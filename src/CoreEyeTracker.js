/**
 * Core Eye Tracker Module - Production Ready
 * Extracted from working-eye-tracker.html with same accuracy
 * For integration into EdTech video dashboards and learning platforms
 */

class CoreEyeTracker {
    constructor(config = {}) {
        // Configuration with same settings as working eye tracker
        this.config = {
            sensitivity: config.sensitivity || { x: 3.5, y: 2.5 },
            smoothing: config.smoothing || 3,
            minDetectionConfidence: config.minDetectionConfidence || 0.7,
            minTrackingConfidence: config.minTrackingConfidence || 0.7,
            debugMode: config.debugMode || false,
            ...config
        };
        
        // Core tracking state
        this.faceMesh = null;
        this.camera = null;
        this.isTracking = false;
        this.isInitialized = false;
        
        // Gaze data
        this.lastResults = null;
        this.gazeHistory = [];
        this.gazeHistorySize = this.config.smoothing;
        this.smoothedGaze = { x: 0.5, y: 0.5 };
        this.currentZone = null;
        this.lastGazePoint = null;
        
        // MediaPipe landmark indices for iris tracking (same as working version)
        this.LEFT_IRIS_INDICES = [468, 469, 470, 471, 472];
        this.RIGHT_IRIS_INDICES = [473, 474, 475, 476, 477];
        this.LEFT_EYE_CORNERS = { inner: 133, outer: 33 };
        this.RIGHT_EYE_CORNERS = { inner: 362, outer: 263 };
        this.LEFT_EYE_BOUNDS = { inner: 133, outer: 33, upper: 159, lower: 145 };
        this.RIGHT_EYE_BOUNDS = { inner: 362, outer: 263, upper: 386, lower: 374 };
        
        // Event callbacks
        this.onGazeUpdate = config.onGazeUpdate || null;
        this.onZoneChange = config.onZoneChange || null;
        this.onFaceDetected = config.onFaceDetected || null;
        this.onError = config.onError || null;
    }
    
    /**
     * Initialize the eye tracker - must be called before start()
     */
    async initialize(videoElement) {
        try {
            if (this.isInitialized) return true;
            
            this.videoElement = videoElement;
            
            // Wait for MediaPipe to load
            await this.waitForMediaPipe();
            
            // Setup MediaPipe
            await this.setupMediaPipe();
            
            this.isInitialized = true;
            return true;
            
        } catch (error) {
            console.error('Eye tracker initialization failed:', error);
            if (this.onError) this.onError('INIT_ERROR', error);
            return false;
        }
    }
    
