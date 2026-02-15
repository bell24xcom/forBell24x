'use client';
import Link from 'next/link';
import { ArrowLeft, Home, MessageSquare, CreditCard, Wallet } from 'lucide-react';

interface HeaderProps {
  title: string;
  showBackButton?: boolean;
  backUrl?: string;
}

export default function Header({ title, showBackButton = true, backUrl = '/' }: HeaderProps) {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-4">
            {showBackButton && (
              <>
                <Link 
                  href={backUrl} 
                  className="flex items-center text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back
                </Link>
                <div className="h-6 w-px bg-gray-300"></div>
              </>
            )}
            
            {/* Branding Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">🔔</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-blue-600">Bell24h</h1>
                <p className="text-xs text-gray-500">Enterprise B2B</p>
              </div>
            </Link>
            
            <div className="h-6 w-px bg-gray-300"></div>
            <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link href="/suppliers" className="text-gray-600 hover:text-blue-600 transition-colors">
              Suppliers
            </Link>
            <Link href="/pricing" className="text-gray-600 hover:text-blue-600 transition-colors">
              Pricing
            </Link>
            <Link href="/fintech" className="text-gray-600 hover:text-blue-600 transition-colors">
              Fintech
            </Link>
            <Link href="/wallet" className="text-gray-600 hover:text-blue-600 transition-colors">
              Wallet
            </Link>
            <Link href="/negotiation" className="flex items-center text-gray-600 hover:text-blue-600 transition-colors">
              <MessageSquare className="h-4 w-4 mr-1" />
              Negotiations
            </Link>
          </nav>
        </div>
      </div>
    </div>
  );
}
