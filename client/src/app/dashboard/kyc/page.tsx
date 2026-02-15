'use client';
import { useState } from 'react';
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
  X
} from 'lucide-react';
import Header from '@/components/Header';

interface DocumentUpload {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'uploaded' | 'verified' | 'rejected';
  file?: File;
  preview?: string;
}

interface KYCData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    aadhaar: string;
    pan: string;
    address: string;
  };
  businessInfo: {
    businessName: string;
    businessType: string;
    gstNumber: string;
    udyamAadhaar: string;
    businessAddress: string;
    bankAccount: string;
    ifscCode: string;
  };
  documents: DocumentUpload[];
}

export default function KYCPage() {
  const [kycData, setKycData] = useState<KYCData>({
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      aadhaar: '',
      pan: '',
      address: ''
    },
    businessInfo: {
      businessName: '',
      businessType: '',
      gstNumber: '',
      udyamAadhaar: '',
      businessAddress: '',
      bankAccount: '',
      ifscCode: ''
    },
    documents: [
      { id: '1', name: 'Aadhaar Card', type: 'identity', status: 'pending' },
      { id: '2', name: 'PAN Card', type: 'identity', status: 'pending' },
      { id: '3', name: 'GST Certificate', type: 'business', status: 'pending' },
      { id: '4', name: 'Udyam Aadhaar Certificate', type: 'business', status: 'pending' },
      { id: '5', name: 'Bank Statement', type: 'financial', status: 'pending' },
      { id: '6', name: 'Business Registration', type: 'business', status: 'pending' }
    ]
  });

  const [activeTab, setActiveTab] = useState('personal');
  const [uploading, setUploading] = useState<string | null>(null);

  const handleFileUpload = (documentId: string, file: File) => {
    setUploading(documentId);
    
    // Simulate upload process
    setTimeout(() => {
      setKycData(prev => ({
        ...prev,
        documents: prev.documents.map(doc => 
          doc.id === documentId 
            ? { 
                ...doc, 
                file, 
                status: 'uploaded' as const,
                preview: URL.createObjectURL(file)
              }
            : doc
        )
      }));
      setUploading(null);
    }, 2000);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'uploaded':
        return <Eye className="h-4 w-4 text-blue-600" />;
      case 'rejected':
        return <X className="h-4 w-4 text-red-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'uploaded':
        return 'bg-blue-100 text-blue-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'verified':
        return 'Verified';
      case 'uploaded':
        return 'Under Review';
      case 'rejected':
        return 'Rejected';
      default:
        return 'Pending';
    }
  };

  const calculateProgress = () => {
    const total = kycData.documents.length;
    const completed = kycData.documents.filter(doc => doc.status === 'verified').length;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="KYC Verification" />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {/* KYC Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-blue-600" />
                KYC Verification Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Progress</span>
                  <span className="text-sm text-gray-600">{calculateProgress()}% Complete</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${calculateProgress()}%` }}
                  ></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {kycData.documents.filter(doc => doc.status === 'verified').length}
                    </div>
                    <div className="text-sm text-gray-600">Verified</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {kycData.documents.filter(doc => doc.status === 'uploaded').length}
                    </div>
                    <div className="text-sm text-gray-600">Under Review</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {kycData.documents.filter(doc => doc.status === 'rejected').length}
                    </div>
                    <div className="text-sm text-gray-600">Rejected</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">
                      {kycData.documents.filter(doc => doc.status === 'pending').length}
                    </div>
                    <div className="text-sm text-gray-600">Pending</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* KYC Form Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal Info</TabsTrigger>
              <TabsTrigger value="business">Business Info</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
            </TabsList>

            {/* Personal Information Tab */}
            <TabsContent value="personal" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-6 w-6 text-blue-600" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={kycData.personalInfo.fullName}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, fullName: e.target.value }
                        }))}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={kycData.personalInfo.email}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, email: e.target.value }
                        }))}
                        placeholder="Enter your email"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={kycData.personalInfo.phone}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, phone: e.target.value }
                        }))}
                        placeholder="Enter your phone number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="aadhaar">Aadhaar Number</Label>
                      <Input
                        id="aadhaar"
                        value={kycData.personalInfo.aadhaar}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, aadhaar: e.target.value }
                        }))}
                        placeholder="Enter Aadhaar number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="pan">PAN Number</Label>
                      <Input
                        id="pan"
                        value={kycData.personalInfo.pan}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, pan: e.target.value }
                        }))}
                        placeholder="Enter PAN number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={kycData.personalInfo.address}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          personalInfo: { ...prev.personalInfo, address: e.target.value }
                        }))}
                        placeholder="Enter your address"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Business Information Tab */}
            <TabsContent value="business" className="space-y-4">
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
                      <Label htmlFor="businessName">Business Name</Label>
                      <Input
                        id="businessName"
                        value={kycData.businessInfo.businessName}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, businessName: e.target.value }
                        }))}
                        placeholder="Enter business name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessType">Business Type</Label>
                      <Input
                        id="businessType"
                        value={kycData.businessInfo.businessType}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, businessType: e.target.value }
                        }))}
                        placeholder="e.g., Manufacturing, Service, Trading"
                      />
                    </div>
                    <div>
                      <Label htmlFor="gstNumber">GST Number</Label>
                      <Input
                        id="gstNumber"
                        value={kycData.businessInfo.gstNumber}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, gstNumber: e.target.value }
                        }))}
                        placeholder="Enter GST number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="udyamAadhaar">Udyam Aadhaar Number</Label>
                      <Input
                        id="udyamAadhaar"
                        value={kycData.businessInfo.udyamAadhaar}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, udyamAadhaar: e.target.value }
                        }))}
                        placeholder="Enter Udyam Aadhaar number"
                      />
                    </div>
                    <div>
                      <Label htmlFor="businessAddress">Business Address</Label>
                      <Input
                        id="businessAddress"
                        value={kycData.businessInfo.businessAddress}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, businessAddress: e.target.value }
                        }))}
                        placeholder="Enter business address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="bankAccount">Bank Account Number</Label>
                      <Input
                        id="bankAccount"
                        value={kycData.businessInfo.bankAccount}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, bankAccount: e.target.value }
                        }))}
                        placeholder="Enter bank account number"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="ifscCode">IFSC Code</Label>
                      <Input
                        id="ifscCode"
                        value={kycData.businessInfo.ifscCode}
                        onChange={(e) => setKycData(prev => ({
                          ...prev,
                          businessInfo: { ...prev.businessInfo, ifscCode: e.target.value }
                        }))}
                        placeholder="Enter IFSC code"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Documents Upload Tab */}
            <TabsContent value="documents" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-6 w-6 text-purple-600" />
                    Document Upload
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {kycData.documents.map((document) => (
                      <div key={document.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getStatusIcon(document.status)}
                            <div>
                              <h3 className="font-semibold">{document.name}</h3>
                              <p className="text-sm text-gray-600">
                                {document.type === 'identity' ? 'Identity Verification' :
                                 document.type === 'business' ? 'Business Verification' :
                                 'Financial Verification'}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(document.status)}>
                            {getStatusText(document.status)}
                          </Badge>
                        </div>
                        
                        {document.preview && (
                          <div className="mb-4">
                            <img 
                              src={document.preview} 
                              alt={document.name}
                              className="w-32 h-20 object-cover rounded border"
                            />
                          </div>
                        )}
                        
                        <div className="flex gap-2">
                          <label className="flex items-center gap-2 px-4 py-2 border rounded-lg cursor-pointer hover:bg-gray-50">
                            <Upload className="h-4 w-4" />
                            {uploading === document.id ? 'Uploading...' : 'Upload Document'}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*,.pdf"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileUpload(document.id, file);
                              }}
                              disabled={uploading === document.id}
                            />
                          </label>
                          {document.preview && (
                            <Button variant="outline" size="sm">
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

            {/* Verification Status Tab */}
            <TabsContent value="verification" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Verification Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <User className="h-6 w-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">Personal Information</h3>
                            <p className="text-sm text-gray-600">Identity verification</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Building2 className="h-6 w-6 text-green-600" />
                          <div>
                            <h3 className="font-semibold">Business Information</h3>
                            <p className="text-sm text-gray-600">Business verification</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <CreditCard className="h-6 w-6 text-purple-600" />
                          <div>
                            <h3 className="font-semibold">Bank Account</h3>
                            <p className="text-sm text-gray-600">Financial verification</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Shield className="h-6 w-6 text-indigo-600" />
                          <div>
                            <h3 className="font-semibold">MSME Verification</h3>
                            <p className="text-sm text-gray-600">Udyam Aadhaar verification</p>
                          </div>
                        </div>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-blue-800">Verification Process</h3>
                          <p className="text-blue-700 mt-1">
                            Once you submit all required documents, our verification team will review them within 24-48 hours. 
                            You'll receive email notifications for each verification step.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <Button className="w-full" size="lg">
                      Submit for Verification
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
