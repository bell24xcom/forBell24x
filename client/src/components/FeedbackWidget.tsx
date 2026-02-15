'use client';

import { useState } from 'react';
import { MessageSquare, X, Send, Star, ThumbsUp, ThumbsDown } from 'lucide-react';

interface FeedbackData {
  type: 'bug' | 'feature' | 'general';
  rating: number;
  message: string;
  email?: string;
}

const FeedbackWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData>({
    type: 'general',
    rating: 0,
    message: '',
    email: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...feedback,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        }),
      });

      if (response.ok) {
        alert('Thank you for your feedback! We\'ll review it shortly.');
        setFeedback({
          type: 'general',
          rating: 0,
          message: '',
          email: ''
        });
        setIsOpen(false);
      } else {
        alert('Failed to submit feedback. Please try again.');
      }
    } catch (error) {
      console.error('Feedback submission error:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingStars = () => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => setFeedback(prev => ({ ...prev, rating: star }))}
          className={`p-1 rounded ${
            star <= feedback.rating ? 'text-yellow-400' : 'text-gray-300'
          } hover:text-yellow-400 transition-colors`}
        >
          <Star className="w-5 h-5 fill-current" />
        </button>
      ))}
    </div>
  );

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          title="Send Feedback"
        >
          <MessageSquare className="w-6 h-6" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-gray-200 w-80 max-h-96 overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="font-semibold text-lg">Send Feedback</h3>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Feedback Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Feedback Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'bug', label: 'Bug Report', icon: '🐛' },
                { value: 'feature', label: 'Feature Request', icon: '💡' },
                { value: 'general', label: 'General', icon: '💬' }
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFeedback(prev => ({ ...prev, type: type.value as any }))}
                  className={`p-2 rounded-lg border text-sm transition-colors ${
                    feedback.type === type.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <div className="text-center">
                    <div className="text-lg mb-1">{type.icon}</div>
                    <div className="text-xs">{type.label}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              How would you rate your experience?
            </label>
            <RatingStars />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Feedback
            </label>
            <textarea
              value={feedback.message}
              onChange={(e) => setFeedback(prev => ({ ...prev, message: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
              placeholder="Tell us about your experience, suggestions, or any issues you encountered..."
              required
            />
          </div>

          {/* Email (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email (Optional)
            </label>
            <input
              type="email"
              value={feedback.email}
              onChange={(e) => setFeedback(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="your@email.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              We'll only use this to follow up on your feedback
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 5, message: 'Great platform! Everything works perfectly.' }))}
              className="flex items-center gap-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              Love it!
            </button>
            <button
              type="button"
              onClick={() => setFeedback(prev => ({ ...prev, rating: 1, message: 'Found some issues that need attention.' }))}
              className="flex items-center gap-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              Issues
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !feedback.message}
            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
              isSubmitting || !feedback.message
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Send Feedback
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FeedbackWidget; 
