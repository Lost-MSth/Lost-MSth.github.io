param(
  [string]$SiteDir = "_site",
  [string]$ConfigFile = "_config.yml",
  [string[]]$ExtraInternalHosts = @(),
  [string[]]$IgnorePathPrefixes = @('/media/'),
  [string[]]$ExcludeFilePathPatterns = @('\\assets\\geekgame2024\.pku\.edu\.cn\\')
)

$ErrorActionPreference = 'Stop'

if (-not (Test-Path -LiteralPath $SiteDir)) {
  Write-Host "[ERROR] SiteDir '$SiteDir' not found. Run: bundle exec jekyll build" -ForegroundColor Red
  exit 2
}

$siteRoot = (Resolve-Path -LiteralPath $SiteDir).Path
$htmlFilesAll = Get-ChildItem -LiteralPath $siteRoot -Recurse -File | Where-Object { $_.Extension -ieq '.html' }

$htmlFiles = @()
foreach ($f in $htmlFilesAll) {
  $excluded = $false
  foreach ($pattern in $ExcludeFilePathPatterns) {
    if ($f.FullName -match $pattern) { $excluded = $true; break }
  }
  if (-not $excluded) { $htmlFiles += $f }
}

$internalHosts = New-Object System.Collections.Generic.HashSet[string] ([System.StringComparer]::OrdinalIgnoreCase)
foreach ($h in @('localhost', '127.0.0.1')) { [void]$internalHosts.Add($h) }

if (Test-Path -LiteralPath $ConfigFile) {
  $urlLine = Get-Content -Encoding UTF8 -LiteralPath $ConfigFile | Select-String -Pattern '^\s*url\s*:\s*"?([^"#\s]+)'
  if ($urlLine) {
    $url = $urlLine.Matches[0].Groups[1].Value
    try {
      $host = ([uri]$url).Host
      if ($host) { [void]$internalHosts.Add($host) }
    } catch {}
  }
}
foreach ($h in $ExtraInternalHosts) {
  if ($h) { [void]$internalHosts.Add($h) }
}

$idMap = @{}
$idValueRegex = [regex]'id\s*=\s*["'']([^"'']+)["'']'
foreach ($file in $htmlFiles) {
  $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName
  $set = New-Object System.Collections.Generic.HashSet[string] ([System.StringComparer]::Ordinal)
  foreach ($m in $idValueRegex.Matches($content)) {
    [void]$set.Add($m.Groups[1].Value)
  }
  $idMap[$file.FullName] = $set
}

function Split-UrlParts {
  param([string]$Url)
  $u = $Url.Trim()
  $fragment = ''
  $base = $u

  $hashIdx = $u.IndexOf('#')
  if ($hashIdx -ge 0) {
    $base = $u.Substring(0, $hashIdx)
    $fragment = $u.Substring($hashIdx + 1)
  }

  $qIdx = $base.IndexOf('?')
  if ($qIdx -ge 0) {
    $base = $base.Substring(0, $qIdx)
  }

  try {
    $base = [uri]::UnescapeDataString($base)
  } catch {}
  try {
    $fragment = [uri]::UnescapeDataString($fragment)
  } catch {}

  [pscustomobject]@{ Path = $base; Fragment = $fragment }
}

function Resolve-TargetFile {
  param(
    [string]$CurrentFile,
    [string]$RawPath
  )

  if ([string]::IsNullOrWhiteSpace($RawPath)) {
    return $CurrentFile
  }

  $pathPart = $RawPath.Replace('/', [IO.Path]::DirectorySeparatorChar)
  if ($RawPath.StartsWith('/')) {
    $candidate = Join-Path $siteRoot ($pathPart.TrimStart([IO.Path]::DirectorySeparatorChar))
  } else {
    $baseDir = Split-Path -Parent $CurrentFile
    $candidate = Join-Path $baseDir $pathPart
  }

  $candidates = New-Object System.Collections.Generic.List[string]

  if ($RawPath.EndsWith('/')) {
    $candidates.Add((Join-Path $candidate 'index.html'))
  } else {
    $candidates.Add($candidate)
    if ([IO.Path]::GetExtension($candidate) -eq '') {
      $candidates.Add($candidate + '.html')
      $candidates.Add((Join-Path $candidate 'index.html'))
    }
  }

  foreach ($c in $candidates) {
    if (Test-Path -LiteralPath $c -PathType Leaf) {
      return (Resolve-Path -LiteralPath $c).Path
    }
  }

  return $null
}

