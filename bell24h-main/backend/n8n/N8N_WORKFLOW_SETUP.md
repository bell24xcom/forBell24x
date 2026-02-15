# n8n Workflow Setup Guide for BELL24h

## 🎯 Overview

This guide will help you import and activate the RFQ AI Matching and Marketing Automation workflows in n8n.

## 📋 Prerequisites

1. ✅ n8n installed and running on Oracle VM (port 5678)
2. ✅ FastAPI backend deployed at `https://api.bell24h.com`
3. ✅ MSG91 API key configured
4. ✅ Google Sheets API credentials (optional, for logging)

## 🚀 Quick Setup (10 minutes)

### Step 1: Access n8n Editor

Open your browser and go to:
```
https://n8n.bell24h.com
```

Or if not using HTTPS:
```
http://YOUR_ORACLE_VM_IP:5678
```

### Step 2: Import RFQ AI Matching Workflow

1. Click **"Workflows"** in the left sidebar
2. Click **"Import from File"** or **"+"** → **"Import from File"**
3. Select `backend/n8n/workflows/rfq-ai-matching.json`
4. Click **"Import"**

### Step 3: Configure Environment Variables

Before activating the workflow, set these environment variables in n8n:

1. Go to **Settings** → **Environment Variables**
2. Add the following variables:

```env
MSG91_API_KEY=your_msg91_api_key_here
MSG91_RFQ_WINNER_TEMPLATE_ID=your_template_id_here
MSG91_WELCOME_TEMPLATE_ID=your_welcome_template_id_here
MSG91_VERIFICATION_REMINDER_TEMPLATE_ID=your_reminder_template_id_here
GOOGLE_SHEETS_RFQ_LOG_ID=your_google_sheets_id_here (optional)
GOOGLE_SHEETS_SUPPLIERS_ID=your_google_sheets_id_here (optional)
```

### Step 4: Configure Google Sheets (Optional)

If you want to log RFQ winners and suppliers to Google Sheets:

1. Click on the **"Google Sheets - Log Win"** node
2. Click **"Connect Google Sheets"**
3. Follow the OAuth flow to authorize n8n
4. Repeat for **"Google Sheets - Add to Active"** node

### Step 5: Test the Workflow

1. Click **"Execute Workflow"** button (play icon)
2. Or use the webhook URL to test:
   ```bash
   curl -X POST https://n8n.bell24h.com/webhook/rfq-new \
     -H "Content-Type: application/json" \
     -d '{
       "id": 1001,
       "price": 125000,
       "lead_time": 7,
       "supplier_rating": 4.8,
       "distance_km": 89,
       "past_on_time_rate": 0.97,
       "supplier_id": 1,
       "supplier_phone": "+919819049523"
     }'
   ```

### Step 6: Activate the Workflow

1. Toggle the **"Active"** switch at the top right
2. The workflow is now live and will trigger on webhook calls

### Step 7: Import Marketing Automation Workflow

Repeat steps 2-6 for `backend/n8n/workflows/marketing-automation.json`

## 📊 Workflow Details

### RFQ AI Matching Workflow

**Purpose**: Automatically match RFQs with suppliers using SHAP/LIME AI, send winner notifications, and log results.

**Flow**:
1. **Webhook** receives new RFQ
2. **Call SHAP API** to get AI predictions and explanations
3. **Extract Winner** from SHAP results
4. **Send SMS** to winner via MSG91
5. **Log to Google Sheets** (optional)
6. **Generate SHAP Report** if model was used

**Webhook URL**: `https://n8n.bell24h.com/webhook/rfq-new`

**Test Payload**:
```json
{
  "id": 1001,
  "price": 125000,
  "lead_time": 7,
  "supplier_rating": 4.8,
  "distance_km": 89,
  "past_on_time_rate": 0.97,
  "supplier_id": 1,
  "supplier_phone": "+919819049523"
}
```

### Marketing Automation Workflow

**Purpose**: Automate supplier onboarding with welcome messages, verification reminders, and status tracking.

**Flow**:
1. **Webhook** receives new supplier registration
2. **Send Welcome SMS** via MSG91
3. **Wait 24 hours**
4. **Check Verification Status**
5. **IF Verified**: Add to Active Suppliers sheet
6. **ELSE**: Send reminder SMS and flag as pending

