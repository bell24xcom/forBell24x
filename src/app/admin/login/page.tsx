'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminLoginPage() {
  const [mode, setMode] = useState<'password' | 'otp'>('otp')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  // Bug 2 — auto-redirect if already authenticated via localStorage
  useEffect(() => {
    const stored = localStorage.getItem('bell24h_user')
    if (stored) {
      try {
        const user = JSON.parse(stored)
        if (user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard')
        }
      } catch {
        localStorage.removeItem('bell24h_user')
      }
    }
  }, [router])

  // Bug 2 — auto-redirect if already authenticated via cookie session
  useEffect(() => {
    fetch('/api/auth/me', { credentials: 'include' })
      .then(r => r.json())
      .then(data => {
        if (data?.user?.role === 'ADMIN' || data?.user?.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard')
        }
      })
      .catch(() => {})
  }, [router])

  // Email + Password login (admin@bell24h.com / Bell@2026)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (data.success) {
        router.push('/admin/dashboard')
      } else {
        setError(data.message || data.error || 'Invalid credentials')
      }
    } catch {
      setError('Login failed. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Phone OTP login (for users with ADMIN role in DB)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.replace(/\D/g, '') }),
      })
      const data = await res.json()
      if (data.success) {
        setOtpSent(true)
      } else {
        setError(data.message || data.error || 'Failed to send OTP')
      }
    } catch {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ phone: phone.replace(/\D/g, ''), otp }),
      })
      const data = await res.json()
      if (data.success) {
        // Check if this user has ADMIN role
        const meRes = await fetch('/api/auth/me', { credentials: 'include' })
        const meData = await meRes.json()
        if (meData.user?.role === 'ADMIN' || meData.user?.role === 'SUPER_ADMIN') {
          router.push('/admin/dashboard')
        } else {
          setError('This account does not have admin access.')
        }
      } else {
        setError(data.message || data.error || 'Invalid OTP')
      }
    } catch {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">B</span>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Access</h1>
          <p className="text-slate-400 text-sm mt-1">VyaparSethu Control Panel</p>
        </div>

        {/* Mode Toggle */}
        <div className="flex bg-slate-900 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setMode('password'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'password' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Email + Password
          </button>
          <button
            onClick={() => { setMode('otp'); setError('') }}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
              mode === 'otp' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            Phone OTP
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-700/50 rounded-xl p-3 mb-4 text-red-300 text-sm text-center">
            {error}
          </div>
        )}

        {/* Email + Password Form */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <p className="text-xs text-slate-500 bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2 text-center">
              Email login requires a registered admin email. If you registered via phone OTP, use the{' '}
              <button type="button" onClick={() => setMode('otp')} className="text-indigo-400 hover:text-indigo-300 underline">
                Phone OTP tab
              </button>{' '}instead.
            </p>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Admin Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@vyaparsethu.com"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
            >
              {loading ? 'Signing in...' : 'Sign In to Admin'}
            </button>
          </form>
        )}

        {/* Phone OTP — send */}
        {mode === 'otp' && !otpSent && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Admin Phone Number</label>
              <div className="flex gap-2">
                <span className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-3 text-slate-400 text-sm min-h-[44px] flex items-center">+91</span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="9004962871"
                  required
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </button>
          </form>
        )}

        {/* Phone OTP — verify */}
        {mode === 'otp' && otpSent && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <p className="text-slate-400 text-sm text-center">OTP sent to +91 {phone}</p>
            <div>
              <label className="text-slate-400 text-xs font-medium block mb-1.5">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="6-digit OTP"
                maxLength={6}
                required
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px] text-center text-xl tracking-widest"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
            >
              {loading ? 'Verifying...' : 'Verify & Enter Admin'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp('') }}
              className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors py-2"
            >
              Change phone number
            </button>
          </form>
        )}

        <p className="text-center mt-6">
          <a href="/" className="text-slate-600 hover:text-slate-400 text-xs transition-colors">
            ← Back to bell24h.com
          </a>
        </p>

      </div>
    </div>
  )
}
