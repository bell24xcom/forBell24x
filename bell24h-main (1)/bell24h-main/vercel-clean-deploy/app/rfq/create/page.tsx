import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Create RFQ - Bell24h',
  description: 'Create Request for Quotation'
};

export default function CreateRFQPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Create Request for Quotation (RFQ)
        </h1>
        
        <div className="max-w-2xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Category
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Category</option>
                  <option value="textiles-garments">Textiles & Garments</option>
                  <option value="pharmaceuticals">Pharmaceuticals</option>
                  <option value="agricultural-products">Agricultural Products</option>
                  <option value="automotive-parts">Automotive Parts</option>
                  <option value="it-services">IT Services</option>
                  <option value="gems-jewelry">Gems & Jewelry</option>
                  <option value="handicrafts">Handicrafts</option>
                  <option value="machinery-equipment">Machinery & Equipment</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="food-processing">Food Processing</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product/Service Description
                </label>
                <textarea 
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe the product or service you need..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantity
                  </label>
                  <input 
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter quantity"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Unit
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Select Unit</option>
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="tons">Tons</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="hours">Hours</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Budget Range (INR)
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <input 
                    type="number"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Minimum"
                  />
                  <input 
                    type="number"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Maximum"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Timeline
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="">Select Timeline</option>
                  <option value="1-week">Within 1 week</option>
                  <option value="2-weeks">Within 2 weeks</option>
                  <option value="1-month">Within 1 month</option>
                  <option value="2-months">Within 2 months</option>
                  <option value="3-months">Within 3 months</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Requirements
                </label>
                <textarea 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Any specific requirements, certifications, or preferences..."
                />
              </div>
              
              <div className="flex gap-4">
                <button 
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Submit RFQ
                </button>
                <button 
                  type="button"
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Save Draft
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
