package com.shopflow.payment.dto;

public class CreateIntentResponse {
    private String clientSecret;

    public CreateIntentResponse() {
    }

    public CreateIntentResponse(String clientSecret) {
        this.clientSecret = clientSecret;
    }

    public String getClientSecret() {
        return clientSecret;
    }

    public void setClientSecret(String clientSecret) {
        this.clientSecret = clientSecret;
    }
}
