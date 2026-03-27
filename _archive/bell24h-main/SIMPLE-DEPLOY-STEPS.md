# 🎯 SUPER SIMPLE DEPLOYMENT - Step by Step (For Non-Coders)

## ✅ What You Need Before Starting

1. ✅ Your Oracle VM is running (you already SSH'd into it - that's good!)
2. ✅ Your Neon database connection string (you should have this)
3. ✅ Your GitHub repository URL (where your code is stored)

---

## 📋 STEP 1: Open PowerShell on Your Computer

1. Press `Windows Key` + `R`
2. Type: `powershell`
3. Press `Enter`
4. A black window opens - this is PowerShell

---

## 📋 STEP 2: Connect to Your Oracle VM

**Copy and paste this EXACT command** (one line):

```powershell
ssh -i "C:\Users\Sanika\Downloads\oracle-ssh-bell\ssh-key-2025-10-01.key" ubuntu@80.225.192.248
```

**Press Enter**

**What you should see:**
- It might ask "Are you sure you want to continue connecting?" - Type: `yes` and press Enter
- You should see: `Welcome to Ubuntu...` and `ubuntu@bell24h-n8n:~$`
- ✅ **You're now connected to your server!**

---

## 📋 STEP 3: Check if Docker is Installed

**Copy and paste this command:**

```bash
docker --version
```

**Press Enter**

**What you should see:**
- If you see a version number (like `Docker version 24.0.5`) → ✅ Docker is installed, go to STEP 4
- If you see `command not found` → Docker is NOT installed, do STEP 3A below

### STEP 3A: Install Docker (Only if needed)

**Copy and paste these commands ONE BY ONE** (wait for each to finish):

```bash
sudo apt update
```

**Press Enter, wait for it to finish**

```bash
sudo apt install -y docker.io
```

**Press Enter, wait for it to finish (this takes 2-3 minutes)**

```bash
sudo systemctl enable docker
```

**Press Enter**

```bash
sudo systemctl start docker
```

**Press Enter**

```bash
sudo usermod -aG docker ubuntu
```

**Press Enter**

