import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Product */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Product</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/rfq/voice" className="hover:text-white transition">
                  Voice RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/video" className="hover:text-white transition">
                  Video RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/create" className="hover:text-white transition">
                  Text RFQ
                </Link>
              </li>
              <li>
                <Link href="/rfq/demo/all" className="hover:text-white transition">
                  Demo RFQs
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-white transition">
                  How It Works
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Company</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/about" className="hover:text-white transition">
                  About
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition">
                  Blog
                </Link>
              </li>
              <li>
                <Link href="/careers" className="hover:text-white transition">
                  Careers
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="hover:text-white transition">
                  Pricing
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Support</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help/posting" className="hover:text-white transition">
                  Help Center
                </Link>
              </li>
              <li>
                <Link href="/help/responding" className="hover:text-white transition">
                  Responding Guide
                </Link>
              </li>
              <li>
                <Link href="/legal/privacy" className="hover:text-white transition">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="/legal/terms" className="hover:text-white transition">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="/legal/cookie" className="hover:text-white transition">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Connect</h3>
            <p className="text-gray-400 mb-2">₹500Cr+ in transactions</p>
            <p className="text-gray-400 mb-4">10,000+ verified suppliers</p>
            <p className="text-2xl font-bold text-white mb-4">bell24h.in</p>
            
            {/* Social Links */}
            <div className="flex gap-3 mt-4">
              <a href="#" className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-white/10 hover:bg-blue-600 rounded-lg transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Mail className="w-4 h-4" />
                <a href="mailto:support@bell24h.com" className="hover:text-white transition">
                  support@bell24h.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Phone className="w-4 h-4" />
                <a href="tel:+918888888888" className="hover:text-white transition">
                  +91 88888 88888
                </a>
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

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center text-gray-400">
          <p>© {currentYear} Bell24H Technology Pvt Ltd. Made in India 🚀</p>
        </div>
      </div>
    </footer>
  );
}

