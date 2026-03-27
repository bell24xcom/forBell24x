# 🎯 N8N WORKFLOW A-E: MICRO-LEVEL NODE-BY-NODE GUIDE (FOR NON-CODERS)

**Based on YOUR EXACT IMAGE - Step-by-Step Configuration**

---

## 📸 **YOUR IMAGE SHOWS: "Bell24H AI Category Worker - Complete"**

### **Status**: ⚠️ **INACTIVE** (Red error: Webhook conflict)

### **Error Message**: 
```
"Problem running workflow. Please resolve outstanding issues before you activate it."
"A webhook trigger 'Worker Webhook1' in the workflow 'postgres' uses a conflicting URL path"
```

---

## 🔧 **STEP 1: FIX WEBHOOK CONFLICT (5 MINUTES)**

### **MINI-STEP 1.1: Open Your Workflow**

**What you see:**
- n8n dashboard at `https://n8n.bell24h.com`
- Workflow: "Bell24H AI Category Worker - Complete"
- Status: "Inactive" (toggle switch is OFF)

**Action:**
1. Click on the workflow name in the left sidebar (if not already open)
2. You should see the canvas with all nodes

---

### **MINI-STEP 1.2: Find the Webhook Node**

**What you see on canvas:**

From **LEFT TO RIGHT**, you'll see these nodes:

**LEFT SIDE (Entry Points):**
- `Execute workflow` (Red button)
- `Worker Webhook1` ← **THIS IS THE PROBLEM NODE**
- `RFQ Webhook`
- `Enrichment Webhook`
- `Lead Scoring Webhook`
- `Hourly Trigger`

**Action:**
1. Look at the **LEFT SIDE** of your canvas
2. Find the node labeled: **"Worker Webhook1"**
3. It should have a **red triangle** or **warning icon** (indicates error)

---

### **MINI-STEP 1.3: Click the Webhook Node**

**Action:**
1. **Click ONCE** on the node labeled **"Worker Webhook1"**
2. The node will be **highlighted** (usually with a colored border)
3. A **right panel** will open showing node settings

**What you should see:**
- Right panel opens
- Node settings visible
- Fields like: "Path", "HTTP Method", "Response Mode", etc.

---

### **MINI-STEP 1.4: Find the "Path" Field**

**In the right panel, look for:**

**Field Name:** `Path` or `Webhook Path`

**Current Value:** Likely shows: `ai-category-worker-complete` or `worker-webhook1`

**Action:**
1. Scroll in the right panel if needed
2. Find the field labeled **"Path"**
3. It's usually near the top of the settings panel
4. Click inside the text box to select the current path

---

### **MINI-STEP 1.5: Change the Path**

**Action:**
1. **Click inside the "Path" text box**
2. **Select all text** (Ctrl+A or triple-click)
3. **Delete the current path**
4. **Type this NEW path:** `worker-rfq-handler-unique-2025`

**Why this works:**
- Each webhook needs a UNIQUE path
- Another workflow already uses the old path
- New path is unique and won't conflict

**VERIFY:**
- Path field now shows: `worker-rfq-handler-unique-2025`
- No typos or spaces

---

### **MINI-STEP 1.6: Save the Change**

**Action:**
1. Look at the **TOP RIGHT** of your screen
2. Find the **RED button** labeled **"Save"**
3. **Click ONCE** on the "Save" button
4. Wait 1-2 seconds

**What you should see:**
- Red error box at bottom-right should **disappear**
- Workflow saves successfully
- No more error messages

---

### **MINI-STEP 1.7: Verify Error is Fixed**

**Action:**
1. Look at the **BOTTOM RIGHT** corner of your screen
2. The red error box should be **GONE**
3. Check the workflow status (top right)
4. Toggle switch should now be **clickable** (not grayed out)

**If error still shows:**
- There might be ANOTHER workflow with same path
- Check if other workflows exist with similar webhook paths
- If yes, rename those too using the same process

---

## 🔧 **STEP 2: CONFIGURE NODE A - Worker Webhook1 (DONE ABOVE)**

✅ **Already completed in Step 1**

**Node Type:** Webhook Trigger
**Status:** ✅ Path renamed to `worker-rfq-handler-unique-2025`
**Purpose:** Entry point for RFQ worker requests

**Configuration:**
- Path: `worker-rfq-handler-unique-2025`
- HTTP Method: `POST` (default)
- Response Mode: `On Last Node` (default)

---

## 🔧 **STEP 3: CONFIGURE NODE B - Save RFQ to Database**

**Location on Canvas:** Right side of "Worker Webhook1"

**What this node does:**
- Saves incoming RFQ data to your Postgres database
- Stores RFQ details for processing

