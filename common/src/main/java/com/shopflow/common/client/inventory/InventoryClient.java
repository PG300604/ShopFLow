package com.shopflow.common.client.inventory;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

public interface InventoryClient {

    @GetMapping("/inventory/{productId}/availability")
    AvailabilityResponse checkAvailability(
            @PathVariable("productId") UUID productId,
            @RequestParam("quantity") int quantity
    );

    @PostMapping("/inventory/reserve")
    ReservationResponse reserve(@RequestBody ReserveRequest request);

    @PostMapping("/inventory/{reservationId}/commit")
    void commit(@PathVariable("reservationId") UUID reservationId);

    @PostMapping("/inventory/{reservationId}/release")
    void release(@PathVariable("reservationId") UUID reservationId);
}
