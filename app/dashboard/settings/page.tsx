'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Globe, Moon, Shield, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState({
    email: true,
    sms: false,
    whatsapp: true,
  });

  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('dark');

  const handleNotificationToggle = (key: string) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
    // TODO: Save to API
  };

  return (
      <div className="max-w-4xl">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 text-sm transition-colors cursor-pointer">
          ← Back
        </button>
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your account preferences and notifications</p>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notification Preferences
            </h2>
            <div className="space-y-4">
              <label className="flex items-center justify-between">
                <span className="text-slate-300">Email Notifications</span>
                <button
                  onClick={() => handleNotificationToggle('email')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.email ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.email ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-300">SMS Notifications</span>
                <button
                  onClick={() => handleNotificationToggle('sms')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.sms ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.sms ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
              <label className="flex items-center justify-between">
                <span className="text-slate-300">WhatsApp Notifications</span>
                <button
                  onClick={() => handleNotificationToggle('whatsapp')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notifications.whatsapp ? 'bg-blue-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notifications.whatsapp ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </label>
            </div>
          </div>

          {/* Language */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Language
            </h2>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-700 text-white rounded-lg"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी (Hindi)</option>
              <option value="mr">मराठी (Marathi)</option>
              <option value="gu">ગુજરાતી (Gujarati)</option>
            </select>
          </div>

          {/* Theme */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Moon className="w-5 h-5" />
              Theme
            </h2>
            <div className="flex gap-4">
              <button
                onClick={() => setTheme('dark')}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  theme === 'dark' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'
                }`}
              >
                Dark Mode (Current)
              </button>
              <button
                disabled
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-slate-700 text-slate-500 cursor-not-allowed"
              >
                Light Mode (Coming Soon)
              </button>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Account
            </h2>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-left">
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-red-900/40 hover:bg-red-900/60 text-red-300 rounded-lg transition-colors text-left flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      </div>
  );
}
