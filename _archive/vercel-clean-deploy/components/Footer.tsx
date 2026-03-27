// components/Footer.tsx - Footer with legal links for Razorpay compliance
'use client';

import Link from 'next/link';
import { Bell, Mail, Phone, MapPin, Shield, FileText, CreditCard, Wallet } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Bell className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">Bell24h</span>
            </div>
            <p className="text-gray-300 mb-4">
              India's leading B2B marketplace connecting verified suppliers with buyers for secure and efficient business transactions.
            </p>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>support@bell24h.com</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <Phone className="h-4 w-4" />
                <span>+91-XXXX-XXXX-XX</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-4 w-4" />
                <span>India</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rfq/create" className="text-gray-300 hover:text-white transition-colors">
                  RFQ Management
                </Link>
              </li>
              <li>
                <Link href="/suppliers" className="text-gray-300 hover:text-white transition-colors">
                  Supplier Directory
                </Link>
              </li>
              <li>
                <Link href="/escrow" className="text-gray-300 hover:text-white transition-colors">
                  Escrow Services
                </Link>
              </li>
              <li>
                <Link href="/wallet" className="text-gray-300 hover:text-white transition-colors">
                  Digital Wallet
                </Link>
              </li>
              <li>
                <Link href="/verification" className="text-gray-300 hover:text-white transition-colors">
                  Supplier Verification
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <Shield className="h-4 w-4 mr-2" />
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <FileText className="h-4 w-4 mr-2" />
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/refund-policy" className="text-gray-300 hover:text-white transition-colors">
                  Refund Policy
                </Link>
              </li>
              <li>
                <Link href="/shipping-policy" className="text-gray-300 hover:text-white transition-colors">
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link href="/cancellation-policy" className="text-gray-300 hover:text-white transition-colors">
                  Cancellation Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Payment & Security</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/payment-methods" className="text-gray-300 hover:text-white transition-colors flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/security" className="text-gray-300 hover:text-white transition-colors">
                  Security Features
                </Link>
              </li>
              <li>
                <Link href="/fraud-protection" className="text-gray-300 hover:text-white transition-colors">
                  Fraud Protection
                </Link>
              </li>
              <li>
                <Link href="/dispute-resolution" className="text-gray-300 hover:text-white transition-colors">
                  Dispute Resolution
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-300 text-sm">
              © 2025 Bell24h Technologies Pvt Ltd. All rights reserved.
            </div>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy" className="text-gray-300 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-gray-300 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link href="/cookies" className="text-gray-300 hover:text-white text-sm transition-colors">
                Cookies
              </Link>
              <Link href="/sitemap" className="text-gray-300 hover:text-white text-sm transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
