# 🚀 N8N Setup Quick Reference - Bell24H

## ✅ **DATABASE STATUS - READY FOR N8N**

### **Verification Results:**
- ✅ **23 Tables**: All required tables exist
- ✅ **5 Suppliers**: Properly categorized and ready
- ✅ **10 Categories**: Available for RFQ matching
- ✅ **RFQ Table**: Ready with 20 columns
- ✅ **Database Connection**: Tested and working

### **Key Tables Status:**
| Table | Records | Status |
|-------|---------|--------|
| `suppliers` | 5 | ✅ Ready |
| `categories` | 10 | ✅ Ready |
| `rfq_requests` | 0 | ✅ Ready (empty is normal) |
| `sources` | 5 | ✅ Ready |
| `supplier_products` | 0 | ✅ Ready |
| `scraping_batches` | 0 | ✅ Ready |
| `scraping_logs` | 0 | ✅ Ready |

---

## 🔑 **N8N CREDENTIALS TO CONFIGURE**

### **1. PostgreSQL Database (Neon)**
```
Name: Neon PostgreSQL
Type: PostgreSQL
Host: ep-super-wind-a1c1ni4n-pooler.ap-southeast-1.aws.neon.tech
Port: 5432
Database: neondb
User: neondb_owner
Password: npg_0Duqdxs3RoyA
SSL: true
SSL Mode: require
```

### **2. OpenAI API**
```
Name: OpenAI API
Type: OpenAI
API Key: [Your OpenAI API Key]
```

### **3. Google Gemini API**
```
Name: Google Gemini API
Type: Google Gemini
API Key: AIzaSyCF6w_cgnRn7MRwvZuBUexxhygAn9KBAvU
```

### **4. Gmail SMTP**
```
Name: Gmail SMTP
Type: SMTP
Host: smtp.gmail.com
Port: 587
User: bell24h.info@gmail.com
Password: [Your Gmail App Password]
SSL: false
```

---

## 📥 **WORKFLOW IMPORT ORDER**

### **Priority 1: Core RFQ Automation**
1. **bell24h-rfq-notification-with-db.json**
   - Core RFQ automation with database integration
   - Handles RFQ creation, supplier matching, notifications

### **Priority 2: AI Lead Scoring**
2. **bell24h-lead-scoring-with-db.json**
   - AI-powered lead scoring and matching
   - Ranks suppliers by potential value

### **Priority 3: Supplier Acquisition**
3. **bell24h-ai-scraper-master-with-db.json**
   - Master scheduler for supplier acquisition
   - Orchestrates scraping workflows

4. **bell24h-ai-category-worker-with-db.json**
   - AI category classification worker
   - Processes and categorizes supplier data

### **Priority 4: Advanced Features**
5. **nano-banana-enrichment.json**
   - Advanced AI enrichment pipeline
   - Website analysis and data enhancement

---

## 🧪 **TEST DATA FOR RFQ WORKFLOW**

### **Sample RFQ for Testing:**
```json
{
  "title": "Steel Rods for Construction Project",
  "description": "Need TMT steel rods for residential construction",
  "category_id": 1,
  "budget_min": 200000,
  "budget_max": 300000,
  "quantity": 50,
  "unit": "tons",
  "buyer_name": "John Smith",
  "buyer_email": "john@construction.com",
  "buyer_phone": "+91-9876543210",
  "buyer_company": "BuildCorp Ltd",
  "status": "open",
  "priority": "high",
  "deadline": "2024-12-31",
  "location": "Mumbai, Maharashtra"
}
```

### **Expected Supplier Match:**
- **Tata Steel** (Category 1 - Steel & Metal)
- Should match based on category_id = 1

---

## 🎯 **STEP-BY-STEP N8N SETUP**

### **Step 1: Access N8N**
1. Open N8N interface: `http://your-n8n-instance:5678`
2. Login with your credentials

### **Step 2: Configure Credentials**
1. Go to **Credentials** section
2. Create the 4 credentials listed above
3. Test each credential connection

### **Step 3: Import RFQ Workflow**
1. Click **"Import from File"**
2. Select: `bell24h-rfq-notification-with-db.json`
3. Configure any missing credentials
4. Test the workflow
5. Activate the workflow

### **Step 4: Test RFQ Automation**
1. Use the sample RFQ data above
2. Send POST request to N8N webhook
3. Verify supplier matching works
4. Check email notifications

### **Step 5: Import Additional Workflows**
1. Import lead scoring workflow
2. Import scraping workflows
3. Configure and test each one

---

## 🔍 **TROUBLESHOOTING**

### **Common Issues:**
1. **Database Connection Failed**
   - Check SSL settings
   - Verify credentials
   - Test connection manually

2. **API Key Errors**
   - Verify API keys are valid
   - Check quota/limits
   - Test API endpoints

3. **Workflow Not Activating**
   - Check all nodes are configured
   - Verify credentials are connected
   - Look for red error indicators

4. **No Supplier Matches**
   - Verify category_id mapping
   - Check suppliers table data
   - Test category matching logic

---

## 📊 **MONITORING & VERIFICATION**

### **Database Queries to Check Status:**
```sql
-- Check supplier-category mapping
SELECT s.name, c.name as category 
FROM suppliers s 
JOIN categories c ON s.category_id = c.id;

-- Check RFQ requests
SELECT * FROM rfq_requests ORDER BY created_at DESC LIMIT 5;

-- Check workflow logs
SELECT * FROM scraping_logs ORDER BY created_at DESC LIMIT 10;
```

### **Success Indicators:**
- ✅ RFQ webhook receives data
- ✅ Suppliers are matched by category
- ✅ Email notifications sent
- ✅ Data stored in database
- ✅ Workflow completes without errors

---

## 🚀 **READY TO START!**

Your database is **100% ready** for N8N workflow import and testing. All tables, data, and relationships are properly configured.

**Next Action:** Import `bell24h-rfq-notification-with-db.json` and start testing the RFQ automation!