    /**
     * Start eye tracking
     */
    async start() {
        try {
            if (!this.isInitialized) {
                throw new Error('Eye tracker not initialized. Call initialize() first.');
            }
            
            if (this.isTracking) return true;
            
            // Get camera stream
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user', 
                    width: { ideal: 640 }, 
                    height: { ideal: 480 }
                }
            });
            
            this.videoElement.srcObject = stream;
            
            // Start camera
            await this.camera.start();
            
            this.isTracking = true;
            return true;
            
        } catch (error) {
            console.error('Eye tracking start failed:', error);
            if (this.onError) this.onError('START_ERROR', error);
            return false;
        }
    }
    
    /**
     * Stop eye tracking
     */
    stop() {
        this.isTracking = false;
        
        if (this.camera) {
            this.camera.stop();
        }
        
        // Stop video stream
        const stream = this.videoElement?.srcObject;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
            if (this.videoElement) this.videoElement.srcObject = null;
        }
        
        this.currentZone = null;
        this.gazeHistory = [];
    }
    
    /**
     * Get current gaze data
     */
    getCurrentGaze() {
        return {
            gaze: this.lastGazePoint,
            zone: this.currentZone,
            smoothed: this.smoothedGaze,
            isTracking: this.isTracking,
            confidence: this.lastGazePoint?.confidence || 0
        };
    }
    
    /**
     * Wait for MediaPipe libraries to load
     */
    async waitForMediaPipe() {
        let attempts = 0;
        const maxAttempts = 50;
        
        while ((typeof FaceMesh === 'undefined' || typeof Camera === 'undefined') && attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (typeof FaceMesh === 'undefined' || typeof Camera === 'undefined') {
            throw new Error('MediaPipe libraries failed to load');
        }
    }
    
    /**
     * Setup MediaPipe FaceMesh
     */
    async setupMediaPipe() {
        this.faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
        });
        
        this.faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: this.config.minDetectionConfidence,
            minTrackingConfidence: this.config.minTrackingConfidence
        });
        
        this.faceMesh.onResults((results) => this.onResults(results));
        
        this.camera = new Camera(this.videoElement, {
            onFrame: async () => {
                if (this.faceMesh && this.isTracking) {
                    await this.faceMesh.send({ image: this.videoElement });
                }
            },
            width: 640,
            height: 480
        });
    }
    
    /**
     * Process MediaPipe results - Core tracking logic
     */
    onResults(results) {
        this.lastResults = results;
        
        if (!this.isTracking) return;
        
        const faceLandmarks = results.multiFaceLandmarks || [];
        
        if (faceLandmarks.length === 0) {
            if (this.onFaceDetected) this.onFaceDetected(false);
            return;
        }
        
        const landmarks = faceLandmarks[0];
        if (this.onFaceDetected) this.onFaceDetected(true, landmarks.length);
        
        if (landmarks.length < 478) {
            return; // Need iris landmarks
        }
        
        // Process iris tracking using the same algorithm as working-eye-tracker.html
        this.processIrisTracking(landmarks);
    }
    
    /**
     * Core iris tracking - Same algorithm as working-eye-tracker.html
     */
    processIrisTracking(landmarks) {
        try {
            // Extract iris data
            const irisData = this.extractIrisData(landmarks);
            if (!irisData) return;
            
            // Calculate gaze from iris
            const gazePoint = this.calculateGazeFromIris(irisData);
            if (!gazePoint) return;
            
            // Apply temporal smoothing
            const smoothedGaze = this.applySmoothingFilter(gazePoint);
            
            // Store for access
            this.lastGazePoint = smoothedGaze;
            
            // Determine zone
            const zone = this.determineGazeZone(smoothedGaze);
            this.updateCurrentZone(zone);
            
            // Trigger callbacks
            if (this.onGazeUpdate) {
                this.onGazeUpdate({
                    gaze: smoothedGaze,
                    zone: zone,
                    raw: gazePoint,
                    timestamp: Date.now()
                });
            }
            
        } catch (error) {
            console.error('Iris tracking error:', error);
        }
    }
    
    /**
     * Extract iris data from landmarks - Same as working version
     */
    extractIrisData(landmarks) {
        if (!landmarks || landmarks.length < 478) return null;
        
        const leftIrisPoints = this.LEFT_IRIS_INDICES.map(i => landmarks[i]);
        const rightIrisPoints = this.RIGHT_IRIS_INDICES.map(i => landmarks[i]);
        
        if (!leftIrisPoints.every(p => p && typeof p.x === 'number') || 
            !rightIrisPoints.every(p => p && typeof p.x === 'number')) {
            return null;
        }
        
        const leftIrisCenter = this.calculateCentroid(leftIrisPoints);
        const rightIrisCenter = this.calculateCentroid(rightIrisPoints);
        
        return {
            leftIris: leftIrisCenter,
            rightIris: rightIrisCenter,
            rawLeftIris: leftIrisPoints,
            rawRightIris: rightIrisPoints
        };
    }
    
    /**
     * Calculate gaze from iris data - Same sensitivity as working version
     */
    calculateGazeFromIris(irisData) {
        if (!irisData?.leftIris || !irisData?.rightIris) return null;
        
        // Average iris position
        const avgIrisX = (irisData.leftIris.x + irisData.rightIris.x) / 2;
        const avgIrisY = (irisData.leftIris.y + irisData.rightIris.y) / 2;
        
        // Apply same amplification as working version
        let gazeX = (avgIrisX - 0.5) * this.config.sensitivity.x + 0.5;
        let gazeY = (avgIrisY - 0.5) * this.config.sensitivity.y + 0.5;
        
        // Clamp to valid range
        gazeX = Math.max(0.0, Math.min(1.0, gazeX));
        gazeY = Math.max(0.0, Math.min(1.0, gazeY));
        
        return {
            x: gazeX,
            y: gazeY,
            confidence: this.calculateConfidence(irisData)
        };
    }
    
    /**
     * Apply temporal smoothing filter - Same as working version
     */
    applySmoothingFilter(gazePoint) {
        this.gazeHistory.push({ x: gazePoint.x, y: gazePoint.y });
        
        if (this.gazeHistory.length > this.gazeHistorySize) {
            this.gazeHistory.shift();
        }
        
        const avgX = this.gazeHistory.reduce((sum, point) => sum + point.x, 0) / this.gazeHistory.length;
        const avgY = this.gazeHistory.reduce((sum, point) => sum + point.y, 0) / this.gazeHistory.length;
        
        this.smoothedGaze = { x: avgX, y: avgY, confidence: gazePoint.confidence };
        return this.smoothedGaze;
    }
    
    /**
     * Calculate confidence score
     */
    calculateConfidence(irisData) {
        const leftSpread = this.calculatePointSpread(irisData.rawLeftIris);
        const rightSpread = this.calculatePointSpread(irisData.rawRightIris);
        return Math.min(1.0, (leftSpread + rightSpread) * 100);
    }
    
    /**
     * Calculate point spread for confidence
     */
    calculatePointSpread(points) {
        const centroid = this.calculateCentroid(points);
        const distances = points.map(p => 
            Math.sqrt(Math.pow(p.x - centroid.x, 2) + Math.pow(p.y - centroid.y, 2))
        );
        return distances.reduce((sum, d) => sum + d, 0) / distances.length;
    }
    
    /**
     * Calculate centroid of points
     */
    calculateCentroid(points) {
        const sum = points.reduce((acc, point) => ({
            x: acc.x + point.x,
            y: acc.y + point.y
        }), { x: 0, y: 0 });
        
        return {
            x: sum.x / points.length,
            y: sum.y / points.length
        };
    }
    
    /**
     * Determine gaze zone - Can be customized per application
     */
    determineGazeZone(gazePoint) {
        const { x, y } = gazePoint;
        
        // Default zones (can be overridden)
        if (y > 0.65) return 'DOWN';
        if (x > 0.65) return 'LEFT';
        if (x < 0.35) return 'RIGHT';
        return 'CENTER';
    }
    
    /**
     * Update current zone and trigger callbacks
     */
    updateCurrentZone(zone) {
        if (zone !== this.currentZone) {
            const previousZone = this.currentZone;
            this.currentZone = zone;
            
            if (this.onZoneChange) {
                this.onZoneChange({
                    zone: zone,
                    previousZone: previousZone,
                    gaze: this.lastGazePoint,
                    timestamp: Date.now()
                });
            }
        }
    }
    
    /**
     * Set custom zone detection function
     */
    setZoneDetector(zoneDetectorFn) {
        this.determineGazeZone = zoneDetectorFn;
    }
    
    /**
     * Get analytics data
     */
    getAnalytics() {
        return {
            totalGazePoints: this.gazeHistory.length,
            currentZone: this.currentZone,
            isTracking: this.isTracking,
            confidence: this.lastGazePoint?.confidence || 0,
            smoothedGaze: this.smoothedGaze
        };
    }
}

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CoreEyeTracker;
}

// Export for ES6 modules
if (typeof window !== 'undefined') {
    window.CoreEyeTracker = CoreEyeTracker;
}