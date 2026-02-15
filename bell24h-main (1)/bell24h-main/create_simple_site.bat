@echo off
echo === CREATING SIMPLE LAUNCH SITE ===
echo.

echo Step 1: Creating simple HTML site...
mkdir C:\bell24h-launch 2>nul
cd C:\bell24h-launch

echo ^<!DOCTYPE html^> > index.html
echo ^<html^> >> index.html
echo ^<head^> >> index.html
echo     ^<title^>Bell24H - India's B2B Marketplace^</title^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1"^> >> index.html
echo     ^<style^> >> index.html
echo         body { margin: 0; font-family: Arial; background: #f5f5f5; } >> index.html
echo         .container { max-width: 1200px; margin: 0 auto; padding: 20px; text-align: center; } >> index.html
echo         .hero { background: white; padding: 60px 20px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); } >> index.html
echo         h1 { color: #2c3e50; font-size: 3em; margin: 0; } >> index.html
echo         .launch { color: #e74c3c; font-size: 1.5em; margin: 20px 0; } >> index.html
echo         .contact { background: #3498db; color: white; padding: 15px 30px; text-decoration: none; display: inline-block; border-radius: 5px; margin-top: 20px; } >> index.html
echo     ^</style^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo     ^<div class="container"^> >> index.html
echo         ^<div class="hero"^> >> index.html
echo             ^<h1^>Bell24H^</h1^> >> index.html
echo             ^<p class="launch"^>Launching October 2, 2025^</p^> >> index.html
echo             ^<p^>India's Premier B2B Marketplace for Industrial Supplies^</p^> >> index.html
echo             ^<p^>400+ Categories ^| Trusted Suppliers ^| Best Prices^</p^> >> index.html
echo             ^<a href="mailto:info@bell24h.com" class="contact"^>Contact Us^</a^> >> index.html
echo         ^</div^> >> index.html
echo     ^</div^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

echo ✓ Simple site created

echo.
echo Step 2: Deploying to Vercel...
npx vercel --prod --yes

echo.
echo === SIMPLE SITE DEPLOYED ===
echo ✅ You now have a working site
echo ✅ Update your domain to point to this deployment
echo ✅ You can enhance it after October 2nd
echo.

pause
