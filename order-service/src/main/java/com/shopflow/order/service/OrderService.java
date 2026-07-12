package com.shopflow.order.service;

import com.shopflow.common.client.inventory.InventoryClient;
import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.order.dto.CartItemDto;
import com.shopflow.order.dto.CheckoutRequest;
import com.shopflow.order.model.Order;
import com.shopflow.order.model.OrderItem;
import com.shopflow.order.model.OrderStatus;
import com.shopflow.order.model.CartItem;
import com.shopflow.order.repository.OrderRepository;
import com.shopflow.order.repository.CartItemRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.time.LocalDateTime;
import java.util.UUID;

import com.shopflow.common.client.notification.NotificationClient;
import com.shopflow.common.client.notification.dto.OrderConfirmationRequest;

@Service
public class OrderService {

    private static final Logger log = LoggerFactory.getLogger(OrderService.class);

    private final OrderRepository orderRepository;
    private final InventoryClient inventoryClient;
    private final NotificationClient notificationClient;
    private final CartItemRepository cartItemRepository;
    private final com.shopflow.order.client.ProductClient productClient;

    public OrderService(OrderRepository orderRepository, InventoryClient inventoryClient, NotificationClient notificationClient, CartItemRepository cartItemRepository, com.shopflow.order.client.ProductClient productClient) {
        this.orderRepository = orderRepository;
        this.inventoryClient = inventoryClient;
        this.notificationClient = notificationClient;
        this.cartItemRepository = cartItemRepository;
        this.productClient = productClient;
    }

    public Order getOrderById(UUID id) {
        return orderRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Order not found"));
    }

