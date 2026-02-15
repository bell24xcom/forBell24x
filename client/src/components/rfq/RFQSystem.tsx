'use client';
import { useState, useRef, useEffect } from 'react';

interface RFQData {
  id: string;
  type: 'VIDEO' | 'VOICE' | 'TEXT';
  title: string;
  message: string;
  productId: string;
  supplierId: string;
  quantity: number;
  unit: string;
  expectedPrice: number;
  deliveryLocation: string;
  deliveryTimeframe: string;
  specifications: Record<string, string>;
  attachments: string[];
  videoUrl?: string;
  audioUrl?: string;
  status: 'DRAFT' | 'SENT' | 'QUOTED' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  createdAt: string;
  updatedAt: string;
}

interface RFQSystemProps {
  productId?: string;
  supplierId?: string;
  onRFQSubmit?: (rfq: RFQData) => void;
}

export default function RFQSystem({ productId, supplierId, onRFQSubmit }: RFQSystemProps) {
  const [rfqType, setRfqType] = useState<'VIDEO' | 'VOICE' | 'TEXT'>('TEXT');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [rfqData, setRfqData] = useState<Partial<RFQData>>({
    title: '',
    message: '',
    quantity: 1,
    unit: 'pieces',
    expectedPrice: 0,
    deliveryLocation: '',
    deliveryTimeframe: '30 days',
    specifications: {},
    attachments: []
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Video recording functions
  const startVideoRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRfqData(prev => ({ ...prev, videoUrl: url }));
        setIsUploading(true);
        
        // Simulate upload
        setTimeout(() => {
          setIsUploading(false);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting video recording:', error);
      alert('Error accessing camera. Please check permissions.');
    }
  };

  const stopVideoRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Stop all tracks
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    }
  };

  // Audio recording functions
  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setRfqData(prev => ({ ...prev, audioUrl: url }));
        setIsUploading(true);
        
        // Simulate upload
        setTimeout(() => {
          setIsUploading(false);
        }, 2000);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      alert('Error accessing microphone. Please check permissions.');
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleInputChange = (field: keyof RFQData, value: any) => {
    setRfqData(prev => ({ ...prev, [field]: value }));
  };

  const handleSpecificationChange = (key: string, value: string) => {
    setRfqData(prev => ({
      ...prev,
      specifications: { ...prev.specifications, [key]: value }
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const fileUrls = files.map(file => URL.createObjectURL(file));
    setRfqData(prev => ({
      ...prev,
      attachments: [...(prev.attachments || []), ...fileUrls]
    }));
  };

  const handleSubmit = () => {
    const newRFQ: RFQData = {
      id: `RFQ-${Date.now()}`,
      type: rfqType,
      title: rfqData.title || '',
      message: rfqData.message || '',
      productId: productId || '',
      supplierId: supplierId || '',
      quantity: rfqData.quantity || 1,
      unit: rfqData.unit || 'pieces',
      expectedPrice: rfqData.expectedPrice || 0,
      deliveryLocation: rfqData.deliveryLocation || '',
      deliveryTimeframe: rfqData.deliveryTimeframe || '30 days',
      specifications: rfqData.specifications || {},
      attachments: rfqData.attachments || [],
      videoUrl: rfqData.videoUrl,
      audioUrl: rfqData.audioUrl,
      status: 'SENT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    onRFQSubmit?.(newRFQ);
    
    // Reset form
    setRfqData({
      title: '',
      message: '',
      quantity: 1,
      unit: 'pieces',
      expectedPrice: 0,
      deliveryLocation: '',
      deliveryTimeframe: '30 days',
      specifications: {},
      attachments: []
    });
    
    alert('RFQ submitted successfully!');
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-2xl shadow-xl">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Submit RFQ</h2>
        <p className="text-gray-600">Choose your preferred communication method</p>
      </div>

      {/* RFQ Type Selection */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Select RFQ Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setRfqType('TEXT')}
            className={`p-6 rounded-xl border-2 transition-all ${
              rfqType === 'TEXT'
                ? 'border-blue-500 bg-blue-50 text-blue-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-4xl mb-3">📝</div>
            <h4 className="font-semibold mb-2">Text RFQ</h4>
            <p className="text-sm text-gray-600">Write detailed requirements</p>
          </button>

          <button
            onClick={() => setRfqType('VOICE')}
            className={`p-6 rounded-xl border-2 transition-all ${
              rfqType === 'VOICE'
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-4xl mb-3">🎤</div>
            <h4 className="font-semibold mb-2">Voice RFQ</h4>
            <p className="text-sm text-gray-600">Record your requirements</p>
          </button>

          <button
            onClick={() => setRfqType('VIDEO')}
            className={`p-6 rounded-xl border-2 transition-all ${
              rfqType === 'VIDEO'
                ? 'border-purple-500 bg-purple-50 text-purple-700'
                : 'border-gray-200 hover:border-gray-300 text-gray-700'
            }`}
          >
            <div className="text-4xl mb-3">📹</div>
            <h4 className="font-semibold mb-2">Video RFQ</h4>
            <p className="text-sm text-gray-600">Record with video</p>
          </button>
        </div>
      </div>

      {/* Basic Information */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">RFQ Title</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Enter RFQ title"
              value={rfqData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
            <div className="flex space-x-2">
              <input
                type="number"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                placeholder="Quantity"
                value={rfqData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
              />
              <select
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={rfqData.unit}
                onChange={(e) => handleInputChange('unit', e.target.value)}
              >
                <option value="pieces">Pieces</option>
                <option value="kg">Kilograms</option>
                <option value="tons">Tons</option>
                <option value="meters">Meters</option>
                <option value="liters">Liters</option>
                <option value="units">Units</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Expected Price (₹)</label>
            <input
              type="number"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Expected price"
              value={rfqData.expectedPrice}
              onChange={(e) => handleInputChange('expectedPrice', parseFloat(e.target.value) || 0)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Location</label>
            <input
              type="text"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Delivery location"
              value={rfqData.deliveryLocation}
              onChange={(e) => handleInputChange('deliveryLocation', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Timeframe</label>
            <select
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              value={rfqData.deliveryTimeframe}
              onChange={(e) => handleInputChange('deliveryTimeframe', e.target.value)}
            >
              <option value="7 days">7 days</option>
              <option value="15 days">15 days</option>
              <option value="30 days">30 days</option>
              <option value="45 days">45 days</option>
              <option value="60 days">60 days</option>
              <option value="90 days">90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Message/Recording Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {rfqType === 'TEXT' ? 'Message' : rfqType === 'VOICE' ? 'Voice Recording' : 'Video Recording'}
        </h3>

        {rfqType === 'TEXT' && (
          <textarea
            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
            placeholder="Describe your requirements in detail..."
            value={rfqData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
          />
        )}

        {rfqType === 'VOICE' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              {!isRecording ? (
                <button
                  onClick={startAudioRecording}
                  className="flex items-center space-x-3 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">🎤</span>
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopAudioRecording}
                  className="flex items-center space-x-3 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">⏹️</span>
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {rfqData.audioUrl && (
              <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <audio controls src={rfqData.audioUrl} className="flex-1" />
                <button
                  onClick={() => setRfqData(prev => ({ ...prev, audioUrl: undefined }))}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            )}

            {isUploading && (
              <div className="text-center text-gray-600">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Uploading audio...
              </div>
            )}
          </div>
        )}

        {rfqType === 'VIDEO' && (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              {!isRecording ? (
                <button
                  onClick={startVideoRecording}
                  className="flex items-center space-x-3 px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">📹</span>
                  <span>Start Recording</span>
                </button>
              ) : (
                <button
                  onClick={stopVideoRecording}
                  className="flex items-center space-x-3 px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <span className="text-2xl">⏹️</span>
                  <span>Stop Recording</span>
                </button>
              )}
            </div>

            {isRecording && (
              <div className="text-center">
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  className="w-full max-w-md mx-auto rounded-lg"
                />
              </div>
            )}

            {rfqData.videoUrl && (
              <div className="space-y-2">
                <video controls src={rfqData.videoUrl} className="w-full max-w-md mx-auto rounded-lg" />
                <div className="text-center">
                  <button
                    onClick={() => setRfqData(prev => ({ ...prev, videoUrl: undefined }))}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg"
                  >
                    Remove Video
                  </button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="text-center text-gray-600">
                <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                Uploading video...
              </div>
            )}
          </div>
        )}
      </div>

      {/* Specifications */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Specifications</h3>
        <div className="space-y-4">
          {Object.entries(rfqData.specifications || {}).map(([key, value]) => (
            <div key={key} className="flex space-x-2">
              <input
                type="text"
                placeholder="Specification name"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={key}
                onChange={(e) => {
                  const newSpecs = { ...rfqData.specifications };
                  delete newSpecs[key];
                  newSpecs[e.target.value] = value;
                  handleInputChange('specifications', newSpecs);
                }}
              />
              <input
                type="text"
                placeholder="Value"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                value={value}
                onChange={(e) => handleSpecificationChange(key, e.target.value)}
              />
              <button
                onClick={() => {
                  const newSpecs = { ...rfqData.specifications };
                  delete newSpecs[key];
                  handleInputChange('specifications', newSpecs);
                }}
                className="px-3 py-2 bg-red-500 text-white rounded-lg"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            onClick={() => handleSpecificationChange(`spec_${Date.now()}`, '')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg"
          >
            Add Specification
          </button>
        </div>
      </div>

      {/* File Attachments */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Attachments</h3>
        <input
          type="file"
          multiple
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          onChange={handleFileUpload}
        />
        
        {rfqData.attachments && rfqData.attachments.length > 0 && (
          <div className="mt-4 space-y-2">
            {rfqData.attachments.map((attachment, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-700">Attachment {index + 1}</span>
                <button
                  onClick={() => {
                    const newAttachments = [...(rfqData.attachments || [])];
                    newAttachments.splice(index, 1);
                    handleInputChange('attachments', newAttachments);
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setRfqData({
            title: '',
            message: '',
            quantity: 1,
            unit: 'pieces',
            expectedPrice: 0,
            deliveryLocation: '',
            deliveryTimeframe: '30 days',
            specifications: {},
            attachments: []
          })}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Reset
        </button>
        <button
          onClick={handleSubmit}
          className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-lg transition-all transform hover:scale-105"
        >
          Submit RFQ
        </button>
      </div>
    </div>
  );
}
