'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Mic, MicOff, Play, Square } from 'lucide-react'

export default function TestVoiceRFQPage() {
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [transcription, setTranscription] = useState('')
  const [rfqData, setRfqData] = useState<any>(null)
  const [error, setError] = useState('')
  const [recordingTime, setRecordingTime] = useState(0)

  let mediaRecorder: MediaRecorder | null = null
  let audioChunks: Blob[] = []
  let timer: NodeJS.Timeout | null = null

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      mediaRecorder = new MediaRecorder(stream)
      audioChunks = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        processVoiceRFQ(audioBlob)
        stream.getTracks().forEach(track => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
      setError('')
      setRecordingTime(0)

      // Start timer
      timer = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (error) {
      console.error('Error starting recording:', error)
      setError('Failed to start recording. Please check microphone permissions.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop()
      setIsRecording(false)
      
      if (timer) {
        clearInterval(timer)
      }
    }
  }

  const processVoiceRFQ = async (audioBlob: Blob) => {
    setIsProcessing(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('audio', audioBlob, 'voice-rfq.webm')
      formData.append('language', 'en')

      const response = await fetch('/api/voice-rfq', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.success) {
        setTranscription(result.transcription.text)
        setRfqData(result.extractedInfo)
      } else {
        setError(result.error || 'Failed to process voice RFQ')
      }
    } catch (error) {
      setError('Failed to process voice RFQ. Please try again.')
      console.error('Voice RFQ processing error:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const resetTest = () => {
    setTranscription('')
    setRfqData(null)
    setError('')
    setRecordingTime(0)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-emerald-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Voice RFQ Test Page
          </h1>
          <p className="text-xl text-gray-600">
            Test the voice RFQ functionality with real audio recording
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recording Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="w-5 h-5" />
                Voice Recording
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <div className="text-6xl font-bold text-indigo-600 mb-4">
                  {formatTime(recordingTime)}
                </div>
                
                <div className="flex justify-center gap-4 mb-6">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      size="lg"
                      className="bg-red-500 hover:bg-red-600 text-white"
                    >
                      <Mic className="w-5 h-5 mr-2" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      size="lg"
                      className="bg-gray-500 hover:bg-gray-600 text-white"
                    >
                      <Square className="w-5 h-5 mr-2" />
                      Stop Recording
                    </Button>
                  )}
                </div>

                {isProcessing && (
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-2"></div>
                    <p className="text-gray-600">Processing your voice...</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                    {error}
                  </div>
                )}
              </div>

              <div className="text-sm text-gray-500 text-center">
                <p>💡 <strong>Tips for better results:</strong></p>
                <ul className="mt-2 space-y-1">
                  <li>• Speak clearly and at normal pace</li>
                  <li>• Mention product name, quantity, and budget</li>
                  <li>• Include specifications and delivery location</li>
                  <li>• Keep recording under 2 minutes</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {transcription && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Transcription:</h3>
                  <div className="bg-gray-50 rounded-lg p-4 text-sm">
                    {transcription}
                  </div>
                </div>
              )}

              {rfqData && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Extracted RFQ Data:</h3>
                  <div className="bg-green-50 rounded-lg p-4 text-sm space-y-2">
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
                </div>
              )}

              {!transcription && !rfqData && !error && (
                <div className="text-center text-gray-500 py-8">
                  <Mic className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Record your voice to see the results here</p>
                </div>
              )}

              {(transcription || rfqData) && (
                <Button onClick={resetTest} variant="outline" className="w-full">
                  Reset Test
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Test Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Test Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Sample Voice Commands to Try:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>"I need 100 units of steel pipes, 5 inches in diameter, delivered to Mumbai by next week. Budget is around 50,000 rupees."</li>
                  <li>"We require 50 electronic components for our manufacturing project. Budget is 25,000 rupees. Need delivery in Delhi within 2 weeks."</li>
                  <li>"Looking for textile fabrics, cotton material, 1000 meters. Budget 30,000 rupees. Delivery to Bangalore in 10 days."</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">What to Expect:</h4>
                <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
                  <li>Voice will be transcribed to text</li>
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
