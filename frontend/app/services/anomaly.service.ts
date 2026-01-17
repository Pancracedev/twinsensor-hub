/**
 * Anomaly Detection Service
 * Provides AI-powered anomaly detection using multiple algorithms
 */

import {
  AnomalyEvent,
  AnomalySeverity,
  AnomalyType,
  SensorBaseline,
  AnomalyDetectionConfig,
  AnomalyPattern,
} from '../types/anomaly.types';

/**
 * Statistical outlier detection
 * Uses Z-score and IQR methods
 */
export class StatisticalDetector {
  private zScoreThreshold = 2.5; // 2.5 standard deviations
  private iqrThreshold = 3; // 3 * IQR

  /**
   * Detect outliers using Z-score
   */
  detectZScoreOutlier(value: number, mean: number, std: number): boolean {
    if (std === 0) return false;
    const zScore = Math.abs((value - mean) / std);
    return zScore > this.zScoreThreshold;
  }

  /**
   * Detect outliers using IQR method
   */
  detectIQROutlier(
    value: number,
    q1: number,
    q3: number
  ): boolean {
    const iqr = q3 - q1;
    const lowerBound = q1 - this.iqrThreshold * iqr;
    const upperBound = q3 + this.iqrThreshold * iqr;
    return value < lowerBound || value > upperBound;
  }

  /**
   * Calculate anomaly score using statistical methods
   */
  calculateAnomalyScore(
    values: number[],
    baseline: SensorBaseline
  ): number {
    if (values.length === 0) return 0;

    let totalScore = 0;
    let scoreCount = 0;

    for (let i = 0; i < values.length && i < 3; i++) {
      const value = values[i];
      const mean = baseline.mean[i];
      const std = baseline.std[i];
      const q1 = baseline.percentile25[i];
      const q3 = baseline.percentile75[i];

      let score = 0;

      // Z-score component
      if (std > 0) {
        const zScore = Math.abs((value - mean) / std);
        score += Math.min(zScore / this.zScoreThreshold, 1);
      }

      // IQR component
      const iqr = q3 - q1;
      if (iqr > 0) {
        const lowerBound = q1 - this.iqrThreshold * iqr;
        const upperBound = q3 + this.iqrThreshold * iqr;
        if (value < lowerBound || value > upperBound) {
          const distance = value < lowerBound
            ? Math.abs(lowerBound - value)
            : Math.abs(value - upperBound);
          score += Math.min(distance / iqr, 1);
        }
      }

      totalScore += score;
      scoreCount++;
    }

    return scoreCount > 0 ? Math.min(totalScore / scoreCount, 1) : 0;
  }
}

/**
 * Isolation Forest-inspired detector
 * Detects anomalies based on data isolation
 */
export class IsolationDetector {
  /**
   * Calculate isolation score based on distance from other points
   */
  calculateIsolationScore(
    currentValue: number[],
    recentValues: number[][]
  ): number {
    if (recentValues.length < 5) return 0;

    let totalDistance = 0;
    let distanceCount = 0;

    // Calculate distance to each recent value
    for (const recentValue of recentValues.slice(-50)) {
      let distance = 0;
      for (let i = 0; i < Math.min(currentValue.length, recentValue.length); i++) {
        distance += Math.pow(currentValue[i] - recentValue[i], 2);
      }
      distance = Math.sqrt(distance);
      totalDistance += distance;
      distanceCount++;
    }

    const meanDistance = totalDistance / distanceCount;
    
    // Calculate how isolated this point is
    // Small distance = more isolated = higher anomaly score
    const minDistance = Math.min(...recentValues.map((v, i) => {
      let d = 0;
      for (let j = 0; j < Math.min(currentValue.length, v.length); j++) {
        d += Math.pow(currentValue[j] - v[j], 2);
      }
      return Math.sqrt(d);
    }));

    // Normalize to 0-1
    const isolationScore = minDistance / (meanDistance + 0.0001);
    return Math.min(Math.max(0, 1 - isolationScore), 1);
  }
}

/**
 * Local Outlier Factor detector
 * Detects density-based anomalies
 */
export class LOFDetector {
  private k = 5; // number of neighbors

