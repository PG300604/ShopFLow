package com.shopflow.common.client.inventory;

import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

import java.util.UUID;

@Component
@Profile("mock")
public class MockInventoryClient implements InventoryClient {

    @Override
    public AvailabilityResponse checkAvailability(UUID productId, int quantity) {
        return new AvailabilityResponse(productId, true, 999);
    }

    @Override
    public ReservationResponse reserve(ReserveRequest request) {
        return new ReservationResponse(UUID.randomUUID(), "PENDING_PAYMENT");
    }

    @Override
    public void commit(UUID reservationId) {
        // No-op for mock testing
    }

    @Override
    public void release(UUID reservationId) {
        // No-op for mock testing
    }
}
