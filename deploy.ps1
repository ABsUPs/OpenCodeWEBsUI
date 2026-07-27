#!/usr/bin/env pwsh
<#
.SYNOPSIS
  Deploy OpenCodeWEBsUI to Cloudflare Pages (production)
.DESCRIPTION
  Builds the frontend, optionally runs the DO Worker deploy,
  and pushes to Cloudflare Pages production branch (main).
.LANGUAGE
  PowerShell
#>

$ErrorActionPreference = "Stop"
$ROOT = Split-Path -Parent $PSScriptRoot

Write-Host "═══ OpenCodeWEBsUI Deploy ═══" -ForegroundColor Cyan

# ---- 1. Build ----
Write-Host "→ Building frontend..." -ForegroundColor Yellow
Set-Location $ROOT
npx vite build
if ($LASTEXITCODE -ne 0) { throw "Build failed" }

# ---- 2. TypeScript check ----
Write-Host "→ TypeScript check..." -ForegroundColor Yellow
npx tsc --noEmit
if ($LASTEXITCODE -ne 0) { throw "TypeScript errors found" }

# ---- 3. Deploy to Cloudflare Pages ----
Write-Host "→ Deploying to Cloudflare Pages..." -ForegroundColor Yellow
npx wrangler pages deploy dist --branch main
if ($LASTEXITCODE -ne 0) { throw "Pages deploy failed" }

Write-Host "✓ Deploy complete!" -ForegroundColor Green
