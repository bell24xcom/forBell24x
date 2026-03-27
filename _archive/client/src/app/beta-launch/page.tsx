'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Rocket, 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function BetaLaunchPage() {
  const [bugReport, setBugReport] = useState('');
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleBugReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    // In production, this would send to your bug tracking system
    setTimeout(() => {
      setBugReport('');
      setEmail('');
      setSubmitted(false);
      alert('Bug report submitted! Thank you for your feedback.');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Beta Banner */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-4 text-center">
        <div className="max-w-7xl mx-auto flex items-center justify-center gap-2">
          <Rocket className="h-5 w-5" />
          <span className="font-bold text-lg">🚀 BETA LAUNCH</span>
          <span>•</span>
          <span>Limited to 50 users • Basic features only • No payments yet</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="bg-gradient-to-r from-blue-600 to-emerald-600 bg-clip-text text-transparent">Bell24h</span> Beta
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              India's AI-powered B2B marketplace is launching in phases. You're part of our exclusive beta group!
            </p>
            
            <Badge variant="secondary" className="text-lg px-4 py-2">
              <Users className="h-4 w-4 mr-2" />
              Beta Users: 12/50
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* What Works Now */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  Available Now
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Company Registration</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Basic RFQ Submission</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Company Profile Creation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Basic Search & Browse</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Mobile OTP Login</span>
                </div>
              </CardContent>
            </Card>

            {/* Coming Soon */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-600">
                  <Clock className="h-5 w-5" />
                  Coming Soon
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>AI-Powered Matching</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Escrow Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Advanced Analytics</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Voice/Video RFQs</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span>Enterprise Features</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle>Beta Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-green-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phase 1: Basic Features (Sept 22-29)</h4>
                    <p className="text-gray-600">Registration, profiles, basic RFQs</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phase 2: Enhanced Features (Sept 30 - Oct 2)</h4>
                    <p className="text-gray-600">AI matching, better search, improved UI</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold">Phase 3: Full Launch (Oct 2+)</h4>
                    <p className="text-gray-600">Payments, escrow, all enterprise features</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bug Report */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Report Bugs & Issues
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBugReport} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bug Description
                  </label>
                  <textarea
                    value={bugReport}
                    onChange={(e) => setBugReport(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                    placeholder="Describe the issue you encountered..."
                    required
                  />
                </div>
                <Button type="submit" disabled={submitted}>
                  {submitted ? 'Submitting...' : 'Submit Bug Report'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Contact & Support */}
          <Card>
            <CardHeader>
              <CardTitle>Beta Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-gray-600">beta@bell24h.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-gray-600">+91 90049 62871</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-indigo-600" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-sm text-gray-600">Mumbai, Maharashtra</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="text-center mt-12 space-x-4">
            <Link href="/auth/login">
              <Button size="lg" className="bg-gradient-to-r from-blue-600 to-emerald-600">
                Start Beta Testing
              </Button>
            </Link>
            <Link href="/test-otp">
              <Button variant="outline" size="lg">
                Test OTP Login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
