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

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final EmailService emailService;

    public NotificationController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/order-confirmation")
    public ResponseEntity<Void> sendOrderConfirmation(@RequestBody OrderConfirmationRequest request) {
        emailService.sendOrderConfirmation(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/payment-status")
    public ResponseEntity<Void> sendPaymentStatus(@RequestBody PaymentStatusRequest request) {
        emailService.sendPaymentStatus(request);
        return ResponseEntity.accepted().build();
    }

    @PostMapping("/shipping-update")
    public ResponseEntity<Void> sendShippingUpdate(@RequestBody ShippingUpdateRequest request) {
        emailService.sendShippingUpdate(request);
        return ResponseEntity.accepted().build();
    }
}
