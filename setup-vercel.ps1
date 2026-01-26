# PowerShell script to set up Vercel file structure
# Run this in the project root directory

Write-Host "Setting up Vercel file structure..." -ForegroundColor Green

# Create public directory if it doesn't exist
if (-not (Test-Path "public")) {
    New-Item -ItemType Directory -Path "public" -Force | Out-Null
    Write-Host "Created public/ directory" -ForegroundColor Yellow
}

# Move HTML files to public
$htmlFiles = Get-ChildItem -Path "." -Filter "*.html" -File
if ($htmlFiles.Count -gt 0) {
    Write-Host "Moving $($htmlFiles.Count) HTML files to public/..." -ForegroundColor Yellow
    Move-Item -Path "*.html" -Destination "public\" -Force
    Write-Host "HTML files moved" -ForegroundColor Green
} else {
    Write-Host "No HTML files found to move" -ForegroundColor Yellow
}

# Move assets directory to public if it exists
if (Test-Path "assets") {
    if (Test-Path "public\assets") {
        Write-Host "public/assets already exists, skipping..." -ForegroundColor Yellow
    } else {
        Move-Item -Path "assets" -Destination "public\" -Force
        Write-Host "Moved assets/ to public/assets/" -ForegroundColor Green
    }
} else {
    Write-Host "assets/ directory not found" -ForegroundColor Yellow
}

Write-Host "`nSetup complete!" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Cyan
Write-Host "1. Review the files in public/ directory" -ForegroundColor White
Write-Host "2. Install dependencies: npm install" -ForegroundColor White
Write-Host "3. Set up Vercel KV in dashboard" -ForegroundColor White
Write-Host "4. Deploy to Vercel" -ForegroundColor White
Write-Host "5. Call /api/secure-portal/init after deployment" -ForegroundColor White
