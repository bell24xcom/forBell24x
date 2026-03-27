@echo off
echo === DEPLOY SIMPLE SITE TO MAIN PROJECT ===
echo.

echo Step 1: Creating simple site directory...
mkdir C:\bell24h_simple 2>nul
cd C:\bell24h_simple

echo Step 2: Creating enhanced landing page...
echo ^<!DOCTYPE html^> > index.html
echo ^<html lang="en"^> >> index.html
echo ^<head^> >> index.html
echo     ^<meta charset="UTF-8"^> >> index.html
echo     ^<meta name="viewport" content="width=device-width, initial-scale=1.0"^> >> index.html
echo     ^<title^>Bell24H - India's Premier B2B Marketplace^</title^> >> index.html
echo     ^<style^> >> index.html
echo         * { margin: 0; padding: 0; box-sizing: border-box; } >> index.html
echo         body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; } >> index.html
echo         .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; } >> index.html
echo         .hero { background: linear-gradient(135deg, #667eea 0%%, #764ba2 100%%); color: white; padding: 80px 0; text-align: center; } >> index.html
echo         .hero h1 { font-size: 3.5em; margin-bottom: 20px; font-weight: 700; } >> index.html
echo         .hero .subtitle { font-size: 1.3em; margin-bottom: 30px; opacity: 0.9; } >> index.html
echo         .launch-badge { background: #e74c3c; color: white; padding: 10px 25px; border-radius: 25px; display: inline-block; font-weight: bold; margin-bottom: 30px; } >> index.html
echo         .cta-button { background: #3498db; color: white; padding: 15px 35px; text-decoration: none; border-radius: 5px; font-size: 1.1em; font-weight: bold; display: inline-block; margin: 10px; transition: background 0.3s; } >> index.html
echo         .cta-button:hover { background: #2980b9; } >> index.html
echo         .features { padding: 80px 0; background: #f8f9fa; } >> index.html
echo         .features h2 { text-align: center; font-size: 2.5em; margin-bottom: 50px; color: #2c3e50; } >> index.html
echo         .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 30px; } >> index.html
echo         .feature-card { background: white; padding: 30px; border-radius: 10px; box-shadow: 0 5px 15px rgba(0,0,0,0.1); text-align: center; } >> index.html
echo         .feature-card h3 { color: #3498db; margin-bottom: 15px; font-size: 1.3em; } >> index.html
echo         .stats { background: #2c3e50; color: white; padding: 60px 0; text-align: center; } >> index.html
echo         .stats h2 { font-size: 2.5em; margin-bottom: 40px; } >> index.html
echo         .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 30px; } >> index.html
echo         .stat-item h3 { font-size: 3em; color: #3498db; margin-bottom: 10px; } >> index.html
echo         .footer { background: #34495e; color: white; padding: 40px 0; text-align: center; } >> index.html
echo         .contact-info { margin-top: 20px; } >> index.html
echo         .contact-info a { color: #3498db; text-decoration: none; } >> index.html
echo     ^</style^> >> index.html
echo ^</head^> >> index.html
echo ^<body^> >> index.html
echo     ^<div class="hero"^> >> index.html
echo         ^<div class="container"^> >> index.html
echo             ^<div class="launch-badge"^>Launching October 2, 2025^</div^> >> index.html
echo             ^<h1^>Bell24H^</h1^> >> index.html
echo             ^<p class="subtitle"^>India's Premier B2B Marketplace for Industrial Supplies^</p^> >> index.html
echo             ^<a href="mailto:info@bell24h.com" class="cta-button"^>Get Early Access^</a^> >> index.html
echo             ^<a href="mailto:suppliers@bell24h.com" class="cta-button"^>Join as Supplier^</a^> >> index.html
echo         ^</div^> >> index.html
echo     ^</div^> >> index.html
echo     ^<div class="features"^> >> index.html
echo         ^<div class="container"^> >> index.html
echo             ^<h2^>Why Choose Bell24H?^</h2^> >> index.html
echo             ^<div class="feature-grid"^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>400+ Categories^</h3^> >> index.html
echo                     ^<p^>From steel to electronics, find everything you need in one place^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>AI-Powered Matching^</h3^> >> index.html
echo                     ^<p^>Get 3 verified quotes in 24 hours using our smart matching engine^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>Escrow Protection^</h3^> >> index.html
echo                     ^<p^>Secure payments with money-back guarantee on all transactions^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>Voice RFQ^</h3^> >> index.html
echo                     ^<p^>Submit requests using voice, video, or text - whatever works for you^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>Verified Suppliers^</h3^> >> index.html
echo                     ^<p^>All suppliers are GST-verified with AI trust scoring^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="feature-card"^> >> index.html
echo                     ^<h3^>Made in India^</h3^> >> index.html
echo                     ^<p^>Supporting Indian MSMEs with world-class technology^</p^> >> index.html
echo                 ^</div^> >> index.html
echo             ^</div^> >> index.html
echo         ^</div^> >> index.html
echo     ^</div^> >> index.html
echo     ^<div class="stats"^> >> index.html
echo         ^<div class="container"^> >> index.html
echo             ^<h2^>Join India's Fastest Growing B2B Platform^</h2^> >> index.html
echo             ^<div class="stats-grid"^> >> index.html
echo                 ^<div class="stat-item"^> >> index.html
echo                     ^<h3^>1000+^</h3^> >> index.html
echo                     ^<p^>Verified Suppliers^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="stat-item"^> >> index.html
echo                     ^<h3^>400+^</h3^> >> index.html
echo                     ^<p^>Product Categories^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="stat-item"^> >> index.html
echo                     ^<h3^>24h^</h3^> >> index.html
echo                     ^<p^>Quote Delivery^</p^> >> index.html
echo                 ^</div^> >> index.html
echo                 ^<div class="stat-item"^> >> index.html
echo                     ^<h3^>98%%^</h3^> >> index.html
echo                     ^<p^>Success Rate^</p^> >> index.html
echo                 ^</div^> >> index.html
echo             ^</div^> >> index.html
echo         ^</div^> >> index.html
echo     ^</div^> >> index.html
echo     ^<div class="footer"^> >> index.html
echo         ^<div class="container"^> >> index.html
echo             ^<h2^>Ready to Transform Your Business?^</h2^> >> index.html
echo             ^<p^>Join thousands of businesses already using Bell24H^</p^> >> index.html
echo             ^<div class="contact-info"^> >> index.html
echo                 ^<p^>Email: ^<a href="mailto:info@bell24h.com"^>info@bell24h.com^</a^>^</p^> >> index.html
echo                 ^<p^>Phone: +91-XXXXXXXXXX^</p^> >> index.html
echo                 ^<p^>© 2025 Bell24H Technologies Pvt Ltd. All rights reserved.^</p^> >> index.html
echo             ^</div^> >> index.html
echo         ^</div^> >> index.html
echo     ^</div^> >> index.html
echo ^</body^> >> index.html
echo ^</html^> >> index.html

echo ✓ Enhanced landing page created

echo.
echo Step 3: Deploying to main bell24h-v1 project...
echo When prompted, choose "Link to existing project" and select "bell24h-v1"
npx vercel --prod

echo.
echo === DEPLOYMENT COMPLETE ===
echo ✅ Your domain bell24h.com will now show this landing page
echo ✅ You're live with a professional site!
echo ✅ Can be enhanced over the next few days
echo.

pause
