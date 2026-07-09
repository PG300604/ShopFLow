package com.shopflow.inventory.repository;

import com.shopflow.inventory.model.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, UUID> {

    @Query("SELECT COALESCE(SUM(r.quantity), 0) FROM Reservation r WHERE r.productId = :productId AND r.status = 'PENDING'")
    int getPendingReservedQuantity(@Param("productId") UUID productId);
}
