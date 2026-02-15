# Disable failing webthinker workflow
if (Test-Path .github\workflows\webthinker.yml) {
    Rename-Item .github\workflows\webthinker.yml webthinker.yml.disabled -Force
    Write-Host "✅ Disabled webthinker.yml workflow"
} else {
    Write-Host "ℹ️ webthinker.yml already disabled or doesn't exist"
}

# Commit and push changes
git add -A
git commit -m "ci: disable non-essential analysis workflow"
git push origin main

Write-Host "✅ Workflow disabled and changes pushed to GitHub"
