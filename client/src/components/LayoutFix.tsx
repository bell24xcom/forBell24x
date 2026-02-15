'use client';
import { useState } from 'react';

export default function LayoutFix() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="layout-fix-container">
      {/* Header with proper alignment */}
      <header className="header-fixed">
        <div className="header-content">
          <div className="logo-section">
            <h1>Bell24h</h1>
          </div>
          
          <div className="search-categories-section">
            {/* Search bar */}
            <div className="search-container">
              <input
                type="text"
                placeholder="Search suppliers, products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              <button className="search-button">
                🔍
              </button>
            </div>
            
            {/* Categories dropdown */}
            <div className="categories-container">
              <select className="categories-select">
                <option value="">All Categories</option>
                <option value="automotive">Automotive</option>
                <option value="electronics">Electronics</option>
                <option value="textiles">Textiles</option>
                <option value="machinery">Machinery</option>
                <option value="chemicals">Chemicals</option>
              </select>
            </div>
          </div>
          
          <div className="auth-section">
            {/* This will be conditionally rendered based on auth state */}
          </div>
        </div>
      </header>
    </div>
  );
}
