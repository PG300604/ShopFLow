# ShopFlow Start Services Helper Script
# This script starts all backend microservices and the Vite React frontend.

$services = @(
    @{ name = "Eureka Server"; dir = "eureka-server"; jar = "eureka-server-1.0.0-SNAPSHOT.jar" },
    @{ name = "API Gateway"; dir = "api-gateway"; jar = "api-gateway-1.0.0-SNAPSHOT.jar" },
    @{ name = "Auth Service"; dir = "auth-service"; jar = "auth-service-1.0.0-SNAPSHOT.jar" },
    @{ name = "Product Service"; dir = "product-service"; jar = "product-service-1.0.0-SNAPSHOT.jar" },
    @{ name = "Order Service"; dir = "order-service"; jar = "order-service-1.0.0-SNAPSHOT.jar" },
    @{ name = "Payment Service"; dir = "payment-service"; jar = "payment-service-1.0.0-SNAPSHOT.jar" },
    @{ name = "Notification Service"; dir = "notification-service"; jar = "notification-service-1.0.0-SNAPSHOT.jar" },
    @{ name = "Inventory Service"; dir = "inventory-service"; jar = "inventory-service-1.0.0-SNAPSHOT.jar" }
)

Write-Host "=========================================" -ForegroundColor Green
Write-Host "Starting ShopFlow Microservices Platform" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Create log directory
$logDir = "d:\ShopFlow\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Start Eureka Server first and wait for it to be healthy
$eureka = $services[0]
Write-Host "Starting $($eureka.name)..." -ForegroundColor Yellow
$eurekaProcess = Start-Process java -ArgumentList "-jar", "d:\ShopFlow\$($eureka.dir)\target\$($eureka.jar)" -RedirectStandardOutput "$logDir\$($eureka.dir).log" -RedirectStandardError "$logDir\$($eureka.dir)-error.log" -PassThru -NoNewWindow
Write-Host "Waiting 12 seconds for Eureka Server to warm up..." -ForegroundColor Gray
Start-Sleep -Seconds 12

# Start all other services
for ($i = 1; $i -lt $services.Length; $i++) {
    $service = $services[$i]
    Write-Host "Starting $($service.name)..." -ForegroundColor Yellow
    Start-Process java -ArgumentList "-jar", "d:\ShopFlow\$($service.dir)\target\$($service.jar)" -RedirectStandardOutput "$logDir\$($service.dir).log" -RedirectStandardError "$logDir\$($service.dir)-error.log" -NoNewWindow
    Start-Sleep -Seconds 2 # Stagger start
}

# Start Frontend Dev Server
Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", "npm run dev" -WorkingDirectory "d:\ShopFlow\frontend" -NoNewWindow

Write-Host "=========================================" -ForegroundColor Green
Write-Host "All services started! You can check logs in: $logDir" -ForegroundColor Green
Write-Host "Eureka Server Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "Vite React Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Gateway (Base URL): http://localhost:8080" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green
