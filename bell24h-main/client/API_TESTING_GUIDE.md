# 🚀 QUICK API TESTING GUIDE

## Method 1: Browser Console Testing

### Step 1: Open Browser Console
1. Go to https://bell24h.com
2. Press F12 (or right-click → Inspect)
3. Click "Console" tab

### Step 2: Run Quick Tests
Copy and paste these commands one by one:

```javascript
// Test 1: Health Check
fetch('/api/health').then(r => r.json()).then(console.log).catch(console.error);

// Test 2: Suppliers API
fetch('/api/suppliers').then(r => r.json()).then(console.log).catch(console.error);

// Test 3: RFQ API
fetch('/api/rfq').then(r => r.json()).then(console.log).catch(console.error);

// Test 4: Auth Check
fetch('/api/auth/check-email').then(r => r.json()).then(console.log).catch(console.error);

// Test 5: Analytics
fetch('/api/analytics/rfq-metrics').then(r => r.json()).then(console.log).catch(console.error);
```

### Step 3: Expected Results
- ✅ **Success**: Returns JSON data
- ❌ **Error**: Shows error message
- 🔄 **Loading**: Shows "Promise" (wait for result)

---

## Method 2: Comprehensive Testing

### Copy this entire script into console:

```javascript
// Comprehensive API Test Suite
console.log('🚀 BELL24H API Testing Started...');

const testEndpoint = async (name, endpoint) => {
  try {
    const response = await fetch(endpoint);
    const data = await response.json();
    console.log(`✅ ${name}:`, data);
    return {name, status: 'SUCCESS', data};
  } catch (error) {
    console.log(`❌ ${name}:`, error.message);
    return {name, status: 'ERROR', error: error.message};
  }
};

// Run all tests
(async () => {
  const results = [];
  
  results.push(await testEndpoint('Health', '/api/health'));
  results.push(await testEndpoint('Suppliers', '/api/suppliers'));
  results.push(await testEndpoint('RFQ', '/api/rfq'));
  results.push(await testEndpoint('Auth Check', '/api/auth/check-email'));
  results.push(await testEndpoint('Analytics', '/api/analytics/rfq-metrics'));
  results.push(await testEndpoint('AI Match', '/api/ai/match'));
  results.push(await testEndpoint('Payments', '/api/payments/create'));
  results.push(await testEndpoint('Voice', '/api/voice/transcribe'));
  
  // Summary
  const success = results.filter(r => r.status === 'SUCCESS').length;
  const errors = results.filter(r => r.status === 'ERROR').length;
  
  console.log(`\n📊 RESULTS: ${success} success, ${errors} errors`);
  
  if (errors === 0) {
    console.log('🎉 ALL APIs WORKING!');
  } else {
    console.log('⚠️ Some APIs need attention.');
  }
})();
```

---

## Method 3: PowerShell Testing

Run this in PowerShell:

```powershell
# Test website APIs
$baseUrl = "https://bell24h.com"
$endpoints = @(
    "/api/health",
    "/api/suppliers", 
    "/api/rfq",
    "/api/auth/check-email",
    "/api/analytics/rfq-metrics"
)

foreach ($endpoint in $endpoints) {
    try {
        $response = Invoke-RestMethod -Uri "$baseUrl$endpoint" -Method Get
        Write-Host "✅ $endpoint : Working" -ForegroundColor Green
    } catch {
        Write-Host "❌ $endpoint : $($_.Exception.Message)" -ForegroundColor Red
    }
}
```

---

## 🎯 What to Look For

### ✅ **Good Results:**
```json
{
  "status": "success",
  "data": [...],
  "message": "API working"
}
```

### ❌ **Error Results:**
```json
{
  "error": "Database connection failed",
  "status": 500
}
```

### 🔄 **Loading States:**
- Shows "Promise" initially
- Wait for actual response

---

## 📊 Test Results Template

**API Test Results:**
- [ ] Health API: ✅/❌
- [ ] Suppliers API: ✅/❌  
- [ ] RFQ API: ✅/❌
- [ ] Auth API: ✅/❌
- [ ] Analytics API: ✅/❌
- [ ] AI API: ✅/❌
- [ ] Payment API: ✅/❌
- [ ] Voice API: ✅/❌

**Overall Status:** ✅ All Working / ⚠️ Some Issues / ❌ Major Problems
