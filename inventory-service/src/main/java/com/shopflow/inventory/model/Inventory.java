package com.shopflow.inventory.model;

import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "inventories")
public class Inventory {

    @Id
    @Column(name = "product_id")
    private UUID productId;

    @Column(nullable = false)
    private int quantity;

    public Inventory() {
    }

    public Inventory(UUID productId, int quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public UUID getProductId() {
        return productId;
    }

    public void setProductId(UUID productId) {
        this.productId = productId;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }
}
