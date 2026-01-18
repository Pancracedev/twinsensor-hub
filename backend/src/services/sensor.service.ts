import type {
  SensorReading,
  PerformanceMetrics,
  AccelerometerReading,
  GyroscopeReading,
  MagnetometerReading,
} from '../types/index.js';
import logger from '../utils/logger.js';

/**
 * Sensor Service - Validates and processes sensor data
 */
class SensorService {
  private readonly ACCEL_RANGE = 50; // m/s^2
  private readonly GYRO_RANGE = 360; // deg/s
  private readonly MAG_RANGE = 100; // µT

  /**
   * Validate accelerometer reading
   */
  validateAccelerometerReading(reading: AccelerometerReading): boolean {
    const { x, y, z } = reading;

    if (
      !this.isValidNumber(x) ||
      !this.isValidNumber(y) ||
      !this.isValidNumber(z)
    ) {
      return false;
    }

    if (
      Math.abs(x) > this.ACCEL_RANGE ||
      Math.abs(y) > this.ACCEL_RANGE ||
      Math.abs(z) > this.ACCEL_RANGE
    ) {
      logger.warn(
        { x, y, z },
        'Accelerometer reading out of expected range'
      );
      return false;
    }

    return true;
  }

  /**
   * Validate gyroscope reading
   */
  validateGyroscopeReading(reading: GyroscopeReading): boolean {
    const { x, y, z } = reading;

    if (
      !this.isValidNumber(x) ||
      !this.isValidNumber(y) ||
      !this.isValidNumber(z)
    ) {
      return false;
    }

    if (
      Math.abs(x) > this.GYRO_RANGE ||
      Math.abs(y) > this.GYRO_RANGE ||
      Math.abs(z) > this.GYRO_RANGE
    ) {
      logger.warn({ x, y, z }, 'Gyroscope reading out of expected range');
      return false;
    }

    return true;
  }

  /**
   * Validate magnetometer reading
   */
  validateMagnetometerReading(reading: MagnetometerReading): boolean {
    const { x, y, z } = reading;

    if (
      !this.isValidNumber(x) ||
      !this.isValidNumber(y) ||
      !this.isValidNumber(z)
    ) {
      return false;
    }

    if (
      Math.abs(x) > this.MAG_RANGE ||
      Math.abs(y) > this.MAG_RANGE ||
      Math.abs(z) > this.MAG_RANGE
    ) {
      logger.warn({ x, y, z }, 'Magnetometer reading out of expected range');
      return false;
    }

    return true;
  }

  /**
   * Validate performance metrics
   */
  validatePerformanceMetrics(metrics: PerformanceMetrics): boolean {
    const { cpu, memory, temperature, fps } = metrics;

    if (!this.isValidNumber(cpu) || cpu < 0 || cpu > 100) {
      return false;
    }

    if (!this.isValidNumber(memory) || memory < 0 || memory > 100) {
      return false;
    }

    if (!this.isValidNumber(temperature) || temperature < -50 || temperature > 150) {
      return false;
    }

    if (!this.isValidNumber(fps) || fps < 0 || fps > 120) {
      return false;
    }

    return true;
  }

  /**
   * Validate sensor reading
   */
  validateSensorReading(reading: SensorReading): boolean {
    try {
      if (!this.isValidNumber(reading.timestamp)) {
        return false;
      }

      if (!this.validateAccelerometerReading(reading.accelerometer)) {
        logger.warn('Invalid accelerometer reading');
        return false;
      }

      if (!this.validateGyroscopeReading(reading.gyroscope)) {
        logger.warn('Invalid gyroscope reading');
        return false;
      }

      if (!this.validateMagnetometerReading(reading.magnetometer)) {
        logger.warn('Invalid magnetometer reading');
        return false;
      }

      return true;
    } catch (error) {
      logger.error({ error }, 'Error validating sensor reading');
      return false;
    }
  }

  /**
   * Calculate acceleration magnitude
   */
  calculateAccelerationMagnitude(reading: AccelerometerReading): number {
    const { x, y, z } = reading;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Calculate rotation rate magnitude
   */
  calculateRotationMagnitude(reading: GyroscopeReading): number {
    const { x, y, z } = reading;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Calculate magnetic field strength
   */
  calculateMagneticStrength(reading: MagnetometerReading): number {
    const { x, y, z } = reading;
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Detect motion patterns
   */
  detectMotion(reading: SensorReading): {
    isMoving: boolean;
    acceleration: number;
    rotation: number;
  } {
    const acceleration = this.calculateAccelerationMagnitude(
      reading.accelerometer
    );
    const rotation = this.calculateRotationMagnitude(reading.gyroscope);

    const MOVEMENT_THRESHOLD = 2; // m/s^2
    const ROTATION_THRESHOLD = 5; // deg/s

    return {
      isMoving:
        acceleration > MOVEMENT_THRESHOLD || rotation > ROTATION_THRESHOLD,
      acceleration,
      rotation,
    };
  }

  /**
   * Private helper - Check if value is a valid number
   */
  private isValidNumber(value: any): boolean {
    return typeof value === 'number' && !isNaN(value) && isFinite(value);
  }
}

export default new SensorService();
