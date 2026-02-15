export default function ComingSoonBanner({ title = 'Coming Soon' }: { title?: string }) {
  return (
    <div className="flex items-center justify-center h-64 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
      <div className="text-center text-white">
        <h2 className="text-3xl font-bold mb-2">{title}</h2>
        <p className="text-lg">🚀 Coming Soon - Stay Tuned!</p>
      </div>
    </div>
  );
}