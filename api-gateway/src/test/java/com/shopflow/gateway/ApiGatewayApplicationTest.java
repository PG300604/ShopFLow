package com.shopflow.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
public class ApiGatewayApplicationTest {

    @Test
    void contextLoads() {
        // Verifies Spring context initializes all gateway beans, routes, and filters without exceptions
    }

    @Test
    void testNormalizeUri_BareHostname() {
        assertEquals("http://shopflow-auth:8081", ApiGatewayApplication.normalizeUri("shopflow-auth", 8081));
    }

    @Test
    void testNormalizeUri_HostWithPort() {
        assertEquals("http://shopflow-auth:8081", ApiGatewayApplication.normalizeUri("shopflow-auth:8081", 8081));
    }

    @Test
    void testNormalizeUri_AlreadyHttp() {
        assertEquals("http://localhost:8081", ApiGatewayApplication.normalizeUri("http://localhost:8081", 8081));
    }

    @Test
    void testNormalizeUri_AlreadyHttps() {
        assertEquals("https://shopflow-auth.onrender.com", ApiGatewayApplication.normalizeUri("https://shopflow-auth.onrender.com", 8081));
    }

    @Test
    void testNormalizeUri_NullOrEmpty() {
        assertEquals("http://localhost:8081", ApiGatewayApplication.normalizeUri(null, 8081));
        assertEquals("http://localhost:8081", ApiGatewayApplication.normalizeUri("   ", 8081));
    }
}
