const { GLOBAL_SEO_CONFIG } = require('./src/data/global-seo-config.ts');

console.log('🌍 Bell24H Global SEO Countries Test\n');
console.log(`Total countries configured: ${Object.keys(GLOBAL_SEO_CONFIG).length}\n`);

// Test for specific countries the user asked about
const testCountries = ['CN', 'HK', 'TW', 'AU', 'AE', 'IN', 'US', 'DE', 'GB', 'JP'];

console.log('Testing specific countries:');
testCountries.forEach(code => {
  const country = GLOBAL_SEO_CONFIG[code];
  if (country) {
    console.log(`✅ ${code}: ${country.name} (${country.currency} ${country.currencySymbol})`);
  } else {
    console.log(`❌ ${code}: Not found`);
  }
});

console.log('\n📊 All available countries:');
Object.entries(GLOBAL_SEO_CONFIG)
  .sort(([, a], [, b]) => a.name.localeCompare(b.name))
  .forEach(([code, country]) => {
    console.log(`${code}: ${country.name} (${country.localSuppliers.toLocaleString()} suppliers)`);
  });

console.log('\n🔍 Countries containing "China", "Hong Kong", "Dubai":');
Object.entries(GLOBAL_SEO_CONFIG)
  .filter(
    ([code, country]) =>
      country.name.toLowerCase().includes('china') ||
      country.name.toLowerCase().includes('hong kong') ||
      country.name.toLowerCase().includes('dubai') ||
      country.metaDescriptionTemplate.toLowerCase().includes('dubai')
  )
  .forEach(([code, country]) => {
    console.log(`${code}: ${country.name}`);
  });
