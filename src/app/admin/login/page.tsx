'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'

declare global {
  interface Window {
    initSendOTP: (config: object) => void
    sendOtp: (identifier: string, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void
    verifyOtp: (otp: number, success?: (d: unknown) => void, failure?: (e: unknown) => void) => void
  }
}

const WIDGET_ID  = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID
const TOKEN_AUTH = process.env.NEXT_PUBLIC_MSG91_TOKEN_AUTH

export default function AdminLoginPage() {
  const [mode, setMode]       = useState<'password' | 'otp'>('otp')
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone]     = useState('')
  const [otp, setOtp]         = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [widgetReady, setWidgetReady]     = useState(false)
  const [sentViaWidget, setSentViaWidget] = useState(false)
  const phoneRef      = useRef('')
  const loginCalledRef = useRef(false)
  const router = useRouter()

  const normalizePhone = (raw: string): string =>
    raw.replace(/[\s\-\(\)]/g, '').replace(/^\+91/, '').replace(/^91/, '')

  const extractToken = (data: unknown): string => {
    if (typeof data === 'string') return data
    const r = data as Record<string, unknown>
    return ((r['access-token'] ?? r['accessToken'] ?? r['token'] ?? r['message'] ?? '') as string)
  }

  // Auto-redirect if already authenticated as admin
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

  // Called after MSG91 widget confirms the OTP is correct
  const completeAdminWidgetLogin = async (accessToken: string) => {
    if (loginCalledRef.current) return
    loginCalledRef.current = true
    const normalizedPhone = phoneRef.current
    if (!accessToken || !normalizedPhone) {
      setError('Verification failed. Please try again.')
      setLoading(false)
      loginCalledRef.current = false
      return
    }
    try {
      const res = await fetch('/api/auth/otp/widget-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ accessToken, phone: normalizedPhone }),
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setError(data.message || 'Login failed. Please try again.')
        setLoading(false)
        loginCalledRef.current = false
        return
      }
      if (data.user?.role !== 'ADMIN' && data.user?.role !== 'SUPER_ADMIN') {
        setError('This account does not have admin access.')
        setLoading(false)
        loginCalledRef.current = false
        return
      }
      localStorage.setItem('bell24h_user', JSON.stringify(data.user))
      router.push('/admin/dashboard')
    } catch {
      setError('Network error. Please try again.')
      setLoading(false)
      loginCalledRef.current = false
    }
  }

  // Email + Password login (unchanged)
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

  // Send OTP via MSG91 widget (same as user login)
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    const normalized = normalizePhone(phone)
    if (!/^[6-9]\d{9}$/.test(normalized)) {
      setError('Please enter a valid 10-digit Indian mobile number.')
      return
    }
    phoneRef.current = normalized
    loginCalledRef.current = false
    if (!widgetReady || !window.sendOtp) {
      setError('OTP service not ready. Please refresh the page.')
      return
    }
    setLoading(true)
    setSentViaWidget(true)
    window.sendOtp(
      `91${normalized}`,
      () => { setOtpSent(true); setLoading(false) },
      (err) => {
        console.error('MSG91 sendOtp failed:', err)
        setError('Failed to send OTP. Please try again.')
        setLoading(false)
      }
    )
  }

  // Verify OTP via MSG91 widget (same as user login)
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (!sentViaWidget || !window.verifyOtp) {
      setError('OTP service not ready. Please refresh the page.')
      return
    }
    setLoading(true)
    window.verifyOtp(
      parseInt(otp, 10),
      async (data: unknown) => {
        const accessToken = extractToken(data)
        if (accessToken) {
          await completeAdminWidgetLogin(accessToken)
        }
      },
      (err) => {
        console.error('MSG91 verifyOtp failed:', err)
        setError('Invalid OTP. Please check and try again.')
        setLoading(false)
      }
    )
  }

  return (
    <>
      {/* MSG91 OTP Widget — same script used by user login */}
      {WIDGET_ID && TOKEN_AUTH && (
        <Script
          src="https://verify.msg91.com/otp-provider.js"
          strategy="afterInteractive"
          onLoad={() => {
            if (typeof window.initSendOTP === 'function') {
              window.initSendOTP({
                widgetId: WIDGET_ID,
                tokenAuth: TOKEN_AUTH,
                exposeMethods: true,
                success: async (data: unknown) => {
                  const accessToken = extractToken(data)
                  if (accessToken) {
                    await completeAdminWidgetLogin(accessToken)
                  } else {
                    setError('Verification failed — no token received. Please try again.')
                    setLoading(false)
                  }
                },
                failure: (err: unknown) => {
                  console.error('MSG91 widget failure:', err)
                  setError('OTP verification failed. Please try again.')
                  setLoading(false)
                },
              })
              setWidgetReady(true)
            }
          }}
        />
      )}

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

          {/* Phone OTP — enter phone */}
          {mode === 'otp' && !otpSent && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Admin Phone Number</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/[^\d+\-\s]/g, ''))}
                  placeholder="+91 9876543210"
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px]"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !widgetReady || !phone}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
              >
                {loading ? 'Sending...' : !widgetReady ? 'Loading OTP service...' : 'Send OTP'}
              </button>
            </form>
          )}

          {/* Phone OTP — enter code */}
          {mode === 'otp' && otpSent && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <p className="text-slate-400 text-sm text-center">OTP sent to {phone}</p>
              <div>
                <label className="text-slate-400 text-xs font-medium block mb-1.5">Enter OTP</label>
                <input
                  type="text"
                  value={otp}
                  onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="6-digit OTP"
                  maxLength={6}
                  autoFocus
                  required
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 min-h-[44px] text-center text-xl tracking-widest"
                />
              </div>
              <button
                type="submit"
                disabled={loading || otp.length !== 6}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors min-h-[44px]"
              >
                {loading ? 'Verifying...' : 'Verify & Enter Admin'}
              </button>
              <button
                type="button"
                onClick={() => { setOtpSent(false); setOtp(''); setSentViaWidget(false) }}
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
    </>
  )
}
