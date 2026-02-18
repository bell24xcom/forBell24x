/**
 * NextAuth configuration stub.
 * Bell24h uses custom JWT auth (cookie: auth-token) via lib/jwt.ts.
 * NextAuth is mounted at /api/auth/[...nextauth] for SessionProvider compatibility,
 * but no providers are configured — sessions are always null.
 */
import { NextAuthOptions } from 'next-auth';

export const authOptions: NextAuthOptions = {
  providers: [],
  secret: process.env.NEXTAUTH_SECRET || 'bell24h-nextauth-secret-placeholder',
  session: {
    strategy: 'jwt',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  pages: {
    signIn: '/auth/login',
  },
  callbacks: {
    async session({ session }) {
      return session;
    },
  },
};
