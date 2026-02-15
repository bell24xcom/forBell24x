'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Building, Bell, Shield, Cookie, Globe, Settings as SettingsIcon, MessageSquare, Smartphone, Key, Info, AlertCircle } from 'lucide-react';
import { CookiePreferencesManager } from '@/components/gdpr/CookieConsentBanner';
import DataDeletionManager from '@/components/gdpr/DataDeletionManager';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const { data: session, status } = () => ({ data: { user: { id: "user", email: "user@company.com", name: "Business User" } }, status: "authenticated" });
  const router = useRouter();

  // Form states
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    jobTitle: '',
    department: '',
    profileImage: '',
  });

  const [companyData, setCompanyData] = useState({
    companyName: '',
    industry: '',
    companySize: '',
    website: '',
    address: '',
    gstin: '',
    pan: '',
  });

  const [notificationSettings, setNotificationSettings] = useState({
    email: true,
    sms: false,
    push: true,
    whatsapp: true,
    rfqUpdates: true,
    marketingEmails: false,
    priceAlerts: true,
    systemUpdates: true,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    sessionTimeout: '30',
    loginNotifications: true,
    passwordExpiry: '90',
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && session?.user) {
      setProfileData({
        name: session.user.name || '',
        email: session.user.email || '',
        phone: session.user.phone || '',
        jobTitle: session.user.jobTitle || '',
        department: session.user.department || '',
        profileImage: session.user.image || '',
      });

      setCompanyData({
        companyName: session.user.companyName || '',
        industry: session.user.industry || '',
        companySize: session.user.companySize || '',
        website: session.user.website || '',
        address: session.user.address || '',
        gstin: session.user.gstin || '',
        pan: session.user.pan || '',
      });
    }
  }, [mounted, session]);

  if (!mounted) return null;

  if (status === 'loading') {
    return (
      <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
        <div className='animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent'></div>
      </div>
    );
  }

  if (!session) {
    router.push('/login');
    return null;
  }

  const handleSave = async () => {
    setSaving(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotification({ type: 'success', message: 'Settings updated successfully!' });
    } catch (error) {
      setNotification({ type: 'error', message: 'Failed to update settings. Please try again.' });
    } finally {
      setSaving(false);
    }
  };

  const userRole = session.user?.role || 'user';

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'company', label: 'Company', icon: Building },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'privacy', label: 'Privacy & Cookies', icon: Cookie },
    { id: 'integrations', label: 'Integrations', icon: Globe },
    ...(userRole === 'admin' ? [{ id: 'admin', label: 'Admin', icon: SettingsIcon }] : []),
  ];

  return (
    <div className='min-h-screen bg-gray-50'>
      {/* Header */}
      <div className='bg-white border-b border-gray-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-2xl font-bold text-gray-900'>Settings</h1>
            <p className='text-sm text-gray-500'>Manage your account and preferences</p>
          </div>
          <button
            onClick={() => router.push('/dashboard')}
            className='text-sm text-blue-600 hover:text-blue-700 font-medium'
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className='max-w-7xl mx-auto px-6 py-8'>
        <div className='flex flex-col lg:flex-row gap-8'>
          {/* Sidebar */}
          <div className='lg:w-64 flex-shrink-0'>
            <div className='bg-white rounded-lg border border-gray-200 p-4'>
              <nav className='space-y-2'>
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <div className='flex items-center space-x-3'>
                      <tab.icon className='h-5 w-5' />
                      <span className='font-medium'>{tab.label}</span>
                    </div>
                    <span>▶️</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1'>
            <div className='bg-white rounded-lg border border-gray-200 shadow-sm'>
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Profile Information</h2>
                    <span className='text-sm text-gray-500'>Update your personal details</span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Full Name
                      </label>
                      <input
                        type='text'
                        value={profileData.name}
                        onChange={e => setProfileData({ ...profileData, name: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter your full name'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Email Address
                      </label>
                      <input
                        type='email'
                        value={profileData.email}
                        onChange={e => setProfileData({ ...profileData, email: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter your email'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Phone Number
                      </label>
                      <input
                        type='tel'
                        value={profileData.phone}
                        onChange={e => setProfileData({ ...profileData, phone: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='+91 9876543210'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Job Title
                      </label>
                      <input
                        type='text'
                        value={profileData.jobTitle}
                        onChange={e => setProfileData({ ...profileData, jobTitle: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='e.g., Procurement Manager'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Department
                      </label>
                      <select
                        value={profileData.department}
                        onChange={e =>
                          setProfileData({ ...profileData, department: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value=''>Select Department</option>
                        <option value='procurement'>Procurement</option>
                        <option value='operations'>Operations</option>
                        <option value='finance'>Finance</option>
                        <option value='supply_chain'>Supply Chain</option>
                        <option value='management'>Management</option>
                        <option value='other'>Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Company Tab */}
              {activeTab === 'company' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Company Information</h2>
                    <span className='text-sm text-gray-500'>Update your company details</span>
                  </div>

                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Company Name
                      </label>
                      <input
                        type='text'
                        value={companyData.companyName}
                        onChange={e =>
                          setCompanyData({ ...companyData, companyName: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter company name'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Industry
                      </label>
                      <select
                        value={companyData.industry}
                        onChange={e => setCompanyData({ ...companyData, industry: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value=''>Select Industry</option>
                        <option value='manufacturing'>Manufacturing</option>
                        <option value='technology'>Technology</option>
                        <option value='agriculture'>Agriculture</option>
                        <option value='automotive'>Automotive</option>
                        <option value='healthcare'>Healthcare</option>
                        <option value='construction'>Construction</option>
                        <option value='textile'>Textile</option>
                        <option value='food'>Food & Beverages</option>
                        <option value='other'>Other</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Company Size
                      </label>
                      <select
                        value={companyData.companySize}
                        onChange={e =>
                          setCompanyData({ ...companyData, companySize: e.target.value })
                        }
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      >
                        <option value=''>Select Size</option>
                        <option value='1-10'>1-10 employees</option>
                        <option value='11-50'>11-50 employees</option>
                        <option value='51-200'>51-200 employees</option>
                        <option value='201-500'>201-500 employees</option>
                        <option value='501-1000'>501-1000 employees</option>
                        <option value='1000+'>1000+ employees</option>
                      </select>
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Website
                      </label>
                      <input
                        type='url'
                        value={companyData.website}
                        onChange={e => setCompanyData({ ...companyData, website: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='https://yourcompany.com'
                      />
                    </div>

                    <div className='md:col-span-2'>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        Company Address
                      </label>
                      <textarea
                        value={companyData.address}
                        onChange={e => setCompanyData({ ...companyData, address: e.target.value })}
                        rows={3}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='Enter complete address'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>GSTIN</label>
                      <input
                        type='text'
                        value={companyData.gstin}
                        onChange={e => setCompanyData({ ...companyData, gstin: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='GST Identification Number'
                      />
                    </div>

                    <div>
                      <label className='block text-sm font-medium text-gray-700 mb-2'>
                        PAN Number
                      </label>
                      <input
                        type='text'
                        value={companyData.pan}
                        onChange={e => setCompanyData({ ...companyData, pan: e.target.value })}
                        className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                        placeholder='PAN Number'
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Notification Preferences
                    </h2>
                    <span className='text-sm text-gray-500'>Control how you receive updates</span>
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-md font-medium text-gray-900 mb-4'>
                        Communication Channels
                      </h3>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <span>📧</span>
                            <div>
                              <p className='text-sm font-medium text-gray-700'>
                                Email Notifications
                              </p>
                              <p className='text-xs text-gray-500'>Receive updates via email</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setNotificationSettings({
                                ...notificationSettings,
                                email: !notificationSettings.email,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings.email ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                notificationSettings.email ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <MessageSquare className='h-5 w-5 text-gray-400' />
                            <div>
                              <p className='text-sm font-medium text-gray-700'>SMS Notifications</p>
                              <p className='text-xs text-gray-500'>Receive updates via SMS</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setNotificationSettings({
                                ...notificationSettings,
                                sms: !notificationSettings.sms,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings.sms ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                notificationSettings.sms ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div className='flex items-center space-x-3'>
                            <Smartphone className='h-5 w-5 text-gray-400' />
                            <div>
                              <p className='text-sm font-medium text-gray-700'>
                                Push Notifications
                              </p>
                              <p className='text-xs text-gray-500'>Receive browser notifications</p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setNotificationSettings({
                                ...notificationSettings,
                                push: !notificationSettings.push,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings.push ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                notificationSettings.push ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='text-md font-medium text-gray-900 mb-4'>
                        Content Preferences
                      </h3>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>RFQ Updates</p>
                            <p className='text-xs text-gray-500'>Updates on your RFQ submissions</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotificationSettings({
                                ...notificationSettings,
                                rfqUpdates: !notificationSettings.rfqUpdates,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings.rfqUpdates ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                notificationSettings.rfqUpdates ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className='flex items-center justify-between'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>Price Alerts</p>
                            <p className='text-xs text-gray-500'>Market price changes and alerts</p>
                          </div>
                          <button
                            onClick={() =>
                              setNotificationSettings({
                                ...notificationSettings,
                                priceAlerts: !notificationSettings.priceAlerts,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              notificationSettings.priceAlerts ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                notificationSettings.priceAlerts ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Security Settings</h2>
                    <span className='text-sm text-gray-500'>Protect your account</span>
                  </div>

                  <div className='space-y-6'>
                    <div>
                      <h3 className='text-md font-medium text-gray-900 mb-4'>Authentication</h3>
                      <div className='space-y-4'>
                        <div className='flex items-center justify-between p-4 bg-gray-50 rounded-lg'>
                          <div className='flex items-center space-x-3'>
                            <Key className='h-5 w-5 text-gray-400' />
                            <div>
                              <p className='text-sm font-medium text-gray-700'>
                                Two-Factor Authentication
                              </p>
                              <p className='text-xs text-gray-500'>
                                Add an extra layer of security
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              setSecuritySettings({
                                ...securitySettings,
                                twoFactorAuth: !securitySettings.twoFactorAuth,
                              })
                            }
                            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                              securitySettings.twoFactorAuth ? 'bg-blue-600' : 'bg-gray-200'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
                                securitySettings.twoFactorAuth ? 'translate-x-5' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>

                        <div className='p-4 bg-gray-50 rounded-lg'>
                          <div className='flex items-center space-x-3 mb-3'>
                            <span>🕐</span>
                            <p className='text-sm font-medium text-gray-700'>Session Timeout</p>
                          </div>
                          <select
                            value={securitySettings.sessionTimeout}
                            onChange={e =>
                              setSecuritySettings({
                                ...securitySettings,
                                sessionTimeout: e.target.value,
                              })
                            }
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          >
                            <option value='15'>15 minutes</option>
                            <option value='30'>30 minutes</option>
                            <option value='60'>1 hour</option>
                            <option value='240'>4 hours</option>
                            <option value='480'>8 hours</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className='text-md font-medium text-gray-900 mb-4'>Change Password</h3>
                      <div className='space-y-4'>
                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Current Password
                          </label>
                          <div className='relative'>
                            <input
                              type={showPassword ? 'text' : 'password'}
                              className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10'
                              placeholder='Enter current password'
                            />
                            <button
                              onClick={() => setShowPassword(!showPassword)}
                              className='absolute inset-y-0 right-0 pr-3 flex items-center'
                            >
                              {showPassword ? (
                                <span>👁️</span>
                              ) : (
                                <span>👁️</span>
                              )}
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            New Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='Enter new password'
                          />
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-gray-700 mb-2'>
                            Confirm Password
                          </label>
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className='w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='Confirm new password'
                          />
                        </div>

                        <button className='bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                          Update Password
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy & Cookies Tab */}
              {activeTab === 'privacy' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>
                      Privacy & Cookie Preferences
                    </h2>
                    <span className='text-sm text-gray-500'>
                      Manage your privacy settings and cookie preferences
                    </span>
                  </div>

                  <div className='space-y-6'>
                    <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                      <div className='flex items-center space-x-2 mb-2'>
                        <Info className='h-5 w-5 text-blue-600' />
                        <span className='font-medium text-blue-900'>Your Privacy Rights</span>
                      </div>
                      <p className='text-blue-800 text-sm'>
                        Bell24H is committed to protecting your privacy. You have full control over
                        your data and cookie preferences. Changes to these settings will be applied
                        immediately and affect how we collect and use your information.
                      </p>
                    </div>

                    <CookiePreferencesManager />

                    <div className='bg-white border border-gray-200 rounded-lg p-6'>
                      <div className='flex items-center space-x-3 mb-4'>
                        <span>🛡️</span>
                        <h3 className='text-md font-medium text-gray-900'>Data Protection</h3>
                      </div>

                      <div className='space-y-4'>
                        <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>Data Export</p>
                            <p className='text-xs text-gray-500'>Download all your personal data</p>
                          </div>
                          <button className='text-sm bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors'>
                            Export Data
                          </button>
                        </div>

                        <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg'>
                          <div>
                            <p className='text-sm font-medium text-gray-700'>Privacy Policy</p>
                            <p className='text-xs text-gray-500'>
                              View our complete privacy policy
                            </p>
                          </div>
                          <a
                            href='/privacy-policy'
                            className='text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'
                          >
                            View Policy
                          </a>
                        </div>
                      </div>
                    </div>

                    <DataDeletionManager className='mt-6' />
                  </div>
                </div>
              )}

              {/* Integrations Tab */}
              {activeTab === 'integrations' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Integrations</h2>
                    <span className='text-sm text-gray-500'>Connect with third-party services</span>
                  </div>

                  <div className='space-y-4'>
                    <div className='p-4 border border-gray-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center'>
                            <span>🌍</span>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>Google Calendar</p>
                            <p className='text-xs text-gray-500'>
                              Sync RFQ deadlines with calendar
                            </p>
                          </div>
                        </div>
                        <button className='text-sm bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors'>
                          Connect
                        </button>
                      </div>
                    </div>

                    <div className='p-4 border border-gray-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center'>
                            <MessageSquare className='h-5 w-5 text-green-600' />
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>Slack</p>
                            <p className='text-xs text-gray-500'>Get notifications in Slack</p>
                          </div>
                        </div>
                        <button className='text-sm bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors'>
                          Connect
                        </button>
                      </div>
                    </div>

                    <div className='p-4 border border-gray-200 rounded-lg'>
                      <div className='flex items-center justify-between'>
                        <div className='flex items-center space-x-3'>
                          <div className='w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center'>
                            <span>💳</span>
                          </div>
                          <div>
                            <p className='text-sm font-medium text-gray-900'>Payment Gateway</p>
                            <p className='text-xs text-gray-500'>Connect payment processing</p>
                          </div>
                        </div>
                        <button className='text-sm bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors'>
                          Connect
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Admin Tab */}
              {activeTab === 'admin' && userRole === 'admin' && (
                <div className='p-6'>
                  <div className='flex items-center justify-between mb-6'>
                    <h2 className='text-lg font-semibold text-gray-900'>Admin Settings</h2>
                    <span className='text-sm text-gray-500'>System administration</span>
                  </div>

                  <div className='space-y-6'>
                    <div className='p-4 bg-purple-50 border border-purple-200 rounded-lg'>
                      <div className='flex items-center space-x-3 mb-3'>
                        <span>⚙️</span>
                        <h3 className='text-md font-medium text-gray-900'>System Configuration</h3>
                      </div>
                      <div className='space-y-3'>
                        <button className='w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-gray-700'>
                              User Management
                            </span>
                            <span>▶️</span>
                          </div>
                        </button>

                        <button className='w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-gray-700'>
                              System Settings
                            </span>
                            <span>▶️</span>
                          </div>
                        </button>

                        <button className='w-full text-left p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors'>
                          <div className='flex items-center justify-between'>
                            <span className='text-sm font-medium text-gray-700'>
                              Analytics Dashboard
                            </span>
                            <span>▶️</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className='px-6 py-4 border-t border-gray-200'>
                <div className='flex items-center justify-between'>
                  <div className='text-sm text-gray-500'>
                    {notification && (
                      <div
                        className={`flex items-center space-x-2 ${
                          notification.type === 'success' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {notification.type === 'success' ? (
                          <span>✅</span>
                        ) : (
                          <AlertCircle className='h-4 w-4' />
                        )}
                        <span>{notification.message}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className='flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                  >
                    <span>💾</span>
                    <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
