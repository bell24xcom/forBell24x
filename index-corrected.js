import { useState, useEffect } from "react"
import Link from "next/link"

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState("all")
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Mock RFQ data - 10 examples
  const mockRFQs = [
    {
      id: 1,
      type: "voice",
      title: "Steel Pipes - 500 units required",
      description: "Need galvanized steel pipes for construction project. Must meet IS standards.",
      location: "Mumbai",
      budget: "₹2.5L - ₹3.5L",
      time: "15m ago",
      quotesCount: 12,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      id: 2,
      type: "text",
      title: "Industrial Chemicals - Bulk Order",
      description: "Looking for caustic soda, hydrochloric acid, and sodium hypochlorite suppliers.",
      location: "Navi Mumbai",
      budget: "₹50L - ₹75L",
      time: "1h ago",
      quotesCount: 8
    },
    {
      id: 3,
      type: "video",
      title: "Copper Wire - 1000 meters",
      description: "Need flexible copper wire for electrical installations. Check video for specifications.",
      location: "Delhi",
      budget: "₹8L - ₹12L",
      time: "2h ago",
      quotesCount: 15,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    },
    {
      id: 4,
      type: "voice",
      title: "Packaging Materials - Cardboard Boxes",
      description: "Monthly requirement of 10,000 corrugated boxes. Various sizes needed.",
      location: "Pune",
      budget: "₹1.2L - ₹1.8L",
      time: "3h ago",
      quotesCount: 6,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
      id: 5,
      type: "text",
      title: "Raw Cotton - 5000 kg",
      description: "Grade A raw cotton for textile manufacturing. Delivery to factory required.",
      location: "Ahmedabad",
      budget: "₹15L - ₹20L",
      time: "4h ago",
      quotesCount: 10
    },
    {
      id: 6,
      type: "video",
      title: "CNC Machine Parts",
      description: "Custom machined parts as per drawing. Video shows exact specifications.",
      location: "Bangalore",
      budget: "₹3L - ₹5L",
      time: "5h ago",
      quotesCount: 4,
      videoUrl: "https://www.w3schools.com/html/movie.mp4"
    },
    {
      id: 7,
      type: "text",
      title: "LED Bulbs - 2000 units",
      description: "9W LED bulbs, warm white, B22 base. Energy Star certified preferred.",
      location: "Chennai",
      budget: "₹60K - ₹80K",
      time: "6h ago",
      quotesCount: 18
    },
    {
      id: 8,
      type: "voice",
      title: "Office Furniture - Complete Setup",
      description: "100 workstations, 20 chairs, 10 conference tables. Modern design.",
      location: "Hyderabad",
      budget: "₹25L - ₹35L",
      time: "8h ago",
      quotesCount: 7,
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
      id: 9,
      type: "text",
      title: "Aluminum Sheets - 500 sq meters",
      description: "2mm thickness, marine grade. Need fire safety certification.",
      location: "Kolkata",
      budget: "₹4L - ₹6L",
      time: "10h ago",
      quotesCount: 5
    },
    {
      id: 10,
      type: "video",
      title: "Industrial Pump - Submersible",
      description: "5HP submersible pump for water treatment plant. See video demo.",
      location: "Jaipur",
      budget: "₹1.5L - ₹2L",
      time: "12h ago",
      quotesCount: 9,
      videoUrl: "https://www.w3schools.com/html/mov_bbb.mp4"
    }
  ]

  // Filter RFQs
  const filteredRFQs = activeFilter === "all" 
    ? mockRFQs 
    : mockRFQs.filter(rfq => rfq.type === activeFilter)

  // Categories data - 50+ categories in 3-column grid
  const categories = [
    { name: "Industrial Machinery", icon: "⚙️", count: 1250, subcategories: 45 },
    { name: "Raw Materials", icon: "🏭", count: 2340, subcategories: 38 },
    { name: "Chemicals & Solvents", icon: "🧪", count: 890, subcategories: 52 },
    { name: "Electronics & Components", icon: "🔌", count: 1560, subcategories: 67 },
    { name: "Textiles & Fabrics", icon: "🧵", count: 980, subcategories: 41 },
    { name: "Packaging Materials", icon: "📦", count: 1120, subcategories: 28 },
    { name: "Steel & Metal Products", icon: "🔩", count: 1870, subcategories: 55 },
    { name: "Construction Materials", icon: "🏗️", count: 2100, subcategories: 49 },
    { name: "Automotive Parts", icon: "🚗", count: 1450, subcategories: 62 },
    { name: "Electrical Equipment", icon: "💡", count: 1320, subcategories: 44 },
    { name: "Safety Equipment", icon: "🦺", count: 670, subcategories: 31 },
    { name: "Office Supplies", icon: "📎", count: 540, subcategories: 22 },
    { name: "Food Processing", icon: "🍕", count: 780, subcategories: 35 },
    { name: "Pharmaceuticals", icon: "💊", count: 920, subcategories: 48 },
    { name: "Plastics & Polymers", icon: "♻️", count: 1100, subcategories: 39 },
    { name: "Paper & Pulp", icon: "📄", count: 650, subcategories: 26 },
    { name: "Agriculture Equipment", icon: "🚜", count: 890, subcategories: 33 },
    { name: "HVAC Systems", icon: "❄️", count: 710, subcategories: 29 },
    { name: "Pumps & Valves", icon: "🔧", count: 830, subcategories: 37 },
    { name: "Bearings & Seals", icon: "⚫", count: 590, subcategories: 24 },
    { name: "Paints & Coatings", icon: "🎨", count: 720, subcategories: 30 },
    { name: "Adhesives & Sealants", icon: "🔗", count: 480, subcategories: 19 },
    { name: "Fasteners & Hardware", icon: "🔨", count: 910, subcategories: 34 },
    { name: "Industrial Tools", icon: "🛠️", count: 1040, subcategories: 42 },
    { name: "Laboratory Equipment", icon: "🔬", count: 620, subcategories: 27 },
    { name: "Medical Devices", icon: "🏥", count: 770, subcategories: 36 },
    { name: "Furniture & Fixtures", icon: "🪑", count: 690, subcategories: 25 },
    { name: "Ceramics & Glass", icon: "🏺", count: 530, subcategories: 21 },
    { name: "Rubber Products", icon: "🛞", count: 640, subcategories: 28 },
    { name: "Wood & Timber", icon: "🌲", count: 580, subcategories: 23 }
  ]

  return (
    <div className="min-h-screen bg-[#0f172a]">
      {/* NAVIGATION */}
      <nav className="bg-[#1e293b] border-b border-[#334155] sticky top-0 z-50 backdrop-blur-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex justify-between items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">B</span>
              </div>
              <div>
                <div className="text-white font-bold text-xl">BELL</div>
                <div className="text-cyan-500 text-xs font-semibold">24H</div>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-6">
              <Link href="/demo" className="text-slate-300 hover:text-cyan-500 transition-colors">Demo RFQs</Link>
              <Link href="/post-rfq" className="text-slate-300 hover:text-cyan-500 transition-colors">Post RFQ</Link>
              <Link href="/browse" className="text-slate-300 hover:text-cyan-500 transition-colors">Browse RFQs</Link>
              <Link href="/suppliers" className="text-slate-300 hover:text-cyan-500 transition-colors">Suppliers</Link>
            </div>

            <div className="flex items-center space-x-3">
              <button className="text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-slate-700 transition-all">Login</button>
              <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg transition-all">Register</button>
            </div>
          </div>
        </div>
      </nav>

      {/* HERO - 3 COLUMNS */}
      <section className="relative py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Column 1: Main Content */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Ready to Transform Your Procurement?
              </h1>
              <p className="text-lg text-slate-300 mb-6">
                Join thousands of businesses using Bell24h for faster, smarter B2B transactions
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/post-rfq" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all hover:scale-105">
                  Post an RFQ
                </Link>
                <Link href="/browse" className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold text-center transition-all">
                  Browse RFQs
                </Link>
              </div>
            </div>

            {/* Column 2: Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] h-[120px] flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span className="text-xs text-slate-400">Verified Suppliers</span>
                </div>
                <div className="text-3xl font-bold text-cyan-500">10,000+</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] h-[120px] flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span className="text-xs text-slate-400">Active RFQs</span>
                </div>
                <div className="text-3xl font-bold text-cyan-500">2,500+</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] h-[120px] flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                  <span className="text-xs text-slate-400">Success Rate</span>
                </div>
                <div className="text-3xl font-bold text-cyan-500">94%</div>
              </div>
              <div className="bg-[#1e293b] p-4 rounded-xl border border-[#334155] h-[120px] flex flex-col justify-center">
                <div className="flex items-center space-x-2 mb-1">
                  <svg className="w-5 h-5 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span className="text-xs text-slate-400">Avg Savings</span>
                </div>
                <div className="text-3xl font-bold text-cyan-500">23%</div>
              </div>
            </div>

            {/* Column 3: Features */}
            <div className="space-y-4">
              <h3 className="text-xl font-bold text-white mb-4">Why Choose Bell24h?</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">AI-Powered Matching</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">Verified Suppliers</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">Lightning Fast</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-cyan-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <span className="text-sm text-slate-300">Secure & Private</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - 3 COLUMN GRID */}
      <section className="py-12 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Browse by Category</h2>
            <p className="text-lg text-slate-400">50+ Categories with 450+ Subcategories</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                href={`/category/${category.name.toLowerCase().replace(/ /g, "-")}`}
                className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] hover:border-cyan-500 transition-all group"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-3xl">{category.icon}</div>
                    <div>
                      <h3 className="text-white font-semibold group-hover:text-cyan-500 transition-colors">
                        {category.name}
                      </h3>
                      <p className="text-xs text-slate-400">{category.subcategories} subcategories</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-500 font-bold text-lg">{category.count}</div>
                    <div className="text-xs text-slate-500">suppliers</div>
                  </div>
                </div>
                <div className="w-full bg-slate-700/30 rounded-full h-1.5">
                  <div 
                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all group-hover:w-full"
                    style={{ width: `${Math.min(100, (category.count / 25))}%` }}
                  ></div>
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link href="/categories" className="bg-cyan-500 hover:bg-cyan-600 text-white px-8 py-3 rounded-lg font-semibold transition-all inline-block">
              View All Categories
            </Link>
          </div>
        </div>
      </section>

      {/* RFQ INPUT METHODS */}
      <section className="py-12 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-4">Choose Your Input Method</h2>
            <p className="text-lg text-slate-400">Multiple ways to submit your requirements</p>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            {/* Text RFQ */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-blue-500 transition-all group">
              <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Text RFQ</h3>
              <p className="text-sm text-slate-400 mb-4">
                Type your requirement with full specifications
              </p>
              <div className="text-slate-500 text-xs mb-4">~3 Text RFQ Demos Available</div>
              <Link href="/post-rfq/text" className="block bg-blue-500 hover:bg-blue-600 text-white text-sm py-2 rounded-lg transition-all font-medium text-center">
                Try Text RFQ
              </Link>
            </div>

            {/* Voice RFQ */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-violet-500 transition-all group">
              <div className="w-14 h-14 bg-violet-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Voice RFQ</h3>
              <p className="text-sm text-slate-400 mb-4">
                Just speak in any language - our AI understands 12 Indian languages
              </p>
              <div className="text-slate-500 text-xs mb-4">~2 Voice RFQ Demos Available</div>
              <Link href="/post-rfq/voice" className="block bg-violet-500 hover:bg-violet-600 text-white text-sm py-2 rounded-lg transition-all font-medium text-center">
                Try Voice RFQ
              </Link>
            </div>

            {/* Video RFQ */}
            <div className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-pink-500 transition-all group">
              <div className="w-14 h-14 bg-pink-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-pink-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Video RFQ</h3>
              <p className="text-sm text-slate-400 mb-4">
                Record or upload a video showing the product you need
              </p>
              <div className="text-slate-500 text-xs mb-4">~1 Video RFQ Demos Available</div>
              <Link href="/post-rfq/video" className="block bg-pink-500 hover:bg-pink-600 text-white text-sm py-2 rounded-lg transition-all font-medium text-center">
                Try Video RFQ
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* LIVE RFQs WITH EMBEDDED MEDIA - 10 MOCK RFQs */}
      <section className="py-12 bg-[#0f172a]">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-3xl font-bold text-white mb-2">Live RFQs</h2>
              <p className="text-slate-400">Browse active requirements from verified buyers</p>
            </div>
            <Link href="/browse" className="bg-cyan-500 hover:bg-cyan-600 text-white px-6 py-2 rounded-lg font-medium transition-all">
              View All RFQs
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-wrap gap-2 mb-6">
            {["all", "voice", "video", "text"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all capitalize ${
                  activeFilter === filter
                    ? "bg-cyan-500 text-white"
                    : "bg-[#1e293b] text-slate-300 hover:bg-[#334155]"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* RFQ Cards Grid - 10 Mock RFQs with Media */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRFQs.map((rfq) => (
              <div key={rfq.id} className="bg-[#1e293b] rounded-xl p-4 border border-[#334155] hover:border-cyan-500 transition-all h-[380px] flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      rfq.type === "voice" ? "bg-violet-500/20" :
                      rfq.type === "video" ? "bg-pink-500/20" : "bg-blue-500/20"
                    }`}>
                      <svg className={`w-4 h-4 ${
                        rfq.type === "voice" ? "text-violet-500" :
                        rfq.type === "video" ? "text-pink-500" : "text-blue-500"
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {rfq.type === "voice" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                        )}
                        {rfq.type === "video" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        )}
                        {rfq.type === "text" && (
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        )}
                      </svg>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded capitalize ${
                      rfq.type === "voice" ? "text-violet-400 bg-violet-500/10" :
                      rfq.type === "video" ? "text-pink-400 bg-pink-500/10" : "text-blue-400 bg-blue-500/10"
                    }`}>
                      {rfq.type} RFQ
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">{rfq.time}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 line-clamp-2">
                  {rfq.title}
                </h3>

                {/* Embedded Media Player */}
                {rfq.type === "video" && rfq.videoUrl && (
                  <div className="mb-3 rounded-lg overflow-hidden bg-black">
                    <video 
                      controls 
                      className="w-full h-32 object-cover"
                      poster="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='320' height='180'%3E%3Crect fill='%231e293b' width='320' height='180'/%3E%3Ctext fill='%2394a3b8' font-family='sans-serif' font-size='14' x='50%25' y='50%25' text-anchor='middle' dy='.3em'%3EClick to play%3C/text%3E%3C/svg%3E"
                    >
                      <source src={rfq.videoUrl} type="video/mp4" />
                      Your browser does not support video.
                    </video>
                  </div>
                )}

                {rfq.type === "voice" && rfq.audioUrl && (
                  <div className="mb-3 bg-[#0f172a] p-3 rounded-lg">
                    <audio controls className="w-full h-8">
                      <source src={rfq.audioUrl} type="audio/mpeg" />
                      Your browser does not support audio.
                    </audio>
                  </div>
                )}

                <p className="text-sm text-slate-400 mb-3 line-clamp-2 flex-grow">
                  {rfq.description}
                </p>

                <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    {rfq.location}
                  </div>
                  <div className="flex items-center text-emerald-500">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                    </svg>
                    {rfq.quotesCount} quotes
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-[#334155]">
                  <span className="text-cyan-500 font-semibold">{rfq.budget}</span>
                  <button className="bg-cyan-500 hover:bg-cyan-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all">
                    Quote Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#1e293b] border-t border-[#334155] py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">B</span>
                </div>
                <div>
                  <div className="text-white font-bold">BELL</div>
                  <div className="text-cyan-500 text-xs">24H</div>
                </div>
              </div>
              <p className="text-slate-400 text-sm">
                Transforming B2B procurement with AI-powered RFQ matching.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/post-rfq" className="text-slate-400 hover:text-cyan-500 transition-colors">Post RFQ</Link></li>
                <li><Link href="/browse" className="text-slate-400 hover:text-cyan-500 transition-colors">Browse RFQs</Link></li>
                <li><Link href="/suppliers" className="text-slate-400 hover:text-cyan-500 transition-colors">Find Suppliers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-slate-400 hover:text-cyan-500 transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-slate-400 hover:text-cyan-500 transition-colors">Contact</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-cyan-500 transition-colors">Privacy</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="text-slate-400 hover:text-cyan-500 transition-colors">Help Center</Link></li>
                <li><Link href="/demo" className="text-slate-400 hover:text-cyan-500 transition-colors">Request Demo</Link></li>
                <li><Link href="/status" className="text-slate-400 hover:text-cyan-500 transition-colors">System Status</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-[#334155] mt-8 pt-6 text-center">
            <p className="text-slate-400 text-sm">
              © 2026 Bell24h. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}