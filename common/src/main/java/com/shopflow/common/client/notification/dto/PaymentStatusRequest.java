package com.shopflow.common.client.notification.dto;

import java.util.UUID;

public class PaymentStatusRequest {
    private UUID orderId;
    private String email;
    private String status;

    public PaymentStatusRequest() {
    }

    public PaymentStatusRequest(UUID orderId, String email, String status) {
        this.orderId = orderId;
        this.email = email;
        this.status = status;
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

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
