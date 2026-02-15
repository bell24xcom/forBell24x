'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ClaimProfileModalProps {
  supplier: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ClaimProfileModal({
  supplier,
  isOpen,
  onClose,
}: ClaimProfileModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    verificationMethod: 'PHONE',
  });
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'form' | 'verify'>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [claimId, setClaimId] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim/company', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: supplier.id,
          claimedBy: formData.email,
          claimedByName: formData.name,
          claimedByPhone: formData.phone,
          claimedByRole: formData.role,
          verificationMethod: formData.verificationMethod,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setClaimId(data.claimId);
        setStep('verify');
      } else {
        setError(data.error || 'Failed to submit claim');
      }
    } catch (error: any) {
      console.error('Claim error:', error);
      setError('Failed to submit claim. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/claim/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          claimId,
          verificationCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        onClose();
        // Redirect to supplier dashboard
        router.push('/supplier/dashboard');
      } else {
        setError(data.error || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error('Verification error:', error);
      setError('Failed to verify. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg p-6 max-w-md w-full shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Claim This Profile
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900/20 border border-red-400 text-red-700 dark:text-red-400 rounded">
            {error}
          </div>
        )}

        {step === 'form' ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Name *
              </label>
              <Input
                placeholder="Enter your full name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email *
              </label>
              <Input
                type="email"
                placeholder="your@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone *
              </label>
              <Input
                type="tel"
                placeholder="+91 98190 49523"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Your Role *
              </label>
              <Input
                placeholder="e.g. Founder, CEO, Manager"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                required
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Method *
              </label>
              <select
                value={formData.verificationMethod}
                onChange={(e) => setFormData({ ...formData, verificationMethod: e.target.value })}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PHONE">Phone (SMS)</option>
                <option value="EMAIL">Email</option>
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Submitting...' : 'Submit Claim'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="space-y-4">
            <p className="text-gray-600 dark:text-gray-400">
              Enter the verification code sent to your {formData.verificationMethod === 'PHONE' ? 'phone' : 'email'}
            </p>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Verification Code *
              </label>
              <Input
                placeholder="Enter 6-digit code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                maxLength={6}
                className="w-full text-center text-2xl tracking-widest"
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                type="submit"
                disabled={loading || verificationCode.length !== 6}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {loading ? 'Verifying...' : 'Verify & Claim'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep('form')}
                disabled={loading}
              >
                Back
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

