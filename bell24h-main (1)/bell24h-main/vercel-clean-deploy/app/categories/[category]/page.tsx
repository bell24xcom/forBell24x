import { Metadata } from 'next';

interface CategoryPageProps {
  params: {
    category: string;
  };
}

const categoryData = {
  'textiles-garments': {
    title: 'Textiles & Garments',
    description: 'Find suppliers for textiles, clothing, and fashion accessories',
    icon: '👕',
    subcategories: ['Cotton Textiles', 'Synthetic Fabrics', 'Garments', 'Fashion Accessories', 'Home Textiles']
  },
  'pharmaceuticals': {
    title: 'Pharmaceuticals',
    description: 'Connect with pharmaceutical manufacturers and suppliers',
    icon: '💊',
    subcategories: ['Generic Medicines', 'API', 'Medical Devices', 'Healthcare Products', 'Veterinary Medicines']
  },
  'agricultural-products': {
    title: 'Agricultural Products',
    description: 'Source agricultural products and farming equipment',
    icon: '🌾',
    subcategories: ['Grains & Cereals', 'Fruits & Vegetables', 'Spices', 'Farming Equipment', 'Organic Products']
  },
  'automotive-parts': {
    title: 'Automotive Parts',
    description: 'Automotive components and spare parts',
    icon: '🚗',
    subcategories: ['Engine Parts', 'Brake Systems', 'Electrical Components', 'Body Parts', 'Accessories']
  },
  'it-services': {
    title: 'IT Services',
    description: 'Information technology services and solutions',
    icon: '💻',
    subcategories: ['Software Development', 'Web Development', 'Mobile Apps', 'Cloud Services', 'IT Consulting']
  },
  'gems-jewelry': {
    title: 'Gems & Jewelry',
    description: 'Precious stones, jewelry, and accessories',
    icon: '💎',
    subcategories: ['Diamonds', 'Gold Jewelry', 'Silver Jewelry', 'Gemstones', 'Jewelry Making Tools']
  },
  'handicrafts': {
    title: 'Handicrafts',
    description: 'Traditional and modern handicraft products',
    icon: '🎨',
    subcategories: ['Wooden Crafts', 'Metal Crafts', 'Textile Crafts', 'Pottery', 'Art & Decor']
  },
  'machinery-equipment': {
    title: 'Machinery & Equipment',
    description: 'Industrial machinery and equipment',
    icon: '⚙️',
    subcategories: ['Manufacturing Equipment', 'Construction Machinery', 'Agricultural Machinery', 'Packaging Equipment', 'Power Tools']
  },
  'chemicals': {
    title: 'Chemicals',
    description: 'Industrial and specialty chemicals',
    icon: '🧪',
    subcategories: ['Industrial Chemicals', 'Specialty Chemicals', 'Agrochemicals', 'Petrochemicals', 'Laboratory Chemicals']
  },
  'food-processing': {
    title: 'Food Processing',
    description: 'Food processing equipment and ingredients',
    icon: '🍽️',
    subcategories: ['Processing Equipment', 'Food Ingredients', 'Packaging Materials', 'Quality Control', 'Storage Solutions']
  },
  'construction': {
    title: 'Construction',
    description: 'Construction materials and services',
    icon: '🏗️',
    subcategories: ['Building Materials', 'Construction Equipment', 'Interior Design', 'Architectural Services', 'Safety Equipment']
  },
  'metals-steel': {
    title: 'Metals & Steel',
    description: 'Metal products and steel manufacturing',
    icon: '🔩',
    subcategories: ['Steel Products', 'Aluminum', 'Copper', 'Iron & Steel', 'Metal Fabrication']
  },
  'plastics': {
    title: 'Plastics',
    description: 'Plastic products and manufacturing',
    icon: '🔄',
    subcategories: ['Plastic Raw Materials', 'Plastic Products', 'Packaging', 'Molding Services', 'Recycling']
  },
  'paper-packaging': {
    title: 'Paper & Packaging',
    description: 'Paper products and packaging solutions',
    icon: '📦',
    subcategories: ['Paper Products', 'Packaging Materials', 'Printing Services', 'Labels & Tags', 'Corrugated Boxes']
  },
  'rubber': {
    title: 'Rubber',
    description: 'Rubber products and manufacturing',
    icon: '🛞',
    subcategories: ['Natural Rubber', 'Synthetic Rubber', 'Rubber Products', 'Tires', 'Rubber Machinery']
  },
  'ceramics': {
    title: 'Ceramics',
    description: 'Ceramic products and manufacturing',
    icon: '🏺',
    subcategories: ['Ceramic Tiles', 'Sanitary Ware', 'Tableware', 'Industrial Ceramics', 'Art Ceramics']
  },
  'glass': {
    title: 'Glass',
    description: 'Glass products and manufacturing',
    icon: '🪟',
    subcategories: ['Flat Glass', 'Container Glass', 'Specialty Glass', 'Glass Products', 'Glass Machinery']
  },
  'wood': {
    title: 'Wood',
    description: 'Wood products and furniture',
    icon: '🪵',
    subcategories: ['Timber', 'Furniture', 'Wooden Crafts', 'Plywood', 'Wood Processing']
  },
  'leather': {
    title: 'Leather',
    description: 'Leather products and manufacturing',
    icon: '👜',
    subcategories: ['Leather Goods', 'Footwear', 'Bags & Accessories', 'Leather Raw Materials', 'Leather Machinery']
  }
};

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const category = categoryData[params.category as keyof typeof categoryData];

  return {
    title: `${category?.title || 'Category'} - Bell24h`,
    description: category?.description || 'B2B marketplace category'
  };
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const category = categoryData[params.category as keyof typeof categoryData];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Category Not Found</h1>
          <p className="text-gray-600 mb-6">The requested category does not exist.</p>
          <a href="/marketplace" className="text-blue-600 hover:text-blue-800">
            Back to Marketplace
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center mb-4">
            <span className="text-4xl mr-4">{category.icon}</span>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{category.title}</h1>
              <p className="text-gray-600 mt-2">{category.description}</p>
            </div>
          </div>

          <div className="flex gap-4">
            <a
              href="/rfq/create"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create RFQ
            </a>
            <a
              href="/suppliers"
              className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Browse Suppliers
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {category.subcategories.map((subcategory, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-lg font-semibold mb-2">{subcategory}</h3>
              <p className="text-gray-600 mb-4">
                Find suppliers and products in {subcategory.toLowerCase()}
              </p>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                Explore →
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Featured Suppliers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-blue-600 font-bold">A</span>
                </div>
                <div>
                  <h4 className="font-semibold">ABC {category.title}</h4>
                  <p className="text-sm text-gray-600">Verified Supplier</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Leading supplier in {category.title.toLowerCase()} with 10+ years experience
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Profile →
              </button>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-green-600 font-bold">B</span>
                </div>
                <div>
                  <h4 className="font-semibold">Best {category.title}</h4>
                  <p className="text-sm text-gray-600">Premium Supplier</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                High-quality {category.title.toLowerCase()} products and services
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Profile →
              </button>
            </div>

            <div className="border border-gray-200 p-4 rounded-lg">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                  <span className="text-yellow-600 font-bold">C</span>
                </div>
                <div>
                  <h4 className="font-semibold">Creative {category.title}</h4>
                  <p className="text-sm text-gray-600">Innovative Solutions</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                Innovative {category.title.toLowerCase()} solutions and products
              </p>
              <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                View Profile →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
