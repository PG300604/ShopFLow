package com.shopflow.order.repository;

import com.shopflow.order.model.CartItem;
import com.shopflow.order.model.CartItemId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CartItemRepository extends JpaRepository<CartItem, CartItemId> {
    List<CartItem> findByUserId(UUID userId);
    void deleteByUserId(UUID userId);
}
