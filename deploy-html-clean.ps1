# DEPLOY FAST HTML SITE - CLEAN VERSION
Write-Host "=== DEPLOY FAST HTML SITE NOW ===" -ForegroundColor Green
Write-Host "Using existing HTML pages for maximum speed!" -ForegroundColor Yellow

# Create public directories
$publicDirs = @("public", "public/css", "public/js")
foreach ($dir in $publicDirs) {
    if (!(Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force
        Write-Host "Created directory: $dir" -ForegroundColor Green
    }
}

# Create simple CSS
$cssContent = @"
* { margin: 0; padding: 0; box-sizing: border-box; }
body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
.container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
.header { background: #1a1a1a; color: white; padding: 1rem 0; }
.hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 4rem 0; text-align: center; }
.hero h1 { font-size: 3rem; margin-bottom: 1rem; }
.btn { display: inline-block; padding: 12px 30px; background: #00d4aa; color: white; text-decoration: none; border-radius: 5px; margin: 0.5rem; }
.btn:hover { background: #00b894; }
.modal { display: none; position: fixed; z-index: 1000; left: 0; top: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); }
.modal-content { background: white; margin: 5% auto; padding: 2rem; border-radius: 10px; width: 90%; max-width: 400px; }
.close { float: right; font-size: 28px; font-weight: bold; cursor: pointer; }
.form-group { margin-bottom: 1rem; }
.form-group input { width: 100%; padding: 12px; border: 2px solid #ddd; border-radius: 5px; }
.error { color: #e74c3c; font-size: 0.9rem; }
.success { color: #27ae60; font-size: 0.9rem; }
"@

Set-Content -Path "public/css/style.css" -Value $cssContent -Encoding UTF8
Write-Host "Created CSS" -ForegroundColor Green

# Create simple JavaScript
$jsContent = @"
document.addEventListener('DOMContentLoaded', function() {
    const loginBtn = document.getElementById('loginBtn');
    const modal = document.getElementById('authModal');
    const closeBtn = document.querySelector('.close');
    
    if (loginBtn) loginBtn.addEventListener('click', () => modal.style.display = 'block');
    if (closeBtn) closeBtn.addEventListener('click', () => modal.style.display = 'none');
    
    window.addEventListener('click', (e) => {
        if (e.target === modal) modal.style.display = 'none';
    });
});
"@

Set-Content -Path "public/js/mobile-otp.js" -Value $jsContent -Encoding UTF8
Write-Host "Created JavaScript" -ForegroundColor Green

# Create simple HTML
$htmlContent = @"
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bell24H - B2B Marketplace</title>
    <link rel="stylesheet" href="/css/style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1>Bell24H</h1>
        </div>
    </header>
    
    <section class="hero">
        <div class="container">
            <h1>India's Leading B2B Marketplace</h1>
            <p>Connect with verified suppliers and buyers</p>
            <button class="btn" id="loginBtn">Login / Join Free</button>
            <a href="/register" class="btn">Register Now</a>
        </div>
    </section>
    
    <div id="authModal" class="modal">
        <div class="modal-content">
            <span class="close">&times;</span>
            <h2>Login with Mobile OTP</h2>
            <div class="form-group">
                <input type="tel" placeholder="Enter mobile number">
            </div>
            <button class="btn">Send OTP</button>
        </div>
    </div>
    
    <script src="/js/mobile-otp.js"></script>
</body>
</html>
"@

Set-Content -Path "public/index.html" -Value $htmlContent -Encoding UTF8
Write-Host "Created HTML homepage" -ForegroundColor Green

# Create Vercel config
$vercelConfig = @'
{
  "version": 2,
  "builds": [
    {
      "src": "public/**/*",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/public/$1"
    }
  ]
}
'@

Set-Content -Path "vercel.json" -Value $vercelConfig -Encoding UTF8
Write-Host "Created Vercel config" -ForegroundColor Green

Write-Host "=== DEPLOYMENT COMPLETE ===" -ForegroundColor Green
Write-Host "Fast HTML site ready for deployment!" -ForegroundColor Yellow
Write-Host "Run: vercel --prod" -ForegroundColor White