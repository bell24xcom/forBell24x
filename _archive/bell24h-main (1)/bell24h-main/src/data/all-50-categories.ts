export interface Category {
  id: number;
  name: string;
  slug: string;
  icon: string;
  description: string;
  rfqCount?: number;
  subcategories?: string[];
}

export const ALL_50_CATEGORIES: Category[] = [
  { id: 1, name: 'Agriculture & Food Products', slug: 'agriculture-food', icon: '🌾', description: 'Farm produce, food items, agricultural equipment', rfqCount: 234 },
  { id: 2, name: 'Apparel & Clothing', slug: 'apparel-clothing', icon: '👕', description: 'Garments, textiles, fashion accessories', rfqCount: 189 },
  { id: 3, name: 'Automotive & Vehicles', slug: 'automotive', icon: '🚗', description: 'Cars, bikes, parts, accessories', rfqCount: 567 },
  { id: 4, name: 'Building & Construction', slug: 'construction', icon: '🏗️', description: 'Construction materials, tools, equipment', rfqCount: 423 },
  { id: 5, name: 'Chemicals & Pharmaceuticals', slug: 'chemicals-pharma', icon: '⚗️', description: 'Industrial chemicals, medicines, lab equipment', rfqCount: 312 },
  { id: 6, name: 'Electronics & Electricals', slug: 'electronics', icon: '⚡', description: 'Electronic components, electrical equipment', rfqCount: 678 },
  { id: 7, name: 'Furniture & Home Decor', slug: 'furniture', icon: '🛋️', description: 'Furniture, home furnishings, decor items', rfqCount: 156 },
  { id: 8, name: 'Industrial Machinery', slug: 'machinery', icon: '⚙️', description: 'Manufacturing equipment, industrial tools', rfqCount: 445 },
  { id: 9, name: 'IT & Software', slug: 'it-software', icon: '💻', description: 'Software, IT services, tech solutions', rfqCount: 523 },
  { id: 10, name: 'Packaging & Printing', slug: 'packaging', icon: '📦', description: 'Packaging materials, printing services', rfqCount: 289 },
  { id: 11, name: 'Plastics & Polymers', slug: 'plastics', icon: '🔷', description: 'Plastic products, polymer materials', rfqCount: 198 },
  { id: 12, name: 'Steel & Metals', slug: 'steel-metals', icon: '🔩', description: 'Steel products, metal components', rfqCount: 534 },
  { id: 13, name: 'Textiles & Fabrics', slug: 'textiles', icon: '🧵', description: 'Fabrics, textile materials, threads', rfqCount: 267 },
  { id: 14, name: 'Healthcare & Medical', slug: 'healthcare', icon: '🏥', description: 'Medical equipment, healthcare supplies', rfqCount: 389 },
  { id: 15, name: 'Sports & Fitness', slug: 'sports-fitness', icon: '⚽', description: 'Sports equipment, fitness gear', rfqCount: 145 },
  { id: 16, name: 'Office Supplies', slug: 'office-supplies', icon: '📎', description: 'Stationery, office equipment, supplies', rfqCount: 223 },
  { id: 17, name: 'Toys & Games', slug: 'toys-games', icon: '🎮', description: 'Toys, games, entertainment products', rfqCount: 178 },
  { id: 18, name: 'Beauty & Personal Care', slug: 'beauty-personal-care', icon: '💄', description: 'Cosmetics, personal care products', rfqCount: 234 },
  { id: 19, name: 'Jewelry & Accessories', slug: 'jewelry', icon: '💎', description: 'Jewelry, fashion accessories', rfqCount: 167 },
  { id: 20, name: 'Books & Stationery', slug: 'books-stationery', icon: '📚', description: 'Books, educational materials, stationery', rfqCount: 198 },
  { id: 21, name: 'Baby & Kids Products', slug: 'baby-kids', icon: '👶', description: 'Baby products, kids items, toys', rfqCount: 212 },
  { id: 22, name: 'Pet Supplies', slug: 'pet-supplies', icon: '🐕', description: 'Pet food, pet care products', rfqCount: 134 },
  { id: 23, name: 'Home Appliances', slug: 'home-appliances', icon: '��', description: 'Kitchen appliances, home electronics', rfqCount: 345 },
  { id: 24, name: 'Lighting & Electrical', slug: 'lighting', icon: '💡', description: 'Lights, electrical fixtures, bulbs', rfqCount: 289 },
  { id: 25, name: 'Security & Surveillance', slug: 'security', icon: '🔒', description: 'Security systems, CCTV, alarms', rfqCount: 267 },
  { id: 26, name: 'Solar & Renewable Energy', slug: 'solar-energy', icon: '☀️', description: 'Solar panels, renewable energy products', rfqCount: 312 },
  { id: 27, name: 'Tools & Hardware', slug: 'tools-hardware', icon: '🔨', description: 'Hand tools, power tools, hardware', rfqCount: 423 },
  { id: 28, name: 'Pipes & Plumbing', slug: 'plumbing', icon: '🚰', description: 'Pipes, plumbing fixtures, fittings', rfqCount: 298 },
  { id: 29, name: 'Paints & Coatings', slug: 'paints-coatings', icon: '🎨', description: 'Paints, coatings, surface treatments', rfqCount: 234 },
  { id: 30, name: 'Glass & Ceramics', slug: 'glass-ceramics', icon: '��', description: 'Glass products, ceramic items', rfqCount: 189 },
  { id: 31, name: 'Rubber Products', slug: 'rubber', icon: '⚫', description: 'Rubber components, elastomers', rfqCount: 167 },
  { id: 32, name: 'Leather Products', slug: 'leather', icon: '👜', description: 'Leather goods, accessories', rfqCount: 145 },
  { id: 33, name: 'Paper & Pulp', slug: 'paper-pulp', icon: '📄', description: 'Paper products, pulp materials', rfqCount: 198 },
  { id: 34, name: 'Food Processing Equipment', slug: 'food-processing', icon: '🍲', description: 'Food processing machinery, equipment', rfqCount: 267 },
  { id: 35, name: 'Bakery & Confectionery', slug: 'bakery', icon: '🍰', description: 'Bakery items, confectionery products', rfqCount: 178 },
  { id: 36, name: 'Beverages & Drinks', slug: 'beverages', icon: '🥤', description: 'Drinks, beverages, liquid products', rfqCount: 223 },
  { id: 37, name: 'Organic Products', slug: 'organic', icon: '🌱', description: 'Organic food, natural products', rfqCount: 289 },
  { id: 38, name: 'Spices & Herbs', slug: 'spices-herbs', icon: '🌶️', description: 'Spices, herbs, seasonings', rfqCount: 156 },
  { id: 39, name: 'Seafood & Aquaculture', slug: 'seafood', icon: '🐟', description: 'Seafood products, aquaculture', rfqCount: 134 },
  { id: 40, name: 'Dairy Products', slug: 'dairy', icon: '🥛', description: 'Milk, cheese, dairy items', rfqCount: 212 },
  { id: 41, name: 'Meat & Poultry', slug: 'meat-poultry', icon: '🍖', description: 'Meat products, poultry items', rfqCount: 198 },
  { id: 42, name: 'Fruits & Vegetables', slug: 'fruits-vegetables', icon: '🍎', description: 'Fresh fruits, vegetables', rfqCount: 267 },
  { id: 43, name: 'Grains & Cereals', slug: 'grains-cereals', icon: '🌾', description: 'Grains, cereals, pulses', rfqCount: 234 },
  { id: 44, name: 'Oil & Lubricants', slug: 'oil-lubricants', icon: '🛢️', description: 'Industrial oils, lubricants', rfqCount: 312 },
  { id: 45, name: 'Fertilizers & Pesticides', slug: 'fertilizers', icon: '🧪', description: 'Agricultural chemicals, fertilizers', rfqCount: 223 },
  { id: 46, name: 'Seeds & Plants', slug: 'seeds-plants', icon: '🌱', description: 'Seeds, plants, saplings', rfqCount: 189 },
  { id: 47, name: 'Garden & Landscaping', slug: 'garden-landscaping', icon: '🌳', description: 'Garden tools, landscaping supplies', rfqCount: 167 },
  { id: 48, name: 'Waste Management', slug: 'waste-management', icon: '♻️', description: 'Waste disposal, recycling services', rfqCount: 145 },
  { id: 49, name: 'Logistics & Transportation', slug: 'logistics', icon: '🚛', description: 'Transport services, logistics', rfqCount: 423 },
  { id: 50, name: 'Event & Exhibition', slug: 'event-exhibition', icon: '🎪', description: 'Event supplies, exhibition materials', rfqCount: 178 },
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return ALL_50_CATEGORIES.find((cat) => cat.slug === slug);
}

export function getCategoryById(id: number): Category | undefined {
  return ALL_50_CATEGORIES.find((cat) => cat.id === id);
}

export function searchCategories(query: string): Category[] {
  const lowerQuery = query.toLowerCase();
  return ALL_50_CATEGORIES.filter(
    (cat) =>
      cat.name.toLowerCase().includes(lowerQuery) ||
      cat.description.toLowerCase().includes(lowerQuery)
  );
}
