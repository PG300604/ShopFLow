package com.shopflow.order.controller;

import com.shopflow.order.dto.CheckoutRequest;
import com.shopflow.order.model.Order;
import com.shopflow.order.model.OrderStatus;
import com.shopflow.order.service.OrderService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService orderService;

    @Value("${shopflow.internal-key}")
    private String internalKeySecret;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<Order> checkout(@Valid @RequestBody CheckoutRequest request) {
        Order order = orderService.checkout(request);
        return new ResponseEntity<>(order, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrderById(@PathVariable("id") UUID id) {
        Order order = orderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Order> updateStatus(
            @PathVariable("id") UUID id,
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @Valid @RequestBody StatusUpdateRequest request
    ) {
        if (internalKey == null || !internalKey.equals(internalKeySecret)) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }
        Order updatedOrder = orderService.updateOrderStatus(id, request.getStatus());
        return ResponseEntity.ok(updatedOrder);
    }

    private UUID getAuthenticatedUserId() {
        String principal = (String) org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        return UUID.fromString(principal);
    }

    @GetMapping("/history")
    public ResponseEntity<java.util.List<Order>> getOrderHistory() {
        UUID userId = getAuthenticatedUserId();
        java.util.List<Order> orders = orderService.getUserOrderHistory(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping
    public ResponseEntity<org.springframework.data.domain.Page<Order>> getAdminDashboard(
            @RequestParam(value = "status", required = false) OrderStatus status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy
    ) {
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size, org.springframework.data.domain.Sort.by(sortBy).descending());
        org.springframework.data.domain.Page<Order> orders = orderService.getAllOrdersForAdmin(status, pageable);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/cart")
    public ResponseEntity<java.util.List<com.shopflow.order.model.CartItem>> getCart() {
        UUID userId = getAuthenticatedUserId();
        java.util.List<com.shopflow.order.model.CartItem> cart = orderService.getCart(userId);
        return ResponseEntity.ok(cart);
    }

    @PostMapping("/cart")
    public ResponseEntity<com.shopflow.order.model.CartItem> addToCart(@RequestBody java.util.Map<String, Object> body) {
        UUID userId = getAuthenticatedUserId();
        UUID productId = UUID.fromString((String) body.get("productId"));
        int quantity = ((Number) body.get("quantity")).intValue();
        com.shopflow.order.model.CartItem item = orderService.addToCart(userId, productId, quantity);
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/cart/{productId}")
    public ResponseEntity<Void> removeFromCart(@PathVariable("productId") UUID productId) {
        UUID userId = getAuthenticatedUserId();
        orderService.removeFromCart(userId, productId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/cart")
    public ResponseEntity<Void> clearCart() {
        UUID userId = getAuthenticatedUserId();
        orderService.clearCart(userId);
        return ResponseEntity.noContent().build();
    }

    public static class StatusUpdateRequest {
        @NotNull(message = "Status is required")
        private OrderStatus status;

        public StatusUpdateRequest() {
        }

        public StatusUpdateRequest(OrderStatus status) {
            this.status = status;
        }

        public OrderStatus getStatus() {
            return status;
        }

        public void setStatus(OrderStatus status) {
            this.status = status;
        }
    }
}
