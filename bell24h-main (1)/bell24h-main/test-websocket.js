/**
 * WebSocket Test Script
 * 
 * This script tests the WebSocket connection to the server.
 * It connects to the WebSocket server, sends messages, and listens for responses.
 */

import WebSocket from 'ws';

// Test configuration
const WS_URL = 'ws://localhost:5000/ws';
const TEST_DURATION = 10000; // 10 seconds

// Connect to WebSocket server
console.log('🔌 Connecting to WebSocket server at:', WS_URL);
const ws = new WebSocket(WS_URL);

// Connection opened
ws.on('open', () => {
  console.log('✅ Connected to WebSocket server');
  
  // Send authentication message
  console.log('🔐 Sending authentication message');
  ws.send(JSON.stringify({
    type: 'authenticate',
    userId: 1 // Use the ID from our test user
  }));
  
  // Send test message every 2 seconds
  const interval = setInterval(() => {
    const testMessage = {
      type: 'test',
      timestamp: new Date().toISOString(),
      message: 'Hello from test client'
    };
    
    console.log('📤 Sending test message:', testMessage.message);
    ws.send(JSON.stringify(testMessage));
  }, 2000);
  
  // Stop after test duration
  setTimeout(() => {
    clearInterval(interval);
    console.log('🛑 Test completed, closing connection');
    ws.close();
    process.exit(0);
  }, TEST_DURATION);
});

// Listen for messages
ws.on('message', (data) => {
  try {
    const message = JSON.parse(data.toString());
    console.log('📩 Received message:', message);
    
    // Check for connection success
    if (message.type === 'connection') {
      console.log('🆔 Client ID assigned:', message.clientId);
    }
    
    // Check for authentication success
    if (message.type === 'authentication' && message.status === 'success') {
      console.log('🔓 Authentication successful!');
    }
  } catch (error) {
    console.error('❌ Error parsing message:', error);
  }
});

// Handle errors
ws.on('error', (error) => {
  console.error('❌ WebSocket error:', error.message);
});

// Handle close
ws.on('close', (code, reason) => {
  console.log(`❌ Connection closed: ${code} - ${reason || 'No reason provided'}`);
});

// client/src/components/VoiceRFQ.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, StyleSheet, ActivityIndicator } from 'react';
import Toast from 'react-native-toast-message';

const VoiceRFQ: React.FC = () => {
  const [transcript, setTranscript] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Add loading state and error handling
  const startListening = async () => {
    setIsLoading(true);
    try {
      // Simulate voice recognition
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTranscript("Sample transcription");
      setIsListening(true);
    } catch (e) {
      setError("Failed to start voice recognition");
    } finally {
      setIsLoading(false);
    }
  };

  // In your submitRFQ function
  const submitRFQ = () => {
    // Your submit logic here
    Toast.show({ type: 'success', text1: 'RFQ submitted successfully!' });
  };

  return (
    <View style={styles.container}>
      {isLoading && <ActivityIndicator size="large" />}
      {error && <Text style={styles.error}>{error}</Text>}
      {/* Rest of your component */}
    </View>
  );
};