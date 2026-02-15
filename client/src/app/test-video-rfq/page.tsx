'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Video, VideoOff, Upload, Play, Square, Trash2, Camera, FileVideo } from 'lucide-react'

export default function TestVideoRFQPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [transcription, setTranscription] = useState('')
  const [rfqData, setRfqData] = useState<any>(null)
  const [error, setError] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      mediaRecorderRef.current = new MediaRecorder(stream)
      const chunks: BlobPart[] = []

      mediaRecorderRef.current.ondataavailable = (event) => {
        chunks.push(event.data)
      }

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' })
        setVideoBlob(blob)
        setVideoUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorderRef.current.start()
      setIsRecording(true)
      setError('')
      setRecordingTime(0)

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check camera and microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file)
      setVideoUrl(URL.createObjectURL(file))
      setError('')
    } else {
      setError('Please select a valid video file (MP4, MOV, AVI)')
    }
  }

  const processVideoRFQ = async () => {
    const videoToProcess = videoBlob || uploadedFile
    
    if (!videoToProcess) {
      setError('No video to process. Please record or upload a video first.')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('video', videoToProcess, 'video-rfq.webm')
      formData.append('type', videoBlob ? 'recording' : 'upload')

      const response = await fetch('/api/video-rfq', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()

      if (result.success) {
        setTranscription(result.transcription)
        setRfqData(result.extractedInfo)
      } else {
        setError(result.error || 'Failed to process video RFQ')
      }
    } catch (error) {
      console.error('Video RFQ processing error:', error)
      
      // Provide fallback mock data for testing
      const mockTranscription = "I need 50 units of industrial machinery for our manufacturing plant in Mumbai. Budget is around 2 lakhs. Need delivery within 3 weeks."
      const mockRfqData = {
        title: "Industrial Machinery - 50 units",
        description: mockTranscription,
        category: "Machinery & Equipment",
        subcategory: "Industrial Machinery",
        quantity: 50,
        unit: "units",
        budget: 200000,
        currency: "INR",
        location: "Mumbai",
        deliveryDeadline: "3 weeks",
        priority: "medium",
        specifications: ["Industrial grade", "Manufacturing use"],
        requirements: ["Quality certification", "Installation support"]
      }

      setTranscription(mockTranscription)
      setRfqData(mockRfqData)
      setError('Using demo data - API connection failed. This is normal for testing.')
    } finally {
      setIsUploading(false)
    }
  }

  const resetVideo = () => {
    setVideoBlob(null)
    setUploadedFile(null)
    setVideoUrl(null)
    setTranscription('')
    setRfqData(null)
    setRecordingTime(0)
    setError('')
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Video RFQ Test Page
          </h1>
          <p className="text-xl text-gray-600">
            Test the video RFQ functionality with real video recording and upload
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Record Video Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Camera className="w-5 h-5 mr-2" />
                Record Video RFQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className='bg-gray-100 rounded-lg h-64 flex items-center justify-center relative'>
                {videoUrl ? (
                  <video 
                    ref={videoRef}
                    src={videoUrl} 
                    controls 
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className='text-center'>
                    <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className='text-gray-500 mb-2'>Click to start recording</p>
                    {recordingTime > 0 && (
                      <div className="text-3xl font-bold text-red-600">
                        {formatTime(recordingTime)}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                {!isRecording ? (
                  <Button
                    onClick={startRecording}
                    className="flex-1 bg-red-500 hover:bg-red-600"
                    disabled={!!videoUrl}
                  >
                    <Video className="w-4 h-4 mr-2" />
                    Start Recording
                  </Button>
                ) : (
                  <Button
                    onClick={stopRecording}
                    className="flex-1 bg-gray-500 hover:bg-gray-600"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
                
                {videoUrl && (
                  <Button
                    onClick={resetVideo}
                    variant="outline"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upload Video Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Video RFQ
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div 
                className='border-2 border-dashed border-gray-300 rounded-lg h-64 flex items-center justify-center cursor-pointer hover:border-purple-400 transition-colors'
                onClick={() => fileInputRef.current?.click()}
              >
                <div className='text-center'>
                  <FileVideo className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className='text-gray-500 mb-2'>Drop video file here or click to browse</p>
                  <p className='text-xs text-gray-400'>MP4, MOV, AVI up to 100MB</p>
                </div>
              </div>
              
              <input
                ref={fileInputRef}
                type="file"
                accept="video/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              
              <div className="flex gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1"
                  variant="outline"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Choose File
                </Button>
                
                {uploadedFile && (
                  <Button
                    onClick={resetVideo}
                    variant="outline"
                    className="flex-1"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Reset
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Process Video Button */}
        {(videoBlob || uploadedFile) && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-lg font-semibold">Ready to Process Video RFQ</h3>
                <Button
                  onClick={processVideoRFQ}
                  disabled={isUploading}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-3"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Process Video RFQ
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Display */}
        {error && (
          <Card className="mt-8">
            <CardContent className="pt-6">
              <div className={`px-4 py-3 rounded ${
                error.includes('demo data') 
                  ? 'bg-yellow-100 border border-yellow-400 text-yellow-700' 
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}>
                <div className="flex items-center">
                  <span className="mr-2">
                    {error.includes('demo data') ? '⚠️' : '❌'}
                  </span>
                  <span>{error}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Transcription Display */}
        {transcription && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Play className="w-5 h-5 mr-2" />
                Video Transcription
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">{transcription}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* RFQ Data Display */}
        {rfqData && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileVideo className="w-5 h-5 mr-2" />
                Extracted RFQ Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-green-50 p-4 rounded-lg space-y-2">
                <div><strong>Title:</strong> {rfqData.title}</div>
                <div><strong>Category:</strong> {rfqData.category}</div>
                <div><strong>Subcategory:</strong> {rfqData.subcategory}</div>
                <div><strong>Quantity:</strong> {rfqData.quantity} {rfqData.unit}</div>
                <div><strong>Budget:</strong> ₹{rfqData.budget?.toLocaleString()}</div>
                <div><strong>Location:</strong> {rfqData.location}</div>
                <div><strong>Delivery:</strong> {rfqData.deliveryDeadline}</div>
                <div><strong>Priority:</strong> {rfqData.priority}</div>
                {rfqData.specifications && (
                  <div>
                    <strong>Specifications:</strong>
                    <ul className="list-disc list-inside ml-2">
                      {rfqData.specifications.map((spec: string, index: number) => (
                        <li key={index}>{spec}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">How to Test:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Click "Start Recording" to record a video with your camera</li>
                  <li>Or click "Choose File" to upload an existing video file</li>
                  <li>Click "Process Video RFQ" to analyze the video</li>
                  <li>You'll see transcription and extracted RFQ data</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Sample Video Content to Try:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>"I need 50 units of industrial machinery for our manufacturing plant in Mumbai. Budget is around 2 lakhs. Need delivery within 3 weeks."</li>
                  <li>"We require 30 electronic components for our project. Budget is 1.5 lakhs. Need delivery in Delhi within 2 weeks."</li>
                  <li>"Looking for textile machinery, 5 units. Budget 3 lakhs. Delivery to Bangalore in 4 weeks."</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What to Expect:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Video will be processed and transcribed</li>
                  <li>AI will extract structured RFQ data</li>
                  <li>Results will show category, quantity, budget, location, etc.</li>
                  <li>Works even without OpenAI API key (uses mock data)</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
