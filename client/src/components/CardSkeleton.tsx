export function CardSkeleton() {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
} 
