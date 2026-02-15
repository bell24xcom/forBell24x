#!/usr/bin/env node

/**
 * Google OAuth Setup Script for Bell24h 2.0
 * This script helps configure Google OAuth environment variables
 */

console.log('🚀 Bell24h 2.0 - Google OAuth Setup');
console.log('=====================================\n');

console.log('📋 STEP 1: Add these environment variables to Vercel Dashboard');
console.log('Go to: https://vercel.com/dashboard → bell24h-v1 → Settings → Environment Variables\n');

console.log('Environment Variables to Add:');
console.log('----------------------------');
console.log('Name: GOOGLE_ID');
console.log('Value: 1044360968417-avn6r7navbtelcvocsauv7j6ck6egvnl.apps.googleusercontent.com');
console.log('Environment: Production\n');

console.log('Name: GOOGLE_SECRET');
console.log('Value: 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');
console.log('Environment: Production\n');

console.log('Name: NEXTAUTH_URL');
console.log('Value: https://bell24h-v1-diyyshvix-vishaals-projects-892b178d.vercel.app');
console.log('Environment: Production\n');

console.log('📋 STEP 2: After adding environment variables, deploy:');
console.log('npx vercel --prod\n');

console.log('📋 STEP 3: Test Google OAuth:');
console.log('1. Visit: https://bell24h-v1-diyyshvix-vishaals-projects-892b178d.vercel.app/auth/login');
console.log('2. Click: "Sign in with Google"');
console.log('3. Expected: Google OAuth popup → Choose account → Redirect to dashboard\n');

console.log('🎯 Expected Result:');
console.log('- ✅ Google OAuth popup appears');
console.log('- ✅ User can select Google account');
console.log('- ✅ Automatic redirect to /dashboard');
console.log('- ✅ User stays logged in across page refreshes\n');

console.log('🚀 Ready for Launch!');
console.log('Bell24h 2.0 will be 100% ready with professional Google authentication!'); 