$linkRegex = [regex]'(?is)<(?<tag>a|img|script|link)\b[^>]*?\b(?<attr>href|src)\s*=\s*["''](?<url>[^"'']+)["'']'
$errors = @()

foreach ($file in $htmlFiles) {
  $content = Get-Content -Raw -Encoding UTF8 -LiteralPath $file.FullName

  foreach ($m in $linkRegex.Matches($content)) {
    $rawUrl = $m.Groups['url'].Value.Trim()
    if (-not $rawUrl) { continue }

    if ($rawUrl -match '^(?i)(mailto:|tel:|javascript:|data:|about:|blob:)') { continue }
    if ($rawUrl.StartsWith('//')) { continue }

    $skip = $false
    foreach ($p in $IgnorePathPrefixes) {
      if ($rawUrl.StartsWith($p, [System.StringComparison]::OrdinalIgnoreCase)) {
        $skip = $true
        break
      }
    }
    if ($skip) { continue }

    $targetPath = $null
    $fragment = ''

    if ($rawUrl.StartsWith('#')) {
      $targetPath = $file.FullName
      try { $fragment = [uri]::UnescapeDataString($rawUrl.Substring(1)) } catch { $fragment = $rawUrl.Substring(1) }
    } elseif ($rawUrl -match '^(?i)https?://') {
      try {
        $u = [uri]$rawUrl
      } catch {
        continue
      }
      if (-not $internalHosts.Contains($u.Host)) { continue }
      $parts = Split-UrlParts -Url ($u.AbsolutePath + $u.Fragment)
      $targetPath = Resolve-TargetFile -CurrentFile $file.FullName -RawPath $parts.Path
      $fragment = $parts.Fragment
    } else {
      $parts = Split-UrlParts -Url $rawUrl
      $targetPath = Resolve-TargetFile -CurrentFile $file.FullName -RawPath $parts.Path
      $fragment = $parts.Fragment
    }

    if (-not $targetPath) {
      $errors += [pscustomobject]@{
        Type = 'missing_file'
        Source = $file.FullName
        Url = $rawUrl
        Detail = 'target file not found'
      }
      continue
    }

    if ($fragment -and $targetPath.ToLowerInvariant().EndsWith('.html')) {
      # SPA hash routes like '#/board/score' are not HTML id anchors
      if ($fragment.StartsWith('/')) {
        continue
      }

      $idSet = $idMap[$targetPath]
      if (-not $idSet -or -not $idSet.Contains($fragment)) {
        $errors += [pscustomobject]@{
          Type = 'missing_anchor'
          Source = $file.FullName
          Url = $rawUrl
          Detail = "anchor '#$fragment' not found in $targetPath"
        }
      }
    }
  }
}

Write-Host "`n=== Internal Link Check ===" -ForegroundColor Cyan
Write-Host "HTML files scanned: $($htmlFiles.Count)"
Write-Host "Errors found: $($errors.Count)"

if (@($errors).Count -gt 0) {
  $errors | Select-Object -First 80 | Format-Table -AutoSize
  if ($errors.Count -gt 80) {
    Write-Host "... and $($errors.Count - 80) more errors" -ForegroundColor Yellow
  }
  Write-Host "`n[FAIL] Internal link checks failed." -ForegroundColor Red
  exit 1
}

Write-Host "`n[PASS] Internal link checks passed." -ForegroundColor Green
exit 0