    @Transactional
    public Order checkout(CheckoutRequest request) {
        // 1. Create order entity in PENDING_PAYMENT
        Order order = new Order();
        order.setUserId(request.getUserId());
        order.setShippingAddress(request.getShippingAddress());
        order.setStatus(OrderStatus.PENDING_PAYMENT);
        order.setTotalAmount(BigDecimal.ZERO);
        order.setExpiresAt(LocalDateTime.now().plusMinutes(15));

        // Save order to generate UUID
        order = orderRepository.save(order);

        List<UUID> successfulReservations = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;

        try {
            for (CartItemDto item : request.getItems()) {
                // Check availability
                AvailabilityResponse availability = inventoryClient.checkAvailability(item.getProductId(), item.getQuantity());
                if (availability == null || !availability.isAvailable()) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Product " + item.getProductId() + " is out of stock");
                }

                // Call reserve
                ReserveRequest reserveReq = new ReserveRequest(order.getId(), item.getProductId(), item.getQuantity());
                ReservationResponse reservation = inventoryClient.reserve(reserveReq);
                if (reservation == null || reservation.getReservationId() == null) {
                    throw new ResponseStatusException(HttpStatus.CONFLICT, "Could not reserve stock for product " + item.getProductId());
                }

                successfulReservations.add(reservation.getReservationId());

                // Create OrderItem (Fetch real price and sellerId from product-service)
                com.shopflow.order.dto.ProductDto productDto = productClient.getProductById(item.getProductId());
                if (productDto == null) {
                    throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Product " + item.getProductId() + " not found");
                }
                if (productDto.getSellerId() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Seller ID could not be resolved for product " + item.getProductId());
                }

                OrderItem orderItem = new OrderItem();
                orderItem.setProductId(item.getProductId());
                orderItem.setQuantity(item.getQuantity());
                orderItem.setUnitPrice(productDto.getPrice());
                orderItem.setSellerId(productDto.getSellerId());
                orderItem.setReservationId(reservation.getReservationId());
                order.addItem(orderItem);

                totalAmount = totalAmount.add(productDto.getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            }

            order.setTotalAmount(totalAmount);
            Order savedOrder = orderRepository.save(order);

            // Trigger order confirmation email notification
            try {
                StringBuilder summary = new StringBuilder();
                for (OrderItem item : savedOrder.getItems()) {
                    summary.append(item.getQuantity())
                           .append("x (Product: ")
                           .append(item.getProductId())
                           .append(") ");
                }
                OrderConfirmationRequest confirmReq = new OrderConfirmationRequest(
                        savedOrder.getId(),
                        "customer@shopflow.com", // Placeholder until cross-service user lookup is available
                        summary.toString().trim(),
                        savedOrder.getTotalAmount(),
                        savedOrder.getShippingAddress()
                );
                notificationClient.sendOrderConfirmation(confirmReq);
            } catch (Exception ex) {
                log.error("Failed to send order confirmation email notification: {}", ex.getMessage());
            }

            return savedOrder;

        } catch (Exception e) {
            log.error("Checkout failed, rolling back reservations: {}", e.getMessage());
            // Release all successful reservations
            for (UUID resId : successfulReservations) {
                try {
                    inventoryClient.release(resId);
                } catch (Exception releaseEx) {
                    log.error("Failed to release reservation {}: {}", resId, releaseEx.getMessage());
                }
            }
            // Propagate exception to trigger @Transactional database rollback
            if (e instanceof ResponseStatusException) {
                throw (ResponseStatusException) e;
            }
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Checkout failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public Order updateOrderStatus(UUID id, OrderStatus newStatus) {
        Order order = getOrderById(id);
        OrderStatus currentStatus = order.getStatus();

        if (!isValidTransition(currentStatus, newStatus)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "Invalid status transition from " + currentStatus + " to " + newStatus);
        }

        order.setStatus(newStatus);
        Order savedOrder = orderRepository.save(order);

        // Inventory commit / release orchestration
        if (newStatus == OrderStatus.PAID) {
            for (OrderItem item : savedOrder.getItems()) {
                if (item.getReservationId() != null) {
                    try {
                        inventoryClient.commit(item.getReservationId());
                        log.info("Committed inventory reservation {} for product {}", item.getReservationId(), item.getProductId());
                    } catch (Exception ex) {
                        log.error("Failed to commit reservation {}: {}", item.getReservationId(), ex.getMessage());
                    }
                }
            }
        } else if (newStatus == OrderStatus.FAILED || newStatus == OrderStatus.CANCELLED) {
            for (OrderItem item : savedOrder.getItems()) {
                if (item.getReservationId() != null) {
                    try {
                        inventoryClient.release(item.getReservationId());
                        log.info("Released inventory reservation {} for product {}", item.getReservationId(), item.getProductId());
                    } catch (Exception ex) {
                        log.error("Failed to release reservation {}: {}", item.getReservationId(), ex.getMessage());
                    }
                }
            }
        }

        return savedOrder;
    }

    private boolean isValidTransition(OrderStatus current, OrderStatus target) {
        if (current == target) {
            return true;
        }
        if (current == null) {
            return false;
        }
        switch (current) {
            case CREATED:
                return target == OrderStatus.PENDING_PAYMENT;
            case PENDING_PAYMENT:
                return target == OrderStatus.PAID || target == OrderStatus.FAILED || target == OrderStatus.CANCELLED;
            case PAID:
                return target == OrderStatus.SHIPPED;
            default:
                return false; // Terminal states (FAILED, CANCELLED, SHIPPED) cannot transition
        }
    }

    public List<Order> getUserOrderHistory(UUID userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public org.springframework.data.domain.Page<Order> getAllOrdersForAdmin(OrderStatus status, org.springframework.data.domain.Pageable pageable) {
        if (status != null) {
            return orderRepository.findByStatus(status, pageable);
        }
        return orderRepository.findAll(pageable);
    }

    public List<CartItem> getCart(UUID userId) {
        return cartItemRepository.findByUserId(userId);
    }

    @Transactional
    public CartItem addToCart(UUID userId, UUID productId, int quantity) {
        if (quantity <= 0) {
            cartItemRepository.deleteById(new com.shopflow.order.model.CartItemId(userId, productId));
            return null;
        }
        CartItem item = cartItemRepository.findById(new com.shopflow.order.model.CartItemId(userId, productId))
                .orElse(new CartItem(userId, productId, 0));
        item.setQuantity(quantity);
        return cartItemRepository.save(item);
    }

    @Transactional
    public void removeFromCart(UUID userId, UUID productId) {
        cartItemRepository.deleteById(new com.shopflow.order.model.CartItemId(userId, productId));
    }

    @Transactional
    public void clearCart(UUID userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    public List<Order> getSellerOrders(UUID sellerId) {
        List<Order> originalOrders = orderRepository.findBySellerId(sellerId);
        List<Order> sellerScopedOrders = new java.util.ArrayList<>();
        
        for (Order order : originalOrders) {
            Order scopedOrder = new Order();
            scopedOrder.setId(order.getId());
            scopedOrder.setUserId(order.getUserId());
            scopedOrder.setStatus(order.getStatus());
            scopedOrder.setShippingAddress(order.getShippingAddress());
            scopedOrder.setCreatedAt(order.getCreatedAt());
            scopedOrder.setUpdatedAt(order.getUpdatedAt());
            scopedOrder.setExpiresAt(order.getExpiresAt());
            
            List<com.shopflow.order.model.OrderItem> scopedItems = new java.util.ArrayList<>();
            BigDecimal sellerTotal = BigDecimal.ZERO;
            
            for (com.shopflow.order.model.OrderItem item : order.getItems()) {
                if (sellerId.equals(item.getSellerId())) {
                    com.shopflow.order.model.OrderItem scopedItem = new com.shopflow.order.model.OrderItem();
                    scopedItem.setId(item.getId());
                    scopedItem.setProductId(item.getProductId());
                    scopedItem.setQuantity(item.getQuantity());
                    scopedItem.setUnitPrice(item.getUnitPrice());
                    scopedItem.setSellerId(item.getSellerId());
                    scopedItem.setReservationId(item.getReservationId());
                    scopedItem.setOrder(scopedOrder);
                    
                    scopedItems.add(scopedItem);
                    sellerTotal = sellerTotal.add(item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
                }
            }
            
            scopedOrder.setItems(scopedItems);
            scopedOrder.setTotalAmount(sellerTotal);
            
            sellerScopedOrders.add(scopedOrder);
        }
        
        return sellerScopedOrders;
    }
}
