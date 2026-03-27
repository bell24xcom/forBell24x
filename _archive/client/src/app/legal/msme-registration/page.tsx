'use client';
import { Slot } from '@radix-ui/react-slot';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  FileText, 
  Shield, 
  CheckCircle, 
  AlertCircle,
  Download,
  Upload,
  Info,
  Users,
  Home,
  Factory,
  Briefcase
} from 'lucide-react';
import Header from '@/components/Header';

export default function MSMERegistrationPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="MSME Registration Guide" />
      <main className="max-w-6xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">MSME Registration Guide</h1>
            <p className="text-xl text-gray-600">
              Complete guide for MSME registration with Udyam Aadhaar & URD support
            </p>
          </div>

          {/* Registration Types Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-600" />
                MSME Registration Types
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center border rounded-lg p-6">
                  <Factory className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Udyam Aadhaar</h3>
                  <p className="text-gray-600 mb-4">Mandatory for all MSMEs in India</p>
                  <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                </div>
                <div className="text-center border rounded-lg p-6">
                  <Briefcase className="h-12 w-12 text-orange-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">URD Registration</h3>
                  <p className="text-gray-600 mb-4">For micro/mini sectors</p>
                  <Badge className="bg-orange-100 text-orange-800">Alternative</Badge>
                </div>
                <div className="text-center border rounded-lg p-6">
                  <Home className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-semibold text-lg mb-2">Home Service</h3>
                  <p className="text-gray-600 mb-4">For home-based businesses</p>
                  <Badge className="bg-purple-100 text-purple-800">Special</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Registration Tabs */}
          <Tabs defaultValue="udyam" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="udyam">Udyam Aadhaar</TabsTrigger>
              <TabsTrigger value="urd">URD Registration</TabsTrigger>
              <TabsTrigger value="home-service">Home Service</TabsTrigger>
            </TabsList>

            {/* Udyam Aadhaar Tab */}
            <TabsContent value="udyam" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-6 w-6 text-green-600" />
                    Udyam Aadhaar Registration (Mandatory)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-green-800">Why Udyam Aadhaar is Mandatory?</h3>
                        <p className="text-green-700 mt-1">
                          Udyam Aadhaar is the official MSME registration certificate issued by the Government of India. 
                          It's mandatory for all MSMEs to avail government benefits, subsidies, and participate in tenders.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Eligibility Criteria</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Investment in plant & machinery/equipment</li>
                        <li>• Micro: Up to ₹1 crore</li>
                        <li>• Small: ₹1 crore to ₹10 crore</li>
                        <li>• Medium: ₹10 crore to ₹50 crore</li>
                        <li>• Annual turnover limits apply</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Required Documents</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Aadhaar Card (Owner/Promoter)</li>
                        <li>• PAN Card (Business)</li>
                        <li>• Business Address Proof</li>
                        <li>• Bank Account Details</li>
                        <li>• Investment Declaration</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Registration Process</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">1</span>
                        </div>
                        <span className="text-gray-600">Visit udyamregistration.gov.in</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">2</span>
                        </div>
                        <span className="text-gray-600">Enter Aadhaar number and verify OTP</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">3</span>
                        </div>
                        <span className="text-gray-600">Fill business details and investment information</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <span className="text-green-600 font-bold text-sm">4</span>
                        </div>
                        <span className="text-gray-600">Submit and receive Udyam Aadhaar number</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Download Application Form
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Upload className="h-4 w-4" />
                      Upload Documents
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* URD Registration Tab */}
            <TabsContent value="urd" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-6 w-6 text-orange-600" />
                    URD (Unregistered Registered Dealer) Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-orange-800">What is URD Registration?</h3>
                        <p className="text-orange-700 mt-1">
                          URD is NOT a certificate - it's a simple registration for businesses that don't require GST registration. 
                          It provides basic business recognition without formal certificates. Suitable for micro and mini sectors with limited turnover.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">URD Eligibility</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Annual turnover below ₹20 lakh</li>
                        <li>• Not engaged in interstate supply</li>
                        <li>• Local business operations only</li>
                        <li>• No manufacturing activities</li>
                        <li>• Service providers with limited scope</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">URD Benefits</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Basic business recognition (No certificate required)</li>
                        <li>• Local market access</li>
                        <li>• Simple compliance requirements</li>
                        <li>• Lower regulatory burden</li>
                        <li>• Entry-level business status</li>
                        <li>• No formal documentation needed</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">URD Registration Process</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">1</span>
                        </div>
                        <span className="text-gray-600">Apply to local commercial tax office</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">2</span>
                        </div>
                        <span className="text-gray-600">Submit basic business documents</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">3</span>
                        </div>
                        <span className="text-gray-600">Pay nominal registration fee</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                          <span className="text-orange-600 font-bold text-sm">4</span>
                        </div>
                        <span className="text-gray-600">Receive URD registration confirmation</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      URD Registration Form
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Info className="h-4 w-4" />
                      URD Guidelines
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Home Service Industry Tab */}
            <TabsContent value="home-service" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="h-6 w-6 text-purple-600" />
                    Home Service Industry Registration
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Home className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-purple-800">Home Service Industry</h3>
                        <p className="text-purple-700 mt-1">
                          Special registration category for home-based service providers, 
                          freelancers, and small-scale home businesses.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Home Service Categories</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Home-based manufacturing</li>
                        <li>• Freelance services</li>
                        <li>• Online tutoring/consulting</li>
                        <li>• Handicrafts and arts</li>
                        <li>• Home delivery services</li>
                        <li>• Digital services</li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-3">Special Benefits</h3>
                      <ul className="space-y-2 text-gray-600">
                        <li>• Flexible working hours</li>
                        <li>• Low overhead costs</li>
                        <li>• Digital platform access</li>
                        <li>• Skill development programs</li>
                        <li>• Marketing support</li>
                        <li>• Technology assistance</li>
                      </ul>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-3">Registration Requirements</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="font-medium mb-2">Basic Documents</h4>
                        <ul className="space-y-1 text-gray-600 text-sm">
                          <li>• Aadhaar Card</li>
                          <li>• PAN Card</li>
                          <li>• Home address proof</li>
                          <li>• Bank account details</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium mb-2">Business Documents</h4>
                        <ul className="space-y-1 text-gray-600 text-sm">
                          <li>• Business description</li>
                          <li>• Service portfolio</li>
                          <li>• Skills certificates</li>
                          <li>• Portfolio samples</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Home Service Form
                    </Button>
                    <Button variant="outline" className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Join Community
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Comparison Table */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Type Comparison</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Feature</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Udyam Aadhaar</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">URD Registration</th>
                      <th className="border border-gray-300 px-4 py-2 text-center">Home Service</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Mandatory</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <CheckCircle className="h-4 w-4 text-green-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <AlertCircle className="h-4 w-4 text-orange-600 mx-auto" />
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center">
                        <AlertCircle className="h-4 w-4 text-purple-600 mx-auto" />
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Government Benefits</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Full Access</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Limited</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Special Programs</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Tender Participation</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Yes</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">No</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Limited</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Compliance</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Standard</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Minimal</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Flexible</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2 font-medium">Registration Fee</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Free</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Nominal</td>
                      <td className="border border-gray-300 px-4 py-2 text-center">Free</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Support Information */}
          <Card>
            <CardHeader>
              <CardTitle>Registration Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Udyam Aadhaar Support</h3>
                  <p className="text-gray-600 mb-2">For official MSME registration</p>
                  <p className="text-sm text-blue-600">support@udyam.gov.in</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">URD Assistance</h3>
                  <p className="text-gray-600 mb-2">For local business registration</p>
                  <p className="text-sm text-orange-600">urd@bell24h.com</p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-lg mb-2">Home Service Support</h3>
                  <p className="text-gray-600 mb-2">For home-based businesses</p>
                  <p className="text-sm text-purple-600">homeservice@bell24h.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
