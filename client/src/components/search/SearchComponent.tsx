import { useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export const SearchComponent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(
        `/api/suppliers?q=${encodeURIComponent(searchQuery)}&category=${encodeURIComponent(
          category
        )}`
      );
      const data = await response.json();
      setResults(data.suppliers);
      router.push(`/search-results?q=${searchQuery}&category=${category}`);
    } catch (error) {
      toast.error('Search failed');
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSearch}>
      <input
        value={searchQuery}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
        placeholder='Search suppliers...'
      />
      <input
        value={category}
        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCategory(e.target.value)}
        placeholder='Category'
      />
      <button type='submit' disabled={loading}>
        Search
      </button>
      {loading && <div>Loading...</div>}
      <ul>
        {results.map((supplier: any) => (
          <li key={supplier.id}>
            {supplier.name} ({supplier.companyName})
          </li>
        ))}
      </ul>
    </form>
  );
};
