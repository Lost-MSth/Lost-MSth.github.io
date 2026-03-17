param(
  [string[]]$ScanPaths = @('assets'),
  [int]$WarningKB = 500,
  [int]$TopN = 20,
  [switch]$FailOnOversize,
  [switch]$DetectDuplicates
)

$ErrorActionPreference = 'Stop'

$extensions = @('.png', '.jpg', '.jpeg', '.gif', '.webp', '.avif', '.svg')
$files = @()

foreach ($path in $ScanPaths) {
  if (-not (Test-Path -LiteralPath $path)) { continue }
  $files += Get-ChildItem -LiteralPath $path -Recurse -File | Where-Object {
    $extensions -contains $_.Extension.ToLowerInvariant()
  }
}

if (@($files).Count -eq 0) {
  Write-Host "[WARN] No image files found in paths: $($ScanPaths -join ', ')" -ForegroundColor Yellow
  exit 0
}

$rows = $files | ForEach-Object {
  [pscustomobject]@{
    Path = $_.FullName
    SizeKB = [math]::Round($_.Length / 1KB, 2)
    SizeMB = [math]::Round($_.Length / 1MB, 3)
    Length = $_.Length
    Ext = $_.Extension.ToLowerInvariant()
  }
}

$totalBytes = ($rows | Measure-Object Length -Sum).Sum
$oversize = @($rows | Where-Object { $_.SizeKB -gt $WarningKB } | Sort-Object SizeKB -Descending)
$top = @($rows | Sort-Object SizeKB -Descending | Select-Object -First $TopN)

Write-Host "`n=== Image Size Audit ===" -ForegroundColor Cyan
Write-Host ("Files: {0}  Total: {1} MB" -f $rows.Count, [math]::Round($totalBytes / 1MB, 3))
Write-Host ("Threshold: > {0} KB" -f $WarningKB)

Write-Host "`nTop $TopN largest images:" -ForegroundColor Cyan
$top | Select-Object SizeKB, Ext, Path | Format-Table -AutoSize

if ($oversize.Count -gt 0) {
  Write-Host "`nOversize images ($($oversize.Count)):" -ForegroundColor Yellow
  $oversize | Select-Object SizeKB, Ext, Path | Format-Table -AutoSize
} else {
  Write-Host "`nNo images exceed ${WarningKB}KB." -ForegroundColor Green
}

if ($DetectDuplicates) {
  Write-Host "`nChecking duplicate images by SHA256 (this may take a while)..." -ForegroundColor Cyan
  $hashRows = $rows | ForEach-Object {
    $h = Get-FileHash -LiteralPath $_.Path -Algorithm SHA256
    [pscustomobject]@{ Path = $_.Path; SizeKB = $_.SizeKB; Hash = $h.Hash }
  }
  $dupes = @($hashRows | Group-Object Hash | Where-Object { $_.Count -gt 1 })
  if ($dupes.Count -gt 0) {
    Write-Host "Duplicate groups: $($dupes.Count)" -ForegroundColor Yellow
    foreach ($g in ($dupes | Select-Object -First 10)) {
      Write-Host "- Hash: $($g.Name)  Count: $($g.Count)"
      $g.Group | Select-Object SizeKB, Path | Format-Table -AutoSize
    }
    if ($dupes.Count -gt 10) {
      Write-Host "... and $($dupes.Count - 10) more duplicate groups" -ForegroundColor Yellow
    }
  } else {
    Write-Host "No duplicate images detected." -ForegroundColor Green
  }
}

if ($FailOnOversize -and $oversize.Count -gt 0) {
  Write-Host "`n[FAIL] Oversize images found and -FailOnOversize is enabled." -ForegroundColor Red
  exit 1
}

Write-Host "`n[PASS] Image audit completed." -ForegroundColor Green
exit 0
