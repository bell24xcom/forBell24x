'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Expert {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  experience: number;
  rating: number;
  reviews: number;
  languages: string[];
  hourlyRate: string;
  availability: 'online' | 'busy' | 'offline';
  nextAvailable: string;
  image: string;
  bio: string;
  achievements: string[];
  successStories: number;
  companiesHelped: string[];
  timeZone: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
  date: string;
}

export default function LiveVideoConsultations() {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [currentCategory, setCurrentCategory] = useState('All');
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showVideoDemo, setShowVideoDemo] = useState(false);

  const categories = ['All', 'Procurement', 'Supply Chain', 'Technical', 'Industry Experts'];

  const experts: Expert[] = [
    {
      id: '1',
      name: 'Dr. Rajesh Kumar',
      title: 'Senior Procurement Strategist',
      specialization: ['Strategic Sourcing', 'Cost Optimization', 'Supplier Management'],
      experience: 15,
      rating: 4.9,
      reviews: 234,
      languages: ['English', 'Hindi', 'Telugu'],
      hourlyRate: '₹3,500',
      availability: 'online',
      nextAvailable: 'Today 2:30 PM',
      image: '👨‍💼',
      bio: 'Former Chief Procurement Officer at Tata Steel with expertise in strategic sourcing and cost optimization across manufacturing sectors.',
      achievements: [
        'Saved ₹150Cr in procurement costs',
        'Led digital transformation',
        '500+ supplier partnerships',
      ],
      successStories: 127,
      companiesHelped: ['Tata Steel', 'Mahindra', 'L&T'],
      timeZone: 'IST (GMT+5:30)',
    },
    {
      id: '2',
      name: 'Priya Sharma',
      title: 'Supply Chain Excellence Expert',
      specialization: ['Logistics Optimization', 'Inventory Management', 'Risk Mitigation'],
      experience: 12,
      rating: 4.8,
      reviews: 189,
      languages: ['English', 'Hindi', 'Gujarati'],
      hourlyRate: '₹2,800',
      availability: 'online',
      nextAvailable: 'Today 4:00 PM',
      image: '👩‍💼',
      bio: 'Supply chain transformation specialist with proven track record in automotive and electronics industries.',
      achievements: ['40% inventory reduction', 'End-to-end visibility', '99.5% on-time delivery'],
      successStories: 98,
      companiesHelped: ['Hero MotoCorp', 'Samsung', 'Bosch'],
      timeZone: 'IST (GMT+5:30)',
    },
    {
      id: '3',
      name: 'Vikram Singh',
      title: 'Technical Consultant - Manufacturing',
      specialization: ['Equipment Selection', 'Quality Standards', 'Technical Specifications'],
      experience: 18,
      rating: 4.9,
      reviews: 156,
      languages: ['English', 'Hindi', 'Punjabi'],
      hourlyRate: '₹4,200',
      availability: 'busy',
      nextAvailable: 'Tomorrow 10:00 AM',
      image: '👨‍🔬',
      bio: 'Former R&D Director with deep expertise in manufacturing equipment and quality systems across multiple industries.',
      achievements: ['50+ equipment implementations', 'ISO certification expert', 'Patent holder'],
      successStories: 78,
      companiesHelped: ['BHEL', 'DRDO', 'Indian Railways'],
      timeZone: 'IST (GMT+5:30)',
    },
    {
      id: '4',
      name: 'Sarah Chen',
      title: 'Global Trade Specialist',
      specialization: ['International Sourcing', 'Compliance', 'Cross-border Logistics'],
      experience: 14,
      rating: 4.7,
      reviews: 203,
      languages: ['English', 'Mandarin', 'Hindi'],
      hourlyRate: '₹3,200',
      availability: 'online',
      nextAvailable: 'Today 6:00 PM',
      image: '👩‍💻',
      bio: 'International trade expert specializing in Asia-Pacific markets with extensive experience in global supply chains.',
      achievements: [
        '200+ international partnerships',
        'Trade compliance expert',
        'Multi-cultural teams',
      ],
      successStories: 145,
      companiesHelped: ['Foxconn', 'Flipkart', 'Amazon'],
      timeZone: 'IST (GMT+5:30)',
    },
  ];

  const generateTimeSlots = (date: Date): TimeSlot[] => {
    const slots: TimeSlot[] = [];
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    const currentHour = today.getHours();

    for (let hour = 9; hour <= 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        const isAvailable = isToday ? hour > currentHour + 1 : Math.random() > 0.3;

        slots.push({
          time: timeSlot,
          available: isAvailable,
          date: date.toISOString().split('T')[0],
        });
      }
    }
    return slots;
  };

  const filteredExperts =
    currentCategory === 'All'
      ? experts
      : experts.filter(expert =>
          expert.specialization.some(
            spec =>
              spec.toLowerCase().includes(currentCategory.toLowerCase()) ||
              currentCategory.toLowerCase().includes(spec.toLowerCase())
          )
        );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-emerald-500';
      case 'busy':
        return 'bg-amber-500';
      case 'offline':
        return 'bg-gray-400';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'online':
        return 'Available Now';
      case 'busy':
        return 'In Session';
      case 'offline':
        return 'Offline';
      default:
        return 'Unknown';
    }
  };

  const handleBookConsultation = () => {
    // Simulate booking process
    setIsBookingOpen(false);
    setSelectedExpert(null);
    // Show success message or redirect to booking confirmation
  };

  return (
    <section className='bg-gradient-to-br from-purple-50 to-blue-50 py-20'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className='text-center mb-12'
        >
          <div className='inline-flex items-center gap-2 bg-gradient-to-r from-blue-100 to-purple-100 px-4 py-2 rounded-full mb-4'>
            <span>🎥</span>
            <span className='text-sm font-semibold text-blue-700'>LIVE CONSULTATIONS</span>
          </div>
          <h2 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
            Book Expert Consultations
          </h2>
          <p className='text-xl text-gray-600 max-w-3xl mx-auto mb-8'>
            Connect with industry experts for personalized guidance on procurement, supply chain
            optimization, and technical specifications.
          </p>

          {/* Demo Video Button */}
          <motion.button
            onClick={() => setShowVideoDemo(true)}
            className='inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold hover:shadow-xl transition-all group'
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span>▶️</span>
            Watch Demo: How It Works
          </motion.button>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          viewport={{ once: true }}
          className='flex flex-wrap justify-center gap-3 mb-12'
        >
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setCurrentCategory(category)}
              className={`px-6 py-3 rounded-xl font-medium transition-all ${
                currentCategory === category
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </motion.div>

        {/* Experts Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 mb-12'
        >
          {filteredExperts.map((expert, index) => (
            <motion.div
              key={expert.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className='bg-white rounded-3xl p-8 shadow-lg hover:shadow-xl transition-all border border-gray-100 group'
            >
              <div className='flex items-start gap-6 mb-6'>
                <div className='relative'>
                  <div className='w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl'>
                    {expert.image}
                  </div>
                  <div
                    className={`absolute -bottom-1 -right-1 w-6 h-6 ${getStatusColor(
                      expert.availability
                    )} rounded-full border-2 border-white flex items-center justify-center`}
                  >
                    <div className='w-2 h-2 bg-white rounded-full'></div>
                  </div>
                </div>
                <div className='flex-1'>
                  <h3 className='text-xl font-bold text-gray-900 mb-1'>{expert.name}</h3>
                  <p className='text-blue-600 font-medium mb-2'>{expert.title}</p>
                  <div className='flex items-center gap-2 mb-2'>
                    <div className='flex items-center'>
                      {[...Array(5)].map((_, i) => (
                        <span>⭐</span>
                      ))}
                    </div>
                    <span className='text-sm text-gray-600'>
                      {expert.rating} ({expert.reviews} reviews)
                    </span>
                  </div>
                  <div className='flex items-center gap-4 text-sm text-gray-600'>
                    <div className='flex items-center gap-1'>
                      <Briefcase className='w-4 h-4' />
                      {expert.experience} years
                    </div>
                    <div className='flex items-center gap-1'>
                      <span>🌍</span>
                      {expert.languages.join(', ')}
                    </div>
                  </div>
                </div>
                <div className='text-right'>
                  <div className='text-2xl font-bold text-green-600 mb-1'>{expert.hourlyRate}</div>
                  <div className='text-sm text-gray-600'>per hour</div>
                </div>
              </div>

              <div className='mb-6'>
                <h4 className='font-semibold text-gray-900 mb-2'>Specializations</h4>
                <div className='flex flex-wrap gap-2'>
                  {expert.specialization.map((spec, index) => (
                    <span
                      key={index}
                      className='px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium'
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className='grid grid-cols-3 gap-4 mb-6'>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-blue-600'>{expert.successStories}</div>
                  <div className='text-xs text-gray-600'>Success Stories</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-purple-600'>
                    {expert.companiesHelped.length}+
                  </div>
                  <div className='text-xs text-gray-600'>Companies</div>
                </div>
                <div className='text-center'>
                  <div className='text-2xl font-bold text-emerald-600'>
                    {expert.achievements.length}
                  </div>
                  <div className='text-xs text-gray-600'>Achievements</div>
                </div>
              </div>

              <div className='flex items-center justify-between mb-6'>
                <div className='flex items-center gap-2'>
                  <div
                    className={`w-3 h-3 ${getStatusColor(
                      expert.availability
                    )} rounded-full animate-pulse`}
                  ></div>
                  <span className='text-sm font-medium text-gray-700'>
                    {getStatusText(expert.availability)}
                  </span>
                </div>
                <div className='text-sm text-gray-600'>Next: {expert.nextAvailable}</div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => setSelectedExpert(expert)}
                  className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2'
                >
                  <span>📅</span>
                  Book Session
                </button>
                <button className='bg-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors flex items-center gap-2'>
                  <MessageCircle className='w-4 h-4' />
                  Chat
                </button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Trust Indicators */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className='bg-white rounded-3xl p-8 shadow-lg border border-gray-100'
        >
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8 text-center'>
            <div>
              <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <span>🛡️</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Verified Experts</h3>
              <p className='text-gray-600'>
                All experts are thoroughly vetted and certified professionals
              </p>
            </div>
            <div>
              <div className='w-16 h-16 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <span>🕐</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Instant Booking</h3>
              <p className='text-gray-600'>
                Book sessions instantly or schedule for later convenience
              </p>
            </div>
            <div>
              <div className='w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <span>📈</span>
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Proven Results</h3>
              <p className='text-gray-600'>
                Track record of successful consultations and implementations
              </p>
            </div>
            <div>
              <div className='w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4'>
                <Award className='w-8 h-8 text-white' />
              </div>
              <h3 className='text-xl font-bold text-gray-900 mb-2'>Satisfaction Guarantee</h3>
              <p className='text-gray-600'>100% satisfaction guarantee or your money back</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Booking Modal */}
      <AnimatePresence>
        {selectedExpert && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setSelectedExpert(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>Book Consultation</h2>
                <button
                  onClick={() => setSelectedExpert(null)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <span>❌</span>
                </button>
              </div>

              <div className='flex items-center gap-4 mb-8'>
                <div className='w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl'>
                  {selectedExpert.image}
                </div>
                <div>
                  <h3 className='text-xl font-bold text-gray-900'>{selectedExpert.name}</h3>
                  <p className='text-blue-600 font-medium'>{selectedExpert.title}</p>
                  <p className='text-gray-600'>{selectedExpert.hourlyRate} per hour</p>
                </div>
              </div>

              {/* Calendar and Time Selection */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
                <div>
                  <h4 className='font-bold text-gray-900 mb-4'>Select Date</h4>
                  <div className='bg-gray-50 rounded-2xl p-4'>
                    {/* Simple date picker simulation */}
                    <div className='grid grid-cols-7 gap-2 text-center'>
                      {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                        <div key={day} className='text-sm font-medium text-gray-600 py-2'>
                          {day}
                        </div>
                      ))}
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(date => (
                        <button
                          key={date}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                            date === selectedDate.getDate()
                              ? 'bg-blue-600 text-white'
                              : 'hover:bg-blue-100 text-gray-700'
                          }`}
                          onClick={() => setSelectedDate(new Date(2025, 0, date))}
                        >
                          {date}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className='font-bold text-gray-900 mb-4'>Available Times</h4>
                  <div className='grid grid-cols-2 gap-2 max-h-60 overflow-y-auto'>
                    {generateTimeSlots(selectedDate).map((slot, index) => (
                      <button
                        key={index}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`p-3 rounded-lg text-sm font-medium transition-colors ${
                          selectedTime === slot.time
                            ? 'bg-blue-600 text-white'
                            : slot.available
                            ? 'bg-gray-100 hover:bg-blue-100 text-gray-700'
                            : 'bg-gray-50 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className='mt-8 flex gap-3'>
                <button
                  onClick={handleBookConsultation}
                  disabled={!selectedTime}
                  className='flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                >
                  Confirm Booking
                </button>
                <button
                  onClick={() => setSelectedExpert(null)}
                  className='bg-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-colors'
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Demo Modal */}
      <AnimatePresence>
        {showVideoDemo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4'
            onClick={() => setShowVideoDemo(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className='bg-white rounded-3xl p-8 max-w-4xl w-full'
              onClick={e => e.stopPropagation()}
            >
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-gray-900'>How Video Consultations Work</h2>
                <button
                  onClick={() => setShowVideoDemo(false)}
                  className='w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors'
                >
                  <span>❌</span>
                </button>
              </div>

              <div className='aspect-video bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6'>
                <div className='text-white text-center'>
                  <span>▶️</span>
                  <p className='text-xl font-semibold'>Video Demo Coming Soon</p>
                  <p className='text-blue-100'>Learn how our consultation platform works</p>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>📅</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>1. Book Session</h3>
                  <p className='text-gray-600 text-sm'>
                    Choose your expert and schedule a convenient time
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>🎥</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>2. Join Call</h3>
                  <p className='text-gray-600 text-sm'>
                    Connect via secure video link at your scheduled time
                  </p>
                </div>
                <div className='text-center'>
                  <div className='w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-3'>
                    <span>✅</span>
                  </div>
                  <h3 className='font-bold text-gray-900 mb-2'>3. Get Results</h3>
                  <p className='text-gray-600 text-sm'>
                    Receive actionable insights and follow-up materials
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
