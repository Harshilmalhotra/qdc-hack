import type { VoiceEvent } from '../types';

class VoiceInterface {
  private recognition: any | null = null;
  private synthesis: SpeechSynthesis | null = null;
  private isListening = false;
  private callbacks: ((event: VoiceEvent) => void)[] = [];
  private currentLanguage = 'en-US';
  private isSupported = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    console.log('Initializing Voice Interface...');

    // Check for Web Speech API support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (SpeechRecognition && window.speechSynthesis) {
      this.recognition = new SpeechRecognition();
      this.synthesis = window.speechSynthesis;
      this.isSupported = true;
      this.setupRecognition();
      console.log('Voice Interface initialized with Web Speech API support');
    } else {
      console.warn('Web Speech API not supported, voice features disabled');
      this.isSupported = false;
      this.emitEvent({ action: 'FALLBACK', command: 'unsupported', confidence: 0 });
    }

    // Add keyboard shortcuts for voice commands simulation
    this.setupKeyboardVoiceSimulation();
  }

  private setupKeyboardVoiceSimulation(): void {
    console.log('Setting up keyboard voice command simulation');

    document.addEventListener('keydown', (event) => {
      // Use number keys to simulate voice commands
      if (event.ctrlKey) {
        let command = '';
        switch (event.key) {
          case '1':
            command = 'next';
            break;
          case '2':
            command = 'back';
            break;
          case '3':
            command = 'select';
            break;
          case '4':
            command = 'dashboard';
            break;
          case '5':
            command = 'repeat';
            break;
          case '6':
            command = 'stop';
            break;
        }

        if (command) {
          event.preventDefault();
          console.log('🎤 Simulated voice command:', command);
          this.processCommand(command, 1.0);
        }
      }
    });
  }

  private setupRecognition(): void {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true; // Enable interim results for faster response
    this.recognition.lang = this.currentLanguage;
    this.recognition.maxAlternatives = 1;

    this.recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const command = result[0].transcript.toLowerCase().trim();
        const confidence = result[0].confidence || 0.8;

        // Process both interim and final results for faster response
        if (result.isFinal || confidence > 0.7) {
          console.log('🎤 Voice command detected:', command, 'Final:', result.isFinal, 'Confidence:', confidence);
          this.processCommand(command, confidence);

          // If we got a good interim result, restart recognition immediately
          if (!result.isFinal && confidence > 0.8) {
            this.restartRecognition();
          }
        }
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        this.emitEvent({ action: 'FALLBACK', command: 'permission-denied', confidence: 0 });
      } else {
        // Restart on other errors
        setTimeout(() => this.restartRecognition(), 1000);
      }
    };

    this.recognition.onend = () => {
      if (this.isListening) {
        // Restart recognition immediately when it ends
        setTimeout(() => this.restartRecognition(), 100);
      }
    };
  }

  private restartRecognition(): void {
    if (this.recognition && this.isListening) {
      try {
        this.recognition.stop();
        setTimeout(() => {
          if (this.recognition && this.isListening) {
            this.recognition.start();
          }
        }, 100);
      } catch (error) {
        console.warn('Error restarting recognition:', error);
      }
    }
  }

  private processCommand(command: string, confidence: number): void {
    // Clean up the command
    const cleanCommand = command.replace(/[^\w\s]/g, '').toLowerCase().trim();
    console.log('🎤 Processing voice command:', `"${cleanCommand}"`);

    // FIRST: Check for read-related commands (highest priority)
    if (cleanCommand.includes('read')) {
      console.log('✅ READ command detected:', cleanCommand, '→ REPEAT');
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
      console.log('✅ Exact command match:', cleanCommand, '→', action);
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
        console.log('✅ Partial word match:', word, '→', action);
        this.emitEvent({
          action: action as VoiceEvent['action'],
          command: cleanCommand,
          confidence: confidence * 0.6
        });
        return;
      }
    }

    // No matching command found
    console.log('❌ Unrecognized voice command:', `"${cleanCommand}"`);
  }

  startListening(): boolean {
    if (!this.isSupported || !this.recognition) {
      return false;
    }

    try {
      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (error) {
      console.error('Failed to start speech recognition:', error);
      return false;
    }
  }

  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  speak(text: string, options: { rate?: number; pitch?: number; volume?: number } = {}): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.synthesis) {
        reject(new Error('Speech synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      this.synthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = this.currentLanguage;
      utterance.rate = options.rate || 1;
      utterance.pitch = options.pitch || 1;
      utterance.volume = options.volume || 1;

      utterance.onend = () => resolve();
      utterance.onerror = (event) => reject(event.error);

      this.synthesis.speak(utterance);
    });
  }

  async translateAndSpeak(text: string, targetLanguage: string): Promise<void> {
    try {
      // Simple translation using Google Translate API (would need API key in production)
      // For demo, we'll just speak in the target language
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = targetLanguage;

      if (this.synthesis) {
        this.synthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Translation failed:', error);
      // Fallback to original language
      await this.speak(text);
    }
  }

  setLanguage(language: string): void {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  onVoiceCommand(callback: (event: VoiceEvent) => void): void {
    this.callbacks.push(callback);
  }

  private emitEvent(event: VoiceEvent): void {
    this.callbacks.forEach(callback => callback(event));

    // Show visual feedback for voice commands
    this.showVoiceCommandFeedback(event);
  }

  private showVoiceCommandFeedback(event: VoiceEvent): void {
    // Remove existing feedback
    const existing = document.querySelectorAll('.voice-command-feedback');
    existing.forEach(el => el.remove());

    // Create feedback element
    const feedback = document.createElement('div');
    feedback.className = 'voice-command-feedback fixed top-20 right-4 z-50 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold pointer-events-none animate-bounce';
    feedback.innerHTML = `🎤 "${event.command}" → ${event.action}`;

    document.body.appendChild(feedback);

    // Remove after 3 seconds
    setTimeout(() => feedback.remove(), 3000);
  }

  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis ? this.synthesis.getVoices() : [];
  }

  isListeningActive(): boolean {
    return this.isListening;
  }

  isVoiceSupported(): boolean {
    return this.isSupported;
  }

  destroy(): void {
    this.stopListening();
    if (this.synthesis) {
      this.synthesis.cancel();
    }
  }
}

export const voiceInterface = new VoiceInterface();