'use client';

import React, { useState, useEffect } from 'react';
import { Phone, MessageSquare, CheckCircle, XCircle, Clock, RefreshCw } from 'lucide-react';

interface OTPConfig {
  authKey: string;
  templateId: string;
  senderId: string;
  route: string;
  country: string;
}

interface OTPRequest {
  mobile: string;
  message: string;
  templateId: string;
  otp: string;
  expiry: number;
}

export default function MSG91OTPIntegration() {
  const [config, setConfig] = useState<OTPConfig>({
    authKey: '',
    templateId: '',
    senderId: 'BELL24',
    route: '4',
    country: '91'
  });

  const [otpRequest, setOtpRequest] = useState<OTPRequest>({
    mobile: '',
    message: '',
    templateId: '',
    otp: '',
    expiry: 5
  });

  const [otpStatus, setOtpStatus] = useState<'idle' | 'sending' | 'sent' | 'verified' | 'failed'>('idle');
  const [verificationCode, setVerificationCode] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpRequest(prev => ({ ...prev, otp }));
    addLog(`Generated OTP: ${otp}`);
    return otp;
  };

  const sendOTP = async () => {
    if (!otpRequest.mobile || !config.authKey) {
      addLog('Error: Mobile number and Auth Key are required');
      return;
    }

    setOtpStatus('sending');
    addLog(`Sending OTP to ${otpRequest.mobile}...`);

    try {
      const otp = generateOTP();
      const message = `Your BELL24h verification code is ${otp}. Valid for ${otpRequest.expiry} minutes.`;

      const response = await fetch('/api/otp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: otpRequest.mobile,
          message: message,
          templateId: config.templateId,
          authKey: config.authKey,
          senderId: config.senderId,
          route: config.route,
          country: config.country
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOtpStatus('sent');
        addLog(`OTP sent successfully. Request ID: ${result.requestId}`);
      } else {
        setOtpStatus('failed');
        addLog(`Failed to send OTP: ${result.error}`);
      }
    } catch (error) {
      setOtpStatus('failed');
      addLog(`Error sending OTP: ${error}`);
    }
  };

  const verifyOTP = async () => {
    if (!verificationCode || !otpRequest.mobile) {
      addLog('Error: Verification code and mobile number are required');
      return;
    }

    addLog(`Verifying OTP: ${verificationCode} for ${otpRequest.mobile}...`);

    try {
      const response = await fetch('/api/otp/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mobile: otpRequest.mobile,
          otp: verificationCode,
          authKey: config.authKey
        }),
      });

      const result = await response.json();

      if (result.success) {
        setOtpStatus('verified');
        addLog(`OTP verified successfully!`);
      } else {
        addLog(`OTP verification failed: ${result.error}`);
      }
    } catch (error) {
      addLog(`Error verifying OTP: ${error}`);
    }
  };

  const resetOTP = () => {
    setOtpStatus('idle');
    setVerificationCode('');
    setOtpRequest(prev => ({ ...prev, otp: '' }));
    addLog('OTP process reset');
  };

  const getStatusIcon = () => {
    switch (otpStatus) {
      case 'sending':
        return <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />;
      case 'sent':
        return <MessageSquare className="w-5 h-5 text-green-600" />;
      case 'verified':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Phone className="w-5 h-5 text-gray-600" />;
    }
  };

  const getStatusText = () => {
    switch (otpStatus) {
      case 'sending':
        return 'Sending OTP...';
      case 'sent':
        return 'OTP Sent Successfully';
      case 'verified':
        return 'OTP Verified';
      case 'failed':
        return 'OTP Failed';
      default:
        return 'Ready to Send';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">MSG91 OTP Integration</h1>
          <p className="text-gray-600 mt-2">Test and configure MSG91 OTP service for user authentication</p>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className="text-sm font-medium text-gray-700">{getStatusText()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">MSG91 Configuration</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Auth Key
              </label>
              <input
                type="password"
                value={config.authKey}
                onChange={(e) => setConfig(prev => ({ ...prev, authKey: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter MSG91 Auth Key"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Template ID
              </label>
              <input
                type="text"
                value={config.templateId}
                onChange={(e) => setConfig(prev => ({ ...prev, templateId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter Template ID"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sender ID
                </label>
                <input
                  type="text"
                  value={config.senderId}
                  onChange={(e) => setConfig(prev => ({ ...prev, senderId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Route
                </label>
                <select
                  value={config.route}
                  onChange={(e) => setConfig(prev => ({ ...prev, route: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1">Promotional</option>
                  <option value="4">Transactional</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Code
              </label>
              <input
                type="text"
                value={config.country}
                onChange={(e) => setConfig(prev => ({ ...prev, country: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* OTP Testing */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">OTP Testing</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mobile Number
              </label>
              <input
                type="tel"
                value={otpRequest.mobile}
                onChange={(e) => setOtpRequest(prev => ({ ...prev, mobile: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter mobile number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                OTP Expiry (minutes)
              </label>
              <input
                type="number"
                value={otpRequest.expiry}
                onChange={(e) => setOtpRequest(prev => ({ ...prev, expiry: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="10"
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={sendOTP}
                disabled={otpStatus === 'sending' || !otpRequest.mobile || !config.authKey}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <MessageSquare className="w-4 h-4 mr-2" />
                Send OTP
              </button>
              <button
                onClick={resetOTP}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Reset
              </button>
            </div>

            {otpStatus === 'sent' && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Verification Code
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                  />
                  <button
                    onClick={verifyOTP}
                    disabled={!verificationCode}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Verify
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logs */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Activity Logs</h2>
        <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">No activity yet. Send an OTP to see logs.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-sm font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="mt-3 flex justify-between items-center">
          <span className="text-sm text-gray-500">
            {logs.length} log entries
          </span>
          <button
            onClick={() => setLogs([])}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* API Documentation */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">API Documentation</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Send OTP</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <code className="text-sm text-gray-700">
                POST /api/otp/send<br/>
                Content-Type: application/json<br/><br/>
                {`{
  "mobile": "9876543210",
  "message": "Your OTP is 123456",
  "templateId": "template_id",
  "authKey": "your_auth_key",
  "senderId": "BELL24",
  "route": "4",
  "country": "91"
}`}
              </code>
            </div>
          </div>

          <div>
            <h3 className="font-medium text-gray-900 mb-2">Verify OTP</h3>
            <div className="bg-gray-50 rounded-lg p-3">
              <code className="text-sm text-gray-700">
                POST /api/otp/verify<br/>
                Content-Type: application/json<br/><br/>
                {`{
  "mobile": "9876543210",
  "otp": "123456",
  "authKey": "your_auth_key"
}`}
              </code>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
