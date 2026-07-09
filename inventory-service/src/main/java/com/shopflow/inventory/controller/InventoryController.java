package com.shopflow.inventory.controller;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.inventory.service.InventoryService;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/inventory")
public class InventoryController {

    private final InventoryService inventoryService;

    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }

    @GetMapping("/{productId}/availability")
    public AvailabilityResponse checkAvailability(
            @PathVariable("productId") UUID productId,
            @RequestParam("quantity") int quantity
    ) {
        return inventoryService.checkAvailability(productId, quantity);
    }

    @PostMapping("/reserve")
    public ReservationResponse reserve(@RequestBody ReserveRequest request) {
        return inventoryService.reserve(request);
    }

    @PostMapping("/{reservationId}/commit")
    public void commit(@PathVariable("reservationId") UUID reservationId) {
        inventoryService.commit(reservationId);
    }

    @PostMapping("/{reservationId}/release")
    public void release(@PathVariable("reservationId") UUID reservationId) {
        inventoryService.release(reservationId);
    }
}
