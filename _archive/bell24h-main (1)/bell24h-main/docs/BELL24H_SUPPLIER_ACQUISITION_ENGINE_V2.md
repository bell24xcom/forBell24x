# 🧠 Bell24H Supplier Acquisition Engine (v2) - Complete Blueprint

## 🎯 Objective
Scrape 0.5M–1M supplier contacts across 400 categories, convert to 5,000+ verified supplier users, feed marketplace liquidity with AI-powered automation.

---

## 🌐 Data Sources (Public Domain)

### Government Portals
- **Udyam Portal** (MSME Database) - https://udyamregistration.gov.in
- **DGFT IEC Directory** - Exporter/Importer codes
- **GeM Vendors** - Government e-Marketplace suppliers
- **APEDA Exporters** - Agricultural products exporters
- **FIEO Members** - Federation of Indian Export Organizations

### Industry Associations
- **CII Directory** - Confederation of Indian Industry
- **FICCI Members** - Federation of Indian Chambers
- **Export Promotion Councils**:
  - Texprocil (Textiles)
  - Plexconcil (Plastics)
  - EEPC (Engineering)
  - Pharmexcil (Pharma)

### B2B Marketplaces (Fair Use)
- **IndiaMART** (Free listings only)
- **TradeIndia** (Public profiles)
- **ExportersIndia**
- **Alibaba India**

### Exhibition Directories
- **IITF Exhibitors** (Annual lists)
- **Industry-specific trade fairs**
- **Virtual expo directories**

### Other Sources
- **Chamber of Commerce** (State/City-wise)
- **Trade Magazine Directories**
- **Public Tender Vendor Lists**
- **Google Maps Business Listings**

---

## 🗺️ Google Maps Integration

### Location-Based Scraping
```javascript
// Example: Scrape textile manufacturers in Surat
const locations = [
  { city: "Surat", category: "Textile Manufacturer", radius: 50000 },
  { city: "Ludhiana", category: "Sports Goods", radius: 30000 },
  { city: "Agra", category: "Leather Goods", radius: 25000 }
];

// Google Maps Places API integration
const scrapeGoogleMaps = async (location) => {
  const places = await mapsClient.placesNearby({
    location: location.coordinates,
    radius: location.radius,
    type: 'business',
    keyword: location.category
  });
  
  return places.map(place => ({
    name: place.name,
    address: place.formatted_address,
    phone: place.formatted_phone_number,
    website: place.website,
    category: location.category,
    coordinates: place.geometry.location,
    rating: place.rating,
    reviews: place.user_ratings_total
  }));
};
```

---

## 🤖 AI Agent Configuration in N8N

### AI Agent Node Setup
```json
{
  "node": "n8n-nodes-base.aiAgent",
  "parameters": {
    "model": "gpt-4-turbo",
    "systemPrompt": "You are a B2B data specialist. Analyze company information and:\n1. Classify into one of 400 categories (list provided)\n2. Extract: company name, contact person, email, phone, products\n3. Generate relevance score (1-100)\n4. Suggest matching RFQs",
    "temperature": 0.3,
    "maxTokens": 500
  }
}
```

### Category Classification Prompt
```
Given this company data:
{company_data}

Classify into these categories:
{category_list}

Return JSON:
{
  "primary_category": "category_name",
  "subcategories": ["sub1", "sub2"],
  "confidence": 0.95,
  "products": ["product1", "product2"],
  "services": ["service1", "service2"]
}
```

---

## 🧱 Enhanced Database Schema

