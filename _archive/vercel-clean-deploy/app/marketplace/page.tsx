import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace - Bell24h',
  description: 'B2B Marketplace for Indian suppliers and buyers'
};

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          B2B Marketplace
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Textiles & Garments</h2>
            <p className="text-gray-600 mb-4">
              Find suppliers for textiles, clothing, and fashion accessories
            </p>
            <a 
              href="/categories/textiles-garments" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Category →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Pharmaceuticals</h2>
            <p className="text-gray-600 mb-4">
              Connect with pharmaceutical manufacturers and suppliers
            </p>
            <a 
              href="/categories/pharmaceuticals" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Category →
            </a>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Agricultural Products</h2>
            <p className="text-gray-600 mb-4">
              Source agricultural products and farming equipment
            </p>
            <a 
              href="/categories/agricultural-products" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Browse Category →
            </a>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <a 
            href="/rfq/create" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create RFQ
          </a>
        </div>
      </div>
    </div>
  );
}
