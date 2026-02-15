'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWeb3, useBellEscrow } from '../lib/web3';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Mic, MicOff, Play, Pause, Square, Send, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface VoiceRFQProps {
  onRFQCreated?: (rfqData: any) => void;
<<<<<<< HEAD
=======
  userId?: string;
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
}

interface RFQData {
  title: string;
  description: string;
  category: string;
  quantity: string;
  budget: string;
  timeline: string;
  milestones: string[];
  milestoneAmounts: string[];
}

<<<<<<< HEAD
export const VoiceRFQ: React.FC<VoiceRFQProps> = ({ onRFQCreated }) => {
=======
export const VoiceRFQ: React.FC<VoiceRFQProps> = ({ onRFQCreated, userId }) => {
>>>>>>> b7b4b9c6cd126094e89116e18b3dbb247f1e8e4d
  const { isConnected, connect } = useWeb3();
  const { createEscrow } = useBellEscrow();
  
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<string>('');
  const [rfqData, setRfqData] = useState<RFQData>({
    title: '',
    description: '',
    category: '',
    quantity: '',
    budget: '',
    timeline: '',
    milestones: [''],
    milestoneAmounts: [''],
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Categories for RFQ
  const categories = [
    'Electronics & Electrical',
    'Textiles & Apparel',
    'Machinery & Equipment',
    'Chemicals & Pharmaceuticals',
    'Food & Beverages',
    'Construction & Building',
    'Automotive & Transportation',
    'Agriculture & Farming',
    'Healthcare & Medical',
    'IT & Software',
  ];

  // Initialize audio recording
  useEffect(() => {
    if (typeof window !== 'undefined' && 'MediaRecorder' in window) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
          mediaRecorderRef.current = new MediaRecorder(stream);
          
          mediaRecorderRef.current.ondataavailable = (event) => {
            if (event.data.size > 0) {
              chunksRef.current.push(event.data);
            }
          };
          
          mediaRecorderRef.current.onstop = () => {
            const blob = new Blob(chunksRef.current, { type: 'audio/wav' });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
            chunksRef.current = [];
          };
        })
        .catch(error => {
          console.error('Error accessing microphone:', error);
          toast.error('Microphone access denied');
        });
    }
  }, []);

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      chunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success('Recording started');
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  // Play recorded audio
  const playAudio = () => {
    if (audioUrl && audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Pause audio
  const pauseAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Process voice to text using OpenAI Whisper
  const processVoiceToText = async () => {
    if (!audioBlob) {
      toast.error('No audio recorded');
      return;
    }

    setIsProcessing(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');
      
      const response = await fetch('/api/voice/transcribe', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Transcription failed');
      }
      
      const data = await response.json();
      setTranscript(data.transcript);
      
      // Parse transcript to extract RFQ data
      parseTranscriptToRFQ(data.transcript);
      
      toast.success('Voice processed successfully');
    } catch (error) {
      console.error('Error processing voice:', error);
      toast.error('Failed to process voice');
    } finally {
      setIsProcessing(false);
    }
  };

  // Parse transcript to extract RFQ information
  const parseTranscriptToRFQ = (text: string) => {
    // This is a simplified parser - in production, you'd use more sophisticated NLP
    const lines = text.toLowerCase().split('\n');
    
    let title = '';
    let description = '';
    let category = '';
    let quantity = '';
    let budget = '';
    let timeline = '';
    
    lines.forEach(line => {
      if (line.includes('title') || line.includes('product')) {
        title = line.replace(/^(title|product):\s*/i, '').trim();
      } else if (line.includes('description') || line.includes('details')) {
        description = line.replace(/^(description|details):\s*/i, '').trim();
      } else if (line.includes('category') || line.includes('type')) {
        category = line.replace(/^(category|type):\s*/i, '').trim();
      } else if (line.includes('quantity') || line.includes('amount')) {
        quantity = line.replace(/^(quantity|amount):\s*/i, '').trim();
      } else if (line.includes('budget') || line.includes('price')) {
        budget = line.replace(/^(budget|price):\s*/i, '').trim();
      } else if (line.includes('timeline') || line.includes('deadline')) {
        timeline = line.replace(/^(timeline|deadline):\s*/i, '').trim();
      }
    });
    
    setRfqData(prev => ({
      ...prev,
      title: title || prev.title,
      description: description || prev.description,
      category: category || prev.category,
      quantity: quantity || prev.quantity,
      budget: budget || prev.budget,
      timeline: timeline || prev.timeline,
    }));
  };

  // Add milestone
  const addMilestone = () => {
    setRfqData(prev => ({
      ...prev,
      milestones: [...prev.milestones, ''],
      milestoneAmounts: [...prev.milestoneAmounts, ''],
    }));
  };

  // Remove milestone
  const removeMilestone = (index: number) => {
    setRfqData(prev => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
      milestoneAmounts: prev.milestoneAmounts.filter((_, i) => i !== index),
    }));
  };

  // Update milestone
  const updateMilestone = (index: number, field: 'milestone' | 'amount', value: string) => {
    setRfqData(prev => ({
      ...prev,
      [field === 'milestone' ? 'milestones' : 'milestoneAmounts']: 
        prev[field === 'milestone' ? 'milestones' : 'milestoneAmounts'].map((item, i) => 
          i === index ? value : item
        ),
    }));
  };

  // Submit RFQ
  const submitRFQ = async () => {
    if (!isConnected) {
      await connect();
      return;
    }

    try {
      // Create escrow if milestones are defined
      if (rfqData.milestones.length > 0 && rfqData.milestoneAmounts.some(amount => amount)) {
        const milestoneAmounts = rfqData.milestoneAmounts
          .filter(amount => amount)
          .map(amount => amount.toString());
        
        const tx = await createEscrow(
          '0x0000000000000000000000000000000000000000', // Placeholder supplier address
          rfqData.milestones.filter(milestone => milestone).map(milestone => Number(milestone)),
          milestoneAmounts
        );
        
        toast.success('RFQ created with blockchain escrow');
      } else {
        // Create regular RFQ without escrow
        const response = await fetch('/api/rfq/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(rfqData),
        });
        
        if (!response.ok) {
          throw new Error('Failed to create RFQ');
        }
        
        toast.success('RFQ created successfully');
      }
      
      onRFQCreated?.(rfqData);
      
      // Reset form
      setRfqData({
        title: '',
        description: '',
        category: '',
        quantity: '',
        budget: '',
        timeline: '',
        milestones: [''],
        milestoneAmounts: [''],
      });
      setTranscript('');
      setAudioBlob(null);
      setAudioUrl(null);
      
    } catch (error) {
      console.error('Error creating RFQ:', error);
      toast.error('Failed to create RFQ');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5" />
            Voice-Based RFQ Submission
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Voice Recording Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isProcessing}
                variant={isRecording ? "destructive" : "default"}
                className="flex items-center gap-2"
              >
                {isRecording ? <Square className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                {isRecording ? 'Stop Recording' : 'Start Recording'}
              </Button>
              
              {audioUrl && (
                <Button
                  onClick={isPlaying ? pauseAudio : playAudio}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isPlaying ? 'Pause' : 'Play'}
                </Button>
              )}
              
              <Button
                onClick={processVoiceToText}
                disabled={!audioBlob || isProcessing}
                className="flex items-center gap-2"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Process Voice
              </Button>
            </div>
            
            {transcript && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <Label className="text-sm font-medium">Transcribed Text:</Label>
                <p className="mt-2 text-sm text-gray-700">{transcript}</p>
              </div>
            )}
          </div>

          {/* RFQ Form */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Product/Service Title</Label>
                <Input
                  id="title"
                  value={rfqData.title}
                  onChange={(e) => setRfqData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter product or service title"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Select
                  value={rfqData.category}
                  onValueChange={(value) => setRfqData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={rfqData.description}
                onChange={(e) => setRfqData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe your requirements in detail"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={rfqData.quantity}
                  onChange={(e) => setRfqData(prev => ({ ...prev, quantity: e.target.value }))}
                  placeholder="e.g., 100 units"
                />
              </div>
              
              <div>
                <Label htmlFor="budget">Budget</Label>
                <Input
                  id="budget"
                  value={rfqData.budget}
                  onChange={(e) => setRfqData(prev => ({ ...prev, budget: e.target.value }))}
                  placeholder="e.g., ₹50,000"
                />
              </div>
              
              <div>
                <Label htmlFor="timeline">Timeline</Label>
                <Input
                  id="timeline"
                  value={rfqData.timeline}
                  onChange={(e) => setRfqData(prev => ({ ...prev, timeline: e.target.value }))}
                  placeholder="e.g., 30 days"
                />
              </div>
            </div>

            {/* Milestones Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Payment Milestones (Optional)</Label>
                <Button onClick={addMilestone} variant="outline" size="sm">
                  Add Milestone
                </Button>
              </div>
              
              {rfqData.milestones.map((milestone, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="flex-1">
                    <Input
                      value={milestone}
                      onChange={(e) => updateMilestone(index, 'milestone', e.target.value)}
                      placeholder="Milestone description"
                    />
                  </div>
                  <div className="w-32">
                    <Input
                      value={rfqData.milestoneAmounts[index]}
                      onChange={(e) => updateMilestone(index, 'amount', e.target.value)}
                      placeholder="Amount"
                    />
                  </div>
                  <Button
                    onClick={() => removeMilestone(index)}
                    variant="destructive"
                    size="sm"
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button
                onClick={submitRFQ}
                disabled={!rfqData.title || !rfqData.description}
                className="flex items-center gap-2"
              >
                <Send className="h-4 w-4" />
                {isConnected ? 'Create RFQ' : 'Connect Wallet & Create RFQ'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hidden audio element for playback */}
      <audio
        ref={audioRef}
        src={audioUrl || undefined}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </div>
  );
};
