package com.shopflow.common.client.notification;

import com.shopflow.common.client.notification.dto.OrderConfirmationRequest;
import com.shopflow.common.client.notification.dto.PaymentStatusRequest;
import com.shopflow.common.client.notification.dto.ShippingUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(name = "notification-service")
public interface NotificationClient {

    @PostMapping("/notifications/order-confirmation")
    void sendOrderConfirmation(@RequestBody OrderConfirmationRequest request);

    @PostMapping("/notifications/payment-status")
    void sendPaymentStatus(@RequestBody PaymentStatusRequest request);

    @PostMapping("/notifications/shipping-update")
    void sendShippingUpdate(@RequestBody ShippingUpdateRequest request);
}
