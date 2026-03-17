# QA scripts

Lightweight local checks for blog quality and performance hygiene.

## Scripts

- `check-baseline.ps1`
  - Checks `_site` size baselines for key files.
  - Fails when thresholds are exceeded.

- `check-links.ps1`
  - Scans generated HTML in `_site` for broken internal links/resources/anchors.
  - Fails on any error.

- `audit-images.ps1`
  - Reports largest images and oversize files in source assets.
  - By default reports only; can fail with `-FailOnOversize`.

- `run-all.ps1`
  - Unified entry: runs all three checks and prints a summary.

## Quick start

```powershell
# optional: rebuild site first
bundle exec jekyll build

# run all checks
powershell -ExecutionPolicy Bypass -File .\.qa\run-all.ps1
```

## Useful options

```powershell
# build first, then run checks
powershell -ExecutionPolicy Bypass -File .\.qa\run-all.ps1 -Build

# image audit strict mode
powershell -ExecutionPolicy Bypass -File .\.qa\run-all.ps1 -FailOnImageOversize -ImageWarningKB 500

# include duplicate image hash check
powershell -ExecutionPolicy Bypass -File .\.qa\run-all.ps1 -DetectImageDuplicates
```

## Exit code behavior

- `0`: all checks passed
- `1`: at least one check failed
- `2`: `_site` missing for checks that require generated files
