package com.shopflow.payment.client;

import com.shopflow.payment.dto.OrderStatusUpdateRequest;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.UUID;

@FeignClient(name = "order-service")
public interface OrderClient {

    @PatchMapping("/orders/{id}/status")
    void updateOrderStatus(@PathVariable("id") UUID id, @RequestBody OrderStatusUpdateRequest request);
}
