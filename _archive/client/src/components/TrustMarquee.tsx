'use client';

export default function TrustMarquee() {
  const companies = [
    { name: 'Tata Steel', logo: '🏭', value: '₹2.5L Cr' },
    { name: 'Reliance Industries', logo: '⚡', value: '₹6.2L Cr' },
    { name: 'Mahindra Group', logo: '🚗', value: '₹1.8L Cr' },
    { name: 'Adani Group', logo: '🏗️', value: '₹1.2L Cr' },
    { name: 'Bajaj Group', logo: '🏍️', value: '₹85K Cr' },
    { name: 'L&T Limited', logo: '🔧', value: '₹1.5L Cr' },
    { name: 'JSW Group', logo: '⚙️', value: '₹1.1L Cr' },
    { name: 'Vedanta Limited', logo: '⛏️', value: '₹95K Cr' },
  ];

  return (
    <section className='py-16 bg-white overflow-hidden'>
      <div className='container mx-auto px-4 mb-8'>
        <h3 className='text-2xl font-bold text-gray-900 text-center'>
          Trusted by India's Largest Enterprises
        </h3>
      </div>

      <div className='relative'>
        <div className='flex animate-scroll space-x-12'>
          {[...companies, ...companies].map((company, index) => (
            <div
              key={index}
              className='flex-shrink-0 bg-gray-50 rounded-xl p-6 flex items-center space-x-4 shadow-lg'
            >
              <div className='text-3xl'>{company.logo}</div>
              <div>
                <div className='font-bold text-gray-900'>{company.name}</div>
                <div className='text-sm text-blue-600 font-semibold'>{company.value} Revenue</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 30s linear infinite;
        }
      `}</style>
    </section>
  );
}
