/**
 * Global Sitemap Generator
 *
 * Generates comprehensive sitemaps for all 75+ target countries
 * with localized URLs, categories, suppliers, and proper SEO structure
 */

import fs from 'fs';
import path from 'path';
import { GLOBAL_SEO_CONFIG } from '../data/global-seo-config';
import { ALL_CATEGORIES } from '../data/categories';

interface SitemapEntry {
  url: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
  alternates?: { hreflang: string; href: string }[];
}

class GlobalSitemapGenerator {
  private readonly baseDir: string;
  private readonly countries = Object.values(GLOBAL_SEO_CONFIG);

  constructor(baseDir: string = './public') {
    this.baseDir = baseDir;
  }

  async generateAllSitemaps() {
    console.log('🌍 Generating Global Sitemaps for 75+ Countries...');

    // Create main sitemap index
    await this.generateSitemapIndex();

    // Generate individual country sitemaps
    for (const country of this.countries) {
      await this.generateCountrySitemap(country);
      console.log(`✅ Generated sitemap for ${country.name}`);
    }

    // Generate category sitemaps
    await this.generateCategorySitemaps();

    // Generate supplier sitemaps
    await this.generateSupplierSitemaps();

    // Generate special pages sitemaps
    await this.generateSpecialPagesSitemaps();

    console.log('🎯 Global Sitemap Generation Complete!');
    console.log(`📊 Generated sitemaps for ${this.countries.length} countries`);
    console.log(`📊 Generated sitemaps for ${ALL_CATEGORIES.length} categories`);
  }

  private async generateSitemapIndex() {
    const sitemapEntries: string[] = [];

    // Add main sitemap
    sitemapEntries.push(this.createSitemapEntry('https://bell24h.com/sitemap-main.xml'));

    // Add country sitemaps
    for (const country of this.countries) {
      sitemapEntries.push(
        this.createSitemapEntry(
          `https://${country.domain}/sitemap-${country.code.toLowerCase()}.xml`
        )
      );
    }

    // Add category sitemaps
    sitemapEntries.push(this.createSitemapEntry('https://bell24h.com/sitemap-categories.xml'));

    // Add supplier sitemaps
    sitemapEntries.push(this.createSitemapEntry('https://bell24h.com/sitemap-suppliers.xml'));

    // Add special pages
    sitemapEntries.push(this.createSitemapEntry('https://bell24h.com/sitemap-pages.xml'));

    const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapEntries.join('\n')}
</sitemapindex>`;

    await this.writeSitemap('sitemap.xml', sitemapIndex);
  }

  private async generateCountrySitemap(country: any) {
    const entries: SitemapEntry[] = [];

    // Homepage
    entries.push({
      url: `https://${country.domain}/`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 1.0,
      alternates: this.generateAlternates('/'),
    });

    // Categories page
    entries.push({
      url: `https://${country.domain}/categories`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.9,
      alternates: this.generateAlternates('/categories'),
    });

    // Individual category pages
    for (const category of ALL_CATEGORIES) {
      entries.push({
        url: `https://${country.domain}/categories/${category.id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.8,
        alternates: this.generateAlternates(`/categories/${category.id}`),
      });

      // Subcategory pages
      for (const subcat of category.subcategories) {
        entries.push({
          url: `https://${country.domain}/categories/${
            (category as any).slug || category.name.toLowerCase().replace(/\s+/g, '-')
          }/${subcat.toLowerCase().replace(/\s+/g, '-')}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
          alternates: this.generateAlternates(
            `/categories/${
              (category as any).slug || category.name.toLowerCase().replace(/\s+/g, '-')
            }/${subcat.toLowerCase().replace(/\s+/g, '-')}`
          ),
        });
      }
    }

    // Search pages
    const searchTerms = [
      'suppliers',
      'manufacturers',
      'exporters',
      'wholesale',
      'bulk',
      ...country.topIndustries.map((industry: string) => industry.toLowerCase()),
    ];

    for (const term of searchTerms) {
      entries.push({
        url: `https://${country.domain}/search?q=${encodeURIComponent(term)}`,
        lastmod: new Date().toISOString(),
        changefreq: 'weekly',
        priority: 0.6,
      });
    }

    // RFQ pages
    entries.push({
      url: `https://${country.domain}/rfq`,
      lastmod: new Date().toISOString(),
      changefreq: 'daily',
      priority: 0.8,
    });

    const sitemap = this.generateSitemapXML(entries);
    await this.writeSitemap(`sitemap-${country.code.toLowerCase()}.xml`, sitemap);
  }

  private async generateCategorySitemaps() {
    const entries: SitemapEntry[] = [];

    for (const category of ALL_CATEGORIES) {
      // Main category page
      entries.push({
        url: `https://bell24h.com/categories/${category.id}`,
        lastmod: new Date().toISOString(),
        changefreq: 'daily',
        priority: 0.9,
        alternates: this.generateAlternates(`/categories/${category.id}`),
      });

      // Subcategories
      for (const subcat of category.subcategories) {
        entries.push({
          url: `https://bell24h.com/categories/${category.id}/${subcat
            .toLowerCase()
            .replace(/\s+/g, '-')}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.8,
          alternates: this.generateAlternates(
            `/categories/${category.id}/${subcat.toLowerCase().replace(/\s+/g, '-')}`
          ),
        });
      }

      // Category with country filters
      for (const country of this.countries.slice(0, 20)) {
        // Top 20 countries
        entries.push({
          url: `https://bell24h.com/categories/${category.id}?country=${country.code}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.7,
        });
      }
    }

    const sitemap = this.generateSitemapXML(entries);
    await this.writeSitemap('sitemap-categories.xml', sitemap);
  }

  private async generateSupplierSitemaps() {
    const entries: SitemapEntry[] = [];

    // Generate sample supplier URLs for each country
    for (const country of this.countries) {
      const supplierCount = Math.min(country.localSuppliers, 50000); // Limit per sitemap

      for (let i = 1; i <= Math.min(supplierCount, 1000); i++) {
        entries.push({
          url: `https://${country.domain}/suppliers/${country.code.toLowerCase()}-supplier-${i}`,
          lastmod: new Date().toISOString(),
          changefreq: 'weekly',
          priority: 0.6,
        });
      }
    }

    const sitemap = this.generateSitemapXML(entries);
    await this.writeSitemap('sitemap-suppliers.xml', sitemap);
  }

  private async generateSpecialPagesSitemaps() {
    const entries: SitemapEntry[] = [];

    const specialPages = [
      { path: '/about', priority: 0.8 },
      { path: '/contact', priority: 0.7 },
      { path: '/pricing', priority: 0.8 },
      { path: '/help', priority: 0.6 },
      { path: '/privacy', priority: 0.5 },
      { path: '/terms', priority: 0.5 },
      { path: '/blog', priority: 0.7 },
      { path: '/news', priority: 0.6 },
      { path: '/events', priority: 0.6 },
      { path: '/careers', priority: 0.6 },
    ];

    for (const page of specialPages) {
      entries.push({
        url: `https://bell24h.com${page.path}`,
        lastmod: new Date().toISOString(),
        changefreq: 'monthly',
        priority: page.priority,
        alternates: this.generateAlternates(page.path),
      });
    }

    const sitemap = this.generateSitemapXML(entries);
    await this.writeSitemap('sitemap-pages.xml', sitemap);
  }

  private generateAlternates(path: string) {
    return this.countries.map(country => ({
      hreflang: country.hreflang,
      href: `https://${country.domain}${path}`,
    }));
  }

  private generateSitemapXML(entries: SitemapEntry[]): string {
    const urlEntries = entries.map(entry => {
      let xml = `  <url>
    <loc>${entry.url}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority}</priority>`;

      if (entry.alternates) {
        for (const alt of entry.alternates) {
          xml += `
    <xhtml:link rel="alternate" hreflang="${alt.hreflang}" href="${alt.href}" />`;
        }
      }

      xml += '\n  </url>';
      return xml;
    });

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urlEntries.join('\n')}
</urlset>`;
  }

  private createSitemapEntry(url: string): string {
    return `  <sitemap>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
  </sitemap>`;
  }

  private async writeSitemap(filename: string, content: string) {
    const filepath = path.join(this.baseDir, filename);
    await fs.promises.writeFile(filepath, content, 'utf8');
  }

  // Generate robots.txt for each country
  async generateRobotsTxt() {
    for (const country of this.countries) {
      const robotsContent = `User-agent: *
