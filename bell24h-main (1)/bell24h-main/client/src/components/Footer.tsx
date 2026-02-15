import Link from 'next/link';

import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <span className="font-bold text-2xl text-white">Bell24h</span>
            </div>
            <p className="text-sm mb-4">
              India's fastest B2B procurement platform. Every user can buy AND sell. Voice-powered RFQs, AI matching, and secure transactions.
            </p>
            <div className="flex gap-3">
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-800 hover:bg-blue-600 rounded-lg transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-blue-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-blue-400 transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-blue-400 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-blue-400 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-blue-400 transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>

          {/* For Posting RFQs (Buying) */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Post RFQs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rfq/voice" className="hover:text-blue-400 transition-colors">
                  Voice RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/video" className="hover:text-blue-400 transition-colors">
                  Video RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/create" className="hover:text-blue-400 transition-colors">
                  Text RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/my-rfqs" className="hover:text-blue-400 transition-colors">
                  My RFQs
                </Link>
              </li>
              <li>
                <Link href="/help/posting" className="hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>

          {/* For Responding to RFQs (Selling) */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4">Respond to RFQs</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/rfq" className="hover:text-blue-400 transition-colors">
                  Browse RFQs
                </Link>
              </li>
              <li>
                <Link href="/products/add" className="hover:text-blue-400 transition-colors">
                  Add Products
                </Link>
              </li>
              <li>
                <Link href="/quotes/my-quotes" className="hover:text-blue-400 transition-colors">
                  My Quotes
                </Link>
              </li>
              <li>
                <Link href="/orders/received" className="hover:text-blue-400 transition-colors">
                  Orders Received
                </Link>
              </li>
              <li>
                <Link href="/help/responding" className="hover:text-blue-400 transition-colors">
                  Help Center
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Contact Info */}
        <div className="mt-8 pt-8 border-t border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <p className="font-semibold text-white">Email Us</p>
                <a href="mailto:support@bell24h.com" className="hover:text-blue-400 transition-colors">
                  support@bell24h.com
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <p className="font-semibold text-white">Call Us</p>
                <a href="tel:+918888888888" className="hover:text-blue-400 transition-colors">
                  +91 88888 88888
                </a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <p className="font-semibold text-white">Visit Us</p>
                <p className="text-sm">
                  Mumbai, Maharashtra, India
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Feature Highlight */}
        <div className="mt-8 p-6 bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-lg border border-blue-800/30">
          <p className="text-center text-white font-medium mb-2">
            🎯 Every User Can Buy AND Sell
          </p>
          <p className="text-center text-sm text-gray-400">
            One login, one dashboard - switch between posting RFQs and responding to RFQs instantly!
          </p>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © {currentYear} Bell24h. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link href="/legal/privacy" className="hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/terms" className="hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/cookie" className="hover:text-blue-400 transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

