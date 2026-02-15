import { createClient } from '@supabase/supabase-js'

// Only enable Supabase when explicit credentials are provided
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// In development, log a concise note when disabled; stay silent in production
if (process.env.NODE_ENV !== 'production' && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase is disabled (no credentials found). This is safe if you use OTP-only auth.')
}

export const supabase: any = (supabaseUrl && supabaseAnonKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : { __disabled: true, auth: { signInWithPassword: async () => ({ data: null, error: { message: 'Supabase disabled' } }), signUp: async () => ({ data: null, error: { message: 'Supabase disabled' } }), signOut: async () => ({ error: null }), getUser: async () => ({ data: { user: null } }) } }

// Auth helper functions
export const signInWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error('Supabase auth error:', error)
    return { data: null, error: { message: 'Authentication service unavailable. Please check your configuration.' } }
  }
}

export const signUpWithEmail = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  } catch (error) {
    console.error('Supabase auth error:', error)
    return { data: null, error: { message: 'Authentication service unavailable. Please check your configuration.' } }
  }
}

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut()
    return { error }
  } catch (error) {
    console.error('Supabase signout error:', error)
    return { error: { message: 'Sign out failed. Please check your configuration.' } }
  }
}

export const getCurrentUser = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  } catch (error) {
    console.error('Supabase getCurrentUser error:', error)
    return null
  }
}

// Database types for TypeScript
export interface User {
  id: string;
  email: string;
  company_name?: string;
  business_type?: string;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  company_name: string;
  business_type: string;
  contact_email: string;
  phone?: string;
  address?: string;
  website?: string;
  created_at: string;
  updated_at: string;
}
