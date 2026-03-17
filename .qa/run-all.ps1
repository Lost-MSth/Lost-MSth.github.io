param(
  [switch]$Build,
  [string]$SiteDir = "_site",
  [int]$ImageWarningKB = 500,
  [int]$ImageTopN = 20,
  [switch]$FailOnImageOversize,
  [switch]$DetectImageDuplicates
)

$ErrorActionPreference = 'Stop'

if ($Build) {
  Write-Host "=== Building site ===" -ForegroundColor Cyan
  & bundle exec jekyll build
  if ($LASTEXITCODE -ne 0) {
    Write-Host "[FAIL] Build failed." -ForegroundColor Red
    exit $LASTEXITCODE
  }
}

$scriptRoot = $PSScriptRoot
$exitCodes = @{}

Write-Host "`n=== Running baseline check ===" -ForegroundColor Cyan
& (Join-Path $scriptRoot 'check-baseline.ps1') -SiteDir $SiteDir
$exitCodes['baseline'] = $LASTEXITCODE

Write-Host "`n=== Running internal link check ===" -ForegroundColor Cyan
& (Join-Path $scriptRoot 'check-links.ps1') -SiteDir $SiteDir
$exitCodes['links'] = $LASTEXITCODE

Write-Host "`n=== Running image audit ===" -ForegroundColor Cyan
& (Join-Path $scriptRoot 'audit-images.ps1') -WarningKB $ImageWarningKB -TopN $ImageTopN -FailOnOversize:$FailOnImageOversize -DetectDuplicates:$DetectImageDuplicates
$exitCodes['images'] = $LASTEXITCODE

Write-Host "`n=== QA Summary ===" -ForegroundColor Cyan
$summary = $exitCodes.GetEnumerator() | Sort-Object Name | ForEach-Object {
  [pscustomobject]@{ Check = $_.Name; ExitCode = $_.Value; Status = if ($_.Value -eq 0) { 'PASS' } else { 'FAIL' } }
}
$summary | Format-Table -AutoSize

if (($exitCodes['baseline'] -ne 0) -or ($exitCodes['links'] -ne 0) -or ($exitCodes['images'] -ne 0)) {
  Write-Host "`n[FAIL] One or more checks failed." -ForegroundColor Red
  exit 1
}

Write-Host "`n[PASS] All checks passed." -ForegroundColor Green
exit 0
