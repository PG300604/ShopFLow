package com.shopflow.notification.service;

import com.shopflow.common.client.notification.dto.OrderConfirmationRequest;
import com.shopflow.common.client.notification.dto.PaymentStatusRequest;
import com.shopflow.common.client.notification.dto.ShippingUpdateRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendOrderConfirmation(OrderConfirmationRequest request) {
        log.info("Sending async order confirmation email for order: {}", request.getOrderId());
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@shopflow.com");
            message.setTo(request.getEmail());
            message.setSubject("ShopFlow Order Confirmation - Order #" + request.getOrderId());
            
            String content = "Thank you for your order!\n\n" +
                    "Order Reference ID: " + request.getOrderId() + "\n" +
                    "Shipping Address: " + request.getShippingAddress() + "\n\n" +
                    "Items Summary:\n" + request.getItemSummary() + "\n\n" +
                    "Total Amount: $" + request.getTotal() + "\n\n" +
                    "We are processing your payment. You will receive another update shortly.";
            
            message.setText(content);
            mailSender.send(message);
            log.info("Order confirmation email sent successfully for order: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Failed to send order confirmation email for order {}: {}", request.getOrderId(), e.getMessage());
        }
    }

    @Async
    public void sendPaymentStatus(PaymentStatusRequest request) {
        log.info("Sending async payment status email for order: {}", request.getOrderId());
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@shopflow.com");
            message.setTo(request.getEmail());
            message.setSubject("ShopFlow Payment Status Update - Order #" + request.getOrderId());

            String content;
            if ("PAID".equalsIgnoreCase(request.getStatus())) {
                content = "Great news! Your payment for Order #" + request.getOrderId() + " was successful.\n\n" +
                        "We are preparing your items for shipping. You will receive a shipping update with tracking information shortly.";
            } else {
                content = "Unfortunately, the payment for Order #" + request.getOrderId() + " has failed.\n\n" +
                        "Please log in and retry checkout, or contact customer support if you need assistance.";
            }

            message.setText(content);
            mailSender.send(message);
            log.info("Payment status email sent successfully for order: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Failed to send payment status email for order {}: {}", request.getOrderId(), e.getMessage());
        }
    }

    @Async
    public void sendShippingUpdate(ShippingUpdateRequest request) {
        log.info("Sending async shipping update email for order: {}", request.getOrderId());
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("no-reply@shopflow.com");
            message.setTo(request.getEmail());
            message.setSubject("ShopFlow Shipping Update - Order #" + request.getOrderId());

            String content = "Your Order #" + request.getOrderId() + " has been updated.\n\n" +
                    "New Shipping Status: " + request.getStatus() + "\n\n" +
                    "Thank you for shopping with ShopFlow!";

            message.setText(content);
            mailSender.send(message);
            log.info("Shipping update email sent successfully for order: {}", request.getOrderId());
        } catch (Exception e) {
            log.error("Failed to send shipping update email for order {}: {}", request.getOrderId(), e.getMessage());
        }
    }
}
