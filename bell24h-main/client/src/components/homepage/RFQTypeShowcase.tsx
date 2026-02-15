'use client';

import { FileText, Mic, Video, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getMockRFQStats } from '@/data/mockRFQs';

export default function RFQTypeShowcase() {
  const stats = getMockRFQStats();

  const types = [
    {
      icon: FileText,
      title: 'Text RFQ',
      description: 'Type your requirement with full specifications',
      count: stats.total - stats.voiceRFQs - stats.videoRFQs,
      color: 'blue',
      bgGradient: 'from-blue-50 to-blue-100',
      textColor: 'text-blue-700',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      link: '/rfq/create?type=text',
      demoLink: '/rfq/demo/text',
    },
    {
      icon: Mic,
      title: 'Voice RFQ',
      description: 'Just speak in any language - our AI understands 12 Indian languages',
      count: stats.voiceRFQs,
      color: 'cyan',
      bgGradient: 'from-cyan-50 to-cyan-100',
      textColor: 'text-cyan-700',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700',
      link: '/rfq/create?type=voice',
      demoLink: '/rfq/demo/voice',
    },
    {
      icon: Video,
      title: 'Video RFQ',
      description: 'Record or upload a video showing the product you need',
      count: stats.videoRFQs,
      color: 'cyan',
      bgGradient: 'from-cyan-50 to-cyan-100',
      textColor: 'text-cyan-700',
      buttonColor: 'bg-cyan-600 hover:bg-cyan-700',
      link: '/rfq/create?type=video',
      demoLink: '/rfq/demo/video',
    },
  ];

  return (
    <section className="py-16 bg-[#0a1128]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How Bell24h Accepts RFQs
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the method that works best for you. Our AI handles all three formats seamlessly.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {types.map((type, index) => {
            const Icon = type.icon;
            return (
              <div
                key={index}
                className="bg-gray-900/80 backdrop-blur border border-white/10 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow"
              >
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`w-20 h-20 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center ${type.textColor}`}>
                    <Icon className="w-10 h-10" />
                  </div>
                </div>

                {/* Content */}
                <h3 className={`text-2xl font-bold ${type.textColor} dark:text-white text-center mb-3`}>
                  {type.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 text-center mb-6">
                  {type.description}
                </p>

                {/* Stats */}
                <div className="text-center mb-6">
                  <p className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    ~{type.count.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {type.title} Demos Available
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href={type.link}
                    className={`w-full ${type.buttonColor} text-white px-4 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 transition-colors`}
                  >
                    Try {type.title}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href={type.demoLink}
                    className="w-full border-2 border-gray-300 dark:border-gray-600 px-4 py-3 rounded-lg font-medium inline-flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    View {type.count.toLocaleString()}+ Demos
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

