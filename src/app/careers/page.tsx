import Link from 'next/link';

export default function CareersPage() {
  return (
    <div className="min-h-screen bg-[#0F172A] py-12">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-white mb-4">Careers at Bell24h</h1>
          <p className="text-slate-300 text-lg">Building the Future of B2B in India</p>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 mb-8">
          <div className="space-y-6 text-slate-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">🚀 Our Mission</h2>
              <p className="leading-relaxed">
                Bell24h is revolutionizing B2B commerce in India by connecting buyers with verified suppliers across 450+ categories.
                We're leveraging cutting-edge AI (NVIDIA DeepSeek V3.2, MiniMax M2.1) to make B2B transactions faster, safer, and more transparent.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">💼 Why Join Us?</h2>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Work with cutting-edge AI and blockchain technology</li>
                <li>Impact millions of Indian businesses and suppliers</li>
                <li>Competitive salary with ESOP opportunities</li>
                <li>Flexible work arrangements (hybrid/remote options)</li>
                <li>Fast-paced startup environment with growth opportunities</li>
                <li>Collaborative team culture with direct access to founders</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">🎯 Current Openings</h2>
              <div className="bg-slate-700/50 border border-slate-600 rounded-xl p-6 text-center">
                <p className="text-lg text-slate-300 mb-4">
                  We're currently building our core team and will be hiring soon for:
                </p>
                <ul className="text-left max-w-md mx-auto space-y-2 text-slate-300">
                  <li>• Full-Stack Developers (React, Next.js, Node.js)</li>
                  <li>• AI/ML Engineers (NLP, Computer Vision)</li>
                  <li>• Product Managers</li>
                  <li>• Business Development Executives</li>
                  <li>• Customer Success Managers</li>
                </ul>
                <p className="text-slate-400 mt-6 text-sm">
                  No current openings, but we're always looking for exceptional talent. Send your resume to get notified when positions open.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">📍 Location</h2>
              <p className="leading-relaxed">
                <strong className="text-white">Headquarters:</strong> Mumbai, Maharashtra, India<br />
                <strong className="text-white">Work Model:</strong> Hybrid (3 days office, 2 days remote)<br />
                <strong className="text-white">Remote:</strong> Open for senior roles
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">📧 Get In Touch</h2>
              <p className="leading-relaxed">
                Interested in joining our team? Send your resume and portfolio to:{' '}
                <a href="mailto:digitex.studio@gmail.com" className="text-blue-400 hover:text-blue-300 font-medium">
                  digitex.studio@gmail.com
                </a>
              </p>
              <p className="text-slate-400 mt-3 text-sm">
                We review all applications and respond within 5-7 business days.
              </p>
            </section>
          </div>
        </div>

        <div className="text-center">
          <Link href="/" className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium px-8 py-3 rounded-lg transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
