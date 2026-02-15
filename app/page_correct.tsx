'use client';

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthModal from '@/components/AuthModal';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const router = useRouter();
  
  const [liveRFQs, setLiveRFQs] = useState([
    'Buyer from Mumbai looking for Steel Pipes - 2 mins ago',
    'Buyer from Delhi looking for Cotton Fabric - 5 mins ago',
    'Buyer from Bangalore looking for Electronics Components - 8 mins ago',
    'Buyer from Chennai looking for Chemical Raw Materials - 12 mins ago',
    'Buyer from Pune looking for Packaging Materials - 15 mins ago',
    'Buyer from Hyderabad looking for Machinery Parts - 18 mins ago'
  ]);
  const [currentRFQIndex, setCurrentRFQIndex] = useState(0);

  const handleAuthSuccess = (user: any) => {
    setShowAuthModal(false);
    router.push('/dashboard');
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRFQIndex((prev) => (prev + 1) % liveRFQs.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [liveRFQs.length]);

  return (
    <>
      <Head>
        <title>Bell24h - India's Fastest B2B Match-Making Engine | Post RFQ Get 3 Verified Quotes in 24 Hours</title>
        <meta name="description" content="India's fastest B2B marketplace. Post RFQ and get 3 verified quotes in 24 hours. 45,000+ verified suppliers, 2.5M+ products. AI-powered matching with 200+ data signals. Escrow-secured payments." />
        <meta name="keywords" content="B2B marketplace India, RFQ platform, verified suppliers, B2B procurement, Indian manufacturers, wholesale suppliers, business to business, procurement platform, supplier verification, B2B trading" />
        <meta property="og:title" content="Bell24h - India's Fastest B2B Match-Making Engine" />
        <meta property="og:description" content="Post RFQ. Get 3 Verified Quotes in 24 Hours. 45,000+ verified suppliers, 2.5M+ products. AI-powered matching with escrow-secured payments." />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:url" content="https://bell24h.com" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Bell24h - India's Fastest B2B Match-Making Engine" />
        <meta name="twitter:description" content="Post RFQ. Get 3 Verified Quotes in 24 Hours. AI-powered B2B marketplace with verified suppliers." />
        
        {/* Structured Data for SEO */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Bell24h",
            "description": "India's fastest B2B match-making engine for MSMEs",
            "url": "https://bell24h.com",
            "logo": "https://bell24h.com/logo.png",
            "sameAs": [
              "https://www.linkedin.com/company/bell24h",
              "https://twitter.com/bell24h"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91-9876543210",
              "contactType": "customer service",
              "email": "support@bell24h.com"
            },
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Mumbai",
              "addressRegion": "Maharashtra",
              "addressCountry": "IN"
            }
          })}
        </script>
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Inter', sans-serif;
          line-height: 1.6;
          color: #212121;
          background-color: #ffffff;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Hero Section */
        .hero {
          background-color: #ffffff;
          padding: 80px 0;
          text-align: center;
        }

        .hero h1 {
          font-size: 56px;
          color: #212121;
          line-height: 1.2;
          font-weight: bold;
          margin-bottom: 20px;
        }

        .hero h1 .highlight {
          color: #1a237e;
        }

        .hero-subtitle {
          font-size: 18px;
          color: #666;
          margin-bottom: 30px;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .hero-subtitle .highlight-text {
          color: #1a237e;
          font-weight: 600;
        }

        /* Trust Badges */
        .trust-badges {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 40px;
          flex-wrap: wrap;
        }

        .trust-badge {
          background-color: #f5f5f5;
          padding: 12px 24px;
          border-radius: 25px;
          font-size: 15px;
          font-weight: 600;
          color: #212121;
          display: flex;
          align-items: center;
          gap: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        /* Search Section */
        .search-section {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.1);
          max-width: 800px;
          margin: 0 auto 40px;
        }

        .search-bar {
          display: flex;
          gap: 10px;
          margin-bottom: 20px;
        }

        .category-select {
          padding: 12px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
          background: white;
          min-width: 150px;
        }

        .search-input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          font-size: 16px;
        }

        .search-btn {
          background-color: #ff6f00;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .search-btn:hover {
          background-color: #e65100;
        }

        .popular-searches {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .search-tag {
          background-color: #f5f5f5;
          color: #1a237e;
          padding: 8px 16px;
          border-radius: 20px;
          font-size: 14px;
          text-decoration: none;
          transition: background-color 0.3s;
        }

        .search-tag:hover {
          background-color: #e3f2fd;
        }

        /* Live RFQ Ticker */
        .rfq-ticker {
          background-color: #1a237e;
          color: white;
          padding: 15px 0;
          overflow: hidden;
          white-space: nowrap;
        }

        .rfq-content {
          display: inline-block;
          padding-left: 100%;
          animation: scroll 30s linear infinite;
        }

        .rfq-item {
          display: inline-block;
          margin-right: 50px;
          font-size: 16px;
        }

        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }

        /* Stats Section */
        .stats-section {
          background-color: #f5f5f5;
          padding: 60px 0;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 30px;
          text-align: center;
        }

        .stat-item h3 {
          font-size: 42px;
          color: #1a237e;
          margin-bottom: 10px;
          font-weight: bold;
        }

        .stat-item p {
          font-size: 16px;
          color: #666;
        }

        /* Categories Section */
        .categories-section {
          background-color: #ffffff;
          padding: 80px 0;
        }

        .categories-section h2 {
          font-size: 36px;
          color: #212121;
          margin-bottom: 50px;
          text-align: center;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 25px;
        }

        .category-card {
          background-color: #f5f5f5;
          padding: 30px 20px;
          border-radius: 8px;
          text-align: center;
          box-shadow: 0 2px 10px rgba(0,0,0,0.05);
          transition: transform 0.3s, box-shadow 0.3s;
          cursor: pointer;
        }

        .category-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 20px rgba(0,0,0,0.1);
        }

        .category-icon {
          font-size: 48px;
          margin-bottom: 15px;
        }

        .category-card h3 {
          font-size: 18px;
          color: #212121;
          margin-bottom: 5px;
        }

        .category-card p {
          font-size: 13px;
          color: #757575;
        }

        /* How It Works Section */
        .how-it-works-section {
          background-color: #ffffff;
          padding: 80px 0;
        }

        .how-it-works-section h2 {
          font-size: 36px;
          color: #212121;
          margin-bottom: 60px;
          text-align: center;
        }

        .steps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 40px;
        }

        .step {
          text-align: center;
        }

        .step .icon {
          width: 80px;
          height: 80px;
          background-color: #1a237e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 32px;
          font-weight: bold;
          margin: 0 auto 25px;
          color: white;
        }

        .step h3 {
          font-size: 22px;
          margin-bottom: 15px;
          color: #212121;
          font-weight: 600;
        }

        .step p {
          color: #666;
          font-size: 16px;
          line-height: 1.6;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .hero h1 {
            font-size: 36px;
          }
          .search-bar {
            flex-direction: column;
          }
          .stats-grid, .category-grid, .steps-grid {
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          }
        }
      `}</style>

      <Header onLoginClick={() => setShowAuthModal(true)} />

      {/* Hero Section - Exact Reference Match */}
      <section className="hero">
        <div className="container">
          <h1>
            Post RFQ. Get 3 Verified Quotes<br />
            <span className="highlight">in 24 Hours</span>
          </h1>
          
          <p className="hero-subtitle">
            200 live data signals—GST, credit, logistics, ESG—to match you with 3 pre-qualified suppliers. 
            <span className="highlight-text">Escrow-secured payments</span> until goods arrive.
          </p>

          {/* Trust Badges */}
          <div className="trust-badges">
            <span className="trust-badge">✅ Escrow-Secured</span>
            <span className="trust-badge">🛡️ GST Verified</span>
            <span className="trust-badge">⭐ AI Trust-Score</span>
          </div>

          {/* Search Section */}
          <div className="search-section">
            <div className="search-bar">
              <select className="category-select">
                <option value="all">All Categories</option>
                <option value="steel">Steel & Metals</option>
                <option value="textiles">Textiles & Fabrics</option>
                <option value="electronics">Electronics & IT</option>
                <option value="chemicals">Chemicals</option>
                <option value="machinery">Machinery</option>
                <option value="packaging">Packaging</option>
                <option value="agriculture">Agriculture</option>
                <option value="construction">Construction</option>
                <option value="auto">Auto Parts</option>
                <option value="pharmaceuticals">Pharmaceuticals</option>
                <option value="food">Food & Beverages</option>
                <option value="services">Business Services</option>
              </select>
              <input
                type="text"
                className="search-input"
                placeholder="What are you looking for today? (e.g., Steel Pipes, Cotton Fabric)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="search-btn">Post Your RFQ</button>
            </div>
            
            <div className="popular-searches">
              <a href="#" className="search-tag">Steel Pipes</a>
              <a href="#" className="search-tag">Cotton Fabric</a>
              <a href="#" className="search-tag">Electronics Components</a>
              <a href="#" className="search-tag">Chemical Raw Materials</a>
              <a href="#" className="search-tag">Packaging Materials</a>
            </div>
          </div>
        </div>
      </section>

      {/* Live RFQ Ticker */}
      <section className="rfq-ticker">
        <div className="rfq-content">
          {liveRFQs.map((rfq, index) => (
            <span key={index} className="rfq-item">
              🔔 {rfq}
            </span>
          ))}
          {/* Duplicate for continuous scroll */}
          {liveRFQs.map((rfq, index) => (
            <span key={`dup-${index}`} className="rfq-item">
              🔔 {rfq}
            </span>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <h3>12,400+</h3>
              <p>Verified Suppliers</p>
            </div>
            <div className="stat-item">
              <h3>4,321</h3>
              <p>RFQs Last Month</p>
            </div>
            <div className="stat-item">
              <h3>98%</h3>
              <p>Success Rate</p>
            </div>
            <div className="stat-item">
              <h3>24hr</h3>
              <p>Response Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container">
          <h2>Popular Categories</h2>
          <div className="category-grid">
            <div className="category-card">
              <div className="category-icon">🏗️</div>
              <h3>Construction Materials</h3>
              <p>5000+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">⚙️</div>
              <h3>Industrial Machinery</h3>
              <p>3200+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📱</div>
              <h3>Electronics & IT</h3>
              <p>7800+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">👗</div>
              <h3>Textiles & Garments</h3>
              <p>6100+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🧪</div>
              <h3>Chemicals & Dyes</h3>
              <p>2900+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">📦</div>
              <h3>Packaging Solutions</h3>
              <p>4500+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🌾</div>
              <h3>Agriculture & Food</h3>
              <p>3800+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🚗</div>
              <h3>Automotive Parts</h3>
              <p>2100+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">💊</div>
              <h3>Pharmaceuticals</h3>
              <p>1500+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">⚡</div>
              <h3>Electrical Equipment</h3>
              <p>3000+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🛠️</div>
              <h3>Tools & Hardware</h3>
              <p>2700+ Products</p>
            </div>
            <div className="category-card">
              <div className="category-icon">🛋️</div>
              <h3>Furniture & Decor</h3>
              <p>1900+ Products</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2>How Bell24h Works</h2>
          <div className="steps-grid">
            <div className="step">
              <div className="icon">1</div>
              <h3>Post Your Requirement</h3>
              <p>Submit your RFQ via text, voice, or video. Our AI analyzes and matches you with relevant suppliers.</p>
            </div>
            <div className="step">
              <div className="icon">2</div>
              <h3>Get 3 Verified Quotes</h3>
              <p>Receive competitive quotes from GST-verified suppliers within 24 hours. Compare and choose the best.</p>
            </div>
            <div className="step">
              <div className="icon">3</div>
              <h3>Secure Payments</h3>
              <p>Transact securely with escrow protection. Funds are released only after you confirm satisfactory delivery.</p>
            </div>
            <div className="step">
              <div className="icon">4</div>
              <h3>Track & Manage</h3>
              <p>Monitor your orders, communicate with suppliers, and manage all your B2B activities from your dashboard.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={handleAuthSuccess}
        />
      )}
    </>
  );
}
