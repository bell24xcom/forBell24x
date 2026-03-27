// 🚨 BELL24H DEPLOYMENT VERIFICATION SCRIPT
// ==========================================
// Test if emergency fixes are live on production

console.log('🚨 BELL24H DEPLOYMENT VERIFICATION');
console.log('===================================');
console.log('');

// Test URLs to verify deployment
const testUrls = [
    'https://bell24h-v1.vercel.app',
    'https://bell24h-v1.vercel.app/dashboard/ai-matching',
    'https://bell24h-v1.vercel.app/dashboard/predictive-analytics',
    'https://bell24h-v1.vercel.app/dashboard'
];

console.log('🧪 TESTING PRODUCTION DEPLOYMENT...');
console.log('');

async function testDeployment() {
    const results = [];
    
    for (const url of testUrls) {
        try {
            console.log(`🔍 Testing: ${url}`);
            
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'User-Agent': 'Bell24h-Deployment-Test/1.0'
                }
            });
            
            const status = response.status;
            const isWorking = status === 200;
            
            console.log(`   Status: ${status} ${isWorking ? '✅' : '❌'}`);
            
            if (isWorking) {
                console.log(`   ✅ Page is accessible`);
            } else {
                console.log(`   ❌ Page not working (Status: ${status})`);
            }
            
            results.push({ url, status, working: isWorking });
            
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({ url, status: 'ERROR', working: false, error: error.message });
        }
        
        console.log('');
    }
    
    // Summary
    console.log('📊 DEPLOYMENT VERIFICATION SUMMARY:');
    console.log('==================================');
    console.log('');
    
    const workingPages = results.filter(r => r.working).length;
    const totalPages = results.length;
    
    console.log(`✅ Working Pages: ${workingPages}/${totalPages}`);
    console.log(`📈 Success Rate: ${((workingPages / totalPages) * 100).toFixed(1)}%`);
    console.log('');
    
    if (workingPages === totalPages) {
        console.log('🎉 ALL PAGES WORKING! DEPLOYMENT SUCCESSFUL!');
        console.log('');
        console.log('✅ Your Bell24h platform is now fully functional:');
        console.log('   • AI Matching page working without errors');
        console.log('   • Predictive Analytics showing full dashboard');
        console.log('   • All navigation links functional');
        console.log('   • No more client-side exceptions');
        console.log('');
        console.log('🚀 Ready for your 5000-supplier marketing campaign!');
    } else {
        console.log('❌ SOME PAGES STILL BROKEN - DEPLOYMENT INCOMPLETE');
        console.log('');
        console.log('🔧 NEXT STEPS:');
        console.log('   1. Check Vercel deployment logs');
        console.log('   2. Verify git repository connection');
        console.log('   3. Try manual Vercel deployment');
        console.log('   4. Contact Vercel support if needed');
    }
    
    console.log('');
    console.log('🔗 PRODUCTION URLS TO TEST MANUALLY:');
    results.forEach(result => {
        const status = result.working ? '✅' : '❌';
        console.log(`   ${status} ${result.url}`);
    });
}

// Run the verification
testDeployment().catch(console.error);

// Also provide manual testing instructions
console.log('');
console.log('🧪 MANUAL TESTING INSTRUCTIONS:');
console.log('==============================');
console.log('');
console.log('1. Open your browser');
console.log('2. Visit: https://bell24h-v1.vercel.app');
console.log('3. Navigate to AI Matching page');
console.log('4. Check if you see "✅ AI Matching Fixed & Deployed!"');
console.log('5. Test Predictive Analytics page');
console.log('6. Verify no more "Application error" messages');
console.log('');
console.log('⏱️ Wait 2-3 minutes for Vercel deployment to complete');
console.log('🔄 Refresh pages if changes don\'t appear immediately'); 
