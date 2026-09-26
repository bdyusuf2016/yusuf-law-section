$ErrorActionPreference = "Stop"
Write-Host "==> Building project..."
npm run build

$tempIndex = Join-Path $PWD ".git\temp-index"
if (Test-Path $tempIndex) { Remove-Item $tempIndex -Force }
$env:GIT_INDEX_FILE = $tempIndex

Write-Host "==> Staging dist files..."
git --work-tree=dist add --all
$tree = (git write-tree).Trim()
Write-Host "Tree: $tree"

$commit = (git commit-tree $tree -m "Deploy to GitHub Pages: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')").Trim()
Write-Host "Commit: $commit"

Write-Host "==> Pushing to origin/gh-pages..."
git push origin "${commit}:refs/heads/gh-pages" --force

if (Test-Path $tempIndex) { Remove-Item $tempIndex -Force }
Write-Host "==> Successfully published to gh-pages branch!"
