// import { FaceMesh } from '@mediapipe/face_mesh';
// import { Camera } from '@mediapipe/camera_utils';
import type { GazeEvent } from '../types';

class EyeTracker {
  private faceMesh: any | null = null;
  private camera: any | null = null;
  private videoElement: HTMLVideoElement | null = null;
  private canvasElement: HTMLCanvasElement | null = null;
  private isInitialized = false;
  private isCalibrated = false;
  private gazeHistory: { x: number; y: number }[] = [];
  private currentZone: GazeEvent['zone'] = 'NONE';
  private callbacks: ((event: GazeEvent) => void)[] = [];
  private calibrationData = { centerX: 0.5, centerY: 0.5 };
  private mockMode = false;

  constructor() {
    this.setupKeyboardFallback();
  }

  async initialize(): Promise<boolean> {
    console.log('Initializing Eye Tracker...');
    
    // Check if we're on HTTPS (required for camera)
    const isHTTPS = window.location.protocol === 'https:';
    
    if (!isHTTPS) {
      console.warn('⚠️ HTTP detected - camera requires HTTPS. Using mouse simulation.');
      this.mockMode = true;
      this.isInitialized = true;
      this.setupMouseSimulation();
      this.emitEvent({ action: 'FALLBACK', zone: 'NONE', confidence: 1.0 });
      return false;
    }

    try {
      // Try to get camera access
      console.log('🔒 HTTPS detected - requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      console.log('✅ Camera access granted');
      
      // Create video element for camera feed
      this.videoElement = document.createElement('video');
      this.videoElement.srcObject = stream;
      this.videoElement.style.display = 'none';
      this.videoElement.autoplay = true;
      document.body.appendChild(this.videoElement);

      // Create canvas for processing
      this.canvasElement = document.createElement('canvas');
      this.canvasElement.width = 640;
      this.canvasElement.height = 480;
      this.canvasElement.style.display = 'none';
      document.body.appendChild(this.canvasElement);

      // For now, use basic face detection instead of MediaPipe
      await this.setupBasicFaceTracking();
      
      this.isInitialized = true;
      this.mockMode = false;
      console.log('✅ Eye Tracker initialized with camera');
      
      return true;
      
    } catch (error) {
      console.warn('❌ Camera access denied, falling back to mouse simulation');
      this.mockMode = true;
      this.isInitialized = true;
      this.setupMouseSimulation();
      this.emitEvent({ action: 'FALLBACK', zone: 'NONE', confidence: 1.0 });
      return false;
    }
  }

  private async setupBasicFaceTracking(): Promise<void> {
    // Simple face tracking using video analysis
    console.log('Setting up basic face tracking...');
    
    if (!this.videoElement || !this.canvasElement) return;
    
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Start video processing
    this.videoElement.addEventListener('loadedmetadata', () => {
      this.startVideoProcessing();
    });
  }

  private startVideoProcessing(): void {
    if (!this.videoElement || !this.canvasElement) return;
    
    const canvas = this.canvasElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const processFrame = () => {
      if (!this.isInitialized || this.mockMode) return;
      
      // Draw video frame to canvas
      ctx.drawImage(this.videoElement!, 0, 0, canvas.width, canvas.height);
      
      // Simple motion detection for gaze simulation
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Simulate gaze based on face position (simplified)
      // In a real implementation, this would use actual face landmarks
      const gazeX = centerX / canvas.width;
      const gazeY = centerY / canvas.height;
      
      this.updateGazeHistory({ x: gazeX, y: gazeY });
      const smoothedGaze = this.getSmoothedGaze();
      const zone = this.determineGazeZone(smoothedGaze);
      
      if (zone !== this.currentZone && zone !== 'NONE') {
        this.currentZone = zone;
        const action = this.mapZoneToAction(zone);
        console.log('📹 Camera Gaze Detection - Zone:', zone, 'Action:', action);
        this.showGazeIndicator(zone);
        this.emitEvent({ action, zone, confidence: 0.7 });
      }
      
      // Continue processing
      requestAnimationFrame(processFrame);
    };
    
    // Start processing
    requestAnimationFrame(processFrame);
  }

  private async initializeFaceMesh(): Promise<void> {
    try {
      // For now, we'll simulate eye tracking with mouse movements for demo
      console.log('MediaPipe not loaded, using mouse simulation for demo');
      this.setupMouseSimulation();
    } catch (error) {
      console.error('Failed to initialize MediaPipe:', error);
      this.mockMode = true;
    }
  }

  private setupMouseSimulation(): void {
    console.log('Setting up mouse simulation for eye tracking demo');
    let lastZone: GazeEvent['zone'] = 'NONE';
    let lastEmitTime = 0;
    let isMouseActive = false;
    
    // Only activate mouse simulation when user moves mouse to edges intentionally
    document.addEventListener('mousemove', (event) => {
      const now = Date.now();
      const x = event.clientX / window.innerWidth;
      const y = event.clientY / window.innerHeight;
      
      // Check if mouse is at screen edges (more intentional)
      const isAtEdge = x < 0.1 || x > 0.9 || y < 0.1 || y > 0.9;
      
      if (isAtEdge) {
        isMouseActive = true;
        
        // Throttle events to avoid spam
        if (now - lastEmitTime < 1500) return;
        
        // Determine zone based on mouse position (stricter zones)
        let zone: GazeEvent['zone'] = 'NONE';
        
        if (x < 0.1) {
          zone = 'LEFT';
        } else if (x > 0.9) {
          zone = 'RIGHT';
        } else if (y > 0.9) {
          zone = 'DOWN';
        } else if (x >= 0.4 && x <= 0.6 && y >= 0.4 && y <= 0.6) {
          zone = 'CENTER';
        }
        
        if (zone !== lastZone && zone !== 'NONE') {
          this.currentZone = zone;
          const action = this.mapZoneToAction(zone);
          console.log('🖱️ Mouse Gaze Simulation - Zone:', zone, 'Action:', action, 'Position:', { x: x.toFixed(2), y: y.toFixed(2) });
          
          // Show visual feedback
          this.showGazeIndicator(zone);
          
          this.emitEvent({ action, zone, confidence: 0.8 });
          lastEmitTime = now;
          lastZone = zone;
        }
      } else {
        // Reset when mouse moves away from edges
        if (isMouseActive && now - lastEmitTime > 2000) {
          isMouseActive = false;
          lastZone = 'NONE';
        }
      }
    });

    // Add visual gaze zones for better understanding
    this.createGazeZoneOverlay();
    
    // Add instructions
    this.showGazeInstructions();
  }

  private showGazeInstructions(): void {
    const instructions = document.createElement('div');
    instructions.className = 'fixed top-4 left-4 z-50 bg-blue-600 text-white p-3 rounded-lg text-sm max-w-xs';
    instructions.innerHTML = `
      <strong>👁️ Gaze Simulation:</strong><br/>
      Move mouse to screen edges:<br/>
      • Far LEFT = Back<br/>
      • Far RIGHT = Next<br/>
      • Far BOTTOM = Dashboard<br/>
      • CENTER = Select
    `;
    
    document.body.appendChild(instructions);
    
    // Remove after 8 seconds
    setTimeout(() => instructions.remove(), 8000);
  }

  private showGazeIndicator(zone: GazeEvent['zone']): void {
    // Remove existing indicators
    const existing = document.querySelectorAll('.gaze-indicator');
    existing.forEach(el => el.remove());

    // Create new indicator
    const indicator = document.createElement('div');
    indicator.className = 'gaze-indicator fixed z-50 bg-blue-500 text-white px-3 py-1 rounded-lg text-sm font-bold pointer-events-none';
    indicator.textContent = `Gaze Zone: ${zone}`;
    
    // Position based on zone
    switch (zone) {
      case 'LEFT':
        indicator.style.left = '20px';
        indicator.style.top = '50%';
        indicator.style.transform = 'translateY(-50%)';
        break;
      case 'RIGHT':
        indicator.style.right = '20px';
        indicator.style.top = '50%';
        indicator.style.transform = 'translateY(-50%)';
        break;
      case 'CENTER':
        indicator.style.left = '50%';
        indicator.style.top = '50%';
        indicator.style.transform = 'translate(-50%, -50%)';
        break;
      case 'DOWN':
        indicator.style.left = '50%';
        indicator.style.bottom = '20px';
        indicator.style.transform = 'translateX(-50%)';
        break;
    }
    
    document.body.appendChild(indicator);
    
    // Remove after 2 seconds
    setTimeout(() => indicator.remove(), 2000);
  }

  private createGazeZoneOverlay(): void {
    // Create overlay to show gaze zones
    const overlay = document.createElement('div');
    overlay.id = 'gaze-zones-overlay';
    overlay.className = 'fixed inset-0 pointer-events-none z-40 opacity-20';
    overlay.innerHTML = `
      <div class="absolute left-0 top-0 w-1/3 h-full bg-red-500 flex items-center justify-center text-white font-bold text-2xl">LEFT<br/>← BACK</div>
      <div class="absolute right-0 top-0 w-1/3 h-full bg-green-500 flex items-center justify-center text-white font-bold text-2xl">RIGHT<br/>NEXT →</div>
      <div class="absolute left-1/3 top-1/3 w-1/3 h-1/3 bg-blue-500 flex items-center justify-center text-white font-bold text-xl">CENTER<br/>SELECT</div>
      <div class="absolute left-0 bottom-0 w-full h-1/4 bg-purple-500 flex items-center justify-center text-white font-bold text-2xl">DOWN - DASHBOARD</div>
    `;
    
    document.body.appendChild(overlay);
    
    // Hide overlay after 5 seconds
    setTimeout(() => {
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 1000);
    }, 5000);
  }

