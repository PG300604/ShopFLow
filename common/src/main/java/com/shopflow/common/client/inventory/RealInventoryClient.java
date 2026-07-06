package com.shopflow.common.client.inventory;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.context.annotation.Profile;

@Profile("!mock")
@FeignClient(name = "inventory-service")
public interface RealInventoryClient extends InventoryClient {
}
