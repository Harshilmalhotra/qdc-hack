import { pipeline, AutomaticSpeechRecognitionPipeline } from '@xenova/transformers';
import type { VoiceEvent } from '../types';

class WhisperVoiceInterface {
  private whisperPipeline: AutomaticSpeechRecognitionPipeline | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isListening = false;
  private isInitialized = false;
  private callbacks: ((event: VoiceEvent) => void)[] = [];
  private synthesis: SpeechSynthesis | null = null;
  private currentLanguage = 'en-US';
  private recordingTimeout: NodeJS.Timeout | null = null;
  private silenceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    console.log('🎤 Initializing Whisper Voice Interface...');
    
    try {
      // Initialize Whisper pipeline with a small, fast model
      console.log('Loading Whisper model...');
      this.whisperPipeline = await pipeline(
        'automatic-speech-recognition',
        'Xenova/whisper-tiny.en', // Small model for low latency
        {
          chunk_length_s: 30,
          stride_length_s: 5,
        }
      );
      
      // Initialize speech synthesis
      this.synthesis = window.speechSynthesis;
      
      this.isInitialized = true;
      console.log('✅ Whisper Voice Interface initialized successfully');
      
    } catch (error) {
      console.error('❌ Failed to initialize Whisper:', error);
      this.fallbackToWebSpeechAPI();
    }
  }

  private fallbackToWebSpeechAPI(): void {
    console.log('🔄 Falling back to Web Speech API...');
    // Keep the existing Web Speech API as fallback
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      // Use the existing Web Speech API implementation
      this.setupWebSpeechAPI();
    } else {
      console.warn('No speech recognition available');
      this.emitEvent({ action: 'FALLBACK', command: 'unsupported', confidence: 0 });
    }
  }

  private setupWebSpeechAPI(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = this.currentLanguage;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const command = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence || 0.8;
        
        if (result.isFinal || confidence > 0.7) {
          console.log('🎤 Web Speech API command:', command);
          this.processCommand(command, confidence);
        }
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Web Speech API error:', event.error);
    };

    recognition.onend = () => {
      if (this.isListening) {
        setTimeout(() => recognition.start(), 100);
      }
    };

    // Store reference for starting/stopping
    (this as any).webSpeechRecognition = recognition;
  }

  async startListening(): Promise<boolean> {
    if (this.isListening) return true;

    console.log('🎤 Starting voice recognition...');

    try {
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      if (this.isInitialized && this.whisperPipeline) {
        await this.startWhisperRecording(stream);
      } else {
        // Fallback to Web Speech API
        if ((this as any).webSpeechRecognition) {
          (this as any).webSpeechRecognition.start();
        }
      }

      this.isListening = true;
      console.log('✅ Voice recognition started');
      return true;

    } catch (error) {
      console.error('❌ Failed to start voice recognition:', error);
      this.emitEvent({ action: 'FALLBACK', command: 'permission-denied', confidence: 0 });
      return false;
    }
  }

  private async startWhisperRecording(stream: MediaStream): Promise<void> {
    // Create MediaRecorder for audio capture
    this.mediaRecorder = new MediaRecorder(stream, {
      mimeType: 'audio/webm;codecs=opus'
    });

    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = async () => {
      if (this.audioChunks.length > 0) {
        await this.processAudioWithWhisper();
      }
    };

    // Start recording in chunks for low latency
    this.mediaRecorder.start();
    this.scheduleNextChunk();
  }

  private scheduleNextChunk(): void {
    // Process audio every 2 seconds for low latency
    this.recordingTimeout = setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.stop();
        
        // Restart recording for continuous listening
        setTimeout(() => {
          if (this.isListening && this.mediaRecorder) {
            this.audioChunks = [];
            this.mediaRecorder.start();
            this.scheduleNextChunk();
          }
        }, 100);
      }
    }, 2000);
  }

  private async processAudioWithWhisper(): Promise<void> {
    if (!this.whisperPipeline || this.audioChunks.length === 0) return;

    try {
      // Convert audio chunks to blob
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Convert to ArrayBuffer
      const arrayBuffer = await audioBlob.arrayBuffer();
      
      // Process with Whisper
      console.log('🔄 Processing audio with Whisper...');
      const result = await this.whisperPipeline(arrayBuffer);
      
      if (result && result.text) {
        const command = result.text.toLowerCase().trim();
        console.log('🎤 Whisper result:', command);
        
        if (command.length > 0) {
          this.processCommand(command, 0.9);
        }
      }
      
    } catch (error) {
      console.error('❌ Whisper processing error:', error);
    }
  }

  private processCommand(command: string, confidence: number): void {
    // Clean up the command
    const cleanCommand = command.replace(/[^\w\s]/g, '').toLowerCase().trim();
    console.log('🤖 Processing Whisper command:', `"${cleanCommand}"`);
    
    // FIRST: Check for read-related commands (highest priority)
    if (cleanCommand.includes('read')) {
      console.log('✅ Whisper READ command detected:', cleanCommand, '→ REPEAT');
      this.emitEvent({ 
        action: 'REPEAT', 
        command: cleanCommand, 
        confidence 
      });
      return;
    }

    // SECOND: Check for exact navigation commands
    const exactCommands = {
      'next': 'NEXT',
      'go next': 'NEXT',
      'forward': 'NEXT',
      'continue': 'NEXT',
      'back': 'BACK',
      'go back': 'BACK',
      'previous': 'BACK',
      'return': 'BACK',
      'select': 'SELECT',
      'choose': 'SELECT',
      'pick': 'SELECT',
      'complete': 'SELECT',
      'dashboard': 'DASHBOARD',
      'menu': 'DASHBOARD',
      'home': 'DASHBOARD',
      'main': 'DASHBOARD',
      'repeat': 'REPEAT',
      'again': 'REPEAT',
      'say again': 'REPEAT',
      'stop': 'STOP',
      'halt': 'STOP',
      'pause': 'STOP',
      'quit': 'STOP',
      'exit': 'STOP',
      'start': 'START',
      'begin': 'START',
      'resume': 'START',
      'listen': 'START'
    } as const;

    // Check exact matches
    if (exactCommands[cleanCommand as keyof typeof exactCommands]) {
      const action = exactCommands[cleanCommand as keyof typeof exactCommands];
      console.log('✅ Whisper exact match:', cleanCommand, '→', action);
      this.emitEvent({ 
        action: action as VoiceEvent['action'], 
        command: cleanCommand, 
        confidence 
      });
      return;
    }

    // THIRD: Check for partial matches
    const words = cleanCommand.split(' ');
    for (const word of words) {
      if (exactCommands[word as keyof typeof exactCommands]) {
        const action = exactCommands[word as keyof typeof exactCommands];
        console.log('✅ Whisper partial match:', word, '→', action);
        this.emitEvent({ 
          action: action as VoiceEvent['action'], 
          command: cleanCommand, 
          confidence: confidence * 0.6
        });
        return;
      }
    }

    console.log('❌ Unrecognized Whisper command:', `"${cleanCommand}"`);
  }

  stopListening(): void {
    if (!this.isListening) return;

    console.log('🛑 Stopping voice recognition...');
    this.isListening = false;

    // Clear timeouts
    if (this.recordingTimeout) {
      clearTimeout(this.recordingTimeout);
      this.recordingTimeout = null;
    }

    if (this.silenceTimeout) {
      clearTimeout(this.silenceTimeout);
      this.silenceTimeout = null;
    }

    // Stop MediaRecorder
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    // Stop Web Speech API fallback
    if ((this as any).webSpeechRecognition) {
      (this as any).webSpeechRecognition.stop();
    }
  }

  async speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.currentLanguage;
      utterance.rate = options.rate || 1.2; // Slightly faster for better UX
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  onVoiceCommand(callback: (event: VoiceEvent) => void): void {
    this.callbacks.push(callback);
  }

  private emitEvent(event: VoiceEvent): void {
    this.callbacks.forEach(callback => callback(event));
    this.showVoiceCommandFeedback(event);
  }

  private showVoiceCommandFeedback(event: VoiceEvent): void {
    const existing = document.querySelectorAll('.voice-command-feedback');
    existing.forEach(el => el.remove());

    const feedback = document.createElement('div');
    feedback.className = 'voice-command-feedback fixed top-20 right-4 z-50 bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none animate-bounce';
    feedback.innerHTML = `🤖 Whisper: "${event.command}" → ${event.action}`;
    
    document.body.appendChild(feedback);
    setTimeout(() => feedback.remove(), 3000);
  }

  isListeningActive(): boolean {
    return this.isListening;
  }

  isVoiceSupported(): boolean {
    return this.isInitialized || !!(window as any).SpeechRecognition || !!(window as any).webkitSpeechRecognition;
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
  }

  destroy(): void {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const whisperVoiceInterface = new WhisperVoiceInterface();