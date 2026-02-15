'use client';

import React, { useState } from 'react';
import { Search, Filter, Edit, Share2, Copy, XCircle, Mic, Video, Upload, Play, PlusCircle } from 'lucide-react';
import UserDashboardLayout from '@/components/dashboard/UserDashboardLayout';

const rfqData = [
  {
    id: 'RFQ001',
    title: 'Procurement of Steel Beams',
    status: 'Active',
    type: 'Text-based',
    submissionDate: '2023-10-26',
    quotes: 5,
    budget: '₹5,00,000',
  },
  {
    id: 'RFQ002',
    title: 'IT Consulting Services',
    status: 'Closed',
    type: 'Video-based',
    submissionDate: '2023-09-15',
    quotes: 2,
    budget: '₹1,50,000',
  },
  {
    id: 'RFQ003',
    title: 'Manufacturing of Custom Parts',
    status: 'Active',
    type: 'Text-based',
    submissionDate: '2023-11-01',
    quotes: 8,
    budget: '₹10,00,000',
  },
  {
    id: 'RFQ004',
    title: 'Digital Marketing Campaign',
    status: 'Active',
    type: 'Video-based',
    submissionDate: '2023-10-20',
    quotes: 3,
    budget: '₹2,00,000',
  },
  {
    id: 'RFQ005',
    title: 'Logistics Partnership for North India',
    status: 'Closed',
    type: 'Text-based',
    submissionDate: '2023-08-01',
    quotes: 10,
    budget: '₹7,50,000',
  },
];

const MyRfqsTable = () => {
  const [filter, setFilter] = useState('All'); // 'All', 'Active', 'Closed', 'Video-based'
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRfqs = rfqData.filter((rfq) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Video-based' && rfq.type === 'Video-based') ||
      (filter === 'Active' && rfq.status === 'Active') ||
      (filter === 'Closed' && rfq.status === 'Closed');

    const matchesSearch = rfq.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        rfq.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getStatusClass = (status) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex flex-col md:flex-row items-center justify-between mb-6 space-y-4 md:space-y-0">
        <h2 className="text-xl font-semibold text-gray-800">My RFQs</h2>
        <div className="flex space-x-2">
          <button className="flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors">
            <Mic size={16} className="mr-2" />
            Submit RFQ (Voice)
          </button>
          <button className="flex items-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition-colors">
            <Video size={16} className="mr-2" />
            Video RFQ Upload
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-between mb-4 space-y-4 sm:space-y-0 sm:space-x-4">
        <div className="relative flex-grow w-full sm:w-auto">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search RFQs..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex space-x-2 w-full sm:w-auto">
          {['All', 'Active', 'Closed', 'Video-based'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                RFQ ID
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Submission Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quotes
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Budget
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRfqs.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-gray-500">No RFQs found matching your criteria.</td>
              </tr>
            ) : (
              filteredRfqs.map((rfq) => (
                <tr key={rfq.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{rfq.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{rfq.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusClass(rfq.status)}`}>
                      {rfq.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {rfq.type === 'Video-based' ? <Video size={16} className="inline mr-1 text-blue-500" /> : null}
                    {rfq.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.submissionDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.quotes}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{rfq.budget}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center space-x-3">
                      <button className="text-blue-600 hover:text-blue-900" title="Edit" aria-label="Edit RFQ">
                        <Edit size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Share" aria-label="Share RFQ">
                        <Share2 size={16} />
                      </button>
                      <button className="text-gray-600 hover:text-gray-900" title="Duplicate" aria-label="Duplicate RFQ">
                        <Copy size={16} />
                      </button>
                      <button className="text-red-600 hover:text-red-900" title="Close" aria-label="Close RFQ">
                        <XCircle size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default function MyRfqsPage() {
  const user = { name: "Rajesh Kumar" }; // Replace with actual user context

  return (
    <UserDashboardLayout user={user}>
      <MyRfqsTable />
    </UserDashboardLayout>
  );
}
