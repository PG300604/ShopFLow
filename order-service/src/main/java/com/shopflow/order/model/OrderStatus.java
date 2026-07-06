package com.shopflow.order.model;

public enum OrderStatus {
    CREATED,
    PENDING_PAYMENT,
    PAID,
    FAILED,
    CANCELLED,
    SHIPPED
}
