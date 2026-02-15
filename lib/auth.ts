import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Mock user for now - in production, fetch from database
        const mockUser = {
          id: '1',
          email: credentials.email,
          name: 'John Doe',
          role: 'buyer'
        }

        // Mock password check - in production, verify against database
        const isValidPassword = credentials.password === 'password123'

        if (isValidPassword) {
          return mockUser
        }

        return null
      }
    })
  ],
  pages: {
    signIn: '/auth/login',
    signUp: '/auth/register'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub
        session.user.role = token.role
      }
      return session
    }
  },
  session: {
    strategy: 'jwt'
  }
}
