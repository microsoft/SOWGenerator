#!/usr/bin/env pwsh
# verify.ps1 - Readiness verify loop for SOWGenerator (static site).
# Confirms basic HTML structure and exercises the primary product flow in a real browser.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $PSScriptRoot
Push-Location $root
$failures = 0

Write-Host "== index.html present & well-formed =="
$index = Join-Path $root 'index.html'
if (-not (Test-Path $index)) { Write-Host "  MISSING: index.html"; $failures++ }
else {
    $html = Get-Content $index -Raw
    if ([string]::IsNullOrWhiteSpace($html)) { Write-Host "  EMPTY: index.html"; $failures++ }
    else {
        $ok = $true
        foreach ($needle in '<html','</html>','<body','</body>') {
            if ($html -notmatch [regex]::Escape($needle)) { Write-Host "  MISSING TAG: $needle"; $ok=$false }
        }
        if ($ok) { Write-Host "  OK: index.html is a non-empty, well-formed HTML document." }
        else { $failures++ }
    }
}

Write-Host "== Browser smoke verification =="
foreach ($command in 'node', 'npm') {
    if (-not (Get-Command $command -ErrorAction SilentlyContinue)) {
        Write-Host "  MISSING TOOL: $command"
        $failures++
    }
}

if ($failures -eq 0) {
    & npm ci --no-audit --no-fund
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAILED: npm ci"
        $failures++
    }
}

if ($failures -eq 0) {
    & npx playwright install chromium
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAILED: Playwright Chromium installation"
        $failures++
    }
}

if ($failures -eq 0) {
    & npm run test:browser
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  FAILED: browser smoke verification"
        $failures++
    }
}

Pop-Location
if ($failures -gt 0) { Write-Host "verify.ps1 FAILED with $failures error(s)." -ForegroundColor Red; exit 1 }
Write-Host "verify.ps1 PASSED." -ForegroundColor Green
exit 0
