import Link from 'next/link';
import { 
  Bell, 
  Mail, 
  Phone, 
  MapPin, 
  Shield, 
  Award,
  Users,
  Globe,
  FileText,
  CreditCard
} from 'lucide-react';

export default function EnterpriseFooter() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
                <Bell className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-lg font-bold">Bell24h</div>
                <div className="text-xs text-gray-400">B2B Operating System</div>
              </div>
            </div>
            <p className="text-gray-300 text-sm">
              India's fastest B2B match-making engine for MSMEs. 
              Connect with verified suppliers using AI matching and secure escrow payments.
            </p>
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs">
                <Shield className="h-3 w-3" />
                <span>ISO 27001</span>
              </div>
              <div className="flex items-center space-x-1 px-2 py-1 bg-blue-900 text-blue-300 rounded-full text-xs">
                <Award className="h-3 w-3" />
                <span>RBI Compliant</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <div className="space-y-2">
              <Link href="/suppliers" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Find Suppliers
              </Link>
              <Link href="/rfq" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Post RFQ
              </Link>
              <Link href="/pricing" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Pricing Plans
              </Link>
              <Link href="/about" className="block text-gray-300 hover:text-white text-sm transition-colors">
                About Us
              </Link>
              <Link href="/contact" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Contact Support
              </Link>
            </div>
          </div>

          {/* Legal & Policies */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Legal & Policies</h3>
            <div className="space-y-2">
              <Link href="/legal/terms" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Terms of Service
              </Link>
              <Link href="/legal/privacy" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Privacy Policy
              </Link>
              <Link href="/legal/cancellation-refund-policy" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Refund Policy
              </Link>
              <Link href="/legal/escrow-terms" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Escrow Terms
              </Link>
              <Link href="/legal/wallet-terms" className="block text-gray-300 hover:text-white text-sm transition-colors">
                Wallet Terms
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  Mumbai, Maharashtra, India
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  +91 9004962871
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-300 text-sm">
                  digitex.studio@gmail.com
                </span>
              </div>
            </div>
            
            {/* Payment Partners */}
            <div className="pt-4">
              <h4 className="text-sm font-semibold mb-2">Payment Partners</h4>
              <div className="flex items-center space-x-2">
                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                  Razorpay
                </div>
                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                  ICICI Bank
                </div>
                <div className="px-2 py-1 bg-gray-800 rounded text-xs">
                  Stripe
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-gray-400 text-sm">
              © 2024 Bell24h Technologies Pvt Ltd. All rights reserved.
            </div>
            <div className="flex items-center space-x-6">
              <Link href="/legal/terms" className="text-gray-400 hover:text-white text-sm transition-colors">
                Terms
              </Link>
              <Link href="/legal/privacy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Privacy
              </Link>
              <Link href="/legal/cancellation-refund-policy" className="text-gray-400 hover:text-white text-sm transition-colors">
                Refunds
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
