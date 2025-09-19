import type { ProgressData, InteractionEvent } from '../types';

class Analytics {
  private readonly STORAGE_KEY = 'adaptive-learning-progress';
  private progressData: ProgressData;
  private sessionStartTime: number;
  private currentGazeStartTime: number | null = null;

  constructor() {
    this.sessionStartTime = Date.now();
    this.progressData = this.loadProgress();
    this.setupEventListeners();
    this.startDemoXPGeneration();
  }

  private startDemoXPGeneration(): void {
    // Generate some XP every few seconds for demo purposes
    setInterval(() => {
      const randomXP = Math.floor(Math.random() * 10) + 1;
      this.addXP(randomXP, 'Demo interaction');
    }, 5000);
  }

  private loadProgress(): ProgressData {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error('Failed to parse stored progress data:', error);
      }
    }

    // Default progress data
    return {
      totalXP: 0,
      sessionsCompleted: 0,
      totalGazeDuration: 0,
      totalInteractions: 0,
      lastSessionDate: new Date().toISOString(),
      completedLessons: []
    };
  }

  private saveProgress(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.progressData));
    } catch (error) {
      console.error('Failed to save progress data:', error);
    }
  }

  private setupEventListeners(): void {
    // Listen for interaction events
    document.addEventListener('adaptiveInteraction', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.trackInteraction(customEvent.detail.interaction, customEvent.detail.confidence);
    });

    // Listen for gaze zone changes
    document.addEventListener('gazeZoneChange', (event: Event) => {
      const customEvent = event as CustomEvent;
      this.trackGazeZone(customEvent.detail.zone);
    });

    // Save progress on page unload
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  private trackInteraction(interaction: InteractionEvent, confidence: number): void {
    this.progressData.totalInteractions++;
    
    // Award XP based on interaction type and confidence
    let xpGain = 0;
    switch (interaction.type) {
      case 'gaze':
        xpGain = Math.floor(confidence * 5);
        break;
      case 'voice':
        xpGain = Math.floor(confidence * 10);
        break;
      case 'keyboard':
        xpGain = 2;
        break;
    }

    this.progressData.totalXP += xpGain;
    this.saveProgress();

    // Emit XP gain event for UI updates
    this.emitProgressEvent('xpGain', { amount: xpGain, total: this.progressData.totalXP });
  }

  private trackGazeZone(zone: string): void {
    const now = Date.now();
    
    if (this.currentGazeStartTime && zone !== 'NONE') {
      // Calculate gaze duration on previous zone
      const duration = now - this.currentGazeStartTime;
      this.progressData.totalGazeDuration += duration;
    }

    this.currentGazeStartTime = zone !== 'NONE' ? now : null;
    this.saveProgress();
  }

  // Public API methods
  getProgress(): ProgressData {
    return { ...this.progressData };
  }

  addXP(amount: number, reason?: string): void {
    this.progressData.totalXP += amount;
    this.saveProgress();
    this.emitProgressEvent('xpGain', { amount, total: this.progressData.totalXP, reason });
  }

  completeLesson(lessonId: string, xpReward: number): void {
    if (!this.progressData.completedLessons.includes(lessonId)) {
      this.progressData.completedLessons.push(lessonId);
      this.addXP(xpReward, `Completed lesson: ${lessonId}`);
      this.emitProgressEvent('lessonCompleted', { lessonId, xpReward });
    }
  }

  getSessionStats() {
    const sessionDuration = Date.now() - this.sessionStartTime;
    const sessionsToday = this.getSessionsToday();
    
    return {
      sessionDuration,
      sessionsToday,
      totalSessions: this.progressData.sessionsCompleted,
      averageGazeDuration: this.progressData.totalGazeDuration / Math.max(this.progressData.totalInteractions, 1)
    };
  }

  private getSessionsToday(): number {
    const today = new Date().toDateString();
    const lastSession = new Date(this.progressData.lastSessionDate).toDateString();
    return today === lastSession ? 1 : 0;
  }

  getXPLevel(): { level: number; currentXP: number; nextLevelXP: number; progress: number } {
    const totalXP = this.progressData.totalXP;
    const level = Math.floor(totalXP / 100) + 1;
    const currentXP = totalXP % 100;
    const nextLevelXP = 100;
    const progress = (currentXP / nextLevelXP) * 100;

    return { level, currentXP, nextLevelXP, progress };
  }

  getInteractionStats() {
    return {
      totalInteractions: this.progressData.totalInteractions,
      totalGazeDuration: this.progressData.totalGazeDuration,
      averageInteractionsPerSession: this.progressData.totalInteractions / Math.max(this.progressData.sessionsCompleted, 1),
      completedLessons: this.progressData.completedLessons.length
    };
  }

  resetProgress(): void {
    this.progressData = {
      totalXP: 0,
      sessionsCompleted: 0,
      totalGazeDuration: 0,
      totalInteractions: 0,
      lastSessionDate: new Date().toISOString(),
      completedLessons: []
    };
    this.saveProgress();
    this.emitProgressEvent('progressReset', {});
  }

  endSession(): void {
    const sessionDuration = Date.now() - this.sessionStartTime;
    this.progressData.sessionsCompleted++;
    this.progressData.lastSessionDate = new Date().toISOString();
    
    // Award session completion XP
    const sessionXP = Math.floor(sessionDuration / 60000) * 2; // 2 XP per minute
    this.progressData.totalXP += sessionXP;
    
    this.saveProgress();
    this.emitProgressEvent('sessionEnded', { duration: sessionDuration, xpGained: sessionXP });
  }

  private emitProgressEvent(type: string, data: any): void {
    const event = new CustomEvent('progressUpdate', {
      detail: { type, data, progress: this.getProgress() }
    });
    document.dispatchEvent(event);
  }

  // Export/Import functionality for data portability
  exportProgress(): string {
    return JSON.stringify(this.progressData, null, 2);
  }

  importProgress(data: string): boolean {
    try {
      const imported = JSON.parse(data);
      // Validate imported data structure
      if (this.validateProgressData(imported)) {
        this.progressData = imported;
        this.saveProgress();
        return true;
      }
    } catch (error) {
      console.error('Failed to import progress data:', error);
    }
    return false;
  }

  private validateProgressData(data: any): data is ProgressData {
    return (
      typeof data === 'object' &&
      typeof data.totalXP === 'number' &&
      typeof data.sessionsCompleted === 'number' &&
      typeof data.totalGazeDuration === 'number' &&
      typeof data.totalInteractions === 'number' &&
      typeof data.lastSessionDate === 'string' &&
      Array.isArray(data.completedLessons)
    );
  }
}

export const analytics = new Analytics();