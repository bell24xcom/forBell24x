'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  Home, 
  Users, 
  Briefcase, 
  Factory, 
  ShoppingBag,
  CheckCircle,
  ArrowRight,
  Shield,
  FileText,
  CreditCard,
  AlertCircle,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

interface BusinessType {
  id: string;
  name: string;
  type: 'B2B' | 'B2C' | 'Home Service' | 'Service Industry';
  icon: any;
  description: string;
  registrationRequirements: string[];
  pricing: string;
  color: string;
}

const businessTypes: BusinessType[] = [
  {
    id: 'b2b-manufacturing',
    name: 'B2B Manufacturing',
    type: 'B2B',
    icon: Factory,
    description: 'Industrial manufacturing and production businesses',
    registrationRequirements: ['Udyam Aadhaar (Mandatory)', 'GST Registration', 'Factory License'],
    pricing: 'Free - Premium Plans',
    color: 'blue'
  },
  {
    id: 'b2b-services',
    name: 'B2B Services',
    type: 'B2B',
    icon: Briefcase,
    description: 'Professional services for businesses',
    registrationRequirements: ['Udyam Aadhaar (Mandatory)', 'GST Registration', 'Professional License'],
    pricing: 'Free - Premium Plans',
    color: 'green'
  },
  {
    id: 'b2c-products',
    name: 'B2C Products',
    type: 'B2C',
    icon: ShoppingBag,
    description: 'Consumer products and retail businesses',
    registrationRequirements: ['GST Registration', 'Shop & Establishment', 'Trade License'],
    pricing: 'Free - Premium Plans',
    color: 'purple'
  },
  {
    id: 'home-services',
    name: 'Home Services',
    type: 'Home Service',
    icon: Home,
    description: 'Home-based businesses and local services',
    registrationRequirements: ['URD Registration', 'Home Business License', 'Local Authority Registration'],
    pricing: 'Free - Basic Plans',
    color: 'orange'
  },
  {
    id: 'service-industry',
    name: 'Service Industry',
    type: 'Service Industry',
    icon: Users,
    description: 'Professional service providers',
    registrationRequirements: ['Udyam Aadhaar', 'GST Registration', 'Professional License'],
    pricing: 'Free - Premium Plans',
    color: 'indigo'
  }
];

interface RegistrationData {
  businessType: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    aadhaar: string;
    pan: string;
  };
  businessInfo: {
    businessName: string;
    businessAddress: string;
    businessType: string;
    gstNumber: string;
    udyamAadhaar: string;
    bankAccount: string;
    ifscCode: string;
  };
  documents: {
    aadhaarUploaded: boolean;
    panUploaded: boolean;
    gstUploaded: boolean;
    udyamUploaded: boolean;
    bankStatementUploaded: boolean;
  };
  plan: string;
}

