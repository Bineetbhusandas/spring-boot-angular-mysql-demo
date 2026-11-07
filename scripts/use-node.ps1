# Activates the portable Node.js 26 installation for the current terminal.
# Usage (from the project root):
#   . .\scripts\use-node.ps1
# This only changes PATH for this PowerShell session - no admin rights needed.

$nodeHome = 'C:\BINEET\tools\node'

if (-not (Test-Path (Join-Path $nodeHome 'node.exe'))) {
    throw "Portable Node.js was not found at $nodeHome"
}

# Remove any system Node.js entry so the portable version always wins.
$parts = $env:Path -split ';' | Where-Object { $_ -and $_ -ne 'C:\Program Files\nodejs' }
$env:Path = (@($nodeHome) + $parts) -join ';'

Write-Host "Node.js $(node --version) / npm $(npm --version) activated for this session." -ForegroundColor Green