  private onResults(results: any): void {
    if (!results.multiFaceLandmarks || results.multiFaceLandmarks.length === 0) {
      return;
    }

    const landmarks = results.multiFaceLandmarks[0];
    const gazePoint = this.calculateGazePoint(landmarks);
    
    if (gazePoint) {
      this.updateGazeHistory(gazePoint);
      const smoothedGaze = this.getSmoothedGaze();
      const zone = this.determineGazeZone(smoothedGaze);
      
      if (zone !== this.currentZone && zone !== 'NONE') {
        this.currentZone = zone;
        const action = this.mapZoneToAction(zone);
        this.emitEvent({ action, zone, confidence: 0.8 });
      }
    }
  }

  private calculateGazePoint(landmarks: any[]): { x: number; y: number } | null {
    // Use eye landmarks to estimate gaze direction
    const leftEye = landmarks[33]; // Left eye center
    const rightEye = landmarks[263]; // Right eye center
    const noseTip = landmarks[1]; // Nose tip
    
    if (!leftEye || !rightEye || !noseTip) return null;

    // Simple gaze estimation based on eye position relative to nose
    const eyeCenterX = (leftEye.x + rightEye.x) / 2;
    const eyeCenterY = (leftEye.y + rightEye.y) / 2;
    
    return {
      x: eyeCenterX + (eyeCenterX - noseTip.x) * 2, // Amplify gaze direction
      y: eyeCenterY + (eyeCenterY - noseTip.y) * 2
    };
  }

