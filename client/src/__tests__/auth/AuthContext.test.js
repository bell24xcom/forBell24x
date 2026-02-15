import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AuthProvider, useAuth } from '../../contexts/AuthContext'

// Test component to access auth context
const TestComponent = () => {
  const { user, isAuthenticated, login, register, logout } = useAuth()
  
  return (
    <div>
      <div data-testid="user">{user ? user.email : 'no-user'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'true' : 'false'}</div>
      <button data-testid="login" onClick={() => login('test@example.com', 'password')}>
        Login
      </button>
      <button data-testid="register" onClick={() => register({ email: 'test@example.com', password: 'password' })}>
        Register
      </button>
      <button data-testid="logout" onClick={logout}>
        Logout
      </button>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear()
    jest.clearAllMocks()
  })

  it('should provide authentication context', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    expect(screen.getByTestId('user')).toHaveTextContent('no-user')
  })

  it('should register a new user successfully', async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const registerButton = screen.getByTestId('register')
    fireEvent.click(registerButton)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })

    // Check if user was stored in localStorage
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'bell24h_users',
      expect.stringContaining('test@example.com')
    )
  })

  it('should login an existing user successfully', async () => {
    // First register a user
    localStorage.setItem('bell24h_users', JSON.stringify([
      { email: 'test@example.com', password: 'password', id: '1' }
    ]))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const loginButton = screen.getByTestId('login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com')
    })
  })

  it('should logout successfully', async () => {
    // First register a user
    localStorage.setItem('bell24h_users', JSON.stringify([
      { email: 'test@example.com', password: 'password', id: '1' }
    ]))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    // Login first
    const loginButton = screen.getByTestId('login')
    fireEvent.click(loginButton)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    // Then logout
    const logoutButton = screen.getByTestId('logout')
    fireEvent.click(logoutButton)

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user')).toHaveTextContent('no-user')
    })

    // Check if auth data was removed from localStorage
    expect(localStorage.removeItem).toHaveBeenCalledWith('bell24h_user')
    expect(localStorage.removeItem).toHaveBeenCalledWith('bell24h_auth_token')
  })

  it('should prevent duplicate user registration', async () => {
    // Set up existing user
    localStorage.setItem('bell24h_users', JSON.stringify([
      { email: 'test@example.com', password: 'password', id: '1' }
    ]))

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    )

    const registerButton = screen.getByTestId('register')
    fireEvent.click(registerButton)

    // Should not be authenticated since user already exists
    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
    })
  })
}) 
