# Script to install PyTorch with GPU support

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Installing PyTorch with CUDA Support" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

# Check if NVIDIA GPU exists
Write-Host "`nChecking for NVIDIA GPU..." -ForegroundColor Yellow
$gpu = Get-WmiObject Win32_VideoController | Where-Object {$_.Name -like "*NVIDIA*"}

if ($gpu) {
    Write-Host "Found NVIDIA GPU: $($gpu.Name)" -ForegroundColor Green
} else {
    Write-Host "No NVIDIA GPU detected!" -ForegroundColor Red
    Write-Host "PyTorch will still be installed with CUDA support, but will not utilize GPU." -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 1: Uninstalling CPU version of PyTorch" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

& E:/FA25AI47/AIP491/CodeApp/.venv/Scripts/python.exe -m pip uninstall -y torch torchvision

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 2: Installing PyTorch with CUDA 11.8" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

& E:/FA25AI47/AIP491/CodeApp/.venv/Scripts/python.exe -m pip install torch==2.0.1+cu118 torchvision==0.15.2+cu118 --index-url https://download.pytorch.org/whl/cu118

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Step 3: Verifying installation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

& E:/FA25AI47/AIP491/CodeApp/.venv/Scripts/python.exe check_gpu.py

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "Installation Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
