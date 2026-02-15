'use client'
import { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [show, setShow] = useState(false)
  
  useEffect(() => {
    const consent = localStorage.getItem('cookieConsent')
    if (!consent) setShow(true)
  }, [])
  
  const acceptCookies = () => {
    localStorage.setItem('cookieConsent', 'true')
    setShow(false)
  }
  
  if (!show) return null
  
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 text-white p-4 flex flex-col sm:flex-row items-center justify-between z-50 shadow-lg">
      <div className="mb-2 sm:mb-0">
        <p className="text-sm">
          We use cookies to enhance your experience. By continuing to visit this site you agree to our use of cookies.
          <a href="/privacy" className="underline ml-2">Privacy Policy</a>
        </p>
      </div>
      <div className="flex space-x-2">
        <button 
          onClick={acceptCookies}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm font-medium transition"
        >
          Accept All
        </button>
        <button 
          onClick={() => setShow(false)}
          className="border border-gray-400 hover:border-gray-300 px-4 py-2 rounded text-sm transition"
        >
          Decline
        </button>
      </div>
    </div>
  )
} 
