import type { LessonCard } from '../types';

export const mockLessons: LessonCard[] = [
  {
    id: 'accessibility-basics',
    title: 'Web Accessibility Fundamentals',
    description: 'Learn the core principles of web accessibility, including WCAG guidelines, semantic HTML, and assistive technologies.',
    type: 'lesson',
    difficulty: 'easy',
    xpReward: 75,
    completed: false
  },
  {
    id: 'screen-reader-navigation',
    title: 'Screen Reader Navigation Quiz',
    description: 'Test your knowledge of how screen readers work and best practices for creating screen reader-friendly content.',
    type: 'quiz',
    difficulty: 'medium',
    xpReward: 100,
    completed: false
  },
  {
    id: 'keyboard-navigation',
    title: 'Keyboard Navigation Patterns',
    description: 'Master keyboard navigation patterns, focus management, and creating fully keyboard-accessible interfaces.',
    type: 'lesson',
    difficulty: 'medium',
    xpReward: 90,
    completed: false
  },
  {
    id: 'color-contrast',
    title: 'Color and Contrast Guidelines',
    description: 'Understand color contrast requirements, color blindness considerations, and designing for visual accessibility.',
    type: 'lesson',
    difficulty: 'easy',
    xpReward: 60,
    completed: false
  },
  {
    id: 'aria-labels-quiz',
    title: 'ARIA Labels and Roles Challenge',
    description: 'Advanced quiz on ARIA attributes, roles, and properties for creating accessible dynamic content.',
    type: 'quiz',
    difficulty: 'hard',
    xpReward: 150,
    completed: false
  },
  {
    id: 'motor-disabilities',
    title: 'Designing for Motor Disabilities',
    description: 'Learn about motor disabilities, alternative input methods, and creating interfaces for users with limited mobility.',
    type: 'lesson',
    difficulty: 'medium',
    xpReward: 85,
    completed: false
  },
  {
    id: 'cognitive-accessibility',
    title: 'Cognitive Accessibility Principles',
    description: 'Explore cognitive disabilities, memory considerations, and designing clear, understandable interfaces.',
    type: 'lesson',
    difficulty: 'medium',
    xpReward: 80,
    completed: false
  },
  {
    id: 'testing-tools',
    title: 'Accessibility Testing Tools',
    description: 'Hands-on experience with automated and manual accessibility testing tools and techniques.',
    type: 'lesson',
    difficulty: 'hard',
    xpReward: 120,
    completed: false
  },
  {
    id: 'final-assessment',
    title: 'Comprehensive Accessibility Assessment',
    description: 'Final comprehensive test covering all aspects of web accessibility and inclusive design principles.',
    type: 'quiz',
    difficulty: 'hard',
    xpReward: 200,
    completed: false
  }
];

export const voiceCommands = [
  { command: 'next', action: 'NEXT', description: 'Navigate to next item' },
  { command: 'previous', action: 'BACK', description: 'Navigate to previous item' },
  { command: 'back', action: 'BACK', description: 'Go back' },
  { command: 'select', action: 'SELECT', description: 'Select current item' },
  { command: 'choose', action: 'SELECT', description: 'Choose current item' },
  { command: 'dashboard', action: 'DASHBOARD', description: 'Open dashboard' },
  { command: 'menu', action: 'DASHBOARD', description: 'Open main menu' },
  { command: 'home', action: 'DASHBOARD', description: 'Go to home' },
  { command: 'repeat', action: 'REPEAT', description: 'Repeat current content' },
  { command: 'read', action: 'REPEAT', description: 'Read current content' },
  { command: 'help', action: 'HELP', description: 'Show help information' }
];

export const keyboardShortcuts = [
  { key: 'Arrow Left', action: 'Navigate left/previous' },
  { key: 'Arrow Right', action: 'Navigate right/next' },
  { key: 'Arrow Up', action: 'Navigate up' },
  { key: 'Arrow Down', action: 'Navigate down/menu' },
  { key: 'Enter', action: 'Select/activate' },
  { key: 'Space', action: 'Select/activate' },
  { key: 'Tab', action: 'Focus next element' },
  { key: 'Shift+Tab', action: 'Focus previous element' },
  { key: 'Escape', action: 'Close dialog/cancel' },
  { key: 'Ctrl+D', action: 'Toggle debug overlay' },
  { key: 'Ctrl+Shift+H', action: 'Toggle high contrast' },
  { key: 'Ctrl+Shift+L', action: 'Toggle large text' }
];

export const gazeZones = [
  { zone: 'LEFT', action: 'BACK', description: 'Look left to go back' },
  { zone: 'RIGHT', action: 'NEXT', description: 'Look right to go next' },
  { zone: 'CENTER', action: 'SELECT', description: 'Look at center to select' },
  { zone: 'DOWN', action: 'DASHBOARD', description: 'Look down to open menu' }
];

export const accessibilityTips = [
  'Use high contrast mode for better visibility',
  'Increase font size if text is hard to read',
  'Enable screen reader mode for audio descriptions',
  'Use keyboard navigation if mouse is difficult',
  'Voice commands work in supported browsers',
  'Eye tracking requires camera permission',
  'All content is available offline after first load',
  'Progress is automatically saved locally'
];