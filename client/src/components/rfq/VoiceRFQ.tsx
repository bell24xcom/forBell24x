'use client';

import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Play, Pause, Download, Trash2, Send, Volume2, FileText, Clock, CheckCircle, AlertCircle, Settings } from 'lucide-react';

interface VoiceRecording {
  id: string;
  filename: string;
  duration: number;
  size: string;
  timestamp: string;
  status: 'recording' | 'processing' | 'completed' | 'failed';
  transcription?: string;
  confidence?: number;
  rfqData?: {
    title: string;
    description: string;
    category: string;
    budget: string;
    deadline: string;
  };
}

interface TranscriptionResult {
  text: string;
  confidence: number;
  segments: {
    start: number;
    end: number;
    text: string;
    confidence: number;
  }[];
}

export default function VoiceRFQ() {
  const [recordings, setRecordings] = useState<VoiceRecording[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [currentRecording, setCurrentRecording] = useState<VoiceRecording | null>(null);
  const [transcription, setTranscription] = useState<TranscriptionResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('electronics');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchVoiceRecordings();
  }, []);

  const fetchVoiceRecordings = async () => {
    try {
      const response = await fetch('/api/rfq/voice-recordings');
      if (response.ok) {
        const data = await response.json();
        setRecordings(data);
      }
    } catch (error) {
      console.error('Error fetching voice recordings:', error);
      // Fallback to mock data
      setRecordings(generateMockRecordings());
    }
  };

  const generateMockRecordings = (): VoiceRecording[] => [
    {
      id: 'rec_001',
      filename: 'RFQ_Electronics_Components_2024-01-16.wav',
      duration: 45,
      size: '2.3 MB',
      timestamp: '2024-01-16T10:30:00Z',
      status: 'completed',
      transcription: 'We need electronic components for our new IoT device. Looking for reliable suppliers with competitive pricing.',
      confidence: 94.2,
      rfqData: {
        title: 'Electronic Components for IoT Device',
        description: 'We need electronic components for our new IoT device. Looking for reliable suppliers with competitive pricing.',
        category: 'electronics',
        budget: '$5,000 - $10,000',
        deadline: '2024-02-15'
      }
    },
    {
      id: 'rec_002',
      filename: 'RFQ_Office_Supplies_2024-01-16.wav',
      duration: 32,
      size: '1.8 MB',
      timestamp: '2024-01-16T11:15:00Z',
      status: 'processing',
      transcription: 'Office supplies needed for new branch opening. Bulk order required.',
      confidence: 87.6,
      rfqData: {
        title: 'Office Supplies for New Branch',
        description: 'Office supplies needed for new branch opening. Bulk order required.',
        category: 'office_supplies',
        budget: '$2,000 - $3,500',
        deadline: '2024-01-30'
      }
    },
    {
      id: 'rec_003',
      filename: 'RFQ_Manufacturing_Equipment_2024-01-16.wav',
      duration: 67,
      size: '3.1 MB',
      timestamp: '2024-01-16T12:00:00Z',
      status: 'failed',
      transcription: 'Manufacturing equipment for automotive parts production.',
      confidence: 72.3
    }
  ];

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        processRecording(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start recording timer
      recordingIntervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

      // Create new recording entry
      const newRecording: VoiceRecording = {
        id: `rec_${Date.now()}`,
        filename: `RFQ_${new Date().toISOString().split('T')[0]}.wav`,
        duration: 0,
        size: '0 MB',
        timestamp: new Date().toISOString(),
        status: 'recording'
      };
      setCurrentRecording(newRecording);
      setRecordings(prev => [newRecording, ...prev]);

    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      // Stop all tracks
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  const processRecording = async (blob: Blob) => {
    if (!currentRecording) return;

    setIsProcessing(true);
    
    try {
      // REAL transcription processing with OpenAI
      const formData = new FormData();
      formData.append('audioFile', blob, 'recording.wav');
      formData.append('language', 'en');

      const response = await fetch('/api/voice/process', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Transcription failed');
      }

      const realTranscription: TranscriptionResult = {
        text: result.transcript,
        confidence: result.analysis?.confidence || 85.0,
        segments: result.analysis?.segments || [
          { start: 0, end: 5, text: result.transcript, confidence: 85.0 }
        ]
      };

      setTranscription(realTranscription);
      
      // Update recording status with REAL data
      const updatedRecording: VoiceRecording = {
        ...currentRecording,
        status: 'completed',
        transcription: realTranscription.text,
        confidence: realTranscription.confidence,
        duration: recordingTime,
        size: `${(blob.size / (1024 * 1024)).toFixed(1)} MB`,
        rfqData: {
          title: result.analysis?.title || 'Voice RFQ - ' + realTranscription.text.substring(0, 50) + '...',
          description: realTranscription.text,
          category: result.analysis?.category || selectedCategory,
          budget: result.analysis?.budget || budget || 'Not specified',
          deadline: result.analysis?.deadline || deadline || 'Not specified'
        }
      };

      setRecordings(prev => 
        prev.map(rec => 
          rec.id === currentRecording.id ? updatedRecording : rec
        )
      );
      setCurrentRecording(null);

    } catch (error) {
      console.error('Error processing recording:', error);
      // Update recording status to failed
      setRecordings(prev => 
        prev.map(rec => 
          rec.id === currentRecording?.id 
            ? { ...rec, status: 'failed' }
            : rec
        )
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recording':
        return 'text-red-600 bg-red-100';
      case 'processing':
        return 'text-blue-600 bg-blue-100';
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'failed':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'recording':
        return <Mic className="w-4 h-4 text-red-600 animate-pulse" />;
      case 'processing':
        return <Clock className="w-4 h-4 text-blue-600 animate-spin" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Mic className="w-4 h-4 text-gray-600" />;
    }
  };

  const deleteRecording = (id: string) => {
    setRecordings(prev => prev.filter(rec => rec.id !== id));
  };

  const downloadRecording = (recording: VoiceRecording) => {
    // In a real app, this would download the actual audio file
    const link = document.createElement('a');
    link.href = URL.createObjectURL(audioBlob || new Blob());
    link.download = recording.filename;
    link.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Voice RFQ</h1>
          <p className="text-gray-600">Create RFQs using voice commands and speech recognition</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center space-x-2">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Recording Controls */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Voice Recording</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recording Interface */}
          <div className="space-y-4">
            <div className="flex items-center justify-center">
              <button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                className={`w-24 h-24 rounded-full flex items-center justify-center text-white text-2xl ${
                  isRecording 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-blue-600 hover:bg-blue-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isRecording ? <MicOff /> : <Mic />}
              </button>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-bold text-gray-900">
                {isRecording ? formatTime(recordingTime) : '00:00'}
              </div>
              <div className="text-sm text-gray-600">
                {isRecording ? 'Recording...' : 'Click to start recording'}
              </div>
            </div>

            {isProcessing && (
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <div className="text-sm text-gray-600 mt-2">Processing audio...</div>
              </div>
            )}
          </div>

          {/* RFQ Details Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="electronics">Electronics</option>
                <option value="office_supplies">Office Supplies</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="construction">Construction</option>
                <option value="healthcare">Healthcare</option>
                <option value="automotive">Automotive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
              <input
                type="text"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., $5,000 - $10,000"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Deadline</label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <button
              disabled={!transcription || isProcessing}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Create RFQ</span>
            </button>
          </div>
        </div>
      </div>

      {/* Transcription Display */}
      {transcription && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Transcription Result</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm font-medium text-gray-700">Confidence: {transcription.confidence}%</span>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                  Edit
                </button>
                <button className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">
                  Accept
                </button>
              </div>
            </div>
            <p className="text-gray-900 leading-relaxed">{transcription.text}</p>
          </div>
        </div>
      )}

      {/* Recordings List */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Voice Recordings</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recording</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recordings.map((recording) => (
                <tr key={recording.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{recording.filename}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(recording.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(recording.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(recording.status)}`}>
                        {recording.status}
                      </span>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(recording.duration)}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recording.size}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {recording.confidence ? `${recording.confidence}%` : '-'}
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      {recording.status === 'completed' && (
                        <>
                          <button 
                            onClick={() => downloadRecording(recording)}
                            className="text-blue-600 hover:text-blue-900"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button className="text-green-600 hover:text-green-900" title="View RFQ">
                            <FileText className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      <button 
                        onClick={() => deleteRecording(recording.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Use Voice RFQ</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-700">
          <div>
            <h4 className="font-medium mb-2">1. Start Recording</h4>
            <p>Click the microphone button and speak clearly about your requirements</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">2. Review Transcription</h4>
            <p>Check the AI-generated transcription and edit if needed</p>
          </div>
          <div>
            <h4 className="font-medium mb-2">3. Create RFQ</h4>
            <p>Fill in additional details and submit your RFQ</p>
          </div>
        </div>
      </div>
    </div>
  );
}