**MINI-STEP 3.1: Click on "Save RFQ to Database" Node**

**Action:**
1. Find the node labeled **"Save RFQ to Database"**
2. Click ONCE on it
3. Right panel opens with node settings

---

### **MINI-STEP 3.2: Configure Database Connection**

**In the right panel:**

**Field 1: Operation**
- Find dropdown: **"Operation"**
- Select: **"Execute Query"** or **"Insert"**

**Field 2: Database Connection (Credentials)**
- Find field: **"Credential for Postgres"**
- You'll see either:
  - ✅ **"Postgres"** (already configured)
  - ❌ **"Create New"** or **"No credentials"** (needs setup)

**If credentials missing:**
1. Click **"Create New"** or **"Set Credential"**
2. Enter these details:

```
Host: your_postgres_host (e.g., db.neon.tech)
Port: 5432
Database: your_database_name
User: your_username
Password: your_password
SSL: Enabled
```

3. Click **"Save"**

**If credentials exist:**
- ✅ Select **"Postgres"** from dropdown
- Node should turn green (no red triangle)

---

### **MINI-STEP 3.3: Configure SQL Query**

**In the right panel, find field: "Query" or "SQL"**

**Action:**
1. Click in the SQL query text box
2. **Copy and paste this query:**

```sql
INSERT INTO rfqs (
  id, 
  title, 
  description, 
  category, 
  budget, 
  quantity, 
  location, 
  created_at
) VALUES (
  {{$json.id}},
  {{$json.title}},
  {{$json.description}},
  {{$json.category}},
  {{$json.budget}},
  {{$json.quantity}},
  {{$json.location}},
  NOW()
) RETURNING *;
```

**Note:** This query uses n8n variables like `{{$json.id}}` which automatically insert values from the incoming webhook data.

**VERIFY:**
- SQL query is pasted correctly
- No syntax errors (red underline)
- Click outside the text box to save

---

## 🔧 **STEP 4: CONFIGURE NODE C - Scrape Suppliers**

**Location on Canvas:** Right side of "Save RFQ to Database"

**What this node does:**
- Scrapes/fetches supplier data based on RFQ category
- Finds matching suppliers from your database

**MINI-STEP 4.1: Click on "Scrape Suppliers" Node**

**Action:**
1. Find the node labeled **"Scrape Suppliers"** or **"Scrape Suppliers1"**
2. Click ONCE on it
3. Right panel opens

---

### **MINI-STEP 4.2: Configure Node Type**

**This node can be one of these types:**

**Option A: Postgres Query (Most Common)**
- Node type: `Postgres`
- Operation: `Execute Query`

**Option B: HTTP Request**
- Node type: `HTTP Request`
- URL: Your API endpoint

**Option C: Function/Code**
- Node type: `Function`
- Custom JavaScript code

**Action:**
1. Check the **node type** (shown at top of right panel)
2. If it's **Postgres**, configure as below:

---

### **MINI-STEP 4.3: Configure Postgres Query (If Node Type is Postgres)**

**In the right panel:**

**Field 1: Credential**
- Select: **"Postgres"** (same as Node B)
- Should already be configured

**Field 2: Operation**
- Select: **"Execute Query"**

**Field 3: Query**
- Click in SQL query text box
- **Copy and paste:**

```sql
SELECT 
  id,
  company_name,
  category,
  location,
  rating,
  verified,
  phone,
  email
FROM suppliers
WHERE 
  category = {{$json.category}}
  AND active = true
  AND verified = true
ORDER BY rating DESC
LIMIT 20;
```

**This query:**
- Finds suppliers matching RFQ category
- Only active and verified suppliers
- Sorted by rating (best first)
- Returns top 20 matches

**VERIFY:**
- Query pasted correctly
- No syntax errors
- Credentials selected

---

### **MINI-STEP 4.4: Configure HTTP Request (If Node Type is HTTP Request)**

**If the node is HTTP Request type:**

**Field 1: URL**
- Enter: `https://api.bell24h.com/api/suppliers/search`
- Or: `http://localhost:8000/api/suppliers/search`

**Field 2: Method**
- Select: `GET` or `POST`

**Field 3: Authentication**
- Select: `None` or `Header Auth`
- If Header Auth, add: `Authorization: Bearer YOUR_TOKEN`

**Field 4: Query Parameters (for GET) or Body (for POST)**
- Add parameters:
  ```
  category: {{$json.category}}
  location: {{$json.location}}
  ```

**VERIFY:**
- URL is correct
- Method matches your API
- Authentication configured (if needed)

---

## 🔧 **STEP 5: CONFIGURE NODE D - AI Classification**

**Location on Canvas:** Connected from "Scrape Suppliers"

