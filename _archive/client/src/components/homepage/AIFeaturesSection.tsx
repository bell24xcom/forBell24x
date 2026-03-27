'use client';

import { Mic, Sparkles, Lock, Zap, Globe, Brain } from 'lucide-react';

export default function AIFeaturesSection() {
  const features = [
    {
      icon: Mic,
      title: 'Voice Recognition',
      description: 'Supports 12+ Indian languages with real-time transcription',
      color: 'cyan',
    },
    {
      icon: Brain,
      title: 'AI Auto-Matching',
      description: 'Intelligent supplier matching based on RFQ requirements',
      color: 'blue',
    },
    {
      icon: Lock,
      title: 'Blockchain Escrow',
      description: 'Secure payments with smart contract-based escrow',
      color: 'green',
    },
    {
      icon: Zap,
      title: '24-Hour Quotes',
      description: 'Get responses from verified suppliers within 24 hours',
      color: 'orange',
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Communicate in Hindi, English, Tamil, Telugu, and more',
      color: 'cyan',
    },
    {
      icon: Sparkles,
      title: 'Video Analysis',
      description: 'AI analyzes video RFQs to extract product specifications',
      color: 'indigo',
    },
  ];

  const colorClasses = {
    cyan: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    green: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    orange: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    indigo: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  };

  return (
    <section className="py-16 bg-[#0a1128]">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            AI-Powered Features
          </h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Leverage cutting-edge AI technology to streamline your B2B procurement process
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-6 hover:shadow-lg transition-shadow border border-gray-200 dark:border-gray-700"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${colorClasses[feature.color as keyof typeof colorClasses]} mb-4`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

