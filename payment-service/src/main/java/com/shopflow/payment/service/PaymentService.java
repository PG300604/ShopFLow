package com.shopflow.payment.service;

import com.shopflow.common.client.notification.NotificationClient;
import com.shopflow.common.client.notification.dto.PaymentStatusRequest;
import com.shopflow.payment.client.OrderClient;
import com.shopflow.payment.dto.CreateIntentRequest;
import com.shopflow.payment.dto.OrderStatusUpdateRequest;
import com.shopflow.payment.model.Payment;
import com.shopflow.payment.repository.PaymentRepository;
import com.stripe.Stripe;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.PaymentIntent;
import com.stripe.model.StripeObject;
import com.stripe.net.Webhook;
import com.stripe.param.PaymentIntentCreateParams;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository paymentRepository;
    private final OrderClient orderClient;
    private final NotificationClient notificationClient;

    @Value("${stripe.secret-key}")
    private String stripeSecretKey;

    @Value("${stripe.webhook-secret}")
    private String webhookSecret;

    public PaymentService(PaymentRepository paymentRepository, OrderClient orderClient, NotificationClient notificationClient) {
        this.paymentRepository = paymentRepository;
        this.orderClient = orderClient;
        this.notificationClient = notificationClient;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    @Transactional
    public String createPaymentIntent(CreateIntentRequest request) {
        log.info("Creating Stripe PaymentIntent for order: {} with amount: {}", request.getOrderId(), request.getAmount());
        try {
            // Stripe expects amount in cents (e.g. $89.99 becomes 8999 cents)
            long amountInCents = request.getAmount().multiply(BigDecimal.valueOf(100)).longValue();

            PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
                    .setAmount(amountInCents)
                    .setCurrency("usd")
                    .putMetadata("orderId", request.getOrderId().toString())
                    .putMetadata("email", request.getEmail())
                    .build();

            PaymentIntent intent = PaymentIntent.create(params);

            // Save processing payment record
            Payment payment = new Payment(
                    request.getOrderId(),
                    intent.getId(),
                    request.getAmount(),
                    "PROCESSING"
            );
            paymentRepository.save(payment);

            return intent.getClientSecret();
        } catch (Exception e) {
            log.error("Failed to create Stripe PaymentIntent: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Stripe payment creation failed: " + e.getMessage(), e);
        }
    }

    @Transactional
    public void handleStripeWebhook(String payload, String sigHeader) {
        Event event;
        try {
            event = Webhook.constructEvent(payload, sigHeader, webhookSecret);
        } catch (Exception e) {
            log.error("Stripe Webhook signature verification failed: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Webhook signature verification failed");
        }

        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        StripeObject stripeObject = dataObjectDeserializer.getObject().orElseThrow(
                () -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Failed to deserialize Stripe event data")
        );

        log.info("Processing Stripe webhook event: {}", event.getType());

        if ("payment_intent.succeeded".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
            processPaymentUpdate(paymentIntent, "SUCCESSFUL", "PAID");

        } else if ("payment_intent.payment_failed".equals(event.getType())) {
            PaymentIntent paymentIntent = (PaymentIntent) stripeObject;
            processPaymentUpdate(paymentIntent, "FAILED", "FAILED");
        }
    }

    private void processPaymentUpdate(PaymentIntent paymentIntent, String paymentStatus, String orderStatus) {
        String paymentIntentId = paymentIntent.getId();
        UUID orderId = UUID.fromString(paymentIntent.getMetadata().get("orderId"));
        String email = paymentIntent.getMetadata().get("email");

        log.info("Updating payment intent {} status to {}, order {} to {}", paymentIntentId, paymentStatus, orderId, orderStatus);

        Payment payment = paymentRepository.findByStripePaymentIntentId(paymentIntentId)
                .orElseGet(() -> {
                    log.warn("Payment record for intent {} not found, creating fallback record", paymentIntentId);
                    BigDecimal amount = BigDecimal.valueOf(paymentIntent.getAmount() / 100.0);
                    return new Payment(orderId, paymentIntentId, amount, "PROCESSING");
                });

        payment.setStatus(paymentStatus);
        paymentRepository.save(payment);

        // 1. Update order-service status
        try {
            orderClient.updateOrderStatus(orderId, new OrderStatusUpdateRequest(orderStatus));
            log.info("Successfully updated order {} status to {} via Feign", orderId, orderStatus);
        } catch (Exception e) {
            log.error("Failed to update order status for order {}: {}", orderId, e.getMessage());
        }

        // 2. Trigger notification-service email update
        try {
            PaymentStatusRequest notifyReq = new PaymentStatusRequest(orderId, email, orderStatus);
            notificationClient.sendPaymentStatus(notifyReq);
            log.info("Successfully triggered payment status email notification for order {}", orderId);
        } catch (Exception e) {
            log.error("Failed to send payment status notification for order {}: {}", orderId, e.getMessage());
        }
    }
}
