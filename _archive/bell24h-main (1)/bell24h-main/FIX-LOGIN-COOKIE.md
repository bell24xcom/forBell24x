# 🔧 **FIX LOGIN COOKIE ISSUE — 2 MINUTES**

## **PROBLEM**
- Middleware checks for `auth_token` cookie
- Login stores token in `localStorage` only
- Result: User gets redirected back to login after OTP

## **SOLUTION**
Update login to set BOTH cookie AND localStorage

---

## **STEP-BY-STEP (COPY-PASTE)**

### **Option A: Edit on VM (SSH)**

```bash
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248

cd ~/bell24h/client/src/app/auth/login-otp

nano page.tsx
```

**Find this line (around line 92-94):**
```typescript
localStorage.setItem('auth_token', data.token);
```

**Replace with:**
```typescript
// Set cookie for middleware (30 days expiry)
document.cookie = `auth_token=${data.token}; path=/; max-age=2592000; SameSite=Lax`;
// Also store in localStorage for client-side access
localStorage.setItem('auth_token', data.token);
```

**Save**: Ctrl+O → Enter → Ctrl+X

**Rebuild Docker:**
```bash
cd ~/bell24h
docker build --no-cache -t bell24h:latest -f Dockerfile .
docker stop bell24h && docker rm bell24h
docker run -d --name bell24h --restart always -p 80:3000 --env-file ~/bell24h/client/.env.production bell24h:latest
```

---

### **Option B: Edit Locally & Push**

1. **Edit file locally:**
   - `client/src/app/auth/login-otp/page.tsx`
   - Find: `localStorage.setItem('auth_token', data.token);`
   - Replace with code above

2. **Commit & push:**
   ```powershell
   git add .
   git commit -m "Fix login cookie for middleware"
   git push
   ```

3. **If auto-deploy is setup**: Wait 2-3 minutes for deployment
4. **If not**: SSH and rebuild manually (see Option A)

---

## **VERIFICATION**

After fix:
1. Login with OTP
2. Should redirect to `/dashboard` (not back to login)
3. Dashboard should load without redirect loop

---

**TIME**: 2 minutes  
**PRIORITY**: 🟡 Medium (but recommended before MSG91 approval)