**IMPORTANT:** Now you need to **disconnect and reconnect**:
1. Type: `exit` and press Enter (you'll be back on your computer)
2. Run the SSH command from STEP 2 again to reconnect
3. Then continue to STEP 4

---

## 📋 STEP 4: Get Your Code from GitHub

**Copy and paste this command** (replace `YOUR_GITHUB_USERNAME` with your actual GitHub username):

```bash
cd ~ && git clone https://github.com/YOUR_GITHUB_USERNAME/bell24h.git
```

**Example:** If your GitHub username is `digitexstudio`, the command would be:
```bash
cd ~ && git clone https://github.com/digitexstudio/bell24h.git
```

**Press Enter, wait for it to finish**

**What you should see:**
- It downloads your code (takes 1-2 minutes)
- You'll see: `Cloning into 'bell24h'...` and then `ubuntu@bell24h-n8n:~$`

**If you already have the code:**
```bash
cd ~/bell24h && git pull
```

---

## 📋 STEP 5: Fix the Configuration File

**Copy and paste these commands ONE BY ONE:**

```bash
cd ~/bell24h/client
```

**Press Enter**

```bash
sed -i "s/output: 'export',/\/\/ output: 'export', \/\/ Disabled for Oracle VM/" next.config.js
```

**Press Enter**

```bash
cd ~/bell24h
```

**Press Enter**

---

## 📋 STEP 6: Create Environment File

**Copy and paste this command:**

```bash
cp client/env.production.example client/.env.production
```

**Press Enter**

**Now you need to EDIT this file. Copy and paste:**

```bash
nano client/.env.production
```

**Press Enter**

**What you should see:**
- A text editor opens with lots of lines
- You can use arrow keys to move around

**What to do:**
1. Find the line that says `DATABASE_URL=postgresql://...`
2. Replace it with your **actual Neon database URL** (you should have this)
3. Find `NEXTAUTH_SECRET=` and add a random secret (or leave it for now)
4. Find `NEXT_PUBLIC_APP_URL=` and make sure it says `https://bell24h.com`

**To save and exit:**
1. Press `Ctrl + X`
2. Press `Y` (to confirm save)
3. Press `Enter`

---

## 📋 STEP 7: Build Your App

**Copy and paste this command:**

```bash
docker build -t bell24h:latest -f Dockerfile .
```

**Press Enter**

**What you should see:**
- It starts building (this takes 5-10 minutes)
- You'll see lots of text scrolling
- Wait until you see: `Successfully built` and `Successfully tagged bell24h:latest`
- ✅ **Build complete!**

---

## 📋 STEP 8: Stop Old Container (If Any)

**Copy and paste these commands:**

```bash
docker stop bell24h-app 2>/dev/null || true
```

**Press Enter**

```bash
docker rm bell24h-app 2>/dev/null || true
```

**Press Enter**

---

## 📋 STEP 9: Start Your App

**Copy and paste this command:**

```bash
docker run -d --name bell24h-app --restart unless-stopped -p 3000:3000 --env-file client/.env.production bell24h:latest
```

**Press Enter**

**What you should see:**
- A long string of letters/numbers (this is the container ID)
- ✅ **Your app is now running!**

---

## 📋 STEP 10: Wait and Test

**Copy and paste this command:**

```bash
sleep 30
```

**Press Enter** (wait 30 seconds)

**Then test if it's working:**

```bash
curl http://localhost:3000/api/health
```

**Press Enter**

**What you should see:**
- If you see `{"status":"ok"}` or similar → ✅ **SUCCESS! Your app is running!**
- If you see an error → Check logs (see STEP 11)

---

## 📋 STEP 11: Check Logs (If Something Went Wrong)

**Copy and paste:**

```bash
docker logs bell24h-app --tail 50
```

**Press Enter**

**This shows you what's happening. Look for errors in red.**

---

## 📋 STEP 12: Test Your App

**Open a web browser on your computer and go to:**

```
http://80.225.192.248:3000
```

**What you should see:**
- Your Bell24h website loads! ✅

---

## 📋 STEP 13: Update DNS (Make Your Domain Work)

**Go to Cloudflare Dashboard:**

1. Login to [dash.cloudflare.com](https://dash.cloudflare.com)
2. Click on your domain `bell24h.com`
3. Go to **DNS** → **Records**
4. Find the record for `@` (or `bell24h.com`)
5. Click **Edit**
6. Change **Type** to `A`
7. Change **Content** to: `80.225.192.248`
8. Turn **Proxy** OFF (gray cloud, not orange)
9. Click **Save**
10. Do the same for `www` record

**Wait 5-30 minutes for DNS to update**

**Then test:** `https://bell24h.com`

---

## ✅ SUCCESS CHECKLIST

- [ ] Connected to Oracle VM (STEP 2)
- [ ] Docker installed (STEP 3)
- [ ] Code downloaded (STEP 4)
- [ ] Configuration fixed (STEP 5)
- [ ] Environment file created (STEP 6)
- [ ] App built successfully (STEP 7)
- [ ] App running (STEP 9)
- [ ] Health check passed (STEP 10)
- [ ] Website loads at `http://80.225.192.248:3000` (STEP 12)
- [ ] DNS updated in Cloudflare (STEP 13)

---

## 🆘 TROUBLESHOOTING

### Problem: "Permission denied" when connecting
**Solution:** Make sure you're using the correct key file path

### Problem: "Docker build failed"
**Solution:** Check if you have enough disk space: `df -h`

### Problem: "Container won't start"
**Solution:** Check logs: `docker logs bell24h-app`

### Problem: "Can't find .env.production"
**Solution:** Make sure you're in the right directory: `cd ~/bell24h`

---

## 📞 Need Help?

If you get stuck at any step:
1. Copy the **exact error message** you see
2. Tell me which **STEP number** you're on
3. I'll help you fix it!

---

**🎉 Once all steps are done, your Bell24h app will be LIVE on Oracle VM!**

