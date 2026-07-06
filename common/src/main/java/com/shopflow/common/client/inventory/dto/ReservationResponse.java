package com.shopflow.common.client.inventory.dto;

import java.util.UUID;

public class ReservationResponse {
    private UUID reservationId;
    private String status;

    public ReservationResponse() {
    }

    public ReservationResponse(UUID reservationId, String status) {
        this.reservationId = reservationId;
        this.status = status;
    }

    public UUID getReservationId() {
        return reservationId;
    }

    public void setReservationId(UUID reservationId) {
        this.reservationId = reservationId;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
