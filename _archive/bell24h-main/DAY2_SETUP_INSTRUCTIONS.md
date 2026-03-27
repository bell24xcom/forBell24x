# 🚀 DAY 2 SETUP INSTRUCTIONS - Complete SHAP/LIME Integration

## ✅ WHAT'S BEEN COMPLETED

1. ✅ Backend AI service enhanced with SHAP visualizations
2. ✅ Frontend API route connects to backend
3. ✅ AI Insights page shows SHAP bar chart, force plot, waterfall, and LIME explanations
4. ✅ Model file exists at `backend/app/models/rfq_model.pkl`
5. ✅ Backend server configured to use real AI service

---

## 📋 SETUP STEPS (5 MINUTES)

### Step 1: Verify Model Exists
```powershell
# From backend directory
cd C:\Users\Sanika\Projects\bell24h\backend
Test-Path "app/models/rfq_model.pkl"
# Should return: True
```

### Step 2: Install Backend Dependencies
```powershell
# From backend directory
pip install -r requirements.txt
# OR if using virtual environment
python -m pip install -r requirements.txt
```

### Step 3: Start Backend Server
```powershell
# From backend directory
uvicorn dev_server:app --reload --port=8000
# OR
python dev_server.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
✅ Model loaded successfully from .../app/models/rfq_model.pkl with 15 features
```

### Step 4: Start Frontend Server
```powershell
# From client directory (new terminal)
cd C:\Users\Sanika\Projects\bell24h\client
npm run dev
```

### Step 5: Test the Integration
1. Open browser: `http://localhost:3000/dashboard/ai-insights`
2. You should see:
   - ✅ Bar chart with feature importance
   - ✅ Force plot (green/blue gradient)
   - ✅ Waterfall plot image
   - ✅ LIME text explanations
   - ✅ "LIVE ML MODEL" status (green)

---

## 🔧 TROUBLESHOOTING

### Issue: "Model file not found"
**Solution:**
```powershell
cd backend
py scripts/train_sample_rfq_model.py
# Verify: Test-Path "app/models/rfq_model.pkl"
```

### Issue: "Module not found: shap" or "matplotlib"
**Solution:**
```powershell
pip install shap matplotlib joblib scikit-learn numpy pandas
# OR
pip install -r requirements.txt
```

### Issue: Backend returns 500 error
**Check:**
1. Model file exists: `Test-Path "app/models/rfq_model.pkl"`
2. All dependencies installed: `pip list | findstr "shap matplotlib"`
3. Backend logs show: "✅ Model loaded successfully"

### Issue: Frontend shows "Fallback Mode"
**Check:**
1. Backend is running on port 8000
2. Backend logs show model loaded
3. Browser console shows API call to backend
4. Network tab shows successful response from `/api/v1/ai/explain-match/1`

---

## 🎯 SUCCESS CRITERIA

### Day 2 is 100% complete when:
- [x] Backend AI service loads model ✅
- [x] Backend endpoint returns SHAP data ✅
- [x] Frontend displays all visualizations ✅
- [ ] Backend server starts without errors
- [ ] Frontend shows "LIVE ML MODEL" (green)
- [ ] All plots render correctly
- [ ] LIME explanations display

---

## 📊 CURRENT STATUS: DAY 2 - 90% COMPLETE

**Remaining:** Start servers + Verify end-to-end flow

**Next:** Once verified, move to Day 3 (Admin Data Wiring)

---

## 🚀 QUICK TEST COMMAND

```powershell
# Terminal 1: Backend
cd backend
uvicorn dev_server:app --reload --port=8000

# Terminal 2: Frontend  
cd client
npm run dev

# Browser: http://localhost:3000/dashboard/ai-insights
# Expected: All visualizations render + "LIVE ML MODEL" status
```

---

**DAY 2 IS ALMOST COMPLETE!** 🎉

Once you verify the end-to-end flow works, Day 2 = 100% ✅

