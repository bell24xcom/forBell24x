'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function SuppliersExportersPage() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('all');

  const countries = [
    { value: 'all', label: 'All Countries' },
    { value: 'usa', label: 'United States' },
    { value: 'europe', label: 'Europe' },
    { value: 'asia', label: 'Asia' },
    { value: 'africa', label: 'Africa' },
    { value: 'australia', label: 'Australia' }
  ];

  useEffect(() => {
    fetchExportSuppliers();
  }, [searchTerm, selectedCountry]);

  const fetchExportSuppliers = async () => {
    setLoading(true);
    try {
      // Mock data for export suppliers
      const mockSuppliers = [
        {
          id: '1',
          name: 'Global Steel Exports',
          company: 'SteelCo International',
          location: 'Mumbai, India',
          exportCountries: ['USA', 'Germany', 'Japan'],
          certifications: ['ISO 9001', 'CE Mark', 'BIS Certified'],
          rating: 4.8,
          verified: true,
          products: ['Steel Pipes', 'Steel Sheets', 'Steel Rods']
        },
        {
          id: '2',
          name: 'Textile World Exports',
          company: 'Fabric Global',
          location: 'Surat, India',
          exportCountries: ['USA', 'UK', 'Canada'],
          certifications: ['OEKO-TEX', 'GOTS', 'ISO 14001'],
          rating: 4.6,
          verified: true,
          products: ['Cotton Fabric', 'Silk Fabric', 'Polyester Fabric']
        }
      ];
      
      setSuppliers(mockSuppliers);
    } catch (error) {
      console.error('Error fetching export suppliers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <section className="bg-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Export Suppliers</h1>
            <p className="text-lg text-gray-600 mb-8">
              Connect with verified export suppliers for international trade
            </p>
            
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search export suppliers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={selectedCountry}
                onChange={(e) => setSelectedCountry(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {countries.map(country => (
                  <option key={country.value} value={country.value}>{country.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Export Suppliers Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            ) : suppliers.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {suppliers.map((supplier) => (
                  <div key={supplier.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">{supplier.company}</h3>
                        <p className="text-gray-600">{supplier.name}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        {supplier.verified && (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">
                            Verified Exporter
                          </span>
                        )}
                        <div className="flex items-center">
                          <span className="text-yellow-400">★</span>
                          <span className="text-sm text-gray-600 ml-1">{supplier.rating}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {supplier.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Export Countries:</span> {supplier.exportCountries.join(', ')}
                      </p>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Certifications:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.certifications.map((cert, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm font-medium text-gray-700 mb-2">Products:</p>
                      <div className="flex flex-wrap gap-1">
                        {supplier.products.map((product, index) => (
                          <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">
                            {product}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                      View Export Profile
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="text-gray-400 text-6xl mb-4">🌍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No export suppliers found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}