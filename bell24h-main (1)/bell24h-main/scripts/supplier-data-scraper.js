/**
 * Supplier Data Scraper
 * Item 22: Scrape supplier data from IndiaMART/Justdial
 * 
 * Note: This is a template. Actual scraping requires:
 * - Respecting robots.txt
 * - Rate limiting
 * - Legal compliance
 * - Data privacy
 */

const axios = require('axios');
const cheerio = require('cheerio');

/**
 * Scrape IndiaMART supplier data
 * Target: 50,000 profiles
 */
async function scrapeIndiaMART(category, maxPages = 100) {
  const suppliers = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      // Respect rate limits
      await new Promise(resolve => setTimeout(resolve, 2000)); // 2 second delay
      
      const url = `https://www.indiamart.com/search.php?q=${category}&page=${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bell24hBot/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.supplier-card').each((i, elem) => {
        const supplier = {
          name: $(elem).find('.company-name').text().trim(),
          category: category,
          city: $(elem).find('.location').text().trim(),
          phone: $(elem).find('.phone').text().trim(),
          email: $(elem).find('.email').text().trim(),
          website: $(elem).find('.website').attr('href'),
          description: $(elem).find('.description').text().trim(),
          source: 'IndiaMART',
          scrapedAt: new Date().toISOString()
        };
        
        if (supplier.name && supplier.phone) {
          suppliers.push(supplier);
        }
      });
      
      console.log(`Scraped page ${page}: ${suppliers.length} suppliers so far`);
      
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error.message);
      break;
    }
  }
  
  return suppliers;
}

/**
 * Scrape Justdial supplier data
 */
async function scrapeJustdial(category, city, maxPages = 100) {
  const suppliers = [];
  
  for (let page = 1; page <= maxPages; page++) {
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const url = `https://www.justdial.com/${city}/${category}/page-${page}`;
      const response = await axios.get(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; Bell24hBot/1.0)'
        }
      });
      
      const $ = cheerio.load(response.data);
      
      $('.result-box').each((i, elem) => {
        const supplier = {
          name: $(elem).find('.store-name').text().trim(),
          category: category,
          city: city,
          phone: $(elem).find('.contact-number').text().trim(),
          address: $(elem).find('.address').text().trim(),
          rating: $(elem).find('.rating').text().trim(),
          source: 'Justdial',
          scrapedAt: new Date().toISOString()
        };
        
        if (supplier.name && supplier.phone) {
          suppliers.push(supplier);
        }
      });
      
      console.log(`Scraped page ${page}: ${suppliers.length} suppliers so far`);
      
    } catch (error) {
      console.error(`Error scraping page ${page}:`, error.message);
      break;
    }
  }
  
  return suppliers;
}

/**
 * Validate and clean scraped data
 */
function validateSupplierData(suppliers) {
  return suppliers.filter(supplier => {
    // Must have name and phone
    if (!supplier.name || !supplier.phone) return false;
    
    // Clean phone number
    supplier.phone = supplier.phone.replace(/\D/g, '');
    if (supplier.phone.length < 10) return false;
    
    // Clean email if present
    if (supplier.email) {
      supplier.email = supplier.email.toLowerCase().trim();
      if (!supplier.email.includes('@')) delete supplier.email;
    }
    
    // Set default category if missing
    if (!supplier.category) supplier.category = 'General';
    
    return true;
  });
}

/**
 * Bulk import suppliers to database
 */
async function importSuppliersToDatabase(suppliers) {
  // TODO: Implement Prisma bulk insert
  // This would use Prisma to insert suppliers into scrapedCompany table
  console.log(`Ready to import ${suppliers.length} suppliers`);
  return suppliers;
}

module.exports = {
  scrapeIndiaMART,
  scrapeJustdial,
  validateSupplierData,
  importSuppliersToDatabase
};

