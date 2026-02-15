'use client';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slot } from '@radix-ui/react-slot';
import { 
  ArrowRight, 
  Phone, 
  User, 
  Building, 
  Shield, 
  Star, 
  CheckCircle,
  Clock,
  Users,
  TrendingUp,
  Zap,
  Crown
} from 'lucide-react';
import Link from 'next/link';

export default function AuthLandingPage() {
  const router = useRouter();

  const registrationSteps = [
    {
      step: 1,
      title: 'Basic Information',
      description: 'Enter your name, email, and company details',
      icon: <User className="h-6 w-6" />,
      color: 'text-indigo-600 bg-indigo-100'
    },
    {
      step: 2,
      title: 'Mobile Verification',
      description: 'Verify your mobile number with OTP',
      icon: <Phone className="h-6 w-6" />,
      color: 'text-emerald-600 bg-emerald-100'
    },
    {
      step: 3,
      title: 'Business Profile',
      description: 'Complete your business information',
      icon: <Building className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100'
    },
    {
      step: 4,
      title: 'Welcome to Bell24h',
      description: 'Access your dashboard and start growing',
      icon: <Star className="h-6 w-6" />,
      color: 'text-yellow-600 bg-yellow-100'
    }
  ];

  const benefits = [
    {
      title: 'Free Forever Plan',
      description: 'Basic features at no cost',
      icon: <Crown className="h-5 w-5 text-yellow-600" />
    },
    {
      title: '3-Month Premium FREE',
      description: 'Premium features worth ₹36,000',
      icon: <Star className="h-5 w-5 text-blue-600" />
    },
    {
      title: 'Early User Badge',
      description: 'Founder member status',
      icon: <Zap className="h-5 w-5 text-purple-600" />
    },
    {
      title: 'Priority Support',
      description: 'Dedicated customer success',
      icon: <Users className="h-5 w-5 text-green-600" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full flex items-center justify-center">
              <Star className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🚀 Join Bell24h
          </h1>
          <p className="text-xl text-gray-700 mb-6 max-w-2xl mx-auto">
            India's Fastest B2B Match-Making Engine for MSMEs
          </p>
          <p className="text-lg text-gray-600 mb-8 max-w-3xl mx-auto">
            Get <strong>3 months FREE premium</strong> worth ₹36,000 + <strong>Free forever basic plan</strong> + <strong>Founder member badge</strong>
          </p>
        </div>

        {/* Registration Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Simple 4-Step Registration
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {registrationSteps.map((step, index) => (
              <Card key={step.step} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className={`w-12 h-12 rounded-full ${step.color} flex items-center justify-center mx-auto mb-4`}>
                    {step.icon}
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm">{step.description}</p>
                  <div className="mt-4 text-2xl font-bold text-indigo-600">
                    {step.step}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            🎁 Exclusive Early User Benefits
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mb-12">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-indigo-50 to-emerald-50 border-2 border-indigo-200">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Ready to Get Started?
              </h3>
              <p className="text-gray-700 mb-6">
                Join thousands of MSMEs already growing with Bell24h
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => router.push('/auth/register')}
                  className="bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white px-8 py-3 text-lg"
                >
                  <User className="h-5 w-5 mr-2" />
                  Start Registration
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
                <Button
                  onClick={() => router.push('/auth/login')}
                  variant="outline"
                  className="border-indigo-600 text-indigo-600 hover:bg-indigo-50 px-8 py-3 text-lg"
                >
                  <Shield className="h-5 w-5 mr-2" />
                  Already Registered? Login
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Features Preview */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            What You'll Get Access To
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <TrendingUp className="h-6 w-6 text-green-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">Lead Generation</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Get qualified leads from verified buyers and sellers
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Shield className="h-6 w-6 text-blue-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">Secure Payments</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Escrow-protected transactions with guaranteed security
                </p>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <Zap className="h-6 w-6 text-purple-600 mr-3" />
                  <h3 className="font-semibold text-gray-900">AI Matching</h3>
                </div>
                <p className="text-gray-600 text-sm">
                  Smart algorithms match you with perfect business partners
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="text-center mb-8">
          <Card className="max-w-4xl mx-auto bg-white">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-indigo-600 mb-2">4,000+</div>
                  <div className="text-gray-600">Companies Registered</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-emerald-600 mb-2">₹36L+</div>
                  <div className="text-gray-600">Value in Free Benefits</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-purple-600 mb-2">98%</div>
                  <div className="text-gray-600">Success Rate</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <div className="p-6 bg-gradient-to-r from-blue-600 to-emerald-600 rounded-lg text-white">
            <h3 className="text-2xl font-bold mb-4">
              🎉 Limited Time Offer - Join Now!
            </h3>
            <p className="text-lg mb-6">
              First 1000 users get exclusive founder benefits
            </p>
            <Button
              onClick={() => router.push('/auth/register')}
              className="bg-white text-indigo-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold"
            >
              <Crown className="h-5 w-5 mr-2" />
              Claim Your Founder Benefits
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-center">
          <Link 
            href="/" 
            className="text-gray-600 hover:text-gray-800 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
