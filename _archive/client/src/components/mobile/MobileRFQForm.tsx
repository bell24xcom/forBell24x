'use client';

import React, { useState } from 'react';

interface RFQFormData {
  title: string;
  description: string;
  category: string;
  quantity: string;
  budget: string;
  deadline: string;
  requirements: string[];
  images: string[];
  voiceRecording?: string;
}

interface MobileRFQFormProps {
  onSubmit: (data: RFQFormData) => void;
  onSave: (data: RFQFormData) => void;
  initialData?: Partial<RFQFormData>;
}

const categories = [
  'Electronics & Components',
  'Manufacturing & Machinery',
  'Textiles & Apparel',
  'Chemicals & Materials',
  'Food & Beverage',
  'Pharmaceuticals',
  'Automotive',
  'Construction',
  'Energy & Power',
  'Healthcare & Medical',
];

export default function MobileRFQForm({ onSubmit, onSave, initialData = {} }: MobileRFQFormProps) {
  const [formData, setFormData] = useState<RFQFormData>({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    deadline: '',
    requirements: [],
    images: [],
    ...initialData,
  });

  const [newRequirement, setNewRequirement] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const handleInputChange = (field: keyof RFQFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addRequirement = () => {
    if (newRequirement.trim()) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()],
      }));
      setNewRequirement('');
    }
  };

  const removeRequirement = (index: number) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index),
    }));
  };

  const takePhoto = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.capture = 'environment';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result],
          }));
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  const pickImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e: any) => {
      const files = Array.from(e.target.files) as File[];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = e => {
          const result = e.target?.result as string;
          setFormData(prev => ({
            ...prev,
            images: [...prev.images, result],
          }));
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  };

  const startVoiceRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      mediaRecorder.ondataavailable = event => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setFormData(prev => ({ ...prev, voiceRecording: url }));
      };

      mediaRecorder.start();
      setIsRecording(true);

      // Stop recording after 30 seconds
      setTimeout(() => {
        mediaRecorder.stop();
        stream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
      }, 30000);
    } catch (error) {
      alert('Failed to access microphone');
    }
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.description || !formData.category) {
      alert('Please fill in all required fields');
      return;
    }

    onSubmit(formData);
  };

  const handleSave = () => {
    onSave(formData);
    alert('RFQ saved as draft');
  };

  return (
    <div className='max-w-md mx-auto p-4 space-y-4'>
      <h2 className='text-xl font-bold mb-4'>Create RFQ</h2>

      <div>
        <label className='block text-sm font-medium mb-1'>Title *</label>
        <input
          type='text'
          value={formData.title}
          onChange={e => handleInputChange('title', e.target.value)}
          className='w-full p-2 border rounded'
          placeholder='Enter RFQ title'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Description *</label>
        <textarea
          value={formData.description}
          onChange={e => handleInputChange('description', e.target.value)}
          className='w-full p-2 border rounded'
          rows={4}
          placeholder='Describe your requirements'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Category *</label>
        <select
          value={formData.category}
          onChange={e => handleInputChange('category', e.target.value)}
          className='w-full p-2 border rounded'
        >
          <option value=''>Select category</option>
          {categories.map(category => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className='grid grid-cols-2 gap-4'>
        <div>
          <label className='block text-sm font-medium mb-1'>Quantity</label>
          <input
            type='number'
            value={formData.quantity}
            onChange={e => handleInputChange('quantity', e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='Enter quantity'
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1'>Budget</label>
          <input
            type='number'
            value={formData.budget}
            onChange={e => handleInputChange('budget', e.target.value)}
            className='w-full p-2 border rounded'
            placeholder='Enter budget'
          />
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Deadline</label>
        <input
          type='date'
          value={formData.deadline}
          onChange={e => handleInputChange('deadline', e.target.value)}
          className='w-full p-2 border rounded'
        />
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Requirements</label>
        <div className='flex gap-2 mb-2'>
          <input
            type='text'
            value={newRequirement}
            onChange={e => setNewRequirement(e.target.value)}
            className='flex-1 p-2 border rounded'
            placeholder='Add requirement'
          />
          <button onClick={addRequirement} className='px-4 py-2 bg-blue-500 text-white rounded'>
            Add
          </button>
        </div>
        <div className='space-y-1'>
          {formData.requirements.map((req, index) => (
            <div key={index} className='flex justify-between items-center p-2 bg-gray-100 rounded'>
              <span>{req}</span>
              <button onClick={() => removeRequirement(index)} className='text-red-500'>
                Remove
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Images</label>
        <div className='flex gap-2 mb-2'>
          <button onClick={takePhoto} className='px-4 py-2 bg-green-500 text-white rounded'>
            Take Photo
          </button>
          <button onClick={pickImage} className='px-4 py-2 bg-blue-500 text-white rounded'>
            Pick Image
          </button>
        </div>
        <div className='grid grid-cols-3 gap-2'>
          {formData.images.map((image, index) => (
            <img
              key={index}
              src={image}
              alt={`Image ${index + 1}`}
              className='w-full h-20 object-cover rounded'
            />
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-medium mb-1'>Voice Recording</label>
        <button
          onClick={startVoiceRecording}
          disabled={isRecording}
          className={`w-full p-2 rounded ${isRecording ? 'bg-gray-400' : 'bg-red-500 text-white'}`}
        >
          {isRecording ? 'Recording...' : 'Start Voice Recording'}
        </button>
        {formData.voiceRecording && (
          <audio controls className='w-full mt-2'>
            <source src={formData.voiceRecording} type='audio/webm' />
          </audio>
        )}
      </div>

      <div className='flex gap-2'>
        <button onClick={handleSave} className='flex-1 px-4 py-2 bg-gray-500 text-white rounded'>
          Save Draft
        </button>
        <button onClick={handleSubmit} className='flex-1 px-4 py-2 bg-blue-500 text-white rounded'>
          Submit RFQ
        </button>
      </div>
    </div>
  );
}
