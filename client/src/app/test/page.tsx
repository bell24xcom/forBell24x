export default function TestPage() {
  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        Bell24h Test Page
      </h1>
      <p className="text-lg text-gray-600 mb-4">
        If you can see this, React is working correctly.
      </p>
      <div className="bg-blue-100 p-4 rounded-lg">
        <h2 className="text-xl font-semibold text-blue-900 mb-2">
          Test Components:
        </h2>
        <ul className="text-blue-800 space-y-1">
          <li>✅ React rendering</li>
          <li>✅ Tailwind CSS</li>
          <li>✅ Next.js routing</li>
          <li>✅ Component structure</li>
        </ul>
      </div>
    </div>
  );
} 
