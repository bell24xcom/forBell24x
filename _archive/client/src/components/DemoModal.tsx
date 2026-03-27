'use client';
import { X } from 'lucide-react';
import { useState } from 'react';

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [formData, setFormData] = useState({
    companyName: '',
    email: '',
    phone: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log('Demo request:', formData);
    alert('Thank you! We will contact you within 24 hours to schedule your demo.');
    onClose();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-lg max-w-md w-full p-6'>
        <div className='flex justify-between items-center mb-4'>
          <h3 className='text-xl font-bold'>Book a Demo</h3>
          <button onClick={onClose} className='text-gray-500 hover:text-gray-700'>
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <input
            type='text'
            name='companyName'
            placeholder='Company Name'
            value={formData.companyName}
            onChange={handleChange}
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <input
            type='email'
            name='email'
            placeholder='Business Email'
            value={formData.email}
            onChange={handleChange}
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <input
            type='tel'
            name='phone'
            placeholder='Phone Number'
            value={formData.phone}
            onChange={handleChange}
            className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            required
          />
          <button
            type='submit'
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition'
          >
            Schedule Demo
          </button>
        </form>
      </div>
    </div>
  );
}
