'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Mic, Video, FileText, Clock, MapPin, DollarSign, 
  ArrowLeft, Play, Pause, TrendingUp, MessageCircle,
  CheckCircle, Building2, Calendar, Package
} from 'lucide-react';
import Link from 'next/link';
import { ALL_MOCK_RFQS, type MockRFQ } from '@/data/mockRFQs';

interface RFQDetailProps {
  id: string;
}

export default function RFQDetail({ id }: RFQDetailProps) {
  const router = useRouter();
  const [rfq, setRfq] = useState<MockRFQ | null>(null);
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    // Find RFQ by ID (format: rfq-1003, 1003, etc.)
    const normalizedId = id.startsWith('rfq-') ? id : `rfq-${id}`;
    const foundRFQ = ALL_MOCK_RFQS.find(r => 
      r.id === normalizedId || 
      r.id === id ||
      r.id.replace('rfq-', '') === id.replace('rfq-', '')
    );
    if (foundRFQ) {
      // Enhance RFQ with missing fields for display
      const enhancedRFQ = {
        ...foundRFQ,
        budget: '₹5L - ₹8L',
        quoteCount: foundRFQ.quotesCount || 0,
        views: Math.floor(Math.random() * 100) + 10,
        requirements: [
          `Quantity: ${foundRFQ.quantity || 'As per requirement'}`,
          `Location: ${foundRFQ.location}`,
          `Category: ${foundRFQ.category}`,
        ],
        tags: [foundRFQ.category, foundRFQ.location],
        audioUrl: foundRFQ.type === 'voice' ? '/audio/sample-voice-rfq.mp3' : undefined,
        videoUrl: foundRFQ.type === 'video' ? 'https://res.cloudinary.com/demo/video/upload/sample.mp4' : undefined,
        thumbnailUrl: foundRFQ.type === 'video' ? undefined : undefined,
      };
      setRfq(enhancedRFQ as any);
    }
  }, [id]);

  const toggleAudio = () => {
    if (!rfq || rfq.type !== 'voice' || !rfq.audioUrl) return;

    if (!audio) {
      const newAudio = new Audio(rfq.audioUrl);
      newAudio.onended = () => setPlaying(false);
      setAudio(newAudio);
      newAudio.play();
      setPlaying(true);
    } else {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.play();
        setPlaying(true);
      }
    }
  };

  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
        audio.src = '';
      }
    };
  }, [audio]);

  if (!rfq) {
    return (
      <div className="min-h-screen bg-[#0a1128] flex items-center justify-center p-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-black text-white mb-4">RFQ #{id}</h1>
          <p className="text-xl text-gray-400 mb-8">RFQ not found</p>
          <Link 
            href="/rfq"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-lg font-bold hover:from-cyan-600 hover:to-blue-700 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            Browse All RFQs
          </Link>
        </div>
      </div>
    );
  }

  const getTypeIcon = (type: 'voice' | 'video' | 'text') => {
    switch (type) {
      case 'voice': return <Mic className="w-6 h-6" />;
      case 'video': return <Video className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const getTypeColor = (type: 'voice' | 'video' | 'text') => {
    switch (type) {
      case 'voice': return 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400';
      case 'video': return 'bg-purple-500/20 border-purple-500/30 text-purple-400';
      default: return 'bg-green-500/20 border-green-500/30 text-green-400';
    }
  };

  const getTimeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  return (
    <div className="min-h-screen bg-[#0a1128] p-4 md:p-12">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Link 
          href="/rfq"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to RFQs
        </Link>

        {/* RFQ Header */}
        <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <span className={`px-4 py-2 rounded-full border flex items-center gap-2 ${getTypeColor(rfq.type)}`}>
                  {getTypeIcon(rfq.type)}
                  <span className="font-bold capitalize">{rfq.type} RFQ</span>
                </span>
                <span className="text-2xl font-black text-white">#{rfq.id.replace('rfq-', '')}</span>
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
                {rfq.title}
              </h1>
              <p className="text-xl text-gray-300">{rfq.description}</p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm">Budget</span>
              </div>
              <p className="text-2xl font-bold text-white">{rfq.budget}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <MapPin className="w-5 h-5" />
                <span className="text-sm">Location</span>
              </div>
              <p className="text-2xl font-bold text-white">{rfq.location}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock className="w-5 h-5" />
                <span className="text-sm">Posted</span>
              </div>
              <p className="text-2xl font-bold text-white">{getTimeAgo(rfq.postedAt)}</p>
            </div>
            <div className="bg-gray-800/50 rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <MessageCircle className="w-5 h-5" />
                <span className="text-sm">Quotes</span>
              </div>
              <p className="text-2xl font-bold text-white">{rfq.quotesCount || 0}</p>
            </div>
          </div>
        </div>

        {/* Audio/Video Player */}
        {(rfq.type === 'voice' || rfq.type === 'video') && (
          <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              {rfq.type === 'voice' ? <Mic className="w-6 h-6" /> : <Video className="w-6 h-6" />}
              {rfq.type === 'voice' ? 'Voice Recording' : 'Video Recording'}
            </h2>
            
            {rfq.type === 'voice' && rfq.audioUrl && (
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-cyan-500/30">
                <button
                  onClick={toggleAudio}
                  className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 hover:scale-110 transition-transform shadow-xl"
                >
                  {playing ? (
                    <Pause className="w-12 h-12 text-white" />
                  ) : (
                    <Play className="w-12 h-12 text-white ml-1" />
                  )}
                </button>
                <p className="text-center text-gray-400">
                  {playing ? 'Playing...' : 'Click to play voice RFQ'}
                </p>
              </div>
            )}

            {rfq.type === 'video' && rfq.videoUrl && (
              <div className="bg-gray-800/50 rounded-2xl p-8 border border-purple-500/30">
                <video
                  src={rfq.videoUrl}
                  controls
                  className="w-full rounded-xl"
                  poster={rfq.thumbnailUrl}
                >
                  Your browser does not support the video tag.
                </video>
              </div>
            )}
          </div>
        )}

        {/* Details */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            {/* Requirements */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Package className="w-6 h-6" />
                Requirements
              </h2>
              <div className="space-y-4 text-gray-300">
                {rfq.requirements?.map((req, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-400 mt-1 flex-shrink-0" />
                    <span>{req}</span>
                  </div>
                )) || (
                  <p className="text-gray-400">No specific requirements listed.</p>
                )}
              </div>
            </div>

            {/* Category & Tags */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Building2 className="w-6 h-6" />
                Category & Tags
              </h2>
              <div className="flex flex-wrap gap-3">
                {rfq.category && (
                  <span className="px-4 py-2 bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 rounded-full font-semibold">
                    {rfq.category}
                  </span>
                )}
                {rfq.tags?.map((tag, idx) => (
                  <span key={idx} className="px-4 py-2 bg-gray-800/50 border border-white/10 text-gray-300 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Submit Quote */}
            <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl border border-cyan-500/30 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-4">Interested in this RFQ?</h3>
              <p className="text-gray-300 mb-6 text-sm">
                Submit a quote and get connected with the buyer instantly.
              </p>
              <button className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white py-4 rounded-xl font-bold transition-all shadow-lg">
                Submit Quote
              </button>
              <p className="text-xs text-gray-400 mt-4 text-center">
                Free to respond • Instant connection
              </p>
            </div>

            {/* Quick Info */}
            <div className="bg-gray-900/80 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Info</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>Posted {getTimeAgo(rfq.postedAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <TrendingUp className="w-4 h-4" />
                  <span>{rfq.views || 0} views</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>{rfq.quotesCount || 0} quotes received</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

