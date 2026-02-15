'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, MapPin, Clock, Shield } from 'lucide-react';
import Header from '@/components/Header';

export default function ShippingPolicyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header title="Shipping Policy" />
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Shipping Policy</h1>
            <p className="text-xl text-gray-600">
              Comprehensive shipping and delivery information for Bell24h orders
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-6 w-6 text-blue-600" />
                Delivery Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Standard Delivery</h3>
                  <p className="text-2xl font-bold text-green-600">5-7 Days</p>
                  <p className="text-gray-600">Within major cities</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Express Delivery</h3>
                  <p className="text-2xl font-bold text-blue-600">2-3 Days</p>
                  <p className="text-gray-600">Premium service</p>
                </div>
                <div className="border rounded-lg p-4 text-center">
                  <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h3 className="font-semibold text-lg mb-2">Same Day</h3>
                  <p className="text-2xl font-bold text-purple-600">24 Hours</p>
                  <p className="text-gray-600">Selected locations</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-red-600" />
                Shipping Areas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Tier 1 Cities</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Mumbai, Delhi, Bangalore, Chennai</li>
                    <li>• Kolkata, Hyderabad, Pune, Ahmedabad</li>
                    <li>• Jaipur, Surat, Lucknow, Kanpur</li>
                    <li>• <strong>Delivery:</strong> 2-3 days standard</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Tier 2 & 3 Cities</h3>
                  <ul className="space-y-2 text-gray-600">
                    <li>• All state capitals and major districts</li>
                    <li>• Industrial areas and manufacturing hubs</li>
                    <li>• Export zones and SEZs</li>
                    <li>• <strong>Delivery:</strong> 5-7 days standard</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-green-600" />
                Shipping Charges
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="border border-gray-300 px-4 py-2 text-left">Weight Range</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tier 1 Cities</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tier 2 Cities</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Tier 3 Cities</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">0-10 kg</td>
                      <td className="border border-gray-300 px-4 py-2">₹150</td>
                      <td className="border border-gray-300 px-4 py-2">₹250</td>
                      <td className="border border-gray-300 px-4 py-2">₹350</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">10-50 kg</td>
                      <td className="border border-gray-300 px-4 py-2">₹300</td>
                      <td className="border border-gray-300 px-4 py-2">₹500</td>
                      <td className="border border-gray-300 px-4 py-2">₹700</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">50+ kg</td>
                      <td className="border border-gray-300 px-4 py-2">₹500</td>
                      <td className="border border-gray-300 px-4 py-2">₹800</td>
                      <td className="border border-gray-300 px-4 py-2">₹1200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-gray-600 mt-4">
                <strong>Free Shipping:</strong> Orders above ₹50,000 qualify for free shipping across India.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Shipping Terms & Conditions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-lg mb-2">Delivery Process</h3>
                <ol className="list-decimal list-inside space-y-2 text-gray-600">
                  <li>Order confirmation and payment verification</li>
                  <li>Inventory check and packaging (24-48 hours)</li>
                  <li>Pickup by logistics partner</li>
                  <li>Transit with real-time tracking</li>
                  <li>Delivery confirmation and receipt</li>
                </ol>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg mb-2">Tracking Information</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Real-time tracking via SMS and email</li>
                  <li>AWB number provided for all shipments</li>
                  <li>Delivery updates at each checkpoint</li>
                  <li>Estimated delivery time provided</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Special Handling</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Fragile items: Special packaging and handling</li>
                  <li>Heavy machinery: Crane and lifting equipment</li>
                  <li>Hazardous materials: Certified transporters only</li>
                  <li>White glove delivery available on request</li>
                </ul>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-2">Delivery Exceptions</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-600">
                  <li>Weather conditions and natural disasters</li>
                  <li>Government restrictions and lockdowns</li>
                  <li>Remote locations may have extended timelines</li>
                  <li>Custom clearance for international orders</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                For shipping inquiries, tracking updates, or delivery issues, please contact:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold">Customer Support</h4>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                  <p>Email: support@bell24h.com</p>
                </div>
                <div>
                  <h4 className="font-semibold">Logistics Support</h4>
                  <p>Phone: +91-XXX-XXXX-XXX</p>
                  <p>Email: logistics@bell24h.com</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
