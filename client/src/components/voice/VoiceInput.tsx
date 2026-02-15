'use client';

import { useState, useEffect, useRef } from 'react';

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  language?: 'en-IN' | 'hi-IN' | 'auto';
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showLanguageToggle?: boolean;
}

export default function VoiceInput({
  onTranscript,
  language = 'en-IN',
  placeholder = 'Click to start voice input...',
  disabled = false,
  className = '',
  showLanguageToggle = true
}: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(language);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check if browser supports speech recognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      setIsSupported(true);
      recognitionRef.current = new SpeechRecognition();
      
      // Configure recognition
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = currentLanguage;
      
      // Event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        const fullTranscript = finalTranscript + interimTranscript;
        setTranscript(fullTranscript);
        onTranscript(fullTranscript);
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(getErrorMessage(event.error));
        setIsListening(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setIsSupported(false);
      setError('Voice input is not supported in this browser');
    }
  }, [currentLanguage, onTranscript]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'no-speech':
        return 'No speech detected. Please try again.';
      case 'audio-capture':
        return 'Microphone access denied. Please allow microphone access.';
      case 'not-allowed':
        return 'Microphone access denied. Please allow microphone access.';
      case 'network':
        return 'Network error. Please check your connection.';
      case 'service-not-allowed':
        return 'Voice service not allowed.';
      default:
        return 'Voice input error. Please try again.';
    }
  };

  const toggleListening = () => {
    if (!isSupported || disabled) return;
    
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setTranscript('');
      recognitionRef.current?.start();
    }
  };

  const handleLanguageChange = (newLanguage: 'en-IN' | 'hi-IN' | 'auto') => {
    setCurrentLanguage(newLanguage);
    if (isListening) {
      recognitionRef.current?.stop();
    }
  };

  const getLanguageLabel = (lang: string): string => {
    switch (lang) {
      case 'en-IN':
        return '🇮🇳 English';
      case 'hi-IN':
        return '🇮🇳 Hindi';
      case 'auto':
        return '🌐 Auto Detect';
      default:
        return '🇮🇳 English';
    }
  };

  if (!isSupported) {
    return (
      <div className={`bg-gray-100 border border-gray-300 rounded-md p-4 text-center ${className}`}>
        <div className="text-gray-600 mb-2">
          🎤 Voice input not supported
        </div>
        <div className="text-sm text-gray-500">
          Please use a modern browser with microphone support
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Language Toggle */}
      {showLanguageToggle && (
        <div className="flex space-x-2">
          {(['en-IN', 'hi-IN', 'auto'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => handleLanguageChange(lang)}
              disabled={disabled || isListening}
              className={`px-3 py-1 text-xs rounded-full border transition-colors ${
                currentLanguage === lang
                  ? 'bg-amber-600 text-white border-amber-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-amber-300'
              } ${disabled || isListening ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {getLanguageLabel(lang)}
            </button>
          ))}
        </div>
      )}

      {/* Voice Input Button */}
      <div className="relative">
        <button
          onClick={toggleListening}
          disabled={disabled}
          className={`w-full p-4 border-2 border-dashed rounded-lg transition-all duration-200 flex items-center justify-center space-x-3 ${
            isListening
              ? 'border-amber-500 bg-amber-50 text-amber-700'
              : 'border-gray-300 hover:border-amber-400 hover:bg-amber-50 text-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        >
          <div className={`text-2xl ${isListening ? 'animate-pulse' : ''}`}>
            {isListening ? '🔴' : '🎤'}
          </div>
          <div className="text-left">
            <div className="font-medium">
              {isListening ? 'Listening...' : 'Click to start voice input'}
            </div>
            <div className="text-sm text-gray-500">
              {currentLanguage === 'en-IN' && 'Speak in English'}
              {currentLanguage === 'hi-IN' && 'हिंदी में बोलें'}
              {currentLanguage === 'auto' && 'Auto-detect language'}
            </div>
          </div>
        </button>

        {/* Visual Feedback */}
        {isListening && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex space-x-1">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-1 h-6 bg-amber-500 rounded-full animate-pulse"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: '1s'
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Transcript Display */}
      {transcript && (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="text-sm font-medium text-gray-700 mb-1">
            Voice Input:
          </div>
          <div className="text-gray-900 font-mono text-sm">
            {transcript}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3">
          <div className="text-sm text-red-700">
            <div className="font-medium mb-1">Voice Input Error:</div>
            <div>{error}</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="text-xs text-gray-500 space-y-1">
        <p>💡 Speak clearly for better recognition</p>
        <p>🎯 Try saying: "I need 100 meters of cotton fabric"</p>
        <p>🔊 Make sure your microphone is working</p>
      </div>
    </div>
  );
}

// Specialized voice input for RFQ creation
export function VoiceRFQInput({
  onTranscript,
  className = ''
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [rfqSuggestions] = useState([
    "I need 500 meters of cotton fabric for garment manufacturing",
    "Looking for automotive parts suppliers in Maharashtra",
    "Require pharmaceutical ingredients with FDA approval",
    "Need IT services for software development project",
    "Searching for construction materials in Delhi"
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="text-sm font-medium text-blue-800 mb-2">
          🎯 RFQ Voice Examples:
        </div>
        <div className="space-y-1">
          {rfqSuggestions.map((suggestion, index) => (
            <div key={index} className="text-xs text-blue-700">
              • {suggestion}
            </div>
          ))}
        </div>
      </div>
      
      <VoiceInput
        onTranscript={onTranscript}
        language="en-IN"
        placeholder="Describe your RFQ requirements..."
        showLanguageToggle={true}
      />
    </div>
  );
}

// Specialized voice input for product search
export function VoiceSearchInput({
  onTranscript,
  className = ''
}: {
  onTranscript: (text: string) => void;
  className?: string;
}) {
  const [searchSuggestions] = useState([
    "cotton fabric",
    "automotive parts",
    "pharmaceutical ingredients",
    "IT services",
    "construction materials"
  ]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="text-sm font-medium text-green-800 mb-2">
          🔍 Search Voice Examples:
        </div>
        <div className="space-y-1">
          {searchSuggestions.map((suggestion, index) => (
            <div key={index} className="text-xs text-green-700">
              • {suggestion}
            </div>
          ))}
        </div>
      </div>
      
      <VoiceInput
        onTranscript={onTranscript}
        language="auto"
        placeholder="Search for products..."
        showLanguageToggle={true}
      />
    </div>
  );
} 
