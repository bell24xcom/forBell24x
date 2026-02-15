<<<<<<< HEAD
import { Metadata } from 'next';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  MessageSquare,
  Send,
  Users,
  Headphones
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Contact Us - Bell24h | Get in Touch with Our Team',
  description: 'Contact Bell24h support team for queries, partnerships, or assistance. Multiple contact options available including phone, email, and live chat.',
  keywords: 'contact bell24h, support, customer service, B2B marketplace support, MSME help',
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50">
      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-indigo-100 max-w-3xl mx-auto">
            Get in touch with our team. We're here to help you succeed with your B2B procurement needs.
          </p>
        </div>
      </section>

      {/* Contact Information */}
      <section className="py-16 -mt-10">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            
            {/* Phone Support */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
                  <Phone className="h-8 w-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Phone Support</h3>
                <p className="text-gray-600 mb-4">
                  Speak directly with our support team
                </p>
                <div className="text-lg font-semibold text-indigo-600">
                  +91 9004962871
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Mon-Fri: 9 AM - 6 PM IST
                </div>
              </CardContent>
            </Card>

            {/* Email Support */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <Mail className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Email Support</h3>
                <p className="text-gray-600 mb-4">
                  Send us your queries and we'll respond quickly
                </p>
                <div className="text-lg font-semibold text-emerald-600">
                  digitex.studio@gmail.com
                </div>
                <div className="text-sm text-gray-500 mt-2">
                  Response within 2 hours
                </div>
              </CardContent>
            </Card>

            {/* Live Chat */}
            <Card className="border-0 shadow-lg text-center">
              <CardContent className="p-8">
                <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Live Chat</h3>
                <p className="text-gray-600 mb-4">
                  Chat with our support team instantly
                </p>
                <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                  Start Chat
                </Button>
                <div className="text-sm text-gray-500 mt-2">
                  Available 24/7
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Send us a Message
              </h2>
              <p className="text-lg text-gray-600">
                Have a question or need assistance? Fill out the form below and we'll get back to you.
            </p>
          </div>

            <Card className="border-0 shadow-lg">
              <CardContent className="p-8">
                <form className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name *
                      </label>
                      <Input
                        type="text" 
                        placeholder="Enter your first name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name *
                      </label>
                      <Input 
                        type="text" 
                        placeholder="Enter your last name"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address *
                      </label>
                      <Input
                        type="email" 
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number *
                      </label>
                      <Input 
                        type="tel" 
                        placeholder="Enter your phone number"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Company Name
                    </label>
                    <Input
                      type="text" 
                      placeholder="Enter your company name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Subject *
                    </label>
                    <Input
                      type="text" 
                      placeholder="What's this about?"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Message *
                    </label>
                    <Textarea
                      placeholder="Tell us how we can help you..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Send className="h-5 w-5 mr-2" />
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Office Information */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Our Office
          </h2>
          <div className="grid md:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* Office Address */}
            <Card className="border-0 shadow-lg">
                <CardHeader>
                <CardTitle className="flex items-center text-indigo-600">
                  <MapPin className="h-6 w-6 mr-2" />
                  Office Address
                  </CardTitle>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                    <div>
                    <h3 className="font-semibold text-gray-900">Bell24h Technologies Pvt Ltd</h3>
                    <p className="text-gray-600">
                      Plot No. 123, Sector 17<br />
                      Gurgaon, Haryana 122001<br />
                      India
                    </p>
                  </div>
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-2">Business Hours</h4>
                    <div className="space-y-1 text-gray-600">
                      <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                      <div>Saturday: 10:00 AM - 4:00 PM</div>
                      <div>Sunday: Closed</div>
                    </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

            {/* Contact Details */}
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center text-emerald-600">
                  <Users className="h-6 w-6 mr-2" />
                  Contact Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">General Inquiries</h4>
                    <p className="text-gray-600">digitex.studio@gmail.com</p>
                    <p className="text-gray-600">+91 9004962871</p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-2">Sales & Partnerships</h4>
                    <p className="text-gray-600">digitex.studio@gmail.com</p>
                    <p className="text-gray-600">+91 9004962871</p>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-gray-900 mb-2">Technical Support</h4>
                    <p className="text-gray-600">digitex.studio@gmail.com</p>
                    <p className="text-gray-600">+91 9004962871</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Multiple Ways to Reach Us
          </h2>
          <div className="grid md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            
            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Headphones className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="font-semibold mb-2">Customer Support</h3>
                <p className="text-sm text-gray-600">
                  General queries and account assistance
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="font-semibold mb-2">Sales Team</h3>
                <p className="text-sm text-gray-600">
                  New business and partnership inquiries
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="font-semibold mb-2">Live Chat</h3>
                <p className="text-sm text-gray-600">
                  Instant support via chat
                </p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg text-center hover:shadow-xl transition-shadow">
              <CardContent className="p-6">
                <div className="mx-auto w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-yellow-600" />
                </div>
                <h3 className="font-semibold mb-2">Emergency Support</h3>
                <p className="text-sm text-gray-600">
                  24/7 critical issue resolution
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-emerald-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-indigo-100 mb-8 max-w-2xl mx-auto">
            Join thousands of MSMEs who trust Bell24h for their B2B procurement needs.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/auth/landing" 
              className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Start Free Trial
            </a>
            <a 
              href="/pricing" 
              className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-indigo-600 transition-colors"
            >
              View Pricing
            </a>
        </div>
      </div>
      </section>
=======
import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-white">
      <h1 className="text-5xl font-black mb-8 text-cyan-400">Contact</h1>
      <p className="mb-4 text-xl">Have questions? Email <a href="mailto:support@bell24h.com" className="text-cyan-400 underline">support@bell24h.com</a>.</p>
      <div className="bg-gray-900/70 p-8 rounded-xl">
        <h2 className="text-lg mb-4 font-bold">Contact Form (Coming Soon)</h2>
        <input className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-400" placeholder="Your email" disabled />
        <textarea className="w-full mb-4 px-4 py-2 rounded-lg bg-gray-800 text-white border border-cyan-400" placeholder="Your message" rows={4} disabled></textarea>
        <button className="w-full px-6 py-3 rounded-lg bg-cyan-500 font-bold text-white opacity-50 cursor-not-allowed" disabled>Send (Soon)</button>
      </div>
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
    </div>
  );
}
