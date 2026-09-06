package com.shopflow.inventory.service;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.inventory.dto.StockDetailsResponse;
import com.shopflow.inventory.model.Inventory;
import com.shopflow.inventory.model.Reservation;
import com.shopflow.inventory.repository.InventoryRepository;
import com.shopflow.inventory.repository.ReservationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private ReservationRepository reservationRepository;

    @InjectMocks
    private InventoryService inventoryService;

    private UUID productId;
    private UUID orderId;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        orderId = UUID.randomUUID();
    }

    @Test
    @DisplayName("checkAvailability: Returns true when available stock >= requested quantity")
    void checkAvailability_whenInStock_returnsTrue() {
        Inventory inventory = new Inventory(productId, 50);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(10);

        AvailabilityResponse response = inventoryService.checkAvailability(productId, 20);

        assertNotNull(response);
        assertEquals(productId, response.getProductId());
        assertTrue(response.isAvailable());
        assertEquals(40, response.getAvailableStock());
    }

    @Test
    @DisplayName("checkAvailability: Returns false when available stock < requested quantity")
    void checkAvailability_whenOutOfStock_returnsFalse() {
        Inventory inventory = new Inventory(productId, 10);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(8);

        AvailabilityResponse response = inventoryService.checkAvailability(productId, 5);

        assertNotNull(response);
        assertFalse(response.isAvailable());
        assertEquals(2, response.getAvailableStock());
    }

    @Test
    @DisplayName("reserve: Creates PENDING reservation when stock is sufficient")
    void reserve_whenStockSufficient_createsPendingReservation() {
        Inventory inventory = new Inventory(productId, 25);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(5);

        Reservation savedReservation = new Reservation(orderId, productId, 5, "PENDING");
        UUID resId = UUID.randomUUID();
        savedReservation.setId(resId);
        when(reservationRepository.save(any(Reservation.class))).thenReturn(savedReservation);

        ReserveRequest request = new ReserveRequest(orderId, productId, 5);
        ReservationResponse response = inventoryService.reserve(request);

        assertNotNull(response);
        assertEquals(resId, response.getReservationId());
        assertEquals("PENDING", response.getStatus());
        verify(reservationRepository, times(1)).save(any(Reservation.class));
    }

    @Test
    @DisplayName("reserve: Throws 409 CONFLICT when available stock is insufficient")
    void reserve_whenStockInsufficient_throwsConflict409() {
        Inventory inventory = new Inventory(productId, 10);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(8);

        ReserveRequest request = new ReserveRequest(orderId, productId, 5);

        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            inventoryService.reserve(request);
        });

        assertEquals(HttpStatus.CONFLICT, ex.getStatusCode());
        verify(reservationRepository, never()).save(any());
    }

    @Test
    @DisplayName("commit: Decrements physical inventory and marks reservation COMMITTED")
    void commit_decrementsPhysicalStockAndMarksCommitted() {
        UUID resId = UUID.randomUUID();
        Reservation reservation = new Reservation(orderId, productId, 5, "PENDING");
        reservation.setId(resId);

        Inventory inventory = new Inventory(productId, 20);

        when(reservationRepository.findById(resId)).thenReturn(Optional.of(reservation));
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));

        inventoryService.commit(resId);

        assertEquals(15, inventory.getQuantity());
        assertEquals("COMMITTED", reservation.getStatus());
        verify(inventoryRepository, times(1)).save(inventory);
        verify(reservationRepository, times(1)).save(reservation);
    }

    @Test
    @DisplayName("release: Marks reservation as RELEASED to unblock pending quantity")
    void release_marksReleasedAndFreesReservedStock() {
        UUID resId = UUID.randomUUID();
        Reservation reservation = new Reservation(orderId, productId, 5, "PENDING");
        reservation.setId(resId);

        when(reservationRepository.findById(resId)).thenReturn(Optional.of(reservation));

        inventoryService.release(resId);

        assertEquals("RELEASED", reservation.getStatus());
        verify(reservationRepository, times(1)).save(reservation);
        verify(inventoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("updateStock: Sets physical quantity and returns updated StockDetails")
    void updateStock_updatesPhysicalStock() {
        Inventory inventory = new Inventory(productId, 10);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(inventoryRepository.save(any(Inventory.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(2);

        StockDetailsResponse response = inventoryService.updateStock(productId, 50);

        assertNotNull(response);
        assertEquals(50, response.physicalQuantity());
        assertEquals(2, response.reservedQuantity());
        assertEquals(48, response.availableQuantity());
        assertTrue(response.inStock());
    }

    @Test
    @DisplayName("updateStock: Throws 400 BAD_REQUEST on negative quantity")
    void updateStock_negativeQuantity_throwsBadRequest() {
        ResponseStatusException ex = assertThrows(ResponseStatusException.class, () -> {
            inventoryService.updateStock(productId, -5);
        });

        assertEquals(HttpStatus.BAD_REQUEST, ex.getStatusCode());
        verify(inventoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("getStockDetails: Correctly computes physical, reserved, and available counts")
    void getStockDetails_returnsAccurateCounts() {
        Inventory inventory = new Inventory(productId, 100);
        when(inventoryRepository.findById(productId)).thenReturn(Optional.of(inventory));
        when(reservationRepository.getPendingReservedQuantity(productId)).thenReturn(25);

        StockDetailsResponse response = inventoryService.getStockDetails(productId);

        assertNotNull(response);
        assertEquals(100, response.physicalQuantity());
        assertEquals(25, response.reservedQuantity());
        assertEquals(75, response.availableQuantity());
        assertTrue(response.inStock());
    }
}
