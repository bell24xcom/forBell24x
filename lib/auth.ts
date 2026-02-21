/**
 * LEGACY STUB — Bell24h uses OTP + JWT auth, NOT NextAuth credentials.
 * Real auth: /api/auth/otp/send → /api/auth/otp/verify → JWT cookie (auth-token)
 * Admin auth: /api/admin/login → JWT cookie (admin-token)
 *
 * This file is kept only for backward compatibility with any NextAuth imports.
 * Do NOT add real credentials here.
 */
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize() {
        // NextAuth credentials login is disabled.
        // Use OTP auth: POST /api/auth/otp/send + /api/auth/otp/verify
        return null;
      },
    }),
  ],
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role;
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session.user as { id?: string }).id = token.sub;
        (session.user as { role?: unknown }).role = token.role;
      }
      return session;
    },
  },
  session: { strategy: 'jwt' },
};
