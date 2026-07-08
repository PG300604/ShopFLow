package com.shopflow.order.repository;

import com.shopflow.order.model.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

import com.shopflow.order.model.OrderStatus;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {
    List<Order> findByStatusAndExpiresAtBefore(OrderStatus status, LocalDateTime time);
    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);
    org.springframework.data.domain.Page<Order> findByStatus(OrderStatus status, org.springframework.data.domain.Pageable pageable);
}