```sql
-- Categories with hierarchy
CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  parent_id INT REFERENCES categories(id),
  level INT DEFAULT 0,
  mock_rfq_count INT DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- Suppliers with rich data
CREATE TABLE suppliers (
  id SERIAL PRIMARY KEY,
  -- Basic Info
  company_name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  alternate_phone VARCHAR(50),
  website VARCHAR(255),
  
  -- Location
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  pincode VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Business Info
  gst_number VARCHAR(50),
  pan_number VARCHAR(50),
  company_type VARCHAR(50), -- Manufacturer, Trader, Service Provider
  establishment_year INT,
  employee_count VARCHAR(50),
  annual_turnover VARCHAR(50),
  
  -- Categories
  primary_category_id INT REFERENCES categories(id),
  category_ids INT[], -- Array of all category IDs
  
  -- AI Analysis
  ai_classification_score DECIMAL(3,2),
  ai_extracted_products TEXT[],
  ai_extracted_services TEXT[],
  business_description TEXT,
  
  -- Source & Status
  source_id INT REFERENCES sources(id),
  source_url TEXT,
  scrape_quality_score INT DEFAULT 50,
  
  -- Claim Status
  is_claimed BOOLEAN DEFAULT false,
  claim_token VARCHAR(255) UNIQUE,
  claimed_at TIMESTAMP,
  claimed_by_user_id INT,
  
  -- Verification
  is_verified BOOLEAN DEFAULT false,
  verification_status VARCHAR(50), -- pending, verified, rejected
  verified_at TIMESTAMP,
  
  -- Engagement
  profile_views INT DEFAULT 0,
  last_active TIMESTAMP,
  rfq_responses INT DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_scraped_at TIMESTAMP
);

-- Product Showcase
CREATE TABLE supplier_products (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id),
  product_name VARCHAR(255),
  description TEXT,
  category_id INT REFERENCES categories(id),
  price_range VARCHAR(100),
  moq VARCHAR(100), -- Minimum Order Quantity
  unit VARCHAR(50),
  image_urls TEXT[],
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Scraping Sources
CREATE TABLE sources (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  type VARCHAR(50), -- govt, b2b, directory, maps, exhibition
  base_url TEXT,
  scrape_frequency_hours INT DEFAULT 24,
  last_scraped_at TIMESTAMP,
  total_scraped INT DEFAULT 0,
  success_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true
);

-- Scraping Logs
CREATE TABLE scraping_logs (
  id SERIAL PRIMARY KEY,
  source_id INT REFERENCES sources(id),
  category_id INT REFERENCES categories(id),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  urls_processed INT,
  suppliers_found INT,
  suppliers_inserted INT,
  errors INT,
  status VARCHAR(50),
  n8n_execution_id VARCHAR(100)
);

-- Claim Invitations
CREATE TABLE claim_invitations (
  id SERIAL PRIMARY KEY,
  supplier_id INT REFERENCES suppliers(id),
  email_sent BOOLEAN DEFAULT false,
  email_sent_at TIMESTAMP,
  whatsapp_sent BOOLEAN DEFAULT false,
  whatsapp_sent_at TIMESTAMP,
  opened_at TIMESTAMP,
  claimed_at TIMESTAMP,
  channel_used VARCHAR(50) -- email, whatsapp, direct
);
```

---

## 🤖 N8N Automation Workflows

### Workflow 1: Master Scheduler (Every Hour)
```json
{
  "name": "Master Supplier Scraper Scheduler",
  "nodes": [
    {
      "name": "Hourly Trigger",
      "type": "n8n-nodes-base.cron",
      "parameters": {
        "triggerTimes": {
          "item": [{
            "mode": "everyHour"
          }]
        }
      }
    },
    {
      "name": "Get Categories to Scrape",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT * FROM categories WHERE is_active = true ORDER BY last_scraped_at ASC LIMIT 10"
      }
    },
    {
      "name": "Get Active Sources",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "query": "SELECT * FROM sources WHERE is_active = true"
      }
    },
    {
      "name": "Launch Category Workers",
      "type": "n8n-nodes-base.executeWorkflow",
      "parameters": {
        "workflowId": "category-scraper-worker",
        "mode": "each"
      }
    }
  ]
}
```

### Workflow 2: Category Scraper with AI
```json
{
  "name": "Category Scraper Worker with AI",
  "nodes": [
    {
      "name": "Scrape Data",
      "type": "n8n-nodes-base.httpRequest",
      "parameters": {
        "url": "={{$json.source_url}}",
        "method": "GET"
      }
    },
    {
      "name": "AI Agent - Classify & Extract",
      "type": "n8n-nodes-base.openAi",
      "parameters": {
        "model": "gpt-4-turbo",
        "messages": {
          "values": [{
            "role": "system",
            "content": "Extract company data and classify into categories"
          }]
        }
      }
    },
    {
      "name": "Google Maps Enrichment",
      "type": "n8n-nodes-base.googleMaps",
      "parameters": {
        "operation": "findPlace",
        "input": "={{$json.company_name}} {{$json.city}}"
      }
    },
    {
      "name": "Insert to Database",
      "type": "n8n-nodes-base.postgres",
      "parameters": {
        "operation": "insert",
        "table": "suppliers",
        "columns": "company_name,email,phone,category_id,ai_classification_score"
      }
    },
    {
      "name": "Trigger Claim Invite",
      "type": "n8n-nodes-base.executeWorkflow",
      "parameters": {
        "workflowId": "send-claim-invitation"
      }
    }
  ]
}
```

---

## 📊 Admin CRM Dashboard Pages

### 1. Scraping Monitor Dashboard
```jsx
// /admin/scraping-monitor
const ScrapingMonitor = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Real-time Stats */}
      <StatCard title="Active Scrapers" value="12" />
      <StatCard title="URLs/Hour" value="8,450" />
      <StatCard title="Success Rate" value="87%" />
      
      {/* Source Performance */}
      <SourcePerformanceTable />
      
      {/* Category Coverage Heatmap */}
      <CategoryHeatmap />
      
      {/* Live Scraping Log */}
      <LiveScrapingFeed />
    </div>
  );
};
```

