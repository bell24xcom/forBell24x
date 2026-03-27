const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');

async function runLighthouse() {
  console.log('🚀 Starting Lighthouse Performance Test...');

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless'] });
  const options = {
    logLevel: 'info',
    output: 'html',
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
    port: chrome.port,
  };

  try {
    const runnerResult = await lighthouse('http://localhost:3000', options);

    console.log('\n📊 Lighthouse Results:');
    console.log('=====================');
    console.log(
      'Performance:',
      Math.round(runnerResult.lhr.categories.performance.score * 100) + '%'
    );
    console.log(
      'Accessibility:',
      Math.round(runnerResult.lhr.categories.accessibility.score * 100) + '%'
    );
    console.log(
      'Best Practices:',
      Math.round(runnerResult.lhr.categories['best-practices'].score * 100) + '%'
    );
    console.log('SEO:', Math.round(runnerResult.lhr.categories.seo.score * 100) + '%');

    // Performance thresholds
    const performance = runnerResult.lhr.categories.performance.score * 100;
    const accessibility = runnerResult.lhr.categories.accessibility.score * 100;
    const bestPractices = runnerResult.lhr.categories['best-practices'].score * 100;
    const seo = runnerResult.lhr.categories.seo.score * 100;

    console.log('\n🎯 Performance Assessment:');
    if (performance >= 90) {
      console.log('✅ Performance: EXCELLENT (>90%)');
    } else if (performance >= 80) {
      console.log('✅ Performance: GOOD (80-90%)');
    } else if (performance >= 60) {
      console.log('⚠️ Performance: NEEDS IMPROVEMENT (60-80%)');
    } else {
      console.log('❌ Performance: POOR (<60%)');
    }

    if (accessibility >= 90) {
      console.log('✅ Accessibility: EXCELLENT (>90%)');
    } else if (accessibility >= 80) {
      console.log('✅ Accessibility: GOOD (80-90%)');
    } else {
      console.log('⚠️ Accessibility: NEEDS IMPROVEMENT (<80%)');
    }

    if (bestPractices >= 90) {
      console.log('✅ Best Practices: EXCELLENT (>90%)');
    } else if (bestPractices >= 80) {
      console.log('✅ Best Practices: GOOD (80-90%)');
    } else {
      console.log('⚠️ Best Practices: NEEDS IMPROVEMENT (<80%)');
    }

    if (seo >= 90) {
      console.log('✅ SEO: EXCELLENT (>90%)');
    } else if (seo >= 80) {
      console.log('✅ SEO: GOOD (80-90%)');
    } else {
      console.log('⚠️ SEO: NEEDS IMPROVEMENT (<80%)');
    }

    const overallScore = (performance + accessibility + bestPractices + seo) / 4;
    console.log(`\n🏆 Overall Score: ${Math.round(overallScore)}%`);

    if (overallScore >= 85) {
      console.log('🎉 BELL24H Platform Performance: PRODUCTION READY!');
    } else if (overallScore >= 70) {
      console.log('✅ BELL24H Platform Performance: GOOD - Minor optimizations needed');
    } else {
      console.log('⚠️ BELL24H Platform Performance: NEEDS OPTIMIZATION');
    }
  } catch (error) {
    console.error('❌ Lighthouse test failed:', error.message);
  } finally {
    await chrome.kill();
  }
}

runLighthouse().catch(console.error);