**What this node does:**
- Uses AI to classify and rank suppliers
- Analyzes RFQ and supplier data for best match

**MINI-STEP 5.1: Click on "AI Classification" Node**

**Action:**
1. Find the node labeled **"AI Classification"**
2. Click ONCE on it
3. Right panel opens

---

### **MINI-STEP 5.2: Configure Node Type**

**This node can be:**

**Option A: HTTP Request (API Call)**
- Calls your AI/ML API endpoint
- Most common for AI processing

**Option B: OpenAI/Anthropic Node**
- Direct integration with AI provider
- Uses API key

**Option C: Function/Code**
- Custom JavaScript for AI processing

**Check the node type first!**

---

### **MINI-STEP 5.3: Configure HTTP Request (If AI API)**

**If node type is "HTTP Request":**

**Field 1: URL**
- Enter: `https://api.bell24h.com/api/ai/classify-rfq`
- Or your AI endpoint URL

**Field 2: Method**
- Select: `POST`

**Field 3: Authentication**
- Select: `Header Auth` or `Basic Auth`
- Add header: `Authorization: Bearer {{$env.AI_API_KEY}}`

**Field 4: Body (JSON)**
- Select: `JSON`
- Add body:
```json
{
  "rfq": {
    "id": {{$json.id}},
    "category": {{$json.category}},
    "budget": {{$json.budget}},
    "location": {{$json.location}}
  },
  "suppliers": {{$json}}
}
```

**VERIFY:**
- URL points to your AI API
- Authentication header configured
- Body includes RFQ and supplier data

---

### **MINI-STEP 5.4: Configure OpenAI/Anthropic Node (If Direct AI)**

**If node type is "OpenAI" or "Anthropic":**

**Field 1: Credential**
- Select: **"OpenAI API"** or **"Anthropic API"**
- If missing, create new:
  - API Key: Your OpenAI/Anthropic key
  - Save credential

**Field 2: Model**
- OpenAI: `gpt-4` or `gpt-3.5-turbo`
- Anthropic: `claude-3-opus` or `claude-3-sonnet`

**Field 3: Messages/Prompt**
- Add system message:
```
You are an AI classifier for B2B RFQ matching. 
Analyze RFQ and supplier data, rank suppliers by relevance.
Return JSON with supplier rankings.
```

**Field 4: Response Format**
- Select: `JSON`

**VERIFY:**
- Credentials configured
- Model selected
- Prompt includes context

---

## 🔧 **STEP 6: CONFIGURE NODE E - Enhance Supplier Data**

**Location on Canvas:** Connected from "AI Classification"

**What this node does:**
- Enhances supplier data with additional details
- Adds enrichment like geocoding, company info, etc.

**MINI-STEP 6.1: Click on "Enhance Supplier Data" or "Enhance Supplier Data1" Node**

**Action:**
1. Find the node labeled **"Enhance Supplier Data"**
2. Click ONCE on it
3. Right panel opens

---

### **MINI-STEP 6.2: Configure Node Type**

**This node is usually:**

**Option A: HTTP Request**
- Calls enrichment API

**Option B: Function/Code**
- Custom JavaScript for data transformation

**Option C: Multiple Nodes (Geocode, Enrich, etc.)**

---

### **MINI-STEP 6.3: Configure Function Node (If Custom Code)**

**If node type is "Function":**

**Field: Function Code**

**Copy and paste this code:**

```javascript
// Get input data from previous nodes
const rfqData = $input.item.json;
const suppliers = rfqData.suppliers || [];

// Enhance each supplier
const enhancedSuppliers = suppliers.map(supplier => {
  return {
    ...supplier,
    // Add enrichment
    enriched_at: new Date().toISOString(),
    match_score: supplier.ai_score || 0,
    distance_km: supplier.distance || 0,
    response_time_avg: supplier.avg_response_time || 0,
    verified_badge: supplier.verified ? 'YES' : 'NO',
    // Format phone
    phone_formatted: supplier.phone ? `+91${supplier.phone.replace(/\D/g, '')}` : '',
    // Calculate priority
    priority: (supplier.rating || 0) * 0.4 + (supplier.match_score || 0) * 0.6
  };
});

// Sort by priority
enhancedSuppliers.sort((a, b) => b.priority - a.priority);

// Return enhanced data
return enhancedSuppliers.map(supp => ({
  json: {
    ...rfqData,
    supplier: supp
  }
}));
```

**This code:**
- Takes supplier data from previous node
- Adds enrichment fields
- Calculates priority scores
- Sorts by best match

**VERIFY:**
- Code pasted correctly
- No JavaScript errors
- Syntax is valid

---

### **MINI-STEP 6.4: Configure HTTP Request (If Enrichment API)**

