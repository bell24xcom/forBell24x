'use client';

import React, { useState } from 'react';

export default function DataDeletionManager() {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    // Simulate deletion
    setTimeout(() => {
      setIsDeleting(false);
      alert('Data deletion request submitted');
    }, 1000);
  };

  return (
    <div className="p-4 border rounded-lg">
      <h3 className="font-semibold mb-2">Data Deletion</h3>
      <p className="text-sm text-gray-600 mb-4">
        Request deletion of your personal data
      </p>
      <button
        onClick={handleDelete}
        disabled={isDeleting}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
      >
        {isDeleting ? 'Processing...' : 'Request Data Deletion'}
      </button>
    </div>
  );
}

