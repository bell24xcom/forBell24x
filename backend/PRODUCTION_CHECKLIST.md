# BELL24h Production Deployment Checklist

## ✅ Pre-Deployment Checklist

### DNS Configuration
- [ ] Domain `bell24h.com` is registered and active
- [ ] DNS A record: `@` → `76.76.21.21` (Vercel)
- [ ] DNS CNAME: `www` → `cname.vercel-dns.com`
- [ ] DNS CNAME: `api` → `YOUR_ORACLE_VM_IP` (Replace with actual IP)
- [ ] DNS propagation verified (use `dig api.bell24h.com`)

### Oracle VM Setup
- [ ] Oracle VM created (2 vCPU, 1GB RAM, 180GB disk)
- [ ] SSH access configured
- [ ] Firewall rules set (ports 22, 80, 443, 5678)
- [ ] Ubuntu 20.04+ installed
- [ ] User `ubuntu` has sudo access

### Backend Code
- [ ] `rfq_model.pkl` exists in `backend/app/models/`
- [ ] All dependencies in `requirements.txt`
- [ ] `dev_server.py` tested locally
- [ ] All `__init__.py` files present
- [ ] Dockerfile tested locally

### Frontend Code
- [ ] Environment variables configured in Vercel
- [ ] `NEXT_PUBLIC_BACKEND_URL=https://api.bell24h.com`
- [ ] `BACKEND_URL=https://api.bell24h.com`
- [ ] `NEXT_PUBLIC_APP_URL=https://bell24h.com`

### Services Configuration
- [ ] MSG91 API key configured
- [ ] MSG91 sender ID configured
- [ ] Database (Neon PostgreSQL) configured
- [ ] n8n installed and configured (if needed)

## 🚀 Deployment Steps

### Step 1: Deploy Backend to Oracle VM
- [ ] SSH into Oracle VM
- [ ] Clone/update repository
- [ ] Run `./deploy.sh` or manual deployment
- [ ] Verify Docker container running
- [ ] Verify Caddy running
- [ ] Test `https://api.bell24h.com/api/health`

### Step 2: Deploy Frontend to Vercel
- [ ] Update environment variables in Vercel
- [ ] Push code to GitHub
- [ ] Verify Vercel auto-deployment
- [ ] Test `https://bell24h.com`

### Step 3: Verify Endpoints
- [ ] `https://bell24h.com` loads correctly
- [ ] `https://api.bell24h.com/api/health` returns healthy
- [ ] OTP login works
- [ ] AI Insights page loads SHAP/LIME
- [ ] All API endpoints respond correctly

## 🔍 Post-Deployment Verification

### Backend Health
- [ ] `curl https://api.bell24h.com/api/health` returns `{"status":"healthy"}`
- [ ] Docker container is running: `docker ps | grep bell24h-prod`
- [ ] Caddy is running: `sudo systemctl status caddy`
- [ ] SSL certificate is valid (check browser)
- [ ] Backend logs show no errors

### Frontend Health
- [ ] `https://bell24h.com` loads without errors
- [ ] No console errors in browser
- [ ] All pages load correctly
- [ ] API calls to backend succeed
- [ ] OTP SMS received successfully

### AI Features
- [ ] SHAP visualizations render correctly
- [ ] LIME explanations display
- [ ] Model predictions work
- [ ] Force plots show data
- [ ] Waterfall plots generate

### Security
- [ ] HTTPS enforced (no HTTP)
- [ ] SSL certificate valid
- [ ] CORS configured correctly
- [ ] Environment variables secured
- [ ] API keys not exposed

## 📊 Monitoring Setup

### Logs
- [ ] Backend logs accessible: `docker logs bell24h-prod`
- [ ] Caddy logs accessible: `sudo tail -f /var/log/caddy/bell24h-api.log`
- [ ] Frontend logs in Vercel dashboard

### Monitoring (Optional)
- [ ] Sentry configured for error tracking
- [ ] Google Analytics configured
- [ ] Uptime monitoring setup
- [ ] Alert system configured

## 🐛 Troubleshooting

### If Backend Not Responding
1. Check Docker container: `docker ps`
2. Check container logs: `docker logs bell24h-prod`
3. Check Caddy status: `sudo systemctl status caddy`
4. Check firewall: `sudo ufw status`
5. Test local endpoint: `curl http://localhost:8000/api/health`

### If Frontend Not Loading
1. Check Vercel deployment status
2. Check browser console for errors
3. Verify environment variables in Vercel
4. Check API endpoint connectivity
5. Verify DNS propagation

### If OTP Not Working
1. Check MSG91 API key
2. Check MSG91 sender ID
3. Verify backend logs for SMS sending
4. Test MSG91 API directly
5. Check phone number format

## 🎯 Success Criteria

- ✅ All checklist items completed
- ✅ All endpoints responding
- ✅ No errors in logs
- ✅ SSL certificates valid
- ✅ OTP SMS working
- ✅ AI features working
- ✅ Frontend loading correctly
- ✅ Zero server cost (Oracle VM free tier)

## 📝 Notes

- Oracle VM free tier: Always Free (2 vCPU, 1GB RAM)
- Vercel: Free tier for frontend hosting
- Caddy: Free HTTPS with Let's Encrypt
- Domain: Paid domain `bell24h.com`

---

**Deployment Date:** _______________
**Deployed By:** _______________
**Status:** ☐ Pending ☐ In Progress ☐ Complete

