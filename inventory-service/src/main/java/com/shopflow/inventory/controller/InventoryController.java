package com.shopflow.inventory.controller;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.inventory.dto.StockDetailsResponse;
import com.shopflow.inventory.dto.StockUpdateRequest;
import com.shopflow.inventory.model.Reservation;
import com.shopflow.inventory.service.InventoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping
    public List<StockDetailsResponse> getAllInventory() {
        return inventoryService.getAllInventory();
    }

    @GetMapping("/{productId}")
    public StockDetailsResponse getStockDetails(@PathVariable("productId") UUID productId) {
        return inventoryService.getStockDetails(productId);
    }

    @PutMapping("/{productId}")
    public StockDetailsResponse updateStock(
            @PathVariable("productId") UUID productId,
            @RequestBody StockUpdateRequest request
    ) {
        return inventoryService.updateStock(productId, request.quantity());
    }

    @GetMapping("/{productId}/availability")
    public AvailabilityResponse checkAvailability(
            @PathVariable("productId") UUID productId,
            @RequestParam(name = "quantity", defaultValue = "1") int quantity
    ) {
        return inventoryService.checkAvailability(productId, quantity);
    }

    @GetMapping("/order/{orderId}")
    public List<Reservation> getOrderReservations(@PathVariable("orderId") UUID orderId) {
        return inventoryService.getReservationsByOrderId(orderId);
    }

    @PostMapping("/reserve")
    public ResponseEntity<ReservationResponse> reserve(@RequestBody ReserveRequest request) {
        ReservationResponse response = inventoryService.reserve(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{reservationId}/commit")
    public ResponseEntity<Void> commit(@PathVariable("reservationId") UUID reservationId) {
        inventoryService.commit(reservationId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{reservationId}/release")
    public ResponseEntity<Void> release(@PathVariable("reservationId") UUID reservationId) {
        inventoryService.release(reservationId);
        return ResponseEntity.ok().build();
    }
}
