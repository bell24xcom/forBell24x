'use client';

import { useState, useEffect } from 'react';

interface Metric {
  value: string;
  label: string;
  icon: string;
  color: string;
  description: string;
}

const metrics: Metric[] = [
  {
    value: "₹500Cr+",
    label: "Monthly Trade Volume",
    icon: "💰",
    color: "text-green-600",
    description: "Total value of transactions processed monthly"
  },
  {
    value: "10,000+",
    label: "Verified Suppliers",
    icon: "🏭",
    color: "text-blue-600",
    description: "KYC-verified businesses across India"
  },
  {
    value: "50,000+",
    label: "Active Buyers",
    icon: "👥",
    color: "text-purple-600",
    description: "Registered procurement professionals"
  },
  {
    value: "51+",
    label: "Business Categories",
    icon: "📊",
    color: "text-orange-600",
    description: "Complete industry coverage"
  },
  {
    value: "95%",
    label: "Customer Satisfaction",
    icon: "⭐",
    color: "text-yellow-600",
    description: "Based on verified user reviews"
  },
  {
    value: "24/7",
    label: "Support Available",
    icon: "🛟",
    color: "text-indigo-600",
    description: "Round-the-clock assistance"
  },
  {
    value: "₹2Cr+",
    label: "Average Savings",
    icon: "💡",
    color: "text-teal-600",
    description: "Per customer annually"
  },
  {
    value: "99.9%",
    label: "Platform Uptime",
    icon: "⚡",
    color: "text-red-600",
    description: "Enterprise-grade reliability"
  }
];

const testimonials = [
  {
    name: "Rajesh Kumar",
    company: "ABC Manufacturing Ltd.",
    role: "Procurement Director",
    content: "Bell24h has transformed our procurement process. We've reduced costs by 35% and improved supplier quality significantly.",
    rating: 5,
    avatar: "👨‍💼"
  },
  {
    name: "Priya Sharma",
    company: "Tech Solutions Pvt. Ltd.",
    role: "Supply Chain Manager",
    content: "The AI-powered supplier matching is incredible. We found better suppliers in half the time it used to take.",
    rating: 5,
    avatar: "👩‍💼"
  },
  {
    name: "Amit Patel",
    company: "Steel Industries",
    role: "Business Owner",
    content: "As a supplier, Bell24h has given us access to customers we never had before. Our business has grown 200% in 6 months.",
    rating: 5,
    avatar: "👨‍🏭"
  }
];

const achievements = [
  {
    title: "ISO 27001 Certified",
    description: "Information Security Management",
    icon: "🛡️"
  },
  {
    title: "MSME Partner",
    description: "Government of India Recognition",
    icon: "🏛️"
  },
  {
    title: "Startup India",
    description: "Recognized Innovation Hub",
    icon: "🚀"
  },
  {
    title: "GST Compliant",
    description: "Full Tax Compliance",
    icon: "📋"
  }
];

export default function SuccessMetrics() {
  const [animatedMetrics, setAnimatedMetrics] = useState<Metric[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('success-metrics');
    if (element) {
      observer.observe(element);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setAnimatedMetrics(metrics);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isVisible]);

  return (
    <section id="success-metrics" className="py-16 bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Trusted by India's Leading Businesses
          </h2>
          <p className="text-xl text-gray-600">
            Join thousands of companies already transforming their B2B operations
          </p>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {metrics.map((metric, index) => (
            <div 
              key={index} 
              className={`bg-white rounded-xl p-6 text-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${
                animatedMetrics.includes(metric) ? 'animate-fade-in' : 'opacity-0'
              }`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="text-3xl mb-3">{metric.icon}</div>
              <div className={`text-2xl font-bold ${metric.color} mb-2`}>
                {metric.value}
              </div>
              <div className="text-sm font-semibold text-gray-900 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-600">
                {metric.description}
              </div>
            </div>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            What Our Customers Say
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg">
                <div className="flex items-center mb-4">
                  <div className="text-2xl mr-3">{testimonial.avatar}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-600">{testimonial.company}</div>
                    <div className="text-xs text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400">⭐</span>
                  ))}
                </div>
                <p className="text-gray-700 text-sm italic">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">
            Recognitions & Certifications
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {achievements.map((achievement, index) => (
              <div key={index} className="bg-white rounded-xl p-6 text-center shadow-lg">
                <div className="text-3xl mb-3">{achievement.icon}</div>
                <div className="font-semibold text-gray-900 mb-1">
                  {achievement.title}
                </div>
                <div className="text-xs text-gray-600">
                  {achievement.description}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Ready to Transform Your Business?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join thousands of businesses already growing with Bell24h
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Start Free Trial
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-600 mb-4">Trusted by leading companies across India</p>
          <div className="flex justify-center items-center space-x-8 opacity-60">
            <div className="text-lg font-semibold text-gray-400">Tata Group</div>
            <div className="text-lg font-semibold text-gray-400">Reliance</div>
            <div className="text-lg font-semibold text-gray-400">Mahindra</div>
            <div className="text-lg font-semibold text-gray-400">L&T</div>
            <div className="text-lg font-semibold text-gray-400">Infosys</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </section>
  );
} 
