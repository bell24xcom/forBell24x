import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const CreateRFQForm = () => {
  const [rfqData, setRfqData] = useState({
    title: '',
    description: '',
    budget: '',
    category: '',
    deadline: '',
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setRfqData({ ...rfqData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/rfq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rfqData),
      });
      if (response.ok) {
        const newRfq = await response.json();
        toast.success('RFQ created successfully!');
        router.push(`/rfq/${newRfq.id}`);
      } else {
        toast.error('Failed to create RFQ');
      }
    } catch (error) {
      toast.error('Failed to create RFQ');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        name='title'
        value={rfqData.title}
        onChange={handleChange}
        placeholder='Title'
        required
      />
      <textarea
        name='description'
        value={rfqData.description}
        onChange={handleChange}
        placeholder='Description'
        required
      />
      <input
        name='budget'
        value={rfqData.budget}
        onChange={handleChange}
        placeholder='Budget'
        type='number'
      />
      <input
        name='category'
        value={rfqData.category}
        onChange={handleChange}
        placeholder='Category'
        required
      />
      <input
        name='deadline'
        value={rfqData.deadline}
        onChange={handleChange}
        placeholder='Deadline'
        type='date'
      />
      <button type='submit'>Create RFQ</button>
    </form>
  );
};
