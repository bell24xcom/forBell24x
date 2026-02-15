# Fix merge conflicts and clean up code
Write-Host "🔧 Fixing merge conflicts and cleaning code..."

# Remove email-OTP APIs (mobile OTP only)
if (Test-Path "app\api\auth\email-otp") {
    Remove-Item "app\api\auth\email-otp" -Recurse -Force
    Write-Host "✅ Removed email-OTP APIs"
}

# Replace AuthModal with clean mobile-OTP-only version
$authModalContent = @'
import React, { useState } from 'react';

type AuthModalProps = {
  onClose: () => void;
  onSuccess?: () => void;
};

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [step, setStep] = useState<number>(1);
  const [mobile, setMobile] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const validateMobile = (m: string) => /^[6-9]\d{9}$/.test(m);

  const sendOtp = async () => {
    setError('');
    if (!validateMobile(mobile)) {
      setError('Enter valid 10-digit Indian mobile number (starts 6-9)');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to send OTP');
      setStep(2);
    } catch (e: any) {
      setError(e?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError('');
    if (!/^\d{6}$/.test(otp)) {
      setError('OTP must be 6 digits');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile, otp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Invalid OTP');
      onSuccess?.();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Sign in with Mobile OTP</h2>
          <button onClick={onClose} aria-label="Close" className="text-gray-500 hover:text-gray-700">×</button>
        </div>

        {error && <div className="mb-3 rounded bg-red-50 p-2 text-sm text-red-700">{error}</div>}

        {step === 1 ? (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Mobile number</label>
            <input
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="9876543210"
              className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              disabled={loading}
              onClick={sendOtp}
              className="w-full rounded bg-blue-600 py-2 text-white disabled:opacity-50"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-medium">Enter OTP</label>
            <input
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              placeholder="6-digit code"
              className="w-full rounded border p-2 outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              disabled={loading}
              onClick={verifyOtp}
              className="w-full rounded bg-green-600 py-2 text-white disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
'@

Set-Content -Path "components\AuthModal.tsx" -Value $authModalContent -Encoding UTF8
Write-Host "✅ Replaced AuthModal with clean mobile-OTP-only version"

# Commit and push changes
Write-Host "📝 Committing changes..."
git add -A
git commit -m "fix: mobile OTP only; remove email-otp; clean AuthModal merge conflicts"
git push origin main

Write-Host "✅ Changes pushed to GitHub!"
Write-Host "🚀 Ready to deploy!"
