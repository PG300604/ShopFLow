# Inventory Service Integration Task — Instructions for Riya

Hi Riya,

To integrate your `inventory-service` into the ShopFlow platform, you need to build your Spring Boot microservice to expose the endpoints matching our Feign Client interface. 

Once your service is ready, we will toggle off the mock profile in `order-service` so it communicates directly with your service via the API Gateway.

---

## 📋 Endpoint Specifications to Implement

Your microservice must expose the following REST endpoints:

### 1. Check Availability
* **Endpoint**: `GET /inventory/{productId}/availability`
* **Query Parameters**: `quantity` (int)
* **Response Payload (JSON)**:
  ```json
  {
    "productId": "UUID",
    "available": true/false,
    "currentStock": 150
  }
  ```

### 2. Reserve Stock
* **Endpoint**: `POST /inventory/reserve`
* **Request Payload (JSON)**:
  ```json
  {
    "orderId": "UUID",
    "productId": "UUID",
    "quantity": 10
  }
  ```
* **Response Payload (JSON)**:
  ```json
  {
    "reservationId": "UUID",
    "status": "PENDING_PAYMENT"
  }
  ```
* **Behavior**: Deduct temporary stock and generate a `reservationId` that links this stock lock to the checkout order.

### 3. Commit Reservation
* **Endpoint**: `POST /inventory/{reservationId}/commit`
* **Response Status**: `200 OK` (No body)
* **Behavior**: Permanently commit the stock reservation (e.g. when payment is successful).

### 4. Release Reservation
* **Endpoint**: `POST /inventory/{reservationId}/release`
* **Response Status**: `200 OK` (No body)
* **Behavior**: Void the reservation and return the reserved stock back to the available inventory pool (e.g. when checkout fails or payment times out).

---

## ⚙️ Configuration & Discovery Requirements

1. **Port**: Please run your service on port **`8086`** (or register it under `inventory-service` name on Eureka).
2. **Eureka Registration**: Ensure you include the Spring Cloud Eureka Client dependency:
   ```yaml
   eureka:
     client:
       service-url:
         defaultZone: http://localhost:8761/eureka/
   ```
3. **Gateway Routing**: The gateway will automatically route `/api/inventory/**` to your service. To match this, verify your controllers are mapped under `/inventory` (e.g., `@RequestMapping("/inventory")`).

If you have any questions or when your service is ready for testing, let me know!