export default function RegistrationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedBusinessType, setSelectedBusinessType] = useState<string>('');
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    businessType: '',
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      aadhaar: '',
      pan: ''
    },
    businessInfo: {
      businessName: '',
      businessAddress: '',
      businessType: '',
      gstNumber: '',
      udyamAadhaar: '',
      bankAccount: '',
      ifscCode: ''
    },
    documents: {
      aadhaarUploaded: false,
      panUploaded: false,
      gstUploaded: false,
      udyamUploaded: false,
      bankStatementUploaded: false
    },
    plan: 'free'
  });

  const getBusinessType = () => {
    return businessTypes.find(bt => bt.id === selectedBusinessType);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'B2B':
        return 'bg-blue-100 text-blue-800';
      case 'B2C':
        return 'bg-purple-100 text-purple-800';
      case 'Home Service':
        return 'bg-orange-100 text-orange-800';
      case 'Service Industry':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600';
      case 'green':
        return 'bg-green-100 text-green-600';
      case 'purple':
        return 'bg-purple-100 text-purple-600';
      case 'orange':
        return 'bg-orange-100 text-orange-600';
      case 'indigo':
        return 'bg-indigo-100 text-indigo-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleBusinessTypeSelect = (businessTypeId: string) => {
    setSelectedBusinessType(businessTypeId);
    setRegistrationData(prev => ({
      ...prev,
      businessType: businessTypeId
    }));
    setCurrentStep(2);
  };

  const handleSubmit = () => {
    // Handle registration submission
    console.log('Registration data:', registrationData);
    alert('Registration submitted successfully! You will receive a confirmation email shortly.');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Business Registration" />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step <= currentStep 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-600'
                }`}>
                  {step < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <span className="text-sm font-medium">{step}</span>
                  )}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    step < currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step 1: Business Type Selection */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Choose Your Business Type</h1>
                <p className="text-lg text-gray-600">
                  Select the category that best describes your business to get started with the right registration process.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businessTypes.map((businessType) => {
                  const IconComponent = businessType.icon;
                  return (
                    <Card 
                      key={businessType.id} 
                      className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-500"
                      onClick={() => handleBusinessTypeSelect(businessType.id)}
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between mb-3">
                          <div className={`w-12 h-12 ${getCategoryColor(businessType.color)} rounded-lg flex items-center justify-center`}>
                            <IconComponent className="h-6 w-6" />
                          </div>
                          <Badge className={getTypeColor(businessType.type)}>
                            {businessType.type}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{businessType.name}</CardTitle>
                        <p className="text-gray-600 text-sm">{businessType.description}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-semibold text-sm text-gray-700 mb-2">Registration Requirements:</h4>
                            <ul className="space-y-1">
                              {businessType.registrationRequirements.map((req, index) => (
                                <li key={index} className="text-sm text-gray-600 flex items-center">
                                  <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                  {req}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="flex items-center justify-between pt-3 border-t">
                            <span className="text-sm font-semibold text-green-600">{businessType.pricing}</span>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                              Select
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-blue-800 mb-2">Need Help Choosing?</h3>
                    <p className="text-blue-700 text-sm">
                      Not sure which category fits your business? Check our comprehensive 
                      <Link href="/business-categories" className="underline ml-1">Business Categories Guide</Link> 
                      or contact our support team for personalized assistance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Personal Information */}
          {currentStep === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-blue-600" />
                  Personal Information
                </CardTitle>
                <p className="text-gray-600">
                  Selected: <Badge className={getTypeColor(getBusinessType()?.type || '')}>
                    {getBusinessType()?.name}
                  </Badge>
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      value={registrationData.personalInfo.fullName}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                      }))}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={registrationData.personalInfo.email}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, email: e.target.value }
                      }))}
                      placeholder="Enter your email"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={registrationData.personalInfo.phone}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, phone: e.target.value }
                      }))}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="aadhaar">Aadhaar Number *</Label>
                    <Input
                      id="aadhaar"
                      value={registrationData.personalInfo.aadhaar}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, aadhaar: e.target.value }
                      }))}
                      placeholder="Enter Aadhaar number"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="pan">PAN Number *</Label>
                    <Input
                      id="pan"
                      value={registrationData.personalInfo.pan}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        personalInfo: { ...prev.personalInfo, pan: e.target.value }
                      }))}
                      placeholder="Enter PAN number"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(1)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(3)}
                    disabled={!registrationData.personalInfo.fullName || !registrationData.personalInfo.email}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Business Information */}
          {currentStep === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-6 w-6 text-green-600" />
                  Business Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="businessName">Business Name *</Label>
                    <Input
                      id="businessName"
                      value={registrationData.businessInfo.businessName}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                      }))}
                      placeholder="Enter business name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="businessType">Business Type *</Label>
                    <Input
                      id="businessType"
                      value={registrationData.businessInfo.businessType}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, businessType: e.target.value }
                      }))}
                      placeholder="e.g., Manufacturing, Service, Trading"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="businessAddress">Business Address *</Label>
                    <Input
                      id="businessAddress"
                      value={registrationData.businessInfo.businessAddress}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, businessAddress: e.target.value }
                      }))}
                      placeholder="Enter business address"
                    />
                  </div>
                  <div>
                    <Label htmlFor="gstNumber">GST Number</Label>
                    <Input
                      id="gstNumber"
                      value={registrationData.businessInfo.gstNumber}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, gstNumber: e.target.value }
                      }))}
                      placeholder="Enter GST number (if applicable)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="udyamAadhaar">Udyam Aadhaar Number</Label>
                    <Input
                      id="udyamAadhaar"
                      value={registrationData.businessInfo.udyamAadhaar}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, udyamAadhaar: e.target.value }
                      }))}
                      placeholder="Enter Udyam Aadhaar number (if applicable)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="bankAccount">Bank Account Number *</Label>
                    <Input
                      id="bankAccount"
                      value={registrationData.businessInfo.bankAccount}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, bankAccount: e.target.value }
                      }))}
                      placeholder="Enter bank account number"
                    />
                  </div>
                  <div>
                    <Label htmlFor="ifscCode">IFSC Code *</Label>
                    <Input
                      id="ifscCode"
                      value={registrationData.businessInfo.ifscCode}
                      onChange={(e) => setRegistrationData(prev => ({
                        ...prev,
                        businessInfo: { ...prev.businessInfo, ifscCode: e.target.value }
                      }))}
                      placeholder="Enter IFSC code"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between pt-4">
                  <Button variant="outline" onClick={() => setCurrentStep(2)}>
                    Back
                  </Button>
                  <Button 
                    onClick={() => setCurrentStep(4)}
                    disabled={!registrationData.businessInfo.businessName || !registrationData.businessInfo.businessAddress}
                  >
                    Continue
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Document Upload & Plan Selection */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    Document Upload & Plan Selection
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-4">Required Documents</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { name: 'Aadhaar Card', key: 'aadhaarUploaded', required: true },
                        { name: 'PAN Card', key: 'panUploaded', required: true },
                        { name: 'GST Certificate', key: 'gstUploaded', required: false },
                        { name: 'Udyam Aadhaar Certificate', key: 'udyamUploaded', required: false },
                        { name: 'Bank Statement', key: 'bankStatementUploaded', required: true }
                      ].map((doc) => (
                        <div key={doc.key} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={registrationData.documents[doc.key as keyof typeof registrationData.documents]}
                              onChange={(e) => setRegistrationData(prev => ({
                                ...prev,
                                documents: {
                                  ...prev.documents,
                                  [doc.key]: e.target.checked
                                }
                              }))}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{doc.name}</span>
                            {doc.required && <Badge variant="destructive" className="text-xs">Required</Badge>}
                          </div>
                          <Button size="sm" variant="outline">
                            Upload
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-lg mb-4">Select Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {[
                        { id: 'free', name: 'Free Plan', price: '₹0', features: ['Basic listing', 'Limited RFQs', 'Standard support'] },
                        { id: 'premium', name: 'Premium Plan', price: '₹999/month', features: ['Unlimited RFQs', 'Priority support', 'Advanced analytics'] },
                        { id: 'enterprise', name: 'Enterprise Plan', price: '₹2999/month', features: ['Custom features', 'Dedicated support', 'API access'] }
                      ].map((plan) => (
                        <div 
                          key={plan.id}
                          className={`border rounded-lg p-4 cursor-pointer ${
                            registrationData.plan === plan.id ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                          }`}
                          onClick={() => setRegistrationData(prev => ({ ...prev, plan: plan.id }))}
                        >
                          <h4 className="font-semibold text-lg">{plan.name}</h4>
                          <p className="text-2xl font-bold text-blue-600 mb-3">{plan.price}</p>
                          <ul className="space-y-1">
                            {plan.features.map((feature, index) => (
                              <li key={index} className="text-sm text-gray-600 flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep(3)}>
                  Back
                </Button>
                <Button 
                  onClick={handleSubmit}
                  className="bg-green-600 hover:bg-green-700"
                  size="lg"
                >
                  Complete Registration
                  <CheckCircle className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
