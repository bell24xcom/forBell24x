'use client';

import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ManufacturersPage() {
  const manufacturers = [
    { name: 'Steel Manufacturing Co.', location: 'Mumbai, Maharashtra', rating: 4.8, products: 150, verified: true },
    { name: 'Textile Mills Ltd.', location: 'Ahmedabad, Gujarat', rating: 4.9, products: 200, verified: true },
    { name: 'Electronics Solutions', location: 'Bangalore, Karnataka', rating: 4.7, products: 180, verified: true },
    { name: 'Chemical Industries', location: 'Chennai, Tamil Nadu', rating: 4.6, products: 120, verified: true },
    { name: 'Machinery Works', location: 'Pune, Maharashtra', rating: 4.8, products: 95, verified: true },
    { name: 'Packaging Solutions', location: 'Delhi, NCR', rating: 4.7, products: 160, verified: true }
  ];

  return (
    <>
      <style jsx>{`
        .manufacturers-page {
          min-height: 100vh;
          background: #ffffff;
        }
        
        .hero-section {
          background: #1a237e;
          color: white;
          padding: 60px 0;
          text-align: center;
        }
        
        .hero-section h1 {
          font-size: 48px;
          margin-bottom: 20px;
          font-weight: bold;
        }
        
        .hero-section p {
          font-size: 20px;
          opacity: 0.9;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .manufacturers-grid {
          padding: 80px 0;
          max-width: 1200px;
          margin: 0 auto;
        }
        
        .manufacturers-grid h2 {
          text-align: center;
          font-size: 42px;
          margin-bottom: 50px;
          color: #1a237e;
          font-weight: bold;
        }
        
        .manufacturer-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 30px;
        }
        
        .manufacturer-card {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
          transition: all 0.3s;
          border: 2px solid #f3f4f6;
        }
        
        .manufacturer-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 40px rgba(0,0,0,0.12);
          border-color: #1a237e;
        }
        
        .manufacturer-header {
          display: flex;
          align-items: center;
          margin-bottom: 20px;
        }
        
        .manufacturer-logo {
          width: 60px;
          height: 60px;
          background: #1a237e;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin-right: 15px;
        }
        
        .manufacturer-info h3 {
          font-size: 20px;
          color: #1a237e;
          margin-bottom: 5px;
          font-weight: 600;
        }
        
        .manufacturer-info p {
          color: #666;
          font-size: 14px;
        }
        
        .manufacturer-details {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-top: 20px;
        }
        
        .detail-item {
          text-align: center;
          padding: 15px;
          background: #f5f5f5;
          border-radius: 8px;
        }
        
        .detail-value {
          font-size: 18px;
          font-weight: bold;
          color: #1a237e;
          margin-bottom: 5px;
        }
        
        .detail-label {
          font-size: 12px;
          color: #666;
        }
        
        .verified-badge {
          background: #dcfce7;
          color: #15803d;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          display: inline-block;
          margin-top: 10px;
        }
      `}</style>

      <Header />

      <div className="manufacturers-page">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="container">
            <h1>Manufacturers</h1>
            <p>Connect with verified manufacturers across India for your B2B needs</p>
          </div>
        </section>

        {/* Manufacturers Grid */}
        <section className="manufacturers-grid">
          <div className="container">
            <h2>Verified Manufacturers</h2>
            <div className="manufacturer-grid">
              {manufacturers.map((manufacturer, index) => (
                <div key={index} className="manufacturer-card">
                  <div className="manufacturer-header">
                    <div className="manufacturer-logo">
                      {manufacturer.name.charAt(0)}
                    </div>
                    <div className="manufacturer-info">
                      <h3>{manufacturer.name}</h3>
                      <p>📍 {manufacturer.location}</p>
                    </div>
                  </div>
                  
                  <div className="manufacturer-details">
                    <div className="detail-item">
                      <div className="detail-value">⭐ {manufacturer.rating}</div>
                      <div className="detail-label">Rating</div>
                    </div>
                    <div className="detail-item">
                      <div className="detail-value">{manufacturer.products}</div>
                      <div className="detail-label">Products</div>
                    </div>
                  </div>
                  
                  {manufacturer.verified && (
                    <div className="verified-badge">
                      ✅ GST Verified
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
