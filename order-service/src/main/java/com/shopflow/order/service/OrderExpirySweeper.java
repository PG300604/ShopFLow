package com.shopflow.order.service;

import com.shopflow.order.model.Order;
import com.shopflow.order.model.OrderStatus;
import com.shopflow.order.repository.OrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class OrderExpirySweeper {

    private static final Logger log = LoggerFactory.getLogger(OrderExpirySweeper.class);

    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public OrderExpirySweeper(OrderRepository orderRepository, OrderService orderService) {
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @Scheduled(fixedDelay = 10000) // Run every 10 seconds for high responsiveness during tests
    public void sweepExpiredOrders() {
        log.debug("Sweeping expired orders...");
        List<Order> expiredOrders = orderRepository.findByStatusAndExpiresAtBefore(
                OrderStatus.PENDING_PAYMENT,
                LocalDateTime.now()
        );

        if (!expiredOrders.isEmpty()) {
            log.info("Found {} expired order(s) pending payment. Commencing cancellation saga...", expiredOrders.size());
            for (Order order : expiredOrders) {
                try {
                    log.info("Order {} has expired. Transitioning status to CANCELLED...", order.getId());
                    orderService.updateOrderStatus(order.getId(), OrderStatus.CANCELLED);
                } catch (Exception e) {
                    log.error("Failed to cancel expired order {}: {}", order.getId(), e.getMessage());
                }
            }
        }
    }
}
