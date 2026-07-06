package com.shopflow.common.client.inventory.dto;

import java.util.UUID;

public class AvailabilityResponse {
    private UUID productId;
    private boolean available;
    private int availableStock;

    public AvailabilityResponse() {
    }

    public AvailabilityResponse(UUID productId, boolean available, int availableStock) {
        this.productId = productId;
        this.available = available;
        this.availableStock = availableStock;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public int getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(int availableStock) {
        this.availableStock = availableStock;
    }
}
