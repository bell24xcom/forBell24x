// ================================================================
// BELL24H - PHASE 1: COMPACT HEADER + SEARCH BAR
// ================================================================
// Height: 50px (vs previous 70px - 29% reduction)
// Design: IndieHackers-inspired compact layout
// Background: Single consistent #0a1128 (no color changes)
// ================================================================

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, Bell, User, Menu, X } from 'lucide-react';

export default function HeaderSearchCompact() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3);

  return (
    <>
      {/* ============================================ */}
      {/* MAIN HEADER - ULTRA COMPACT (50px height) */}
      {/* ============================================ */}
      <header className="header-compact">
        <div className="header-container">

          {/* LEFT: Logo */}
          <div className="logo-section">
            <Link href="/" className="logo-link">
              <div className="logo-icon">
                <span className="logo-letter">B</span>
              </div>
              <div className="logo-text">
                <span className="logo-bell">BELL</span>
                <span className="logo-24h">24H</span>
              </div>
            </Link>
          </div>

          {/* CENTER: Integrated Search Bar */}
          <div className="search-section">
            <div className="search-container">
              <Search className="search-icon" size={16} />
              <input
                type="text"
                placeholder="Search RFQs, suppliers, categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="search-clear"
                  aria-label="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: Navigation Links + Actions */}
          <div className="nav-section">
            {/* Desktop Navigation */}
            <nav className="nav-desktop">
              <Link href="/demo-rfqs" className="nav-link">
                Demo RFQs
              </Link>
              <Link href="/post-rfq" className="nav-link">
                Post RFQ
              </Link>
              <Link href="/browse-rfqs" className="nav-link">
                Browse RFQs
              </Link>
              <Link href="/suppliers" className="nav-link">
                Suppliers
              </Link>
            </nav>

            {/* Notification Bell */}
            <button className="notification-btn" aria-label="Notifications">
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="notification-badge">{notificationCount}</span>
              )}
            </button>

            {/* Login/Register */}
            <Link href="/login" className="auth-link">
              <User size={18} />
              <span>Login / Register</span>
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              className="mobile-menu-toggle"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="mobile-menu">
            <Link href="/demo-rfqs" className="mobile-menu-link">
              Demo RFQs
            </Link>
            <Link href="/post-rfq" className="mobile-menu-link">
              Post RFQ
            </Link>
            <Link href="/browse-rfqs" className="mobile-menu-link">
              Browse RFQs
            </Link>
            <Link href="/suppliers" className="mobile-menu-link">
              Suppliers
            </Link>
            <div className="mobile-menu-divider" />
            <Link href="/login" className="mobile-menu-link-primary">
              Login / Register
            </Link>
          </div>
        )}
      </header>

      {/* ============================================ */}
      {/* STYLES - SCOPED TO THIS COMPONENT */}
      {/* ============================================ */}
      <style jsx>{`
        /* ==================== */
        /* HEADER CONTAINER */
        /* ==================== */
        .header-compact {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #0a1128;
          border-bottom: 1px solid #1a2332;
          height: 50px;
        }

        .header-container {
          max-width: 1400px;
          margin: 0 auto;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1.5rem;
          padding: 0 1rem;
        }

        /* ==================== */
        /* LOGO SECTION */
        /* ==================== */
        .logo-section {
          flex-shrink: 0;
        }

        .logo-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          text-decoration: none;
          transition: opacity 0.2s;
        }

        .logo-link:hover {
          opacity: 0.8;
        }

        .logo-icon {
          width: 32px;
          height: 32px;
          background: linear-gradient(135deg, #06d6f6 0%, #0ea5e9 100%);
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .logo-letter {
          font-size: 18px;
          font-weight: 700;
          color: #0a1128;
        }

        .logo-text {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 18px;
          font-weight: 700;
        }

        .logo-bell {
          color: #ffffff;
        }

        .logo-24h {
          color: #06d6f6;
        }

        /* ==================== */
        /* SEARCH SECTION */
        /* ==================== */
        .search-section {
          flex: 1;
          max-width: 600px;
        }

        .search-container {
          position: relative;
          display: flex;
          align-items: center;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          pointer-events: none;
        }

        .search-input {
          width: 100%;
          height: 36px;
          background: #1a2332;
          border: 1px solid #2a3544;
          border-radius: 6px;
          padding: 0 36px 0 36px;
          font-size: 14px;
          color: #f9fafb;
          transition: all 0.2s;
        }

        .search-input::placeholder {
          color: #64748b;
        }

        .search-input:focus {
          outline: none;
          border-color: #06d6f6;
          background: #1e293b;
          box-shadow: 0 0 0 3px rgba(6, 214, 246, 0.1);
        }

        .search-clear {
          position: absolute;
          right: 10px;
          background: transparent;
          border: none;
          color: #64748b;
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 3px;
          transition: all 0.2s;
        }

        .search-clear:hover {
          background: #2a3544;
          color: #f9fafb;
        }

        /* ==================== */
        /* NAVIGATION SECTION */
        /* ==================== */
        .nav-section {
          display: flex;
          align-items: center;
          gap: 1rem;
          flex-shrink: 0;
        }

        .nav-desktop {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .nav-link {
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          padding: 6px 10px;
          border-radius: 4px;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .nav-link:hover {
          color: #f9fafb;
          background: #1a2332;
        }

        /* ==================== */
        /* NOTIFICATION BUTTON */
        /* ==================== */
        .notification-btn {
          position: relative;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .notification-btn:hover {
          background: #1a2332;
          color: #f9fafb;
        }

        .notification-badge {
          position: absolute;
          top: 2px;
          right: 2px;
          background: #ef4444;
          color: #ffffff;
          font-size: 10px;
          font-weight: 600;
          padding: 2px 4px;
          border-radius: 8px;
          min-width: 16px;
          text-align: center;
          line-height: 1;
        }

        /* ==================== */
        /* AUTH LINK */
        /* ==================== */
        .auth-link {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #f9fafb;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          padding: 6px 12px;
          border-radius: 6px;
          background: #1a2332;
          border: 1px solid #2a3544;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .auth-link:hover {
          background: #2a3544;
          border-color: #06d6f6;
        }

        /* ==================== */
        /* MOBILE MENU */
        /* ==================== */
        .mobile-menu-toggle {
          display: none;
          background: transparent;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 6px;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .mobile-menu-toggle:hover {
          background: #1a2332;
          color: #f9fafb;
        }

        .mobile-menu {
          display: none;
          position: absolute;
          top: 50px;
          left: 0;
          right: 0;
          background: #0a1128;
          border-bottom: 1px solid #1a2332;
          padding: 0.5rem 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
        }

        .mobile-menu-link {
          display: block;
          color: #94a3b8;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          padding: 0.75rem;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .mobile-menu-link:hover {
          color: #f9fafb;
          background: #1a2332;
        }

        .mobile-menu-link-primary {
          display: block;
          color: #f9fafb;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          padding: 0.75rem;
          border-radius: 6px;
          background: #06d6f6;
          text-align: center;
          transition: all 0.2s;
        }

        .mobile-menu-link-primary:hover {
          background: #0ea5e9;
        }

        .mobile-menu-divider {
          height: 1px;
          background: #1a2332;
          margin: 0.5rem 0;
        }

        /* ==================== */
        /* RESPONSIVE DESIGN */
        /* ==================== */

        /* Tablet (768px and below) */
        @media (max-width: 768px) {
          .nav-desktop {
            display: none;
          }

          .mobile-menu-toggle {
            display: flex;
          }

          .mobile-menu {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
          }

          .auth-link span {
            display: none;
          }

          .search-input {
            font-size: 13px;
          }

          .search-input::placeholder {
            font-size: 13px;
          }
        }

        /* Mobile (480px and below) */
        @media (max-width: 480px) {
          .header-container {
            gap: 0.75rem;
            padding: 0 0.75rem;
          }

          .logo-text {
            display: none;
          }

          .search-section {
            max-width: none;
          }

          .search-input {
            height: 34px;
            font-size: 12px;
            padding: 0 32px 0 32px;
          }

          .search-input::placeholder {
            font-size: 12px;
          }

          .notification-btn {
            padding: 4px;
          }

          .auth-link {
            padding: 6px 8px;
          }
        }

        /* Very Small Mobile (360px and below) */
        @media (max-width: 360px) {
          .notification-btn {
            display: none;
          }

          .search-input::placeholder {
            content: 'Search...';
          }
        }
      `}</style>
    </>
  );
}