**Webhook URL**: `https://n8n.bell24h.com/webhook/supplier-new`

**Test Payload**:
```json
{
  "id": 1,
  "name": "Test Supplier",
  "mobile": "+919819049523",
  "phone": "+919819049523",
  "email": "supplier@example.com"
}
```

## 🔧 Configuration

### MSG91 Template Setup

1. Go to MSG91 Dashboard → **Templates**
2. Create these templates:

#### RFQ Winner Template
```
Template ID: [YOUR_TEMPLATE_ID]
Message: Congratulations! You won RFQ #{{VAR1}} with score {{VAR2}}. Login to view details: https://bell24h.com/rfq/{{VAR1}}
Variables: VAR1 (RFQ ID), VAR2 (Score)
```

#### Welcome Template
```
Template ID: [YOUR_TEMPLATE_ID]
Message: Welcome {{VAR1}} to BELL24h! Verify your account: {{VAR2}}
Variables: VAR1 (Name), VAR2 (Verification URL)
```

#### Verification Reminder Template
```
Template ID: [YOUR_TEMPLATE_ID]
Message: Hi {{VAR1}}, please verify your BELL24h account: {{VAR2}}
Variables: VAR1 (Name), VAR2 (Verification URL)
```

### Google Sheets Setup (Optional)

1. Create a new Google Sheet
2. Create two sheets: "RFQ Winners" and "Active Suppliers"
3. Copy the Sheet ID from the URL: `https://docs.google.com/spreadsheets/d/[SHEET_ID]/edit`
4. Add the Sheet ID to n8n environment variables

## 🧪 Testing

### Test RFQ AI Matching

```bash
# Test webhook
curl -X POST https://n8n.bell24h.com/webhook/rfq-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1001,
    "price": 125000,
    "lead_time": 7,
    "supplier_rating": 4.8,
    "distance_km": 89,
    "past_on_time_rate": 0.97,
    "supplier_id": 1,
    "supplier_phone": "+919819049523"
  }'

# Check n8n execution log
# Go to n8n → Executions → View latest execution
```

### Test Marketing Automation

```bash
# Test webhook
curl -X POST https://n8n.bell24h.com/webhook/supplier-new \
  -H "Content-Type: application/json" \
  -d '{
    "id": 1,
    "name": "Test Supplier",
    "mobile": "+919819049523",
    "email": "test@example.com"
  }'

# Check execution after 24 hours (or modify wait time for testing)
```

## 🐛 Troubleshooting

### Workflow Not Triggering

1. Check if workflow is **Active** (toggle switch)
2. Verify webhook URL is correct
3. Check n8n logs: `docker logs n8n` (if using Docker)
4. Verify API backend is running: `curl https://api.bell24h.com/api/health`

### SHAP API Not Responding

1. Check backend logs: `docker logs bell24h-prod`
2. Test API directly: `curl https://api.bell24h.com/api/v1/ai/explain-match/1 -X POST`
3. Verify model file exists: `ls -lh backend/app/models/rfq_model.pkl`

### MSG91 SMS Not Sending

1. Verify MSG91 API key is correct
2. Check template IDs match MSG91 dashboard
3. Verify phone number format: `+91XXXXXXXXXX`
4. Check MSG91 logs in dashboard

### Google Sheets Not Updating

1. Verify Google Sheets OAuth is authorized
2. Check Sheet ID is correct
3. Verify sheet names match: "RFQ Winners" and "Active Suppliers"
4. Check n8n execution logs for errors

## 📝 Next Steps

1. **Integrate with Frontend**: Update frontend to call n8n webhooks
2. **Add More Workflows**: Create workflows for RFQ notifications, supplier matching, etc.
3. **Monitor Executions**: Set up alerts for failed executions
4. **Optimize Performance**: Add caching, rate limiting, etc.

## 🔗 Related Documentation

- [n8n Documentation](https://docs.n8n.io/)
- [MSG91 API Documentation](https://docs.msg91.com/)
- [Google Sheets API Documentation](https://developers.google.com/sheets/api)
- [BELL24h Backend API Documentation](../README.md)

---

**Workflows are ready to import and activate! 🚀**