Allow: /

# Sitemaps
Sitemap: https://${country.domain}/sitemap.xml
Sitemap: https://${country.domain}/sitemap-${country.code.toLowerCase()}.xml

# Crawl-delay
Crawl-delay: 1

# Disallow admin pages
Disallow: /admin/
Disallow: /api/
Disallow: /private/
Disallow: /_next/
Disallow: /tmp/

# Allow important pages
Allow: /categories/
Allow: /suppliers/
Allow: /search/
Allow: /rfq/
Allow: /about/
Allow: /contact/

# Country-specific optimization
# Optimized for ${country.name} market
# Language: ${country.language}
# Currency: ${country.currency}
# Local suppliers: ${country.localSuppliers.toLocaleString()}

# Host
Host: ${country.domain}`;

      await this.writeSitemap(`robots-${country.code.toLowerCase()}.txt`, robotsContent);
    }
  }

  // Generate country-specific manifest.json
  async generateCountryManifests() {
    for (const country of this.countries) {
      const manifest = {
        name: `Bell24H ${country.name} - B2B Marketplace`,
        short_name: `Bell24H ${country.name}`,
        description: `Leading B2B marketplace in ${
          country.name
        } with ${country.localSuppliers.toLocaleString()}+ verified suppliers`,
        start_url: '/',
        display: 'standalone',
        background_color: '#1e40af',
        theme_color: '#1e40af',
        lang: country.language.split(',')[0].trim(),
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      };

      await this.writeSitemap(
        `manifest-${country.code.toLowerCase()}.json`,
        JSON.stringify(manifest, null, 2)
      );
    }
  }
}

// Run the generator
async function runGlobalSitemapGeneration() {
  const generator = new GlobalSitemapGenerator();

  try {
    await generator.generateAllSitemaps();
    await generator.generateRobotsTxt();
    await generator.generateCountryManifests();

    console.log('\n🎉 GLOBAL SEO GENERATION COMPLETE!');
    console.log('📊 Generated files:');
    console.log(`   • Main sitemap index`);
    console.log(`   • ${Object.keys(GLOBAL_SEO_CONFIG).length} country sitemaps`);
    console.log(`   • ${ALL_CATEGORIES.length} category sitemaps`);
    console.log(`   • Supplier sitemaps`);
    console.log(`   • Special pages sitemaps`);
    console.log(`   • ${Object.keys(GLOBAL_SEO_CONFIG).length} robots.txt files`);
    console.log(`   • ${Object.keys(GLOBAL_SEO_CONFIG).length} country manifests`);
  } catch (error) {
    console.error('❌ Error generating global sitemaps:', error);
  }
}

// Export for use
export { GlobalSitemapGenerator, runGlobalSitemapGeneration };

// Run if called directly
if (require.main === module) {
  runGlobalSitemapGeneration();
}
