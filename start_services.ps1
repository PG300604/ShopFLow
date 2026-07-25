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

# Set local development environment variables if not already defined
if (-not $env:DB_URL) { $env:DB_URL = "jdbc:postgresql://localhost:5432/shopflow" }
if (-not $env:DB_USERNAME) { $env:DB_USERNAME = "postgres" }
if (-not $env:DB_PASSWORD) { $env:DB_PASSWORD = "postgres" }
if (-not $env:JWT_SECRET) { $env:JWT_SECRET = "ShopFlowDefaultJwtSecretKeyForDev2026Base64StringLengthMinimum256Bits!" }

# Root directory dynamic resolution
$rootDir = $PSScriptRoot
if (-not $rootDir) { $rootDir = Get-Location }

# Create log directory
$logDir = "$rootDir\logs"
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir | Out-Null
}

# Ensure JAVA_HOME bin and Node.js are in PATH if present
$javaPath = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot\bin"
$nodePath = "C:\Program Files\nodejs"
$gitPath = "C:\Program Files\Git\cmd"
if (Test-Path $javaPath) { $env:PATH = "$javaPath;$env:PATH" }
if (Test-Path $nodePath) { $env:PATH = "$nodePath;$env:PATH" }
if (Test-Path $gitPath) { $env:PATH = "$gitPath;$env:PATH" }
if (-not $env:JAVA_HOME) { $env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot" }

# Start Eureka Server first and wait for it to be healthy
$eureka = $services[0]
Write-Host "Starting $($eureka.name)..." -ForegroundColor Yellow
$eurekaProcess = Start-Process java -ArgumentList "-Djava.net.preferIPv4Stack=true", "-jar", "$rootDir\$($eureka.dir)\target\$($eureka.jar)" -PassThru -NoNewWindow
Write-Host "Waiting 12 seconds for Eureka Server to warm up..." -ForegroundColor Gray
Start-Sleep -Seconds 12

# Start all other services
for ($i = 1; $i -lt $services.Length; $i++) {
    $service = $services[$i]
    Write-Host "Starting $($service.name)..." -ForegroundColor Yellow
    Start-Process java -ArgumentList "-Djava.net.preferIPv4Stack=true", "-jar", "$rootDir\$($service.dir)\target\$($service.jar)" -NoNewWindow
    Start-Sleep -Seconds 2 # Stagger start
}

# Start Frontend Dev Server
Write-Host "Starting Frontend Development Server..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/c", "npm run dev" -WorkingDirectory "$rootDir\frontend" -NoNewWindow

Write-Host "=========================================" -ForegroundColor Green
Write-Host "All services started! You can check logs in: $logDir" -ForegroundColor Green
Write-Host "Eureka Server Dashboard: http://localhost:8761" -ForegroundColor Cyan
Write-Host "Vite React Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host "API Gateway (Base URL): http://localhost:8080" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Green

Write-Host "Keeping start services task alive in sandbox group..."
while ($true) {
    Start-Sleep -Seconds 10
}
