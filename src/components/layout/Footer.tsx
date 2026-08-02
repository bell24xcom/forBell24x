'use client';
import Link from 'next/link';
import { Facebook, Twitter, Linkedin, Instagram, Youtube, Mail, Phone } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black/50 backdrop-blur-xl border-t border-white/10 mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
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
                <Link href="/video-rfq" className="hover:text-white transition">
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

          {/* Platform */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Platform</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/how-it-works" className="hover:text-white transition">How It Works</Link></li>
              <li><Link href="/how-payment-works" className="hover:text-white transition">Payment Protection</Link></li>
              <li><Link href="/how-verification-works" className="hover:text-white transition">Supplier Verification</Link></li>
              <li><Link href="/founding-suppliers" className="hover:text-white transition">Founding Suppliers</Link></li>
              <li><Link href="/features/voice-rfq" className="hover:text-white transition">Speak Requirement <span className="text-xs text-amber-400">(Beta)</span></Link></li>
              <li><Link href="/features/regional-languages" className="hover:text-white transition">Video Requirement <span className="text-xs text-amber-400">(Beta)</span></Link></li>
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
              <li>
                <Link href="/help" className="hover:text-white transition">
                  Help
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white transition">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-bold text-lg mb-4 text-white">Legal</h3>
            <ul className="space-y-2 text-gray-400">
              <li><Link href="/privacy" className="hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition">Terms & Conditions</Link></li>
              <li><Link href="/cookies" className="hover:text-white transition">Cookie Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition">Refund Policy</Link></li>
              <li><Link href="/shipping" className="hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="/data-deletion" className="hover:text-white transition">Data Deletion</Link></li>
              <li><Link href="/consent" className="hover:text-white transition">Consent Notice</Link></li>
              <li>
                <button
                  onClick={() => { localStorage.removeItem('vyaparsethu_cookie_consent_v1'); window.location.reload(); }}
                  className="hover:text-white transition text-left"
                >
                  Cookie Settings
                </button>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <div className="text-4xl font-black mb-4">
              <span className="text-white">Vyapar</span>
              <span className="text-cyan-400">Sethu</span>
            </div>
            <p className="text-gray-400 text-sm mb-1">vyaparsethu.com • Made in India 🇮🇳</p>
            <p className="text-gray-500 text-xs mb-3">Digitex Studio (Proprietorship)</p>
            
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
                <a href="mailto:digitex.studio@gmail.com" className="hover:text-white transition">
                  digitex.studio@gmail.com
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
        <div className="mt-8 p-6 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-lg border border-cyan-800/30">
          <p className="text-center text-white font-medium mb-2">
            🎯 Every User Can Buy AND Sell
          </p>
          <p className="text-center text-sm text-gray-400">
            One login, one dashboard - switch between posting RFQs and responding to RFQs instantly!
          </p>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 text-center">
          <p className="text-gray-400">© {currentYear} Digitex Studio. Made in India 🇮🇳</p>
          <p className="text-slate-500 text-xs mt-1">VyaparSethu • GSTIN 27AAAPP9753F2ZF</p>
        </div>
      </div>
    </footer>
  );
}

