package com.shopflow.payment.controller;

import com.shopflow.payment.dto.CreateIntentRequest;
import com.shopflow.payment.dto.CreateIntentResponse;
import com.shopflow.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-intent")
    public ResponseEntity<CreateIntentResponse> createPaymentIntent(@Valid @RequestBody CreateIntentRequest request) {
        String clientSecret = paymentService.createPaymentIntent(request);
        return new ResponseEntity<>(new CreateIntentResponse(clientSecret), HttpStatus.CREATED);
    }

    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader
    ) {
        paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok().build();
    }
}
