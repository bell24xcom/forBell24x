"use client";

import { useState } from 'react';
import { AdminAuthService } from '@/lib/admin-auth';

import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  return (
    <main className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6">Admin Login</h1>
      <form className="flex flex-col gap-4">
        <input type="text" placeholder="Admin Email" className="border p-2 rounded" />
        <input type="password" placeholder="Password" className="border p-2 rounded" />
        <button type="submit" className="bg-amber-600 text-white py-2 rounded">Login</button>
      </form>
    </main>
  );
} 
