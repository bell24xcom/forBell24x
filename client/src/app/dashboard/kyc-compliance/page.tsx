'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileText, 
  Building2,
  User,
  CreditCard,
  Camera,
  Download,
  Eye,
  X,
  Clock,
  ExternalLink,
  Info
} from 'lucide-react';
import Link from 'next/link';
import Header from '@/components/Header';

interface KYCStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  description: string;
  required: boolean;
  documents: string[];
}

interface UdyamIntegration {
  udyamNumber: string;
  registrationDate: string;
  businessType: string;
  investment: string;
  turnover: string;
  status: 'verified' | 'pending' | 'expired';
}

interface URDSupport {
  urdNumber: string;
  registrationDate: string;
  businessCategory: string;
  localAuthority: string;
  status: 'active' | 'expired' | 'suspended';
}

export default function KYCCompliancePage() {
  const [kycSteps, setKycSteps] = useState<KYCStep[]>([
    {
      id: 'personal-verification',
      name: 'Personal Identity Verification',
      status: 'pending',
      description: 'Verify personal identity using Aadhaar and PAN',
      required: true,
      documents: ['Aadhaar Card', 'PAN Card', 'Photo ID']
    },
    {
      id: 'business-verification',
      name: 'Business Registration Verification',
      status: 'pending',
      description: 'Verify business registration and legal status',
      required: true,
      documents: ['Business Registration', 'GST Certificate', 'Trade License']
    },
    {
      id: 'udyam-verification',
      name: 'Udyam Aadhaar Verification',
      status: 'pending',
      description: 'Verify MSME registration with Udyam Aadhaar',
      required: false,
      documents: ['Udyam Aadhaar Certificate', 'MSME Registration']
    },
    {
      id: 'urd-verification',
      name: 'URD Registration Verification',
      status: 'pending',
      description: 'Verify Unregistered Registered Dealer status',
      required: false,
      documents: ['URD Registration Confirmation', 'Local Authority Registration']
    },
    {
      id: 'financial-verification',
      name: 'Financial Information Verification',
      status: 'pending',
      description: 'Verify bank account and financial status',
      required: true,
      documents: ['Bank Statement', 'Account Details', 'Financial Documents']
    },
    {
      id: 'address-verification',
      name: 'Address Verification',
      status: 'pending',
      description: 'Verify business and personal addresses',
      required: true,
      documents: ['Address Proof', 'Utility Bills', 'Rent Agreement']
    }
  ]);

  const [udyamIntegration, setUdyamIntegration] = useState<UdyamIntegration>({
    udyamNumber: '',
    registrationDate: '',
    businessType: '',
    investment: '',
    turnover: '',
    status: 'pending'
  });

  const [urdSupport, setUrdSupport] = useState<URDSupport>({
    urdNumber: '',
    registrationDate: '',
    businessCategory: '',
    localAuthority: '',
    status: 'active'
  });

  const [activeTab, setActiveTab] = useState('overview');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'failed':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in_progress':
        return 'In Progress';
      case 'failed':
        return 'Failed';
      default:
        return 'Pending';
    }
  };

  const calculateProgress = () => {
    const total = kycSteps.length;
    const completed = kycSteps.filter(step => step.status === 'completed').length;
    return Math.round((completed / total) * 100);
  };

  const handleStepUpdate = (stepId: string, newStatus: KYCStep['status']) => {
    setKycSteps(prev => prev.map(step => 
      step.id === stepId ? { ...step, status: newStatus } : step
    ));
  };

  const handleUdyamVerification = async () => {
    if (!udyamIntegration.udyamNumber) {
      alert('Please enter your Udyam Aadhaar number first');
      return;
    }

    // Simulate Udyam verification API call
    setUdyamIntegration(prev => ({ ...prev, status: 'verified' }));
    handleStepUpdate('udyam-verification', 'completed');
    alert('Udyam Aadhaar verification completed successfully!');
  };

  const handleURDVerification = async () => {
    if (!urdSupport.urdNumber) {
      alert('Please enter your URD number first');
      return;
    }

    // Simulate URD verification API call
    setUrdSupport(prev => ({ ...prev, status: 'active' }));
    handleStepUpdate('urd-verification', 'completed');
    alert('URD verification completed successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="KYC Compliance & Verification" />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* KYC Progress Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                KYC Compliance Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Compliance Progress</span>
                  <span className="text-sm text-gray-600">{calculateProgress()}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {kycSteps.filter(step => step.status === 'completed').length}
                    </div>
                    <div className="text-sm text-gray-600">Completed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {kycSteps.filter(step => step.status === 'in_progress').length}
                    </div>
                    <div className="text-sm text-gray-600">In Progress</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {kycSteps.filter(step => step.status === 'failed').length}
                    </div>
                    <div className="text-sm text-gray-600">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {kycSteps.filter(step => step.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Steps Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="udyam">Udyam Aadhaar</TabsTrigger>
              <TabsTrigger value="urd">URD Support</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {kycSteps.map((step) => (
                  <Card key={step.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(step.status)}
                          <div>
                            <h3 className="font-semibold text-lg">{step.name}</h3>
                            <p className="text-sm text-gray-600">{step.description}</p>
                          </div>
                        </div>
                        <Badge className={getStatusColor(step.status)}>
                          {getStatusText(step.status)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="font-medium text-sm text-gray-700">Required Documents:</h4>
                        <ul className="space-y-1">
                          {step.documents.map((doc, index) => (
                            <li key={index} className="text-sm text-gray-600 flex items-center">
                              <FileText className="h-3 w-3 text-gray-400 mr-2" />
                              {doc}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="flex gap-2 mt-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleStepUpdate(step.id, 'in_progress')}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Documents
                        </Button>
                        {step.status === 'in_progress' && (
                          <Button 
                            size="sm"
                            onClick={() => handleStepUpdate(step.id, 'completed')}
                          >
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Complete
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Udyam Aadhaar Tab */}
            <TabsContent value="udyam" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-6 w-6 text-green-600" />
                    Udyam Aadhaar Integration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-800">Udyam Aadhaar Benefits</h3>
                        <ul className="text-green-700 text-sm mt-1 space-y-1">
                          <li>• Access to government subsidies and schemes</li>
                          <li>• Priority in government tenders</li>
                          <li>• Collateral-free loans up to ₹10 lakhs</li>
                          <li>• Reduced interest rates on loans</li>
                          <li>• Tax benefits and exemptions</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="udyamNumber">Udyam Aadhaar Number</Label>
                      <Input
                        id="udyamNumber"
                        value={udyamIntegration.udyamNumber}
                        onChange={(e) => setUdyamIntegration(prev => ({
                          ...prev,
                          udyamNumber: e.target.value
                        }))}
                        placeholder="Enter your Udyam Aadhaar number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        value={udyamIntegration.businessType}
                        onChange={(e) => setUdyamIntegration(prev => ({
                          ...prev,
                          businessType: e.target.value
                        }))}
                        placeholder="Manufacturing/Service/Trading"
                      />
                    </div>
                    <div>
                      <Label htmlFor="investment">Investment in Plant & Machinery</Label>
                      <Input
                        id="investment"
                        value={udyamIntegration.investment}
                        onChange={(e) => setUdyamIntegration(prev => ({
                          ...prev,
                          investment: e.target.value
                        }))}
                        placeholder="₹ (in crores)"
                      />
                    </div>
                    <div>
                      <Label htmlFor="turnover">Annual Turnover</Label>
                      <Input
                        id="turnover"
                        value={udyamIntegration.turnover}
                        onChange={(e) => setUdyamIntegration(prev => ({
                          ...prev,
                          turnover: e.target.value
                        }))}
                        placeholder="₹ (in crores)"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">Verification Status</h4>
                      <p className="text-sm text-gray-600">
                        {udyamIntegration.status === 'verified' 
                          ? 'Your Udyam Aadhaar is verified and active'
                          : 'Udyam Aadhaar verification pending'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => window.open('https://udyamregistration.gov.in', '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Register Udyam
                      </Button>
                      <Button 
                        onClick={handleUdyamVerification}
                        disabled={udyamIntegration.status === 'verified'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Verify Udyam
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* URD Support Tab */}
            <TabsContent value="urd" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-orange-600" />
                    URD (Unregistered Registered Dealer) Support
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-800">URD Benefits</h3>
                        <ul className="text-orange-700 text-sm mt-1 space-y-1">
                          <li>• Simplified compliance for micro/mini sectors</li>
                          <li>• Lower regulatory burden</li>
                          <li>• Local market access</li>
                          <li>• Basic business recognition</li>
                          <li>• Entry-level business status</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="urdNumber">URD Registration Number</Label>
                      <Input
                        id="urdNumber"
                        value={urdSupport.urdNumber}
                        onChange={(e) => setUrdSupport(prev => ({
                          ...prev,
                          urdNumber: e.target.value
                        }))}
                        placeholder="Enter your URD registration number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessCategory">Business Category</Label>
                      <Input
                        id="businessCategory"
                        value={urdSupport.businessCategory}
                        onChange={(e) => setUrdSupport(prev => ({
                          ...prev,
                          businessCategory: e.target.value
                        }))}
                        placeholder="Micro/Mini sector category"
                      />
                    </div>
                    <div>
                      <Label htmlFor="localAuthority">Local Authority</Label>
                      <Input
                        id="localAuthority"
                        value={urdSupport.localAuthority}
                        onChange={(e) => setUrdSupport(prev => ({
                          ...prev,
                          localAuthority: e.target.value
                        }))}
                        placeholder="Local commercial tax office"
                      />
                    </div>
                    <div>
                      <Label htmlFor="registrationDate">Registration Date</Label>
                      <Input
                        id="registrationDate"
                        type="date"
                        value={urdSupport.registrationDate}
                        onChange={(e) => setUrdSupport(prev => ({
                          ...prev,
                          registrationDate: e.target.value
                        }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-semibold">URD Status</h4>
                      <p className="text-sm text-gray-600">
                        {urdSupport.status === 'active' 
                          ? 'Your URD registration is active and valid'
                          : 'URD verification pending'
                        }
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline"
                        onClick={() => alert('Contact your local commercial tax office for URD registration')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Get URD Info
                      </Button>
                      <Button 
                        onClick={handleURDVerification}
                        disabled={urdSupport.status === 'active'}
                      >
                        <Shield className="h-4 w-4 mr-2" />
                        Verify URD
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-6 w-6 text-purple-600" />
                    Document Upload Center
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {[
                      { name: 'Aadhaar Card', required: true, status: 'uploaded' },
                      { name: 'PAN Card', required: true, status: 'uploaded' },
                      { name: 'GST Certificate', required: false, status: 'pending' },
                      { name: 'Udyam Aadhaar Certificate', required: false, status: 'pending' },
                      { name: 'URD Registration', required: false, status: 'pending' },
                      { name: 'Bank Statement', required: true, status: 'uploaded' },
                      { name: 'Business Registration', required: true, status: 'uploaded' },
                      { name: 'Address Proof', required: true, status: 'pending' }
                    ].map((doc, index) => (
                      <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-gray-500" />
                          <div>
                            <h3 className="font-semibold">{doc.name}</h3>
                            <p className="text-sm text-gray-600">
                              {doc.required ? 'Required document' : 'Optional document'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={doc.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}>
                            {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload
                          </Button>
                          {doc.status === 'uploaded' && (
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Support Information */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-800 mb-2">KYC Compliance Support</h3>
                  <p className="text-blue-700 text-sm mb-3">
                    Need help with KYC compliance? Our team is here to assist you with:
                  </p>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• Udyam Aadhaar registration and verification</li>
                    <li>• URD certificate application and renewal</li>
                    <li>• Document upload and verification process</li>
                    <li>• Compliance requirements for different business types</li>
                    <li>• Government scheme applications</li>
                  </ul>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">
                      Contact Support
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Help Center
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
