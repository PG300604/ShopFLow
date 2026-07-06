package com.shopflow.common.client.notification.dto;

import java.math.BigDecimal;
import java.util.UUID;

public class OrderConfirmationRequest {
    private UUID orderId;
    private String email;
    private String itemSummary;
    private BigDecimal total;
    private String shippingAddress;

    public OrderConfirmationRequest() {
    }

    public OrderConfirmationRequest(UUID orderId, String email, String itemSummary, BigDecimal total, String shippingAddress) {
        this.orderId = orderId;
        this.email = email;
        this.itemSummary = itemSummary;
        this.total = total;
        this.shippingAddress = shippingAddress;
    }

    public UUID getOrderId() {
        return orderId;
    }

    public void setOrderId(UUID orderId) {
        this.orderId = orderId;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getItemSummary() {
        return itemSummary;
    }

    public void setItemSummary(String itemSummary) {
        this.itemSummary = itemSummary;
    }

    public BigDecimal getTotal() {
        return total;
    }

    public void setTotal(BigDecimal total) {
        this.total = total;
    }

    public String getShippingAddress() {
        return shippingAddress;
    }

    public void setShippingAddress(String shippingAddress) {
        this.shippingAddress = shippingAddress;
    }
}
