import { eyeTracker } from './eyeTracker';
import { voiceInterface } from './voiceInterface';
import { whisperVoiceInterface } from './whisperVoiceInterface';
import type { GazeEvent, VoiceEvent, InteractionEvent } from '../types';

type DashboardHandler = (action: string, data?: any) => void;

class InteractionManager {
  private dashboardHandler: DashboardHandler | null = null;
  private lastInteraction: InteractionEvent | null = null;
  private interactionHistory: InteractionEvent[] = [];
  private isInitialized = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    // Subscribe to eye tracking events
    eyeTracker.onGazeChange((gazeEvent: GazeEvent) => {
      this.handleGazeEvent(gazeEvent);
    });

    // Subscribe to voice events (both interfaces)
    voiceInterface.onVoiceCommand((voiceEvent: VoiceEvent) => {
      this.handleVoiceEvent(voiceEvent);
    });

    // Subscribe to Whisper voice events
    whisperVoiceInterface.onVoiceCommand((voiceEvent: VoiceEvent) => {
      this.handleVoiceEvent(voiceEvent);
    });

    this.isInitialized = true;
  }

  private handleGazeEvent(gazeEvent: GazeEvent): void {
    const interaction: InteractionEvent = {
      type: 'gaze',
      action: gazeEvent.action,
      timestamp: Date.now()
    };

    // Check for conflicts with recent voice commands
    if (this.hasRecentVoiceCommand()) {
      console.log('Ignoring gaze event due to recent voice command');
      return;
    }

    this.processInteraction(interaction, gazeEvent.confidence);
  }

  private handleVoiceEvent(voiceEvent: VoiceEvent): void {
    const interaction: InteractionEvent = {
      type: 'voice',
      action: voiceEvent.action,
      timestamp: Date.now()
    };

    // Voice commands have highest priority
    this.processInteraction(interaction, voiceEvent.confidence);
  }

  private handleKeyboardEvent(action: string): void {
    const interaction: InteractionEvent = {
      type: 'keyboard',
      action,
      timestamp: Date.now()
    };

    // Only process keyboard events if no other input is active
    if (!this.hasRecentInteraction(500)) {
      this.processInteraction(interaction, 1.0);
    }
  }

  private processInteraction(interaction: InteractionEvent, confidence: number): void {
    // Store interaction history
    this.interactionHistory.push(interaction);
    if (this.interactionHistory.length > 50) {
      this.interactionHistory.shift();
    }

    this.lastInteraction = interaction;

    console.log('Processing interaction:', interaction.action, 'Type:', interaction.type, 'Confidence:', confidence);

    // Map actions to dashboard functions
    const actionMap = {
      'NEXT': () => {
        console.log('🎯 Executing NEXT action');
        this.callDashboardHandler('goNext');
      },
      'BACK': () => {
        console.log('🎯 Executing BACK action');
        this.callDashboardHandler('goBack');
      },
      'SELECT': () => {
        console.log('🎯 Executing SELECT action');
        this.callDashboardHandler('selectCurrent');
      },
      'DASHBOARD': () => {
        console.log('🎯 Executing DASHBOARD action');
        this.callDashboardHandler('openDashboard');
      },
      'REPEAT': () => {
        console.log('🎯 Executing REPEAT action');
        this.callDashboardHandler('repeatContent');
      },
      'STOP': () => {
        console.log('🎯 Executing STOP action');
        this.callDashboardHandler('stopAction');
      },
      'START': () => {
        console.log('🎯 Executing START action');
        this.callDashboardHandler('startAction');
      },
      'FALLBACK': () => {
        console.log('🎯 Executing FALLBACK action');
        this.callDashboardHandler('showFallbackControls');
      }
    };

    const actionFunction = actionMap[interaction.action as keyof typeof actionMap];
    if (actionFunction && confidence > 0.3) {
      console.log('Executing action:', interaction.action);
      actionFunction();
    }

    // Emit interaction event for analytics
    this.emitInteractionEvent(interaction, confidence);
  }

  private callDashboardHandler(action: string, data?: any): void {
    if (this.dashboardHandler) {
      this.dashboardHandler(action, data);
    } else {
      console.warn('No dashboard handler registered for action:', action);
    }
  }

  private hasRecentVoiceCommand(timeWindow = 1000): boolean {
    const now = Date.now();
    return this.interactionHistory.some(
      interaction => 
        interaction.type === 'voice' && 
        (now - interaction.timestamp) < timeWindow
    );
  }

  private hasRecentInteraction(timeWindow = 1000): boolean {
    if (!this.lastInteraction) return false;
    return (Date.now() - this.lastInteraction.timestamp) < timeWindow;
  }

  private emitInteractionEvent(interaction: InteractionEvent, confidence: number): void {
    // Dispatch custom event for analytics tracking
    const event = new CustomEvent('adaptiveInteraction', {
      detail: { interaction, confidence }
    });
    document.dispatchEvent(event);
  }

  // Public API
  registerDashboardHandler(handler: DashboardHandler): void {
    this.dashboardHandler = handler;
  }

  async startInteractionSystems(): Promise<void> {
    try {
      // Initialize eye tracking
      await eyeTracker.initialize();
      
      // Start voice recognition (try Whisper first, fallback to Web Speech API)
      const whisperStarted = await whisperVoiceInterface.startListening();
      if (!whisperStarted) {
        voiceInterface.startListening();
      }
      
      console.log('Interaction systems started successfully');
    } catch (error) {
      console.error('Failed to start interaction systems:', error);
    }
  }

  stopInteractionSystems(): void {
    voiceInterface.stopListening();
    whisperVoiceInterface.stopListening();
    eyeTracker.destroy();
  }

  getInteractionHistory(): InteractionEvent[] {
    return [...this.interactionHistory];
  }

  getLastInteraction(): InteractionEvent | null {
    return this.lastInteraction;
  }

  // Manual trigger methods for testing
  triggerAction(action: string): void {
    this.handleKeyboardEvent(action);
  }

  // Debug methods
  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      hasHandler: !!this.dashboardHandler,
      lastInteraction: this.lastInteraction,
      historyLength: this.interactionHistory.length,
      eyeTrackerInfo: eyeTracker.getDebugInfo(),
      voiceListening: voiceInterface.isListeningActive()
    };
  }
}

export const interactionManager = new InteractionManager();