**If node type is "HTTP Request":**

**Field 1: URL**
- Enter: `https://api.bell24h.com/api/suppliers/enrich`

**Field 2: Method**
- Select: `POST`

**Field 3: Body (JSON)**
```json
{
  "supplier_id": {{$json.supplier_id}},
  "rfq_id": {{$json.rfq_id}}
}
```

**VERIFY:**
- URL correct
- Body includes supplier and RFQ IDs

---

## ✅ **STEP 7: VERIFY ALL NODES ARE CONFIGURED**

### **CHECKLIST:**

Go through each node and verify:

- [ ] **Node A (Worker Webhook1)**: Path changed to unique value ✅
- [ ] **Node B (Save RFQ to Database)**: Postgres credentials configured ✅
- [ ] **Node C (Scrape Suppliers)**: Query or HTTP request configured ✅
- [ ] **Node D (AI Classification)**: AI API or function configured ✅
- [ ] **Node E (Enhance Supplier Data)**: Function or API configured ✅

**Visual Check:**
- No red triangles on nodes ✅
- All nodes have green checkmarks ✅
- Connections (white lines) between nodes are visible ✅

---

## 🚀 **STEP 8: ACTIVATE THE WORKFLOW**

**Action:**
1. Look at **TOP RIGHT** of screen
2. Find the **toggle switch** labeled **"Inactive"** or **"Active"**
3. **Click ONCE** on the toggle switch
4. It should turn **GREEN** and say **"Active"**

**What you should see:**
- Toggle switch turns green ✅
- Status changes to "Active" ✅
- No error messages ✅
- Workflow is now LIVE ✅

---

## 🧪 **STEP 9: TEST THE WORKFLOW**

### **Option A: Test via Execute Button**

**Action:**
1. Look at **BOTTOM CENTER** of canvas
2. Find the **ORANGE button** labeled **"Execute workflow"**
3. Click on the **dropdown arrow** next to it
4. Select: **"Execute workflow from Worker Webhook1"**
5. Wait 3-5 seconds

**What you should see:**
- Nodes light up one by one (green checkmarks appear)
- Execution progress shown
- Bottom panel shows "Execution successful" or results

---

### **Option B: Test via Webhook URL**

**Action:**
1. Find the **webhook URL** for "Worker Webhook1"
   - Usually shown when you click on the webhook node
   - Format: `https://n8n.bell24h.com/webhook/worker-rfq-handler-unique-2025`

2. **Test with curl** (if you have terminal access):

```bash
curl -X POST https://n8n.bell24h.com/webhook/worker-rfq-handler-unique-2025 \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test-001",
    "title": "Test RFQ",
    "category": "Machinery",
    "budget": 100000,
    "quantity": 10,
    "location": "Mumbai"
  }'
```

3. **Or use Postman** (if you have it installed):
   - Create new POST request
   - URL: Your webhook URL
   - Body: JSON test data (as above)
   - Send request

**What you should see:**
- Workflow executes
- Nodes process in sequence
- Results appear in execution log

---

## ❌ **TROUBLESHOOTING**

### **Problem: Error still shows after renaming webhook**

**Solution:**
1. Check if **other workflows** have same path
2. Go to **Workflows** list (left sidebar)
3. Check each workflow's webhook paths
4. Rename any duplicates

---

### **Problem: Postgres connection fails**

**Solution:**
1. Verify database credentials are correct
2. Check if database is accessible from n8n server
3. Test connection: Click "Test" button on Postgres node
4. If fails, check database firewall/security groups

---

### **Problem: AI Classification node fails**

**Solution:**
1. Verify AI API is running
2. Check API endpoint URL is correct
3. Verify API key/token is valid
4. Test API directly (curl or Postman)
5. Check n8n execution logs for error details

---

### **Problem: Workflow executes but no data saved**

**Solution:**
1. Check database query syntax
2. Verify table names match your schema
3. Check if data is passing between nodes
4. Click on each node after execution to see output data

---

## 📊 **NEXT STEPS AFTER A-E ARE WORKING**

Once Nodes A-E are configured and working:

1. ✅ Test workflow end-to-end
2. ✅ Monitor first few executions
3. ✅ Check database for saved data
4. ✅ Verify AI classification results
5. ✅ Move to configure remaining nodes (F, G, H, I, J)

---

## 💬 **NEED HELP?**

**If you're stuck at any step:**

1. **Take a screenshot** of the step where you're stuck
2. **Note the exact error message** (if any)
3. **Tell me which MINI-STEP** you're on
4. **Send me the details**

I'll help you fix it immediately! 🚀

---

**Status: Complete Guide for Nodes A-E ✅**

**Next: After A-E are working, we'll configure remaining nodes (F-J)**

