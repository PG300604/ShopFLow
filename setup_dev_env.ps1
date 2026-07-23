# ShopFlow Developer Environment Setup Script (Run as Administrator)
# This script uses Windows Package Manager (winget) to install all developer apps automatically.

Write-Host "====================================================" -ForegroundColor White
Write-Host "ShopFlow Developer Setup Utility" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor White

# Check for Administrator privileges
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Error "Please run this script in an Administrator PowerShell window!"
    Write-Host "Right-click PowerShell and select 'Run as Administrator'."
    Pause
    Exit
}

# Function to install an app via winget
function Install-App {
    param (
        [string]$AppId,
        [string]$DisplayName
    )
    Write-Host "`n[Installing] $DisplayName..." -ForegroundColor Yellow
    winget install --id $AppId -e --silent --accept-source-agreements --accept-package-agreements
    if ($LASTEXITCODE -eq 0) {
        Write-Host "[SUCCESS] $DisplayName installed successfully." -ForegroundColor Green
    } else {
        Write-Host "[WARNING] winget returned exit code $LASTEXITCODE. Verify installation manually." -ForegroundColor Yellow
    }
}

# 1. Install Applications
Install-App -AppId "Git.Git" -DisplayName "Git Version Control"
Install-App -AppId "OpenJS.NodeJS.LTS" -DisplayName "Node.js (LTS)"
Install-App -AppId "Eclipse.Temurin.17.JDK" -DisplayName "Java JDK 17 (Adoptium)"
Install-App -AppId "Microsoft.VisualStudioCode" -DisplayName "VS Code"
Install-App -AppId "Postman.Postman" -DisplayName "Postman API Client"
Install-App -AppId "Brave.Brave" -DisplayName "Brave Browser"
Install-App -AppId "Google.Chrome" -DisplayName "Google Chrome"

# 2. Download and Setup Apache Maven
Write-Host "`n[Installing] Apache Maven..." -ForegroundColor Yellow
$mavenVersion = "3.9.8"
$mavenUrl = "https://dlcdn.apache.org/maven/maven-3/$mavenVersion/binaries/apache-maven-$mavenVersion-bin.zip"
$installDir = "C:\Program Files\Maven"
$zipFile = "$env:TEMP\maven.zip"

if (-not (Test-Path $installDir)) {
    New-Item -ItemType Directory -Force -Path $installDir | Out-Null
    Write-Host "Downloading Maven $mavenVersion..." -ForegroundColor Gray
    Invoke-WebRequest -Uri $mavenUrl -OutFile $zipFile -ErrorAction SilentlyContinue
    if (Test-Path $zipFile) {
        Write-Host "Extracting Maven to $installDir..." -ForegroundColor Gray
        Expand-Archive -Path $zipFile -DestinationPath $installDir -Force
        
        # Get extracted folder name
        $extractedFolder = Get-ChildItem -Path $installDir -Directory | Select-Object -First 1 -ExpandProperty FullName
        
        # Add to Environment Variables
        [Environment]::SetEnvironmentVariable("M2_HOME", $extractedFolder, "Machine")
        
        # Add bin to Path
        $binPath = Join-Path $extractedFolder "bin"
        $currentPath = [Environment]::GetEnvironmentVariable("Path", "Machine")
        if ($currentPath -notlike "*$binPath*") {
            [Environment]::SetEnvironmentVariable("Path", "$currentPath;$binPath", "Machine")
        }
        Write-Host "[SUCCESS] Apache Maven set up and added to System PATH." -ForegroundColor Green
    } else {
        Write-Host "[ERROR] Could not download Apache Maven. Install manually from maven.apache.org." -ForegroundColor Red
    }
} else {
    Write-Host "Apache Maven already exists at $installDir" -ForegroundColor Green
}

# 3. Resolve & Set JAVA_HOME Environment Variable
Write-Host "`nConfiguring JAVA_HOME..." -ForegroundColor Yellow
$jdkPath = Get-ChildItem -Path "C:\Program Files\Eclipse Foundation" -Filter "jdk-17*" -Directory | Select-Object -First 1 -ExpandProperty FullName
if ($jdkPath) {
    [Environment]::SetEnvironmentVariable("JAVA_HOME", $jdkPath, "Machine")
    Write-Host "[SUCCESS] JAVA_HOME set to: $jdkPath" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Could not automatically resolve JDK 17 path. Please set JAVA_HOME manually." -ForegroundColor Yellow
}

Write-Host "`n====================================================" -ForegroundColor White
Write-Host "SETUP COMPLETE! Please restart your PC or reopen your terminal." -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor White
Pause
