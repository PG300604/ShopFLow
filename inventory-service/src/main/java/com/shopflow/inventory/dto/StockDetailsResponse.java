package com.shopflow.inventory.dto;

import java.util.UUID;

public record StockDetailsResponse(
        UUID productId,
        int physicalQuantity,
        int reservedQuantity,
        int availableQuantity,
        boolean inStock
) {}
