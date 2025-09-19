export interface GazeEvent {
  action: 'NEXT' | 'BACK' | 'SELECT' | 'DASHBOARD' | 'FALLBACK';
  zone: 'LEFT' | 'RIGHT' | 'CENTER' | 'DOWN' | 'NONE';
  confidence: number;
}

export interface VoiceEvent {
  action: 'NEXT' | 'BACK' | 'DASHBOARD' | 'REPEAT' | 'FALLBACK';
  command: string;
  confidence: number;
}

export interface InteractionEvent {
  type: 'gaze' | 'voice' | 'keyboard';
  action: string;
  timestamp: number;
}

export interface LessonCard {
  id: string;
  title: string;
  description: string;
  type: 'lesson' | 'quiz';
  difficulty: 'easy' | 'medium' | 'hard';
  xpReward: number;
  completed: boolean;
}

export interface ProgressData {
  totalXP: number;
  sessionsCompleted: number;
  totalGazeDuration: number;
  totalInteractions: number;
  lastSessionDate: string;
  completedLessons: string[];
}

export interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'xl';
  reducedMotion: boolean;
  screenReaderMode: boolean;
}