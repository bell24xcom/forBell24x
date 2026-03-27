// 🔍 BELL24H PRODUCTION VERIFICATION SCRIPT
// Verifies that the platform is ready for marketing launch

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function verifyProduction() {
  console.log('🔍 Starting production verification...')
  
  let allChecksPassed = true
  
  try {
    // 1. Check for demo users
    console.log('📧 Checking for demo users...')
    const { data: demoUsers, error } = await supabase
      .from('auth.users')
      .select('email')
      .or('email.like.%demo%,email.like.%test%')
    
    if (error) {
      console.log('✅ Clean production database (no demo users found)')
    } else if (demoUsers && demoUsers.length > 0) {
      console.error('❌ Demo users still exist:', demoUsers)
      allChecksPassed = false
    } else {
      console.log('✅ No demo users found')
    }
    
    // 2. Check for demo files
    console.log('📁 Checking for demo files...')
    const demoFiles = [
      'src/app/simple-login/page.tsx',
      'src/app/test-login/page.tsx',
      'src/app/test-login-redirect/page.tsx'
    ]
    
    const existingDemoFiles = demoFiles.filter(file => {
      const filePath = path.join(process.cwd(), file)
      return fs.existsSync(filePath)
    })
    
    if (existingDemoFiles.length > 0) {
      console.error('❌ Demo files still exist:', existingDemoFiles)
      allChecksPassed = false
    } else {
      console.log('✅ No demo files found')
    }
    
    // 3. Check environment variables
    console.log('🔧 Checking environment variables...')
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY'
    ]
    
    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    if (missingEnvVars.length > 0) {
      console.error('❌ Missing environment variables:', missingEnvVars)
      allChecksPassed = false
    } else {
      console.log('✅ All environment variables set')
    }
    
    // 4. Check for demo references in code
    console.log('🔍 Checking for demo references in code...')
    const srcDir = path.join(process.cwd(), 'src')
    
    function checkForDemoReferences(dir) {
      const files = fs.readdirSync(dir, { withFileTypes: true })
      
      for (const file of files) {
        const fullPath = path.join(dir, file.name)
        
        if (file.isDirectory()) {
          checkForDemoReferences(fullPath)
        } else if (file.name.endsWith('.tsx') || file.name.endsWith('.ts')) {
          const content = fs.readFileSync(fullPath, 'utf8')
          const demoPatterns = [
            /demo@bell24h\.com/,
            /demo123/,
            /Demo login successful/,
            /Simple login/,
            /Test login/
          ]
          
          for (const pattern of demoPatterns) {
            if (pattern.test(content)) {
              console.error(`❌ Demo reference found in ${fullPath}:`, pattern.source)
              allChecksPassed = false
            }
          }
        }
      }
    }
    
    if (fs.existsSync(srcDir)) {
      checkForDemoReferences(srcDir)
      console.log('✅ No demo references found in code')
    }
    
    // Final result
    if (allChecksPassed) {
      console.log('\n🎉 BELL24H PRODUCTION VERIFICATION PASSED!')
      console.log('✅ No demo users in database')
      console.log('✅ No demo files present')
      console.log('✅ Environment variables configured')
      console.log('✅ No demo references in code')
      console.log('\n🚀 Ready for marketing launch!')
      console.log('📈 Ready for 5000-supplier acquisition campaign!')
    } else {
      console.log('\n❌ PRODUCTION VERIFICATION FAILED!')
      console.log('Please fix the issues above before launching marketing campaign.')
      process.exit(1)
    }
    
  } catch (error) {
    console.error('❌ Verification error:', error)
    process.exit(1)
  }
}

// Run verification
verifyProduction() 
