@echo off
echo ========================================
echo   AUTOMATED BELL24H SITE VERIFICATION
echo ========================================

echo Testing your site automatically...
echo.

echo [1/6] Testing main site availability...
curl -s -o nul -w "%%{http_code}" https://bell24h.com > temp_status.txt
set /p status=<temp_status.txt
if "%status%"=="200" (
    echo ✅ Main site is LIVE and responding (Status: %status%)
) else (
    echo ❌ Main site issue (Status: %status%)
)
del temp_status.txt

echo.
echo [2/6] Testing Vercel deployment URL...
curl -s -o nul -w "%%{http_code}" https://bell24h-v1-qi0mgdkog-vishaals-projects-892b178d.vercel.app > temp_vercel.txt
set /p vercel_status=<temp_vercel.txt
if "%vercel_status%"=="200" (
    echo ✅ Vercel deployment is working (Status: %vercel_status%)
) else (
    echo ❌ Vercel deployment issue (Status: %vercel_status%)
)
del temp_vercel.txt

echo.
echo [3/6] Testing response time...
curl -s -o nul -w "Time: %%{time_total}s" https://bell24h.com
echo.

echo.
echo [4/6] Downloading site content for analysis...
curl -s https://bell24h.com > site_content.txt

echo [5/6] Checking for key elements...
findstr /i "bell24h" site_content.txt > nul
if %errorlevel%==0 (
    echo ✅ Site contains Bell24H branding
) else (
    echo ❌ Site branding not found
)

findstr /i "viewport" site_content.txt > nul
if %errorlevel%==0 (
    echo ✅ Mobile responsive tags found
) else (
    echo ❌ Mobile responsive tags not found
)

findstr /i "react\|next" site_content.txt > nul
if %errorlevel%==0 (
    echo ✅ React/Next.js framework detected
) else (
    echo ❌ React/Next.js framework not detected
)

echo.
echo [6/6] Opening your site for visual inspection...
start https://bell24h.com

echo.
echo ========================================
echo   VERIFICATION COMPLETE!
echo ========================================
echo.
echo Now check your browser to see your live site!
echo.

del site_content.txt
pause
