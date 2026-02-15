'use client';
import { Customer, CustomerTracker } from '@/lib/customer-tracker';
import { useEffect, useState } from 'react';

export default function CustomersPage() {
  const [tracker] = useState(new CustomerTracker());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    company: '',
    phone: '',
    email: '',
    service: 'verification' as const,
    amount: 2000,
    status: 'inquiry' as const,
    notes: ''
  });

  useEffect(() => {
    tracker.loadFromLocalStorage();
    setCustomers(tracker.getCustomers());
  }, [tracker]);

  const handleAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    tracker.addCustomer(newCustomer);
    setCustomers(tracker.getCustomers());
    setNewCustomer({
      name: '',
      company: '',
      phone: '',
      email: '',
      service: 'verification',
      amount: 2000,
      status: 'inquiry',
      notes: ''
    });
  };

  const updateCustomerStatus = (id: string, status: Customer['status']) => {
    tracker.updateStatus(id, status);
    setCustomers(tracker.getCustomers());
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Customer Management</h1>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-600">Total Revenue</h3>
          <p className="text-2xl font-bold text-green-600">₹{tracker.getRevenue()}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-600">Active Leads</h3>
          <p className="text-2xl font-bold text-blue-600">{customers.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-sm text-gray-600">Conversion Rate</h3>
          <p className="text-2xl font-bold text-purple-600">{tracker.getConversionRate()}%</p>
        </div>
      </div>

      {/* Add New Customer Form */}
      <div className="bg-white p-6 rounded shadow mb-6">
        <h2 className="text-xl font-semibold mb-4">Add New Customer</h2>
        <form onSubmit={handleAddCustomer} className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Customer Name"
            value={newCustomer.name}
            onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={newCustomer.company}
            onChange={(e) => setNewCustomer({ ...newCustomer, company: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="tel"
            placeholder="Phone"
            value={newCustomer.phone}
            onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={newCustomer.email}
            onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
            className="p-2 border rounded"
          />
          <select
            value={newCustomer.service}
            onChange={(e) => setNewCustomer({ ...newCustomer, service: e.target.value as any })}
            className="p-2 border rounded"
          >
            <option value="verification">Verification Report (₹2000)</option>
            <option value="rfq-writing">RFQ Writing (₹500)</option>
            <option value="featured">Featured Listing (₹1000)</option>
          </select>
          <input
            type="number"
            placeholder="Amount"
            value={newCustomer.amount}
            onChange={(e) => setNewCustomer({ ...newCustomer, amount: parseInt(e.target.value) })}
            className="p-2 border rounded"
            required
          />
          <textarea
            placeholder="Notes"
            value={newCustomer.notes}
            onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
            className="p-2 border rounded col-span-2"
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 col-span-2"
          >
            Add Customer
          </button>
        </form>
      </div>

      {/* Customer List */}
      <div className="bg-white rounded shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Company</th>
              <th className="p-3 text-left">Service</th>
              <th className="p-3 text-left">Amount</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Date</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((customer) => (
              <tr key={customer.id} className="border-t">
                <td className="p-3">{customer.name}</td>
                <td className="p-3">{customer.company}</td>
                <td className="p-3 capitalize">{customer.service.replace('-', ' ')}</td>
                <td className="p-3">₹{customer.amount}</td>
                <td className="p-3">
                  <select
                    value={customer.status}
                    onChange={(e) => updateCustomerStatus(customer.id, e.target.value as Customer['status'])}
                    className="p-1 border rounded text-sm"
                  >
                    <option value="inquiry">Inquiry</option>
                    <option value="quoted">Quoted</option>
                    <option value="paid">Paid</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
                <td className="p-3">{new Date(customer.date).toLocaleDateString()}</td>
                <td className="p-3">
                  <button className="text-blue-500 hover:underline text-sm">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
