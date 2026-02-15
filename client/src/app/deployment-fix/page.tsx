'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, Database, Server, Code, Settings, Terminal, RefreshCw } from 'lucide-react';

const DeploymentFix = () => {
  const [completedSteps, setCompletedSteps] = useState(new Set());

  const toggleStep = (stepId: number) => {
    const newCompleted = new Set(completedSteps);
    if (newCompleted.has(stepId)) {
      newCompleted.delete(stepId);
    } else {
      newCompleted.add(stepId);
    }
    setCompletedSteps(newCompleted);
  };

  const fixSteps = [
    {
      id: 1,
      category: "Environment Variables",
      icon: <Settings className="w-5 h-5" />,
      priority: "Critical",
      time: "2 minutes",
      issue: "Missing or incorrect environment variables causing 503 errors",
      solution: "Verify and update all environment variables in Vercel",
      commands: [
        "# Check current environment variables",
        "vercel env ls",
        "",
        "# Add missing variables to Vercel",
        "vercel env add DATABASE_URL",
        "vercel env add NEXTAUTH_SECRET", 
        "vercel env add RAZORPAY_KEY_SECRET",
        "vercel env add OPENAI_API_KEY",
        "",
        "# Verify in Vercel dashboard:",
        "# DATABASE_URL=postgresql://postgres:lTbKChgEtrkiElIkFNhXuXzxbyqECLPC@shortline.proxy.rlwy.net:45776/railway?sslmode=require",
        "# NEXTAUTH_URL=https://bell24h-v1-mojahtaej-vishaals-projects-892b178d.vercel.app",
        "# NEXTAUTH_SECRET=your-secret-key-here"
      ],
      verification: "All environment variables show in Vercel dashboard"
    },
    {
      id: 2,
      category: "Database Connection",
      icon: <Database className="w-5 h-5" />,
      priority: "Critical", 
      time: "3 minutes",
      issue: "Database schema not synced, tables missing, connection failures",
      solution: "Force database reset and schema push",
      commands: [
        "# 1. Reset database client completely",
        "rm -rf node_modules/.database-cache",
        "npm run db:generate --force",
        "",
        "# 2. Force push schema to database",
        "npm run db:reset --force",
        "",
        "# 3. Verify tables created",
        "npm run db:execute --stdin <<SQL",
        "SELECT table_name FROM information_schema.tables WHERE table_schema='public';",
        "SQL",
        "",
        "# 4. Test direct database connection",
        "npm run db:studio",
        "# Should open browser with database GUI"
      ],
      verification: "Database GUI opens showing all tables (User, Product, RFQ, Wallet, etc.)"
    },
    {
      id: 3,
      category: "API Routes Fix",
      icon: <Code className="w-5 h-5" />,
      priority: "High",
      time: "5 minutes", 
      issue: "API routes returning 503, database connections failing in serverless environment",
      solution: "Add proper error handling and connection pooling for serverless",
      commands: [
        "# Create /lib/database.ts for connection pooling",
        "// Database connection setup for serverless",
        "// Use your existing database client configuration",
        "",
        "# Update API routes to use pooled connection",
        "# Replace direct database instantiation with shared connection",
        "",
        "# Add to /api/health/route.ts",
        "export async function GET() {",
        "  try {",
        "    // Test database connection",
        "    // await your_db_client.query.raw('SELECT 1');",
        "    return Response.json({ status: 'ok', database: 'connected' });",
        "  } catch (error) {",
        "    return Response.json({ status: 'error', message: error.message }, { status: 503 });",
        "  }",
        "}"
      ],
      verification: "curl https://your-app.vercel.app/api/health returns {status: 'ok'}"
    },
    {
      id: 4,
      category: "Build Process Fix",
      icon: <Terminal className="w-5 h-5" />,
      priority: "High",
      time: "2 minutes",
      issue: "Build hanging on database client generation, outdated dependencies",
      solution: "Clean build with proper database setup for serverless",
      commands: [
        "# 1. Clean everything",
        "rm -rf .next node_modules package-lock.json",
        "",
        "# 2. Reinstall with proper versions",
        "npm install",
        "",
        "# 3. Generate database client for production",
        "npm run db:generate",
        "",
        "# 4. Test build locally",
        "npm run build",
        "",
        "# 5. Add build optimization to package.json",
        "\"scripts\": {",
        "  \"build\": \"npm run db:generate && next build\",",
        "  \"postinstall\": \"npm run db:setup\"",
        "}"
      ],
      verification: "npm run build completes without errors in under 2 minutes"
    },
    {
      id: 5,
      category: "Vercel Configuration",
      icon: <Server className="w-5 h-5" />,
      priority: "Medium",
      time: "3 minutes",
      issue: "Serverless functions timing out, incorrect region settings",
      solution: "Optimize Vercel configuration for database operations",
      commands: [
        "# Create/update vercel.json",
        "{",
        "  \"functions\": {",
        "    \"app/api/*/route.js\": {",
        "      \"maxDuration\": 30",
        "    }",
        "  },",
        "  \"regions\": [\"bom1\"],",
        "  \"env\": {",
        "    \"DISABLE_ESLINT_PLUGIN\": \"true\"",
        "  },",
        "  \"buildCommand\": \"npm run db:generate && next build\"",
        "}",
        "",
        "# Add to next.config.js",
        "module.exports = {",
        "  experimental: {",
        "    serverComponentsExternalPackages: ['your-database-client'],",
        "  },",
        "  webpack: (config) => {",
        "    config.externals.push('your-database-client');",
        "    return config;",
        "  }",
        "}"
      ],
      verification: "Vercel functions run without timeout errors"
    },
    {
      id: 6,
      category: "Health Check Implementation", 
      icon: <CheckCircle className="w-5 h-5" />,
      priority: "Medium",
      time: "2 minutes",
      issue: "No way to verify if application is actually working",
      solution: "Implement comprehensive health checks",
      commands: [
        "# Create /app/api/health-detailed/route.ts",
        "// Import your database client here",
        "",
        "export async function GET() {",
        "  const checks = await Promise.allSettled([",
        "    // Database check", 
        "    // your_db_client.query.raw('SELECT 1 as db_check'),",
        "    ",
        "    // Environment variables check",
        "    Promise.resolve({",
        "      database_url: !!process.env.DATABASE_URL,",
        "      nextauth_secret: !!process.env.NEXTAUTH_SECRET,",
        "      razorpay_key: !!process.env.RAZORPAY_KEY_SECRET",
        "    }),",
        "    ",
        "    // Tables check",
        "    // your_db_client.user.count(),",
        "    // your_db_client.product.count()",
        "  ]);",
        "",
        "  return Response.json({",
        "    status: checks.every(c => c.status === 'fulfilled') ? 'healthy' : 'degraded',",
        "    timestamp: new Date().toISOString(),",
        "    checks: {",
        "      database: checks[0].status,",
        "      environment: checks[1].status,",
        "      tables: checks[2] ? checks[2].status : 'skipped',",
        "      data: checks[3] ? checks[3].status : 'skipped'",
        "    }",
        "  });",
        "}"
      ],
      verification: "/api/health-detailed returns comprehensive system status"
    }
  ];

  const commonIssues = [
    {
      symptom: "503 Service Unavailable",
      cause: "Database connection failed or environment variables missing",
      fix: "Steps 1 & 2"
    },
    {
      symptom: "Build succeeds but app doesn't work",
      cause: "Database client not generated properly for serverless",
      fix: "Steps 2 & 4"
    },
    {
      symptom: "API routes timeout",
      cause: "Database queries taking too long in serverless environment",
      fix: "Steps 3 & 5"
    },
    {
      symptom: "Pages load but no data",
      cause: "Database tables missing or empty",
      fix: "Step 2"
    }
  ];

  const verificationTests = [
    {
      test: "Environment Variables",
      command: "vercel env ls",
      expected: "All required variables listed"
    },
    {
      test: "Database Connection",
      command: "npm run db:studio",
      expected: "Database GUI opens with tables visible"
    },
    {
      test: "API Health",
      command: "curl https://your-app.vercel.app/api/health",
      expected: '{"status": "ok"}'
    },
    {
      test: "Build Process",
      command: "npm run build",
      expected: "Completes in under 2 minutes"
    },
    {
      test: "Local Development",
      command: "npm run dev",
      expected: "Starts without database errors"
    }
  ];

  const StepCard = ({ step }: { step: any }) => (
    <Card className={`mb-4 ${completedSteps.has(step.id) ? 'border-green-500 bg-green-50' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <button
              onClick={() => toggleStep(step.id)}
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                completedSteps.has(step.id)
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              {completedSteps.has(step.id) && <CheckCircle className="w-4 h-4" />}
            </button>
            {step.icon}
            Step {step.id}: {step.category}
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">{step.time}</Badge>
            <Badge className={`${
              step.priority === 'Critical' ? 'bg-red-100 text-red-800' :
              step.priority === 'High' ? 'bg-orange-100 text-orange-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {step.priority}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-red-600 mb-2"><strong>Issue:</strong> {step.issue}</p>
            <p className="text-sm text-green-600 mb-4"><strong>Solution:</strong> {step.solution}</p>
          </div>
          
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">
              {step.commands.join('\n')}
            </pre>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>✅ Verification:</strong> {step.verification}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Bell24h Deployment Fix Guide</h1>
        <p className="text-xl text-gray-600">Systematic solution for "deployed but not working" issues</p>
      </div>

      {/* Progress Overview */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="w-5 h-5" />
            Fix Progress: {completedSteps.size}/6 Steps Complete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 mb-4">
            {fixSteps.map((step) => (
              <div
                key={step.id}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  completedSteps.has(step.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {step.id}
              </div>
            ))}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(completedSteps.size / 6) * 100}%` }}
            ></div>
          </div>
        </CardContent>
      </Card>

      {/* Common Issues Reference */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Common Issues & Quick Fixes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            {commonIssues.map((issue, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <h3 className="font-semibold text-red-600 mb-2">🚨 {issue.symptom}</h3>
                <p className="text-sm text-gray-600 mb-2"><strong>Cause:</strong> {issue.cause}</p>
                <Badge variant="outline" className="text-blue-600">Fix: {issue.fix}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Step-by-step fixes */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold mb-4">Step-by-Step Fix Process</h2>
        {fixSteps.map((step) => (
          <StepCard key={step.id} step={step} />
        ))}
      </div>

      {/* Verification Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Final Verification Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {verificationTests.map((test, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{test.test}</h3>
                  <code className="text-sm text-gray-600">{test.command}</code>
                </div>
                <Badge className="bg-green-100 text-green-800">{test.expected}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Emergency Recovery */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-red-800 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Emergency Recovery (If All Else Fails)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-red-900 text-red-100 p-4 rounded-lg">
            <pre className="text-sm">{`# Nuclear option - complete reset
git checkout -b emergency-fix
rm -rf node_modules .next package-lock.json
npm install
npm run db:reset --force
npm run db:push
npm run build
git add .
git commit -m "🚑 EMERGENCY: Complete rebuild"
npx vercel --prod`}</pre>
          </div>
          <p className="text-sm text-red-700 mt-3">
            ⚠️ This will reset everything but guarantees a working deployment
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeploymentFix; 
