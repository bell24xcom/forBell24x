export default function AdminHome() {
  return (
    <div className="min-h-screen bg-[#0a1128] text-white p-8">
      <h1 className="text-5xl font-black mb-6 text-cyan-400">BELL Admin Dashboard</h1>
      <p className="text-xl text-gray-300 mb-8">Welcome to your command center</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <a href="/admin/dashboard" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p className="text-gray-400">Platform overview & metrics</p>
        </a>
        <a href="/admin/crm" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">CRM</h2>
          <p className="text-gray-400">Customer relationship management</p>
        </a>
        <a href="/admin/monitoring" className="bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl p-6 hover:border-cyan-500 transition">
          <h2 className="text-2xl font-bold mb-2">Monitoring</h2>
          <p className="text-gray-400">System & project monitoring</p>
        </a>
      </div>
    </div>
  );
}

