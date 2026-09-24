package com.shopflow.gateway;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@SpringBootApplication(exclude = {
    org.springframework.cloud.gateway.config.GatewayMetricsAutoConfiguration.class
})
@RestController
public class ApiGatewayApplication {

    private static final Logger log = LoggerFactory.getLogger(ApiGatewayApplication.class);

    @Bean
    public static org.springframework.beans.factory.config.BeanFactoryPostProcessor removeWeightBeans() {
        return beanFactory -> {
            if (beanFactory instanceof org.springframework.beans.factory.support.BeanDefinitionRegistry registry) {
                if (registry.containsBeanDefinition("weightCalculatorWebFilter")) {
                    registry.removeBeanDefinition("weightCalculatorWebFilter");
                }
                if (registry.containsBeanDefinition("weightRoutePredicateFactory")) {
                    registry.removeBeanDefinition("weightRoutePredicateFactory");
                }
            }
        };
    }

    @GetMapping("/")
    public ResponseEntity<Map<String, Object>> root() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "service", "shopflow-gateway",
            "message", "ShopFlow API Gateway is operational"
        ));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        return ResponseEntity.ok(Map.of("status", "UP"));
    }

    @Bean
    public RouteLocator customRouteLocator(RouteLocatorBuilder builder,
            @Value("${AUTH_SERVICE_URL:http://localhost:8081}") String authUrl,
            @Value("${PRODUCT_SERVICE_URL:http://localhost:8083}") String productUrl,
            @Value("${ORDER_SERVICE_URL:http://localhost:8082}") String orderUrl,
            @Value("${PAYMENT_SERVICE_URL:http://localhost:8084}") String paymentUrl,
            @Value("${NOTIFICATION_SERVICE_URL:http://localhost:8086}") String notificationUrl,
            @Value("${INVENTORY_SERVICE_URL:http://localhost:8085}") String inventoryUrl) {

        String resolvedAuth = normalizeUri(authUrl, 8081);
        String resolvedProduct = normalizeUri(productUrl, 8083);
        String resolvedOrder = normalizeUri(orderUrl, 8082);
        String resolvedPayment = normalizeUri(paymentUrl, 8084);
        String resolvedNotification = normalizeUri(notificationUrl, 8086);
        String resolvedInventory = normalizeUri(inventoryUrl, 8085);

        log.info("Routing Configured -> auth: {}, product: {}, order: {}, payment: {}, notification: {}, inventory: {}",
                resolvedAuth, resolvedProduct, resolvedOrder, resolvedPayment, resolvedNotification, resolvedInventory);

        return builder.routes()
                .route("auth-service", r -> r.path("/api/auth/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedAuth))
                .route("product-service", r -> r.path("/api/products/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedProduct))
                .route("order-service", r -> r.path("/api/orders/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedOrder))
                .route("payment-service", r -> r.path("/api/payments/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedPayment))
                .route("notification-service", r -> r.path("/api/notifications/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedNotification))
                .route("inventory-service", r -> r.path("/api/inventory/**")
                        .filters(f -> f.stripPrefix(1))
                        .uri(resolvedInventory))
                .build();
    }

    public static String normalizeUri(String rawUrl, int defaultPort) {
        if (rawUrl == null || rawUrl.isBlank()) {
            return "http://localhost:" + defaultPort;
        }
        String trimmed = rawUrl.trim();
        // If it starts with http:// or https://
        if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
            return trimmed;
        }
        // If it's host:port without scheme (e.g. "shopflow-auth:8081")
        if (trimmed.contains(":")) {
            return "http://" + trimmed;
        }
        // Bare hostname, e.g. "shopflow-auth"
        return "http://" + trimmed + ":" + defaultPort;
    }

    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
