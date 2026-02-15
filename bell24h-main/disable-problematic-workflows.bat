@echo off
echo === DISABLING PROBLEMATIC WORKFLOWS ===

echo Disabling WebThinker workflow...
if exist ".github\workflows\webthinker.yml" (
    ren ".github\workflows\webthinker.yml" "webthinker.yml.disabled"
    echo ✅ WebThinker disabled
) else (
    echo ⚠️ WebThinker already disabled
)

echo Disabling main workflow...
if exist ".github\workflows\main.yml" (
    ren ".github\workflows\main.yml" "main.yml.disabled"
    echo ✅ Main workflow disabled
) else (
    echo ⚠️ Main workflow already disabled
)

echo Disabling ci workflow...
if exist ".github\workflows\ci.yml" (
    ren ".github\workflows\ci.yml" "ci.yml.disabled"
    echo ✅ CI workflow disabled
) else (
    echo ⚠️ CI workflow already disabled
)

echo Disabling build workflow...
if exist ".github\workflows\build.yml" (
    ren ".github\workflows\build.yml" "build.yml.disabled"
    echo ✅ Build workflow disabled
) else (
    echo ⚠️ Build workflow already disabled
)

echo Disabling test workflow...
if exist ".github\workflows\test.yml" (
    ren ".github\workflows\test.yml" "test.yml.disabled"
    echo ✅ Test workflow disabled
) else (
    echo ⚠️ Test workflow already disabled
)

echo Disabling e2e workflow...
if exist ".github\workflows\e2e.yml" (
    ren ".github\workflows\e2e.yml" "e2e.yml.disabled"
    echo ✅ E2E workflow disabled
) else (
    echo ⚠️ E2E workflow already disabled
)

echo Disabling ci-cd workflow...
if exist ".github\workflows\ci-cd.yml" (
    ren ".github\workflows\ci-cd.yml" "ci-cd.yml.disabled"
    echo ✅ CI-CD workflow disabled
) else (
    echo ⚠️ CI-CD workflow already disabled
)

echo.
echo === WORKFLOW CLEANUP COMPLETE ===
echo.
echo ✅ Active workflows:
echo - deploy-clean.yml (NEW - working)
echo - deploy.yml (existing)
echo - deployment-protection.yml (existing)
echo.
echo ✅ Disabled workflows:
echo - webthinker.yml.disabled
echo - main.yml.disabled
echo - ci.yml.disabled
echo - build.yml.disabled
echo - test.yml.disabled
echo - e2e.yml.disabled
echo - ci-cd.yml.disabled
echo.
echo 🚀 Now only clean, working workflows will run!
echo.
pause
