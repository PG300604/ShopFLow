package com.shopflow.notification.controller;

import com.shopflow.common.client.notification.dto.OrderConfirmationRequest;
import com.shopflow.common.client.notification.dto.PaymentStatusRequest;
import com.shopflow.common.client.notification.dto.ShippingUpdateRequest;
import com.shopflow.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final EmailService emailService;

    @Value("${shopflow.internal-key}")
    private String internalKeySecret;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    private boolean isInvalidKey(String key) {
        return key == null || !key.equals(internalKeySecret);
    }

    @PostMapping("/order-confirmation")
    public ResponseEntity<Void> sendOrderConfirmation(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @RequestBody OrderConfirmationRequest request
    ) {
        if (isInvalidKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        emailService.sendOrderConfirmation(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/payment-status")
    public ResponseEntity<Void> sendPaymentStatus(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @RequestBody PaymentStatusRequest request
    ) {
        if (isInvalidKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        emailService.sendPaymentStatus(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/shipping-update")
    public ResponseEntity<Void> sendShippingUpdate(
            @RequestHeader(value = "X-Internal-Key", required = false) String internalKey,
            @RequestBody ShippingUpdateRequest request
    ) {
        if (isInvalidKey(internalKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        emailService.sendShippingUpdate(request);
        return ResponseEntity.accepted().build();
    }
}
