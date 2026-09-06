package com.shopflow.inventory.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.shopflow.common.client.inventory.dto.AvailabilityResponse;
import com.shopflow.common.client.inventory.dto.ReservationResponse;
import com.shopflow.common.client.inventory.dto.ReserveRequest;
import com.shopflow.inventory.dto.StockDetailsResponse;
import com.shopflow.inventory.dto.StockUpdateRequest;
import com.shopflow.inventory.security.JwtAuthenticationFilter;
import com.shopflow.inventory.security.SecurityConfig;
import com.shopflow.inventory.service.InventoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.util.Collections;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
@Import({SecurityConfig.class, JwtAuthenticationFilter.class})
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

    @Test
    @DisplayName("GET /inventory/{productId}/availability: Permitted publicly and returns availability")
    void checkAvailability_returnsOk() throws Exception {
        UUID productId = UUID.randomUUID();
        when(inventoryService.checkAvailability(productId, 2))
                .thenReturn(new AvailabilityResponse(productId, true, 45));

        mockMvc.perform(get("/inventory/{productId}/availability", productId)
                        .param("quantity", "2"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(productId.toString()))
                .andExpect(jsonPath("$.available").value(true))
                .andExpect(jsonPath("$.availableStock").value(45));
    }

    @Test
    @DisplayName("GET /inventory/{productId}: Returns detailed stock metrics")
    void getStockDetails_returnsOk() throws Exception {
        UUID productId = UUID.randomUUID();
        when(inventoryService.getStockDetails(productId))
                .thenReturn(new StockDetailsResponse(productId, 100, 10, 90, true));

        mockMvc.perform(get("/inventory/{productId}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.productId").value(productId.toString()))
                .andExpect(jsonPath("$.physicalQuantity").value(100))
                .andExpect(jsonPath("$.reservedQuantity").value(10))
                .andExpect(jsonPath("$.availableQuantity").value(90))
                .andExpect(jsonPath("$.inStock").value(true));
    }

    @Test
    @DisplayName("POST /inventory/reserve: Creates reservation or dispatches 409 conflict")
    void reserve_whenStockSufficient_returns200() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();
        UUID resId = UUID.randomUUID();

        ReserveRequest request = new ReserveRequest(orderId, productId, 2);
        when(inventoryService.reserve(any(ReserveRequest.class)))
                .thenReturn(new ReservationResponse(resId, "PENDING"));

        mockMvc.perform(post("/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.reservationId").value(resId.toString()))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    @DisplayName("POST /inventory/reserve: Dispatches 409 CONFLICT on out-of-stock without being blocked by Spring Security")
    void reserve_whenStockInsufficient_returns409Conflict() throws Exception {
        UUID orderId = UUID.randomUUID();
        UUID productId = UUID.randomUUID();

        ReserveRequest request = new ReserveRequest(orderId, productId, 999);
        when(inventoryService.reserve(any(ReserveRequest.class)))
                .thenThrow(new ResponseStatusException(HttpStatus.CONFLICT, "Insufficient stock"));

        mockMvc.perform(post("/inventory/reserve")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict());
    }

    @Test
    @WithMockUser(roles = "SELLER")
    @DisplayName("PUT /inventory/{productId}: Authorized SELLER can restock inventory")
    void updateStock_withSellerRole_returnsOk() throws Exception {
        UUID productId = UUID.randomUUID();
        StockUpdateRequest request = new StockUpdateRequest(150);

        when(inventoryService.updateStock(eq(productId), eq(150)))
                .thenReturn(new StockDetailsResponse(productId, 150, 0, 150, true));

        mockMvc.perform(put("/inventory/{productId}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.physicalQuantity").value(150));
    }

    @Test
    @DisplayName("PUT /inventory/{productId}: Anonymous user without SELLER/ADMIN role is denied (403/401)")
    void updateStock_withoutAuth_returnsForbidden() throws Exception {
        UUID productId = UUID.randomUUID();
        StockUpdateRequest request = new StockUpdateRequest(150);

        mockMvc.perform(put("/inventory/{productId}", productId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden());
    }
}
