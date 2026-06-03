import Link from 'next/link';

export default function TestimonialsPage() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      company: "Kumar Textiles Pvt Ltd",
      location: "Surat, Gujarat",
      role: "Managing Director",
      text: "Bell24h transformed how we source raw materials. The voice RFQ feature saved us hours of typing detailed specifications. Got 8 competitive quotes within 24 hours!",
      rating: 5
    },
    {
      name: "Priya Sharma",
      company: "Sharma Pharmaceuticals",
      location: "Mumbai, Maharashtra",
      role: "Procurement Head",
      text: "The escrow system gave us confidence to deal with new suppliers. We've completed ₹25+ lakhs in transactions with zero payment issues. Highly recommended for bulk purchases.",
      rating: 5
    },
    {
      name: "Amit Patel",
      company: "Patel Engineering Works",
      location: "Ahmedabad, Gujarat",
      role: "Owner",
      text: "As a first-time B2B buyer, Bell24h's verified supplier network was a lifesaver. The AI matched us with the perfect CNC machine supplier. Smooth delivery and great support.",
      rating: 5
    },
    {
      name: "Deepa Menon",
      company: "Green Agro Exports",
      location: "Kerala",
      role: "Export Manager",
      text: "We use Bell24h for all our packaging material sourcing. The Pro plan's unlimited RFQs and reduced fees paid for itself in the first month. Platform is intuitive and fast.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">What Our Customers Say</h1>
          <p className="text-slate-300 text-lg">Real stories from businesses growing with Bell24h</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {testimonials.map((testimonial, idx) => (
            <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
              <div className="flex items-start mb-4">
                <div className="w-14 h-14 bg-blue-500/20 rounded-full flex items-center justify-center text-blue-400 font-bold text-xl mr-4 shrink-0">
                  {testimonial.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white text-lg">{testimonial.name}</h3>
                  <p className="text-slate-400 text-sm">{testimonial.role}</p>
                  <p className="text-slate-500 text-sm">{testimonial.company}</p>
                  <p className="text-slate-500 text-xs">{testimonial.location}</p>
                </div>
              </div>

              <div className="flex mb-3">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <span key={i} className="text-yellow-400 text-lg">★</span>
                ))}
              </div>

              <p className="text-slate-300 leading-relaxed italic">"{testimonial.text}"</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border border-blue-500/30 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Join 10,000+ Businesses on Bell24h</h2>
          <p className="text-slate-300 mb-6 max-w-2xl mx-auto">
            Whether you're a buyer looking for suppliers or a supplier seeking new customers, Bell24h is your trusted B2B marketplace.
            Post your first RFQ free and experience the difference.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/rfq/create" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
              Post RFQ Free
            </Link>
            <Link href="/auth/register" className="bg-slate-700 hover:bg-slate-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
              Register as Supplier
            </Link>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-slate-400 mb-4">Have a success story with Bell24h?</p>
          <a href="mailto:bell24h.helpline@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
            Share your testimonial →
          </a>
        </div>
      </div>
    </div>
  );
}
