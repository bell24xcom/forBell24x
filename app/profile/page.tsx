'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    company: 'Example Company',
    phone: '+91-9876543210',
    location: 'Mumbai, India',
    role: 'Buyer'
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'company', label: 'Company', icon: '🏢' },
    { id: 'settings', label: 'Settings', icon: '⚙️' },
    { id: 'billing', label: 'Billing', icon: '💳' }
  ];

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Profile updated:', profileData);
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Profile</h1>
            <p className="text-lg text-gray-600">
              Manage your account settings and preferences
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-lg shadow mb-8">
                <div className="border-b border-gray-200">
                  <nav className="-mb-px flex space-x-8 px-6">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={'py-4 px-1 border-b-2 font-medium text-sm ' + (activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300')}
                      >
                        <span className="mr-2">{tab.icon}</span>
                        {tab.label}
                      </button>
                    ))}
                  </nav>
                </div>

                <div className="p-6">
                  {activeTab === 'profile' && (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                            Full Name
                          </label>
                          <input
                            type="text"
                            id="name"
                            name="name"
                            value={profileData.name}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                            Email
                          </label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            value={profileData.email}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                            Phone
                          </label>
                          <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={profileData.phone}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Location
                          </label>
                          <input
                            type="text"
                            id="location"
                            name="location"
                            value={profileData.location}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Update Profile
                        </button>
                      </div>
                    </form>
                  )}

                  {activeTab === 'company' && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">🏢</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Company Settings</h3>
                      <p className="text-gray-600">Company management features coming soon</p>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">⚙️</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Account Settings</h3>
                      <p className="text-gray-600">Account settings features coming soon</p>
                    </div>
                  )}

                  {activeTab === 'billing' && (
                    <div className="text-center py-12">
                      <div className="text-gray-400 text-6xl mb-4">💳</div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">Billing & Payments</h3>
                      <p className="text-gray-600">Billing features coming soon</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}