  /**
   * Calculate local outlier factor
   */
  calculateLOF(
    currentValue: number[],
    neighborValues: number[][]
  ): number {
    if (neighborValues.length < this.k) return 0;

    // Calculate reachability distances to k nearest neighbors
    const distances = neighborValues.map((v) => this.euclideanDistance(currentValue, v));
    const sortedDistances = distances.sort((a, b) => a - b);
    const kDistance = sortedDistances[Math.min(this.k, sortedDistances.length - 1)];

    // Reachability distance to neighbors
    let reachabilitySum = 0;
    for (let i = 0; i < Math.min(this.k, distances.length); i++) {
      const dist = distances[i];
      const neighborKDist = this.estimateKDistance(neighborValues[i]);
      reachabilitySum += Math.max(dist, neighborKDist);
    }

    const localReachabilityDensity = Math.min(this.k, distances.length) / (reachabilitySum + 0.0001);

    // LOF is average LRD of neighbors / LRD of point
    let neighborLRDSum = 0;
    for (let i = 0; i < Math.min(this.k, neighborValues.length); i++) {
      neighborLRDSum += this.estimateLRD(neighborValues[i]);
    }

    const neighborAvgLRD = neighborLRDSum / Math.min(this.k, neighborValues.length);
    const lof = neighborAvgLRD / (localReachabilityDensity + 0.0001);

    // Normalize LOF to 0-1 scale
    return Math.min(Math.max(0, lof - 1), 1);
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private estimateKDistance(value: number[]): number {
    // Estimate based on variance
    const variance = value.reduce((sum, v) => sum + v * v, 0) / value.length;
    return Math.sqrt(variance);
  }

  private estimateLRD(value: number[]): number {
    const variance = value.reduce((sum, v) => sum + v * v, 0) / value.length;
    return 1 / (Math.sqrt(variance) + 0.0001);
  }
}

/**
 * Anomaly Detection Service (Singleton)
 */
class AnomalyDetectionService {
  private staticDetector = new StatisticalDetector();
  private isolationDetector = new IsolationDetector();
  private lofDetector = new LOFDetector();

  /**
   * Detect anomalies in sensor values
   */
  detectAnomalies(
    values: number[],
    baseline: SensorBaseline | null,
    recentValues: number[][] = [],
    config?: Partial<AnomalyDetectionConfig>
  ): { score: number; type: AnomalyType; confidence: number }[] {
    const results: { score: number; type: AnomalyType; confidence: number }[] = [];

    if (!baseline) return results;

    // Statistical detection
    const statScore = this.staticDetector.calculateAnomalyScore(values, baseline);
    if (statScore > 0.5) {
      results.push({
        score: statScore,
        type: AnomalyType.PATTERN_DEVIATION,
        confidence: statScore,
      });
    }

    // Isolation detection
    if (recentValues.length > 0) {
      const isolationScore = this.isolationDetector.calculateIsolationScore(
        values,
        recentValues
      );
      if (isolationScore > 0.6) {
        results.push({
          score: isolationScore,
          type: AnomalyType.UNEXPECTED_ACCELERATION,
          confidence: isolationScore,
        });
      }

      // LOF detection
      const lofScore = this.lofDetector.calculateLOF(values, recentValues);
      if (lofScore > 0.5) {
        results.push({
          score: lofScore,
          type: AnomalyType.DRIFT_DETECTED,
          confidence: lofScore,
        });
      }
    }

    return results;
  }

  /**
   * Determine anomaly severity from score
   */
  determineSeverity(score: number): AnomalySeverity {
    if (score >= 0.9) return AnomalySeverity.CRITICAL;
    if (score >= 0.75) return AnomalySeverity.HIGH;
    if (score >= 0.6) return AnomalySeverity.MEDIUM;
    return AnomalySeverity.LOW;
  }

