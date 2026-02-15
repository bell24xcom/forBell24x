import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Suppliers - Bell24h',
  description: 'Verified B2B suppliers and manufacturers'
};

export default function SuppliersPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Verified Suppliers
        </h1>
        
        <div className="mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Search Suppliers</h2>
            <div className="flex gap-4">
              <input 
                type="text" 
                placeholder="Search by company name, product, or location"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Search
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">A</span>
              </div>
              <div>
                <h3 className="font-semibold">ABC Textiles Ltd.</h3>
                <p className="text-sm text-gray-600">Mumbai, Maharashtra</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Leading manufacturer of cotton and synthetic textiles with 20+ years experience
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 font-medium">Verified ✓</span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View Profile
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold">P</span>
              </div>
              <div>
                <h3 className="font-semibold">Pharma Solutions Inc.</h3>
                <p className="text-sm text-gray-600">Hyderabad, Telangana</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Pharmaceutical manufacturing and distribution company
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 font-medium">Verified ✓</span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View Profile
              </button>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-yellow-600 font-bold">F</span>
              </div>
              <div>
                <h3 className="font-semibold">Farm Fresh Co.</h3>
                <p className="text-sm text-gray-600">Punjab, India</p>
              </div>
            </div>
            <p className="text-gray-600 mb-4">
              Agricultural products and organic farming solutions
            </p>
            <div className="flex justify-between items-center">
              <span className="text-sm text-green-600 font-medium">Verified ✓</span>
              <button className="text-blue-600 hover:text-blue-800 font-medium">
                View Profile
              </button>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Load More Suppliers
          </button>
        </div>
      </div>
    </div>
  );
}
