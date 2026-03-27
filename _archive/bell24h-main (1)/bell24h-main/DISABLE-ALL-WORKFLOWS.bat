@echo off
echo ========================================
echo   DISABLING ALL GITHUB WORKFLOWS
echo ========================================

cd .github\workflows

echo Renaming all workflow files...
for %%f in (*.yml) do (
    ren "%%f" "%%f.disabled"
    echo Disabled: %%f
)
for %%f in (*.yaml) do (
    ren "%%f" "%%f.disabled"
    echo Disabled: %%f
)

cd ..\..

echo.
echo Committing changes...
git add -A
git commit -m "ci: disable all workflows to stop conflicts"
git push origin main

echo.
echo ========================================
echo   ALL WORKFLOWS DISABLED!
echo ========================================
pause