  /**
   * Calculate baseline statistics from sensor data
   */
  calculateBaseline(
    sensorType: 'accelerometer' | 'gyroscope' | 'magnetometer',
    values: number[][]
  ): SensorBaseline {
    if (values.length === 0) {
      return {
        sensorType,
        mean: [0, 0, 0],
        std: [1, 1, 1],
        min: [0, 0, 0],
        max: [0, 0, 0],
        median: [0, 0, 0],
        percentile25: [0, 0, 0],
        percentile75: [0, 0, 0],
        iqr: [0, 0, 0],
        samplesCount: 0,
        timeWindowMinutes: 0,
        lastUpdated: Date.now(),
      };
    }

    const axes = [0, 1, 2];
    const stats: any = {
      sensorType,
      samplesCount: values.length,
      timeWindowMinutes: Math.floor(values.length / 60), // assuming ~60Hz
      lastUpdated: Date.now(),
      mean: [],
      std: [],
      min: [],
      max: [],
      median: [],
      percentile25: [],
      percentile75: [],
      iqr: [],
    };

    for (const axis of axes) {
      const axisValues = values.map(v => v[axis] || 0);
      
      // Mean
      const mean = axisValues.reduce((a, b) => a + b, 0) / axisValues.length;
      stats.mean.push(mean);

      // Standard deviation
      const variance = axisValues.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / axisValues.length;
      stats.std.push(Math.sqrt(variance));

      // Min/Max
      stats.min.push(Math.min(...axisValues));
      stats.max.push(Math.max(...axisValues));

      // Percentiles
      const sorted = [...axisValues].sort((a, b) => a - b);
      stats.median.push(sorted[Math.floor(sorted.length / 2)]);
      stats.percentile25.push(sorted[Math.floor(sorted.length * 0.25)]);
      stats.percentile75.push(sorted[Math.floor(sorted.length * 0.75)]);
      stats.iqr.push(stats.percentile75[axis] - stats.percentile25[axis]);
    }

    return stats;
  }

  /**
   * Detect specific anomaly patterns
   */
  detectMotionAnomalies(
    accelerometerValues: number[],
    gyroscopeValues: number[]
  ): { type: AnomalyType; score: number }[] {
    const results: { type: AnomalyType; score: number }[] = [];

    // Calculate magnitudes
    const accelMag = Math.sqrt(accelerometerValues[0] ** 2 + accelerometerValues[1] ** 2 + accelerometerValues[2] ** 2);
    const gyroMag = Math.sqrt(gyroscopeValues[0] ** 2 + gyroscopeValues[1] ** 2 + gyroscopeValues[2] ** 2);

    // Excessive vibration detection (high frequency oscillation)
    if (accelMag > 30) {
      results.push({
        type: AnomalyType.EXCESSIVE_VIBRATION,
        score: Math.min(accelMag / 50, 1),
      });
    }

    // Unusual rotation detection
    if (gyroMag > 100) {
      results.push({
        type: AnomalyType.UNUSUAL_ROTATION,
        score: Math.min(gyroMag / 200, 1),
      });
    }

    // Sudden movement detection
    if (accelMag > 15 && gyroMag > 50) {
      results.push({
        type: AnomalyType.SUDDEN_MOVEMENT,
        score: Math.min((accelMag / 15 + gyroMag / 50) / 2, 1),
      });
    }

    return results;
  }

  /**
   * Detect performance anomalies
   */
  detectPerformanceAnomalies(
    cpu: number,
    memory: number,
    temperature: number
  ): { type: AnomalyType; score: number }[] {
    const results: { type: AnomalyType; score: number }[] = [];

    // CPU spike detection
    if (cpu > 80) {
      results.push({
        type: AnomalyType.CPU_SPIKE,
        score: Math.min(cpu / 100, 1),
      });
    }

    // Memory leak detection (sustained high memory)
    if (memory > 85) {
      results.push({
        type: AnomalyType.MEMORY_LEAK,
        score: Math.min(memory / 100, 1),
      });
    }

    // Temperature spike
    if (temperature > 45) {
      results.push({
        type: AnomalyType.TEMPERATURE_SPIKE,
        score: Math.min(temperature / 80, 1),
      });
    }

    // Thermal throttling
    if (temperature > 50) {
      results.push({
        type: AnomalyType.THERMAL_THROTTLING,
        score: Math.min(temperature / 80, 1),
      });
    }

    return results;
  }
}

// Export singleton instance
export const anomalyDetectionService = new AnomalyDetectionService();
