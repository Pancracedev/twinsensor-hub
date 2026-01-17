/**
 * Anomaly Detection Types
 * Defines types for AI-powered anomaly detection in sensor data
 */

/**
 * Anomaly severity levels
 */
export enum AnomalySeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Anomaly types based on sensor patterns
 */
export enum AnomalyType {
  // Motion anomalies
  UNEXPECTED_ACCELERATION = 'unexpected_acceleration',
  UNEXPECTED_DECELERATION = 'unexpected_deceleration',
  UNUSUAL_ROTATION = 'unusual_rotation',
  EXCESSIVE_VIBRATION = 'excessive_vibration',
  SUDDEN_MOVEMENT = 'sudden_movement',

  // Performance anomalies
  CPU_SPIKE = 'cpu_spike',
  MEMORY_LEAK = 'memory_leak',
  TEMPERATURE_SPIKE = 'temperature_spike',
  THERMAL_THROTTLING = 'thermal_throttling',

  // Pattern anomalies
  PATTERN_DEVIATION = 'pattern_deviation',
  PERIODIC_ANOMALY = 'periodic_anomaly',
  DRIFT_DETECTED = 'drift_detected',
}

/**
 * Single anomaly event
 */
export interface AnomalyEvent {
  id: string;
  timestamp: number;
  type: AnomalyType;
  severity: AnomalySeverity;
  
  // Detection details
  confidence: number; // 0-1
  description: string;
  sensorValues?: Record<string, number>;
  
  // Context
  windowSize: number; // milliseconds
  baselineDeviation: number; // percentage
  
  // Status
  acknowledged: boolean;
  acknowledgedAt?: number;
  notes?: string;
}

/**
 * Anomaly pattern for ML training
 */
export interface AnomalyPattern {
  id: string;
  type: AnomalyType;
  
  // Pattern characteristics
  features: number[];
  mean: number[];
  std: number[];
  
  // Statistics
  frequency: number; // how often it occurs
  averageSeverity: AnomalySeverity;
  occurrences: number;
  
  // Timestamps
  firstSeen: number;
  lastSeen: number;
}

/**
 * Baseline statistics for normal behavior
 */
export interface SensorBaseline {
  sensorType: 'accelerometer' | 'gyroscope' | 'magnetometer';
  
  // Statistics
  mean: number[];
  std: number[];
  min: number[];
  max: number[];
  median: number[];
  
  // Distribution
  percentile25: number[];
  percentile75: number[];
  iqr: number[];
  
  // Temporal
  samplesCount: number;
  timeWindowMinutes: number;
  lastUpdated: number;
}

/**
 * ML Model state
 */
export interface MLModelState {
  isReady: boolean;
  isTraining: boolean;
  accuracy?: number;
  precision?: number;
  recall?: number;
  f1Score?: number;
  
  // Training progress
  trainingProgress?: number; // 0-100
  trainingError?: string;
  
  // Model info
  version: string;
  lastTrained: number;
  samplesUsed: number;
}

/**
 * Anomaly detection configuration
 */
export interface AnomalyDetectionConfig {
  // Sensitivity
  confidenceThreshold: number; // 0-1, default 0.7
  severityThreshold: AnomalySeverity; // minimum severity to alert
  
  // Windows
  slidingWindowSize: number; // ms, default 5000
  updateInterval: number; // ms, default 1000
  
  // Algorithms
  algorithms: {
    isolation_forest: boolean;
    local_outlier_factor: boolean;
    statistical: boolean;
    ml_model: boolean;
  };
  
  // Thresholds per anomaly type
  anomalyThresholds: Record<AnomalyType, {
    threshold: number;
    windowSize: number;
    enableAlert: boolean;
  }>;
}

/**
 * Anomaly detection store state
 */
export interface AnomalyDetectionState {
  // Current anomalies
  currentAnomalies: AnomalyEvent[];
  recentAnomalies: AnomalyEvent[];
  
  // Statistics
  anomalyCount: number;
  anomalyRate: number; // anomalies per hour
  
  // Patterns
  detectedPatterns: Map<AnomalyType, AnomalyPattern>;
  
  // Baselines
  baselines: Map<string, SensorBaseline>;
  
  // ML Model
  mlModel: MLModelState;
  
  // Configuration
  config: AnomalyDetectionConfig;
  
  // Status
  isDetecting: boolean;
  isUpdatingBaseline: boolean;
  lastDetectionTime: number;
  
  // Actions
  addAnomaly: (anomaly: AnomalyEvent) => void;
  acknowledgeAnomaly: (id: string, notes?: string) => void;
  clearAnomalies: () => void;
  
  setConfig: (config: Partial<AnomalyDetectionConfig>) => void;
  updateBaseline: (baseline: SensorBaseline) => void;
  
  setMLModelState: (state: Partial<MLModelState>) => void;
  trainMLModel: () => Promise<void>;
  
  resetPatterns: () => void;
}

/**
 * Anomaly alert
 */
export interface AnomalyAlert {
  id: string;
  anomalyId: string;
  title: string;
  message: string;
  severity: AnomalySeverity;
  timestamp: number;
  
  // Actions
  actionableItems: string[];
  
  // Status
  read: boolean;
  dismissed: boolean;
}

/**
 * Anomaly statistics
 */
export interface AnomalyStatistics {
  totalAnomalies: number;
  byType: Record<AnomalyType, number>;
  bySeverity: Record<AnomalySeverity, number>;
  averageConfidence: number;
  anomalyRate: number; // per hour
  mostCommonType: AnomalyType;
  lastAnomalyTime: number;
}
