package com.shopflow.inventory.service;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.inventory.model.Inventory;
import com.shopflow.inventory.model.Reservation;
import com.shopflow.inventory.repository.InventoryRepository;
import com.shopflow.inventory.repository.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@Service
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final ReservationRepository reservationRepository;

    public InventoryService(InventoryRepository inventoryRepository, ReservationRepository reservationRepository) {
        this.inventoryRepository = inventoryRepository;
        this.reservationRepository = reservationRepository;
    }

    @Transactional(readOnly = true)
    public AvailabilityResponse checkAvailability(UUID productId, int quantity) {
        Inventory inventory = inventoryRepository.findById(productId)
                .orElseGet(() -> inventoryRepository.save(new Inventory(productId, 100)));

        int pendingReserved = reservationRepository.getPendingReservedQuantity(productId);
        int availableStock = Math.max(0, inventory.getQuantity() - pendingReserved);
        boolean isAvailable = availableStock >= quantity;

        return new AvailabilityResponse(productId, isAvailable, availableStock);
    }

    @Transactional
    public ReservationResponse reserve(ReserveRequest request) {
        UUID productId = request.getProductId();
        int requestedQty = request.getQuantity();

        Inventory inventory = inventoryRepository.findById(productId)
                .orElseGet(() -> inventoryRepository.save(new Inventory(productId, 100)));

        int pendingReserved = reservationRepository.getPendingReservedQuantity(productId);
        int availableStock = Math.max(0, inventory.getQuantity() - pendingReserved);

        if (availableStock < requestedQty) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock for product " + productId);
        }

        Reservation reservation = new Reservation(request.getOrderId(), productId, requestedQty, "PENDING");
        Reservation savedReservation = reservationRepository.save(reservation);

        return new ReservationResponse(savedReservation.getId(), "PENDING");
    }

    @Transactional
    public void commit(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if ("PENDING".equals(reservation.getStatus())) {
            Inventory inventory = inventoryRepository.findById(reservation.getProductId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inventory not found"));

            inventory.setQuantity(Math.max(0, inventory.getQuantity() - reservation.getQuantity()));
            inventoryRepository.save(inventory);

            reservation.setStatus("COMMITTED");
            reservationRepository.save(reservation);
        }
    }

    @Transactional
    public void release(UUID reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation not found"));

        if ("PENDING".equals(reservation.getStatus())) {
            reservation.setStatus("RELEASED");
            reservationRepository.save(reservation);
        }
    }
}
