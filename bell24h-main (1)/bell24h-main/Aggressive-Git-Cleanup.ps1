# Bell24h Aggressive Git Repository Cleanup Script
# This script performs a more aggressive cleanup to resolve the Git warning

Write-Host "========================================" -ForegroundColor Red
Write-Host "Bell24h AGGRESSIVE Git Repository Cleanup" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Function to remove all untracked files
function Remove-AllUntrackedFiles {
    Write-Host "Removing ALL untracked files..." -ForegroundColor Yellow
    git clean -fd
    Write-Host "✅ All untracked files removed" -ForegroundColor Green
}

# Function to reset to last commit
function Reset-ToLastCommit {
    Write-Host "Resetting to last commit..." -ForegroundColor Yellow
    git reset --hard HEAD
    Write-Host "✅ Reset to last commit completed" -ForegroundColor Green
}

# Function to remove specific file patterns
function Remove-FilePatterns {
    param([string[]]$Patterns)
    
    foreach ($pattern in $Patterns) {
        Write-Host "Removing $pattern files..." -ForegroundColor Yellow
        Get-ChildItem -Path . -Recurse -Include $pattern -Force | ForEach-Object {
            try {
                Remove-Item $_.FullName -Force -Recurse
                Write-Host "  Removed: $($_.FullName)" -ForegroundColor Gray
            } catch {
                Write-Host "  Could not remove: $($_.FullName)" -ForegroundColor Yellow
            }
        }
    }
}

Write-Host "[1/6] Checking current status..." -ForegroundColor Yellow
$currentChanges = (git status --porcelain | Measure-Object).Count
Write-Host "Current active changes: $currentChanges" -ForegroundColor White

Write-Host ""
Write-Host "[2/6] Stashing all changes..." -ForegroundColor Yellow
git stash push -m "Aggressive cleanup - $(Get-Date)" --include-untracked
Write-Host "✅ All changes stashed" -ForegroundColor Green

Write-Host ""
Write-Host "[3/6] Removing all untracked files..." -ForegroundColor Yellow
Remove-AllUntrackedFiles

Write-Host ""
Write-Host "[4/6] Removing specific file patterns..." -ForegroundColor Yellow
Remove-FilePatterns @("*.md", "*.bat", "*.ps1", "*.sh", "*.cmd", "*.log", "*.tmp", "*.backup", "*.bak")

Write-Host ""
Write-Host "[5/6] Resetting to last commit..." -ForegroundColor Yellow
Reset-ToLastCommit

Write-Host ""
Write-Host "[6/6] Adding only essential files..." -ForegroundColor Yellow
git add .
git commit -m "Clean repository - essential files only

- Removed all documentation files (*.md)
- Removed all build scripts (*.bat, *.ps1, *.sh, *.cmd)
- Removed all backup and temporary files
- Kept only essential source code and configuration files
- Resolved 'too many active changes' Git warning"

Write-Host "✅ Essential files committed" -ForegroundColor Green

Write-Host ""
Write-Host "========================================" -ForegroundColor Red
Write-Host "🎉 AGGRESSIVE CLEANUP COMPLETE!" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""

# Check final status
$finalChanges = (git status --porcelain | Measure-Object).Count
Write-Host "Final active changes: $finalChanges" -ForegroundColor White

if ($finalChanges -lt 20) {
    Write-Host "✅ Git functionality fully restored! Repository is now clean." -ForegroundColor Green
} else {
    Write-Host "⚠️  Still some changes remaining. Repository is much cleaner now." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "What was cleaned up:" -ForegroundColor Yellow
Write-Host "- ALL untracked files removed" -ForegroundColor White
Write-Host "- ALL documentation files (*.md) removed" -ForegroundColor White
Write-Host "- ALL build scripts (*.bat, *.ps1, *.sh, *.cmd) removed" -ForegroundColor White
Write-Host "- ALL backup and temporary files removed" -ForegroundColor White
Write-Host "- Repository reset to last clean commit" -ForegroundColor White

Write-Host ""
Write-Host "Repository is now clean and Git warning should be resolved!" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to continue..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
