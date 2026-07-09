package com.shopflow.product.repository;

import com.shopflow.product.model.Promotion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PromotionRepository extends JpaRepository<Promotion, UUID> {
    List<Promotion> findByStatus(String status);
    List<Promotion> findAllByOrderByCreatedAtDesc();
}
