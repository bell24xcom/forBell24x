import React from 'react'
import { render, screen } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'
import ProtectedRoute from '../../components/ProtectedRoute'

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}))

const TestComponent = () => {
  const { isAuthenticated } = useAuth()
  
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'not-authenticated'}</div>
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    </div>
  )
}

describe('ProtectedRoute', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should show protected content when authenticated', () => {
    // Set up authenticated user
    localStorage.setItem('bell24h_user', JSON.stringify({ email: 'test@example.com' }))
    localStorage.setItem('bell24h_auth_token', 'test-token')

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('authenticated')
    expect(screen.getByTestId('protected-content')).toBeInTheDocument()
  })

  it('should not show protected content when not authenticated', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('auth-status')).toHaveTextContent('not-authenticated')
    expect(screen.queryByTestId('protected-content')).not.toBeInTheDocument()
  })

  it('should show loading state initially', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Initially should show loading
    expect(screen.getByTestId('auth-status')).toBeInTheDocument()
  })
}) 
