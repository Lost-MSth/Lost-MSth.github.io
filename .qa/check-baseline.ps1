param(
  [string]$SiteDir = "_site",
  [int]$MaxHomeHtmlKB = 90,
  [int]$MaxArchiveHtmlKB = 110,
  [int]$MaxMainCssKB = 220,
  [int]$MaxSearchJsKB = 20,
  [int]$MaxLargestPostHtmlKB = 220
)

$ErrorActionPreference = 'Stop'

function To-KB([long]$bytes) {
  [math]::Round($bytes / 1KB, 2)
}

if (-not (Test-Path -LiteralPath $SiteDir)) {
  Write-Host "[ERROR] SiteDir '$SiteDir' not found. Run: bundle exec jekyll build" -ForegroundColor Red
  exit 2
}

$siteRoot = (Resolve-Path -LiteralPath $SiteDir).Path
$script:rows = @()
$script:violations = @()

function Add-SizeCheck {
  param(
    [string]$Name,
    [string]$Path,
    [int]$MaxKB
  )

  if (-not (Test-Path -LiteralPath $Path)) {
    $script:rows += [pscustomobject]@{ Check = $Name; SizeKB = 'MISSING'; LimitKB = $MaxKB; Status = 'FAIL'; Path = $Path }
    $script:violations += "$Name missing: $Path"
    return
  }

  $item = Get-Item -LiteralPath $Path
  $sizeKB = To-KB $item.Length
  $ok = $sizeKB -le $MaxKB

  $script:rows += [pscustomobject]@{
    Check = $Name
    SizeKB = $sizeKB
    LimitKB = $MaxKB
    Status = if ($ok) { 'OK' } else { 'FAIL' }
    Path = $Path
  }

  if (-not $ok) {
    $script:violations += "$Name too large: ${sizeKB}KB > ${MaxKB}KB ($Path)"
  }
}

Add-SizeCheck -Name 'Home HTML' -Path (Join-Path $siteRoot 'index.html') -MaxKB $MaxHomeHtmlKB
Add-SizeCheck -Name 'Archive HTML' -Path (Join-Path $siteRoot 'archive.html') -MaxKB $MaxArchiveHtmlKB
Add-SizeCheck -Name 'Main CSS' -Path (Join-Path $siteRoot 'assets/css/main.css') -MaxKB $MaxMainCssKB
Add-SizeCheck -Name 'Search JS' -Path (Join-Path $siteRoot 'assets/search.js') -MaxKB $MaxSearchJsKB

$postFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -File | Where-Object {
  $_.Extension -ieq '.html' -and $_.FullName -match [regex]::Escape($siteRoot) + '\\[0-9]{4}\\[0-9]{2}\\[0-9]{2}\\'
}

if (@($postFiles).Count -gt 0) {
  $largest = $postFiles | Sort-Object Length -Descending | Select-Object -First 1
  $largestKB = To-KB $largest.Length
  $ok = $largestKB -le $MaxLargestPostHtmlKB
  $rows += [pscustomobject]@{
    Check = 'Largest Post HTML'
    SizeKB = $largestKB
    LimitKB = $MaxLargestPostHtmlKB
    Status = if ($ok) { 'OK' } else { 'FAIL' }
    Path = $largest.FullName
  }
  if (-not $ok) {
    $violations += "Largest Post HTML too large: ${largestKB}KB > ${MaxLargestPostHtmlKB}KB ($($largest.FullName))"
  }
}

Write-Host "`n=== Baseline Size Report ===" -ForegroundColor Cyan
$rows | Format-Table -AutoSize

if (@($violations).Count -gt 0) {
  Write-Host "`n[FAIL] Baseline checks failed:" -ForegroundColor Red
  $violations | ForEach-Object { Write-Host " - $_" -ForegroundColor Red }
  exit 1
}

Write-Host "`n[PASS] Baseline checks passed." -ForegroundColor Green
exit 0
