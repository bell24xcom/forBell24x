// Comprehensive category structure for 50 main categories with 8-9 subcategories each
export interface SubCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  supplierCount: number;
  productCount: number;
  avgRating: number;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  subCategories: SubCategory[];
  totalSuppliers: number;
  totalProducts: number;
  avgRating: number;
  isActive: boolean;
  featured: boolean;
}

export const categories: Category[] = [
  {
    id: 'agriculture',
    name: 'Agriculture',
    slug: 'agriculture',
    description: 'Agricultural equipment, supplies, and farming solutions',
    icon: '🚜',
    color: 'green',
    totalSuppliers: 1250,
    totalProducts: 15600,
    avgRating: 4.6,
    isActive: true,
    featured: true,
    subCategories: [
      { id: 'agriculture-equipment', name: 'Agriculture Equipment', slug: 'agriculture-equipment', description: 'Farm machinery and agricultural tools', icon: '🚜', supplierCount: 180, productCount: 2200, avgRating: 4.7, isActive: true },
      { id: 'fresh-flowers', name: 'Fresh Flowers', slug: 'fresh-flowers', description: 'Fresh flowers and floral arrangements', icon: '🌸', supplierCount: 120, productCount: 1500, avgRating: 4.5, isActive: true },
      { id: 'seeds-saplings', name: 'Seeds & Saplings', slug: 'seeds-saplings', description: 'Agricultural seeds and plant saplings', icon: '🌱', supplierCount: 150, productCount: 1800, avgRating: 4.4, isActive: true },
      { id: 'tractor-parts', name: 'Tractor Parts', slug: 'tractor-parts', description: 'Tractor components and spare parts', icon: '🔧', supplierCount: 100, productCount: 1200, avgRating: 4.6, isActive: true },
      { id: 'animal-feed', name: 'Animal Feed', slug: 'animal-feed', description: 'Livestock and poultry feed products', icon: '🌾', supplierCount: 90, productCount: 1100, avgRating: 4.3, isActive: true },
      { id: 'irrigation-systems', name: 'Irrigation Systems', slug: 'irrigation-systems', description: 'Drip, sprinkler, and irrigation equipment', icon: '💧', supplierCount: 80, productCount: 950, avgRating: 4.5, isActive: true },
      { id: 'fertilizers-pesticides', name: 'Fertilizers & Pesticides', slug: 'fertilizers-pesticides', description: 'Agricultural fertilizers and pest control', icon: '🧪', supplierCount: 110, productCount: 1350, avgRating: 4.2, isActive: true },
      { id: 'organic-farming-tools', name: 'Organic Farming Tools', slug: 'organic-farming-tools', description: 'Organic farming equipment and tools', icon: '🌿', supplierCount: 70, productCount: 850, avgRating: 4.7, isActive: true }
    ]
  }
];

// Helper functions
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

export const getFeaturedCategories = (): Category[] => {
  return categories.filter(category => category.featured);
};