'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <>
      <style jsx>{`
        .not-found-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          text-align: center;
          padding: 20px;
        }
        
        .not-found-content {
          max-width: 600px;
        }
        
        .error-code {
          font-size: 120px;
          font-weight: bold;
          margin-bottom: 20px;
          opacity: 0.9;
        }
        
        .error-message {
          font-size: 32px;
          margin-bottom: 20px;
          font-weight: 600;
        }
        
        .error-description {
          font-size: 18px;
          opacity: 0.8;
          margin-bottom: 40px;
          line-height: 1.6;
        }
        
        .action-buttons {
          display: flex;
          gap: 20px;
          justify-content: center;
          flex-wrap: wrap;
        }
        
        .btn {
          padding: 15px 30px;
          border-radius: 8px;
          text-decoration: none;
          font-weight: 600;
          font-size: 16px;
          transition: all 0.3s;
          display: inline-block;
        }
        
        .btn-primary {
          background: #ff6f00;
          color: white;
        }
        
        .btn-primary:hover {
          background: #e65100;
          transform: translateY(-2px);
        }
        
        .btn-secondary {
          background: transparent;
          color: white;
          border: 2px solid white;
        }
        
        .btn-secondary:hover {
          background: white;
          color: #1a237e;
        }
        
        .bell-logo {
          width: 80px;
          height: 80px;
          background: #ff6f00;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          font-weight: bold;
          margin: 0 auto 30px;
          color: white;
        }
        
        @media (max-width: 768px) {
          .error-code {
            font-size: 80px;
          }
          
          .error-message {
            font-size: 24px;
          }
          
          .error-description {
            font-size: 16px;
          }
          
          .action-buttons {
            flex-direction: column;
            align-items: center;
          }
          
          .btn {
            width: 200px;
          }
        }
      `}</style>

      <div className="not-found-page">
        <div className="not-found-content">
          <div className="bell-logo">B</div>
          
          <div className="error-code">404</div>
          
          <h1 className="error-message">Page Not Found</h1>
          
          <p className="error-description">
            Sorry, the page you're looking for doesn't exist. 
            It might have been moved, deleted, or you entered the wrong URL.
          </p>
          
          <div className="action-buttons">
            <Link href="/" className="btn btn-primary">
              🏠 Go Home
            </Link>
            <Link href="/suppliers" className="btn btn-secondary">
              👥 Find Suppliers
            </Link>
            <Link href="/rfq/create" className="btn btn-secondary">
              📝 Post RFQ
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}