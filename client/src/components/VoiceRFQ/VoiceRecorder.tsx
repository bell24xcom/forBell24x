'use client';

import { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Play, Pause, Square, FileText, Upload, CheckCircle, AlertCircle } from 'lucide-react';

interface VoiceRFQData {
  title: string;
  description: string;
  budget: string;
  deadline: string;
  category: string;
  requirements: string;
  urgency: 'low' | 'medium' | 'high';
  complexity: 'simple' | 'moderate' | 'complex';
}

export default function VoiceRFQ() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState<'recording' | 'details' | 'review'>('recording');
  const [recognitionError, setRecognitionError] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<any>(null);

  const [rfqData, setRfqData] = useState<VoiceRFQData>({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    category: '',
    requirements: '',
    urgency: 'medium',
    complexity: 'moderate'
  });

  const startRecording = useCallback(async () => {
    try {
      setRecognitionError('');
      setIsProcessing(true);

      // Get audio stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100
        }
      });

      streamRef.current = stream;

      // Initialize speech recognition
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-IN';

        recognitionRef.current.onstart = () => {
          setIsRecording(true);
          setIsProcessing(false);
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

          setTranscript(finalTranscript + interimTranscript);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setRecognitionError(`Recognition error: ${event.error}`);
          setIsRecording(false);
          setIsProcessing(false);
        };

        recognitionRef.current.onend = () => {
          setIsRecording(false);
          setIsProcessing(false);
        };

        recognitionRef.current.start();
      } else {
        // Fallback to MediaRecorder for audio recording only
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus'
        });
        
        mediaRecorderRef.current = mediaRecorder;
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
          const blob = new Blob(chunks, { type: 'audio/webm' });
          setAudioBlob(blob);
          setAudioUrl(URL.createObjectURL(blob));
          setCurrentStep('details');
        };
        
        mediaRecorder.start();
        setIsRecording(true);
        setIsProcessing(false);
      }

    } catch (error) {
      console.error('Error accessing microphone:', error);
      setRecognitionError('Unable to access microphone. Please check permissions.');
      setIsProcessing(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current && isRecording) {
      recognitionRef.current.stop();
    }
    
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsRecording(false);
    setIsProcessing(false);
  }, [isRecording]);

  const togglePlayback = useCallback(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  }, [isPlaying]);

  const handleInputChange = (field: keyof VoiceRFQData, value: string) => {
    setRfqData(prev => ({ ...prev, [field]: value }));
  };

  const processTranscript = useCallback(() => {
    if (!transcript) return;

    // Simple NLP processing to extract key information
    const text = transcript.toLowerCase();
    
    // Extract urgency
    if (text.includes('urgent') || text.includes('asap') || text.includes('immediately')) {
      setRfqData(prev => ({ ...prev, urgency: 'high' }));
    } else if (text.includes('soon') || text.includes('quick')) {
      setRfqData(prev => ({ ...prev, urgency: 'medium' }));
    }

    // Extract complexity
    if (text.includes('simple') || text.includes('basic')) {
      setRfqData(prev => ({ ...prev, complexity: 'simple' }));
    } else if (text.includes('complex') || text.includes('advanced') || text.includes('technical')) {
      setRfqData(prev => ({ ...prev, complexity: 'complex' }));
    }

    // Extract budget hints
    const budgetMatch = text.match(/(\d+)\s*(?:lakh|lac|thousand|k|rs|rupees)/i);
    if (budgetMatch) {
      let budget = budgetMatch[1];
      if (text.includes('lakh') || text.includes('lac')) {
        budget = (parseInt(budget) * 100000).toString();
      } else if (text.includes('thousand') || text.includes('k')) {
        budget = (parseInt(budget) * 1000).toString();
      }
      setRfqData(prev => ({ ...prev, budget }));
    }

    // Extract category hints
    const categories = ['electronics', 'textiles', 'automotive', 'pharmaceuticals', 'machinery', 'chemicals', 'food'];
    for (const category of categories) {
      if (text.includes(category)) {
        setRfqData(prev => ({ ...prev, category }));
        break;
      }
    }

    // Use transcript as description if no description set
    if (!rfqData.description) {
      setRfqData(prev => ({ ...prev, description: transcript }));
    }
  }, [transcript, rfqData.description]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('title', rfqData.title);
      formData.append('description', rfqData.description);
      formData.append('budget', rfqData.budget);
      formData.append('deadline', rfqData.deadline);
      formData.append('category', rfqData.category);
      formData.append('requirements', rfqData.requirements);
      formData.append('urgency', rfqData.urgency);
      formData.append('complexity', rfqData.complexity);
      formData.append('transcript', transcript);
      
      if (audioBlob) {
        formData.append('audio', audioBlob, 'rfq-audio.webm');
      }

      // TODO: Replace with actual API endpoint
      const response = await fetch('/api/rfq/create', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        alert('Voice RFQ submitted successfully!');
        // Reset form
        setRfqData({
          title: '',
          description: '',
          budget: '',
          deadline: '',
          category: '',
          requirements: '',
          urgency: 'medium',
          complexity: 'moderate'
        });
        setTranscript('');
        setAudioBlob(null);
        setAudioUrl('');
        setCurrentStep('recording');
      }
    } catch (error) {
      console.error('Error submitting RFQ:', error);
      alert('Error submitting RFQ. Please try again.');
    }
  };

  const retakeAudio = () => {
    setTranscript('');
    setAudioBlob(null);
    setAudioUrl('');
    setCurrentStep('recording');
  };

  if (currentStep === 'details') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Voice RFQ</h2>
          <p className="text-gray-600">Review and enhance the transcribed information</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audio Preview */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Audio Preview</h3>
            {audioUrl && (
              <div className="bg-gray-100 rounded-lg p-4">
                <audio
                  ref={audioRef}
                  src={audioUrl}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  className="w-full"
                  controls
                />
              </div>
            )}
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-800 mb-2">Transcribed Text</h4>
              <p className="text-blue-700 text-sm">{transcript || 'No transcription available'}</p>
            </div>

            <button
              onClick={retakeAudio}
              className="w-full px-4 py-2 text-sm text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Record Again
            </button>
          </div>

          {/* RFQ Details Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">RFQ Details</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={rfqData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Brief title for your RFQ"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={rfqData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Detailed description of your requirements"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Budget <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">₹</span>
                  <input
                    type="number"
                    value={rfqData.budget}
                    onChange={(e) => handleInputChange('budget', e.target.value)}
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Deadline <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={rfqData.deadline}
                  onChange={(e) => handleInputChange('deadline', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category <span className="text-red-500">*</span>
                </label>
                <select
                  value={rfqData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="electronics">Electronics</option>
                  <option value="textiles">Textiles</option>
                  <option value="automotive">Automotive</option>
                  <option value="pharmaceuticals">Pharmaceuticals</option>
                  <option value="machinery">Machinery</option>
                  <option value="chemicals">Chemicals</option>
                  <option value="food">Food & Beverages</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Urgency
                </label>
                <select
                  value={rfqData.urgency}
                  onChange={(e) => handleInputChange('urgency', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Complexity
              </label>
              <select
                value={rfqData.complexity}
                onChange={(e) => handleInputChange('complexity', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="simple">Simple</option>
                <option value="moderate">Moderate</option>
                <option value="complex">Complex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Technical Requirements
              </label>
              <textarea
                value={rfqData.requirements}
                onChange={(e) => handleInputChange('requirements', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Technical specifications, quality standards, certifications needed"
              />
            </div>

            <button
              onClick={() => setCurrentStep('review')}
              className="w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Review & Submit
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'review') {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Review Your Voice RFQ</h2>
          <p className="text-gray-600">Please review all details before submitting</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">RFQ Summary</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Title:</span>
                <span className="text-gray-900">{rfqData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Category:</span>
                <span className="text-gray-900">{rfqData.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Budget:</span>
                <span className="text-gray-900">₹{rfqData.budget}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Deadline:</span>
                <span className="text-gray-900">{rfqData.deadline}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Urgency:</span>
                <span className="text-gray-900 capitalize">{rfqData.urgency}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Complexity:</span>
                <span className="text-gray-900 capitalize">{rfqData.complexity}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Description</h3>
            <p className="text-gray-700">{rfqData.description}</p>
            
            {rfqData.requirements && (
              <>
                <h4 className="font-medium text-gray-800 mt-4 mb-2">Technical Requirements</h4>
                <p className="text-gray-700">{rfqData.requirements}</p>
              </>
            )}

            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">Voice Transcript</h4>
              <p className="text-blue-700 text-sm">{transcript}</p>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentStep('details')}
            className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            Edit Details
          </button>
          <button
            onClick={handleSubmit}
            className="px-8 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            Submit RFQ
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Create Voice RFQ</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Speak your requirements and let AI transcribe and analyze them. 
          Get instant supplier matching based on your voice input.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mic className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Speak Requirements</h3>
          <p className="text-sm text-gray-600">Use your voice to explain needs</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">AI Transcription</h3>
          <p className="text-sm text-gray-600">Automatic text conversion</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Upload className="w-8 h-8 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-800 mb-2">Smart Matching</h3>
          <p className="text-sm text-gray-600">AI-powered supplier selection</p>
        </div>
      </div>

      <div className="text-center">
        {!isRecording ? (
          <button
            onClick={startRecording}
            disabled={isProcessing}
            className={`inline-flex items-center px-8 py-4 text-lg font-medium rounded-full transition-all duration-200 shadow-lg hover:shadow-xl ${
              isProcessing 
                ? 'bg-gray-400 text-gray-600 cursor-not-allowed' 
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {isProcessing ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                Processing...
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-3" />
                Start Voice RFQ
              </>
            )}
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center space-x-4">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-lg font-medium text-gray-700">Recording...</span>
            </div>
            <button
              onClick={stopRecording}
              className="inline-flex items-center px-8 py-4 bg-red-600 text-white text-lg font-medium rounded-full hover:bg-red-700 transition-all duration-200 shadow-lg"
            >
              <Square className="w-6 h-6 mr-3" />
              Stop Recording
            </button>
          </div>
        )}
        
        {recognitionError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-700">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm">{recognitionError}</span>
            </div>
          </div>
        )}
        
        <div className="mt-6 text-sm text-gray-500">
          <p>Speak clearly and at a normal pace</p>
          <p>Recommended duration: 30 seconds to 2 minutes</p>
          <p>Mention budget, deadline, and technical requirements</p>
        </div>
      </div>
    </div>
  );
}