### 2. Supplier Funnel Analytics
```jsx
// /admin/supplier-funnel
const SupplierFunnel = () => {
  const funnelData = {
    scraped: 487650,
    validated: 398420,
    invited: 285000,
    claimed: 4250,
    verified: 3800
  };
  
  return <FunnelChart data={funnelData} />;
};
```

### 3. AI Classification Monitor
```jsx
// /admin/ai-monitor
const AIMonitor = () => {
  return (
    <div>
      <h2>AI Classification Performance</h2>
      <MetricGrid>
        <Metric label="Avg Confidence" value="92%" />
        <Metric label="Categories Used" value="387/400" />
        <Metric label="Processing Time" value="1.2s" />
      </MetricGrid>
      
      <ConfusionMatrix categories={categories} />
    </div>
  );
};
```

---

## 📱 Supplier Claim Page Structure

### Public Profile URL Pattern
```
/supplier/[slug] → Public profile
/supplier/[slug]/claim → Claim page
/supplier/[slug]/products → Product showcase
/supplier/[slug]/contact → Contact form
```

### Claim Page Components
```jsx
// /supplier/[slug]/claim
const SupplierClaimPage = () => {
  return (
    <div className="max-w-2xl mx-auto p-6">
      <CompanyHeader company={company} />
      
      <ClaimBenefits />
      {/* - Manage your profile
          - Showcase products
          - Receive RFQ alerts
          - Verified badge */}
      
      <ClaimForm>
        <EmailOrPhoneInput />
        <OTPVerification />
        <SuccessRedirect to="/dashboard" />
      </ClaimForm>
      
      <TrustSignals />
    </div>
  );
};
```

### Product Showcase Grid
```jsx
const ProductShowcase = ({ products }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {products.map(product => (
        <ProductCard
          key={product.id}
          image={product.image_urls[0]}
          name={product.name}
          priceRange={product.price_range}
          moq={product.moq}
        />
      ))}
    </div>
  );
};
```

---

## ⏱ Execution Timeline & Targets

### Scraping Volume Plan
| Day | Cumulative Scraped | Validated | Invited | Claimed | Verified |
|-----|-------------------|-----------|---------|---------|----------|
| 1   | 120,000          | 96,000    | 70,000  | 70      | 50       |
| 3   | 360,000          | 288,000   | 210,000 | 420     | 350      |
| 5   | 600,000          | 480,000   | 350,000 | 1,050   | 900      |
| 7   | 840,000          | 672,000   | 490,000 | 2,450   | 2,100    |
| 10  | 1,200,000        | 960,000   | 700,000 | 5,250   | 5,000    |

### Category Coverage Strategy
- Day 1-3: Top 50 high-volume categories
- Day 4-6: Medium-volume 150 categories
- Day 7-10: Long-tail 200 categories
- Continuous: Refresh top performers

---

## 🎯 Success KPIs

### Primary Metrics
- ✅ 5,000+ verified suppliers in 10 days
- ✅ 400/400 categories with suppliers
- ✅ 1% claim conversion rate
- ✅ 90%+ AI classification accuracy

### Secondary Metrics
- 📊 Average 50 suppliers per category
- 📊 80% email deliverability
- 📊 60% WhatsApp open rate
- 📊 3+ products per claimed supplier

### Long-term Goals
- 🎯 10,000 verified suppliers in 30 days
- 🎯 1,000 daily active suppliers
- 🎯 100 RFQ responses per day

---

## 🚀 Implementation Checklist

### Week 1
- [ ] Set up N8N workflows
- [ ] Configure AI Agent (OpenAI/Claude)
- [ ] Integrate Google Maps API
- [ ] Build supplier claim pages
- [ ] Set up email/WhatsApp automation

### Week 2
- [ ] Launch scraping on top 50 categories
- [ ] Monitor & optimize AI classification
- [ ] A/B test claim invitation copy
- [ ] Build admin dashboards

### Week 3
- [ ] Scale to all 400 categories
- [ ] Implement product showcase
- [ ] Launch referral program
- [ ] Optimize conversion funnel

---

## 📝 Notes

1. **Legal Compliance**: Only scrape public data, respect robots.txt
2. **Rate Limiting**: Implement delays to avoid IP bans
3. **Data Quality**: Validate emails/phones before inviting
4. **Personalization**: Use category-specific messaging
5. **Monitoring**: Set up alerts for scraping failures

---

*Last Updated: October 2025*
*Version: 2.0*
*Status: Ready for Implementation*
