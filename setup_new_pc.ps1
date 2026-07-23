# ==============================================================================
# 🚀 ShopFlow New PC Environment Setup Script (Run as Administrator)
# ==============================================================================
# This script automates the full developer toolchain installation and environment
# configuration for Windows after a fresh OS / SSD installation.

Write-Host "====================================================" -ForegroundColor White
Write-Host "     ShopFlow Developer Environment Installer       " -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor White
Write-Host ""

# 1. Check for Administrator Privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "[ERROR] Administrator privileges required!" -ForegroundColor Red
    Write-Host "Please right-click PowerShell and select 'Run as Administrator'." -ForegroundColor Yellow
    Write-Host ""
    Pause
    Exit
}

# 2. Enable Script Execution
Set-ExecutionPolicy Bypass -Scope Process -Force

# Helper function to install software via winget
function Install-WingetPackage {
    param (
        [string]$AppId,
        [string]$DisplayName
    )
    Write-Host "[Installing] $DisplayName ($AppId)..." -ForegroundColor Yellow
    winget install --id $AppId -e --silent --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -eq 0 -or $LASTEXITCODE -eq -1978335189) { # 0 = Success, -1978335189 = Already installed
        Write-Host "  [OK] $DisplayName installed successfully." -ForegroundColor Green
    } else {
        Write-Host "  [WARNING] winget returned code $LASTEXITCODE for $DisplayName." -ForegroundColor Yellow
    }
}

# 3. Install Core Developer Tools
Write-Host "--- Step 1: Installing Software Packages ---" -ForegroundColor Cyan
Install-WingetPackage -AppId "Git.Git" -DisplayName "Git Version Control"
Install-WingetPackage -AppId "OpenJS.NodeJS.LTS" -DisplayName "Node.js (LTS)"
Install-WingetPackage -AppId "Eclipse.Temurin.17.JDK" -DisplayName "Java JDK 17 (Adoptium Temurin)"
Install-WingetPackage -AppId "Microsoft.VisualStudioCode" -DisplayName "VS Code"
Install-WingetPackage -AppId "Postman.Postman" -DisplayName "Postman API Client"
Install-WingetPackage -AppId "Brave.Brave" -DisplayName "Brave Browser"
Install-WingetPackage -AppId "Google.Chrome" -DisplayName "Google Chrome"

# 4. Install & Configure Apache Maven
Write-Host "`n--- Step 2: Setting Up Apache Maven ---" -ForegroundColor Cyan
$mavenVersion = "3.9.8"
$mavenUrl = "https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "C:\Program Files\Maven"
$zipFile = "$env:TEMP\maven.zip"

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    Write-Host "Downloading Apache Maven $mavenVersion..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipFile -ErrorAction SilentlyContinue
    if (Test-Path $zipFile) {
        Write-Host "Extracting Maven to $installDir..." -ForegroundColor Yellow
        Expand-Archive -Path $zipFile -DestinationPath $installDir -Force
        
        $extractedFolder = Get-ChildItem -Path $installDir -Directory | Select-Object -First 1 -ExpandProperty FullName
        if ($extractedFolder) {
            [Environment]::SetEnvironmentVariable("M2_HOME", $extractedFolder, "Machine")
            $binPath = Join-Path $extractedFolder "bin"
            $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
            if ($currentPath -notlike "*$binPath*") {
                [Environment]::SetEnvironmentVariable("Path", "$currentPath;$binPath", "Machine")
            }
            Write-Host "  [OK] Apache Maven installed and added to System PATH." -ForegroundColor Green
        }
    } else {
        Write-Host "  [ERROR] Could not download Maven automatically. Please download manually from maven.apache.org." -ForegroundColor Red
    }
} else {
    Write-Host "  [OK] Apache Maven already present at $installDir." -ForegroundColor Green
}

# 5. Automatically Resolve and Set JAVA_HOME Environment Variable
Write-Host "`n--- Step 3: Configuring Environment Variables ---" -ForegroundColor Cyan
$jdkSearchPaths = @(
    "C:\Program Files\Eclipse Foundation",
    "C:\Program Files\Java"
)

$jdkPath = $null
foreach ($searchPath in $jdkSearchPaths) {
    if (Test-Path $searchPath) {
        $found = Get-ChildItem -Path $searchPath -Filter "jdk*" -Directory | Select-Object -First 1 -ExpandProperty FullName
        if ($found) {
            $jdkPath = $found
            break
        }
    }
}

if ($jdkPath) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, "Machine")
    Write-Host "  [OK] JAVA_HOME set to: $jdkPath" -ForegroundColor Green
    
    # Ensure JAVA_HOME bin is in PATH
    $javaBinPath = Join-Path $jdkPath "bin"
    $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
    if ($currentPath -notlike "*$javaBinPath*") {
        [Environment]::SetEnvironmentVariable("Path", "$currentPath;$javaBinPath", "Machine")
    }
} else {
    Write-Host "  [WARNING] Could not locate JDK directory automatically. Please set JAVA_HOME manually." -ForegroundColor Yellow
}

# 6. Verify Installation Status
Write-Host "`n--- Step 4: System Environment Verification ---" -ForegroundColor Cyan
Write-Host "Installed tools status:" -ForegroundColor White
Write-Host "  Git:        $(if (Get-Command git -ErrorAction SilentlyContinue) { 'OK' } else { 'Pending Restart' })"
Write-Host "  Node.js:    $(if (Get-Command node -ErrorAction SilentlyContinue) { 'OK' } else { 'Pending Restart' })"
Write-Host "  Java:       $(if ($env:JAVA_HOME -or (Get-Command java -ErrorAction SilentlyContinue)) { 'OK' } else { 'Pending Restart' })"
Write-Host "  Maven:      $(if ($env:M2_HOME -or (Get-Command mvn -ErrorAction SilentlyContinue)) { 'OK' } else { 'Pending Restart' })"

Write-Host "`n====================================================" -ForegroundColor White
Write-Host "🎉 ENVIRONMENT SETUP COMPLETE!" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor White
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Restart your computer or open a fresh terminal." -ForegroundColor White
Write-Host "2. Clone your project using: git clone https://github.com/PG300604/ShopFLow.git" -ForegroundColor White
Write-Host "3. Run 'cd ShopFlow/frontend && npm install' to install frontend dependencies." -ForegroundColor White
Write-Host ""
Pause
