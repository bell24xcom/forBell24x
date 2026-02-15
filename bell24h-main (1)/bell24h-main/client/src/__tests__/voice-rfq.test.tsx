import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import VoiceRFQModal from '../components/VoiceRFQModal';

// Mock the MediaRecorder API
const mockMediaRecorder = {
  start: jest.fn(),
  stop: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  state: 'inactive',
  ondataavailable: null,
  onstop: null,
};

const mockStream = {
  getTracks: jest.fn().mockReturnValue([{ stop: jest.fn() }]),
};

// Mock navigator.mediaDevices
Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: jest.fn().mockResolvedValue(mockStream),
  },
  writable: true,
});

// Mock MediaRecorder constructor
global.MediaRecorder = jest.fn().mockImplementation(() => mockMediaRecorder);

// Mock fetch
global.fetch = jest.fn();

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn().mockReturnValue('mock-audio-url');
global.URL.revokeObjectURL = jest.fn();

describe('VoiceRFQModal', () => {
  const mockOnClose = jest.fn();
  const mockOnRFQCreated = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockMediaRecorder.state = 'inactive';
  });

  it('renders voice RFQ modal when open', () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    expect(screen.getByText('Voice RFQ Creation')).toBeInTheDocument();
    expect(screen.getByText("Speak your requirements and we'll create an RFQ")).toBeInTheDocument();
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(<VoiceRFQModal isOpen={false} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    expect(screen.queryByText('Voice RFQ Creation')).not.toBeInTheDocument();
  });

  it('starts recording when start button is clicked', async () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 44100,
        },
      });
    });

    expect(MediaRecorder).toHaveBeenCalled();
    expect(mockMediaRecorder.start).toHaveBeenCalledWith(1000);
  });

  it('stops recording when stop button is clicked', async () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Start recording first
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    });

    // Stop recording
    const stopButton = screen.getByText('Stop Recording');
    fireEvent.click(stopButton);

    expect(mockMediaRecorder.stop).toHaveBeenCalled();
  });

  it('handles microphone access error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    // Mock getUserMedia to throw an error
    (navigator.mediaDevices.getUserMedia as jest.Mock).mockRejectedValue(
      new Error('Permission denied')
    );

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(
        screen.getByText('Unable to access microphone. Please check permissions and try again.')
      ).toBeInTheDocument();
    });

    consoleSpy.mockRestore();
  });

  it('processes voice input successfully', async () => {
    const mockResponse = {
      success: true,
      transcription: {
        text: 'I need 500 units of industrial sensors',
        confidence: 0.95,
        language: 'en',
      },
      extractedInfo: {
        title: 'Industrial Sensors',
        description: 'I need 500 units of industrial sensors',
        category: 'Electronics & Components',
        quantity: 500,
        budget: 50000,
        deliveryDeadline: '2024-02-15',
        requirements: ['Waterproof', 'Wireless connectivity'],
        location: 'Mumbai, India',
        priority: 'high',
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Start recording
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    // Simulate recording stop and data available
    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Simulate ondataavailable event
    const mockBlob = new Blob(['mock audio data'], { type: 'audio/webm' });
    if (mockMediaRecorder.ondataavailable) {
      mockMediaRecorder.ondataavailable({ data: mockBlob });
    }

    // Simulate onstop event
    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/rfqs/voice', {
        method: 'POST',
        body: expect.any(FormData),
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Transcription Complete')).toBeInTheDocument();
      expect(screen.getByText('I need 500 units of industrial sensors')).toBeInTheDocument();
    });
  });

  it('handles API error gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'API Error' }),
    });

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Start recording
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    // Simulate recording stop
    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('allows language selection', () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Check if language options are rendered
    expect(screen.getByText('Auto-detect')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Hindi')).toBeInTheDocument();
    expect(screen.getByText('Arabic')).toBeInTheDocument();

    // Select Hindi language
    const hindiButton = screen.getByText('Hindi');
    fireEvent.click(hindiButton);

    expect(hindiButton).toHaveClass('bg-amber-500');
  });

  it('closes modal when close button is clicked', () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    fireEvent.click(closeButton);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('allows retry recording', async () => {
    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Start and stop recording to get to retry state
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(screen.getByText('Stop Recording')).toBeInTheDocument();
    });

    const stopButton = screen.getByText('Stop Recording');
    fireEvent.click(stopButton);

    // Wait for processing to complete
    await waitFor(() => {
      expect(screen.getByText('Record Again')).toBeInTheDocument();
    });

    // Click retry button
    const retryButton = screen.getByText('Record Again');
    fireEvent.click(retryButton);

    // Should be back to initial state
    expect(screen.getByText('Start Recording')).toBeInTheDocument();
  });

  it('creates RFQ when create button is clicked', async () => {
    const mockResponse = {
      success: true,
      transcription: { text: 'Test transcription' },
      extractedInfo: {
        title: 'Test RFQ',
        category: 'Test Category',
        quantity: 100,
        budget: 10000,
      },
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Complete recording process
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    if (mockMediaRecorder.onstop) {
      mockMediaRecorder.onstop();
    }

    await waitFor(() => {
      expect(screen.getByText('Create RFQ')).toBeInTheDocument();
    });

    const createButton = screen.getByText('Create RFQ');
    fireEvent.click(createButton);

    expect(mockOnRFQCreated).toHaveBeenCalledWith(mockResponse.extractedInfo);
    expect(mockOnClose).toHaveBeenCalled();
  });

  it('shows recording timer during recording', async () => {
    jest.useFakeTimers();

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    // Wait for the recording to start and timer to be displayed
    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // The timer should be visible after recording starts
    await waitFor(() => {
      expect(screen.getByText('00:00')).toBeInTheDocument();
    });

    // Advance timer by 5 seconds
    jest.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(screen.getByText('00:05')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('handles audio playback', async () => {
    const mockAudio = {
      play: jest.fn(),
      pause: jest.fn(),
      addEventListener: jest.fn(),
    };

    // Mock HTMLAudioElement
    Object.defineProperty(window, 'HTMLAudioElement', {
      value: jest.fn().mockImplementation(() => mockAudio),
      writable: true,
    });

    render(<VoiceRFQModal isOpen={true} onClose={mockOnClose} onRFQCreated={mockOnRFQCreated} />);

    // Complete recording to get to playback state
    const startButton = screen.getByText('Start Recording');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockMediaRecorder.start).toHaveBeenCalled();
    });

    // Stop recording to trigger processing
    const stopButton = screen.getByText('Stop Recording');
    fireEvent.click(stopButton);

    // Wait for processing to complete and playback controls to appear
    await waitFor(
      () => {
        expect(screen.getByText('Play')).toBeInTheDocument();
      },
      { timeout: 3000 }
    );

    const playButton = screen.getByText('Play');
    fireEvent.click(playButton);

    // The audio play method should be called
    expect(mockAudio.play).toHaveBeenCalled();
  });
});
