# 🚀 LIVE WEBSITE VERIFICATION SCRIPT

## IMMEDIATE VERIFICATION STEPS

### 1. **Check Website Accessibility**
```bash
# Test if website loads
curl -I https://bell24h.com
# Expected: HTTP 200 OK
```

### 2. **Test Critical Pages**
Open browser and test these URLs:

**Homepage:**
- ✅ https://bell24h.com
- ✅ Should load without errors
- ✅ Check for console errors (F12 → Console)

**Authentication:**
- ✅ https://bell24h.com/auth/login
- ✅ https://bell24h.com/auth/register
- ✅ https://bell24h.com/auth/mobile-otp

**Dashboard (after login):**
- ✅ https://bell24h.com/dashboard
- ✅ Should redirect to login if not authenticated

**Key Feature Pages:**
- ✅ https://bell24h.com/suppliers
- ✅ https://bell24h.com/rfq
- ✅ https://bell24h.com/search
- ✅ https://bell24h.com/categories

**Admin Pages:**
- ✅ https://bell24h.com/admin
- ✅ https://bell24h.com/admin/dashboard
- ✅ https://bell24h.com/admin/cms
- ✅ https://bell24h.com/admin/onboarding

### 3. **API Endpoint Testing**
Test these API endpoints:

```javascript
// Run in browser console (F12 → Console)
// Test health endpoint
fetch('/api/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test suppliers API
fetch('/api/suppliers')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);

// Test RFQ API
fetch('/api/rfq')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

### 4. **Vercel Dashboard Check**
- Go to: https://vercel.com/dashboard/bell24h-v1
- Check latest deployment status
- Should show: 🟢 **Ready**
- Review build logs for any errors

### 5. **Performance Check**
- Test page load speed
- Check mobile responsiveness
- Verify all images load correctly
- Test form submissions

---

## EXPECTED RESULTS

### ✅ **SUCCESS INDICATORS:**
- Website loads without 404 errors
- All pages render correctly
- No console errors
- APIs return data (not 500 errors)
- Authentication flow works
- Dashboard accessible after login

### ❌ **FAILURE INDICATORS:**
- 404 errors on main pages
- White screen of death
- Console errors
- API endpoints return 500 errors
- Authentication not working
- Build still failing on Vercel

---

## QUICK TEST COMMANDS

### PowerShell Test Script:
```powershell
# Test website accessibility
try {
    $response = Invoke-WebRequest -Uri "https://bell24h.com" -Method Head
    Write-Host "✅ Website accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Website not accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test key pages
$pages = @(
    "https://bell24h.com/auth/login",
    "https://bell24h.com/suppliers", 
    "https://bell24h.com/rfq",
    "https://bell24h.com/admin"
)

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri $page -Method Head
        Write-Host "✅ $page : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $page : $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

---

## REPORT TEMPLATE

**Deployment Verification Report:**
- [ ] Website loads (https://bell24h.com)
- [ ] Authentication pages work
- [ ] Dashboard accessible
- [ ] Key feature pages load
- [ ] Admin pages accessible
- [ ] APIs respond correctly
- [ ] No console errors
- [ ] Mobile responsive
- [ ] Performance acceptable

**Issues Found:**
- [ ] List any errors or problems

**Overall Status:** ✅ SUCCESS / ❌ NEEDS FIXES