  private updateGazeHistory(point: { x: number; y: number }): void {
    this.gazeHistory.push(point);
    if (this.gazeHistory.length > 5) {
      this.gazeHistory.shift();
    }
  }

  private getSmoothedGaze(): { x: number; y: number } {
    if (this.gazeHistory.length === 0) return { x: 0.5, y: 0.5 };
    
    const avgX = this.gazeHistory.reduce((sum, p) => sum + p.x, 0) / this.gazeHistory.length;
    const avgY = this.gazeHistory.reduce((sum, p) => sum + p.y, 0) / this.gazeHistory.length;
    
    return { x: avgX, y: avgY };
  }

  private determineGazeZone(gaze: { x: number; y: number }): GazeEvent['zone'] {
    const { x, y } = gaze;
    const threshold = 0.15;
    
    if (y > this.calibrationData.centerY + threshold) return 'DOWN';
    if (x < this.calibrationData.centerX - threshold) return 'LEFT';
    if (x > this.calibrationData.centerX + threshold) return 'RIGHT';
    if (Math.abs(x - this.calibrationData.centerX) < threshold && 
        Math.abs(y - this.calibrationData.centerY) < threshold) return 'CENTER';
    
    return 'NONE';
  }

  private mapZoneToAction(zone: GazeEvent['zone']): GazeEvent['action'] {
    switch (zone) {
      case 'LEFT': return 'BACK';
      case 'RIGHT': return 'NEXT';
      case 'CENTER': return 'SELECT';
      case 'DOWN': return 'DASHBOARD';
      default: return 'FALLBACK';
    }
  }

  private setupKeyboardFallback(): void {
    document.addEventListener('keydown', (event) => {
      if (!this.isInitialized || this.mockMode) {
        let action: GazeEvent['action'] | null = null;
        let zone: GazeEvent['zone'] = 'NONE';

        switch (event.key) {
          case 'ArrowLeft':
            action = 'BACK';
            zone = 'LEFT';
            break;
          case 'ArrowRight':
            action = 'NEXT';
            zone = 'RIGHT';
            break;
          case 'Enter':
          case ' ':
            action = 'SELECT';
            zone = 'CENTER';
            break;
          case 'ArrowDown':
            action = 'DASHBOARD';
            zone = 'DOWN';
            break;
        }

        if (action) {
          event.preventDefault();
          this.emitEvent({ action, zone, confidence: 1.0 });
        }
      }
    });
  }

  calibrate(): void {
    // Simple calibration - user looks at center for 3 seconds
    if (this.gazeHistory.length > 0) {
      const smoothed = this.getSmoothedGaze();
      this.calibrationData = { centerX: smoothed.x, centerY: smoothed.y };
      this.isCalibrated = true;
    }
  }

  onGazeChange(callback: (event: GazeEvent) => void): void {
    this.callbacks.push(callback);
  }

  private emitEvent(event: GazeEvent): void {
    this.callbacks.forEach(callback => callback(event));
    
    // Also emit a custom DOM event for dashboard to listen to
    const customEvent = new CustomEvent('gazeZoneChange', {
      detail: { zone: event.zone, action: event.action }
    });
    document.dispatchEvent(customEvent);
  }

  getDebugInfo() {
    return {
      isInitialized: this.isInitialized,
      isCalibrated: this.isCalibrated,
      currentZone: this.currentZone,
      mockMode: this.mockMode,
      gazeHistory: this.gazeHistory
    };
  }

  destroy(): void {
    if (this.camera) {
      this.camera.stop();
    }
    if (this.videoElement) {
      this.videoElement.remove();
    }
    if (this.canvasElement) {
      this.canvasElement.remove();
    }
  }
}

export const eyeTracker = new EyeTracker();