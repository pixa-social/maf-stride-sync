// HealthKit Integration Service
// This provides a unified interface for health data across platforms

import { Capacitor } from '@capacitor/core';

export interface HealthKitData {
  heartRate?: number;
  steps?: number;
  distance?: number; // in kilometers
  activeEnergy?: number; // calories
}

export interface WorkoutData {
  type: 'walking' | 'running';
  startDate: Date;
  endDate: Date;
  duration: number; // minutes
  distance: number; // kilometers
  heartRateData?: number[]; // array of heart rate samples
  averageHeartRate?: number;
}

class HealthKitService {
  private isAvailable = false;
  private listeners: Map<string, (data: HealthKitData) => void> = new Map();

  constructor() {
    this.checkAvailability();
  }

  private async checkAvailability() {
    // Check if running on iOS
    if (Capacitor.getPlatform() === 'ios') {
      try {
        // Check if HealthKit is available (will be set up after native build)
        // Using dynamic import to avoid build errors when plugin isn't installed
        const healthModule = await import('@capacitor-community/health').catch(() => null);
        if (healthModule?.CapacitorHealthKit) {
          this.isAvailable = true;
          console.log('HealthKit available');
        }
      } catch (error) {
        console.log('HealthKit plugin not available:', error);
        this.isAvailable = false;
      }
    }
  }

  async requestAuthorization(): Promise<boolean> {
    if (!this.isAvailable) {
      console.log('HealthKit not available on this platform');
      return false;
    }

    try {
      const healthModule = await import('@capacitor-community/health').catch(() => null);
      if (!healthModule?.CapacitorHealthKit) return false;
      
      const { CapacitorHealthKit } = healthModule;
      
      await CapacitorHealthKit.requestAuthorization({
        read: [
          'heartRate',
          'steps',
          'distance',
          'activeEnergy'
        ],
        write: [
          'steps',
          'distance',
          'workout'
        ]
      });
      
      return true;
    } catch (error) {
      console.error('HealthKit authorization failed:', error);
      return false;
    }
  }

  async queryHeartRate(startDate: Date, endDate: Date): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const healthModule = await import('@capacitor-community/health').catch(() => null);
      if (!healthModule?.CapacitorHealthKit) return null;
      
      const { CapacitorHealthKit } = healthModule;
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'heartRate',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        limit: 1
      });

      if (result.resultData && result.resultData.length > 0) {
        return result.resultData[0].quantity;
      }
      return null;
    } catch (error) {
      console.error('Failed to query heart rate:', error);
      return null;
    }
  }

  async querySteps(startDate: Date, endDate: Date): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const healthModule = await import('@capacitor-community/health').catch(() => null);
      if (!healthModule?.CapacitorHealthKit) return null;
      
      const { CapacitorHealthKit } = healthModule;
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'steps',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (result.resultData && result.resultData.length > 0) {
        return result.resultData.reduce((sum: number, sample: any) => sum + sample.quantity, 0);
      }
      return null;
    } catch (error) {
      console.error('Failed to query steps:', error);
      return null;
    }
  }

  async queryDistance(startDate: Date, endDate: Date): Promise<number | null> {
    if (!this.isAvailable) return null;

    try {
      const healthModule = await import('@capacitor-community/health').catch(() => null);
      if (!healthModule?.CapacitorHealthKit) return null;
      
      const { CapacitorHealthKit } = healthModule;
      
      const result = await CapacitorHealthKit.queryHKitSampleType({
        sampleName: 'distance',
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (result.resultData && result.resultData.length > 0) {
        return result.resultData.reduce((sum: number, sample: any) => sum + sample.quantity, 0);
      }
      return null;
    } catch (error) {
      console.error('Failed to query distance:', error);
      return null;
    }
  }

  async saveWorkout(workout: WorkoutData): Promise<boolean> {
    if (!this.isAvailable) return false;

    try {
      const healthModule = await import('@capacitor-community/health').catch(() => null);
      if (!healthModule?.CapacitorHealthKit) return false;
      
      const { CapacitorHealthKit } = healthModule;
      
      await CapacitorHealthKit.saveWorkout({
        activityType: workout.type === 'walking' ? 'HKWorkoutActivityTypeWalking' : 'HKWorkoutActivityTypeRunning',
        startDate: workout.startDate.toISOString(),
        endDate: workout.endDate.toISOString(),
        duration: workout.duration * 60, // convert to seconds
        distance: workout.distance * 1000, // convert to meters
        energyBurned: 0, // optional
      });
      
      return true;
    } catch (error) {
      console.error('Failed to save workout:', error);
      return false;
    }
  }

  // Start real-time monitoring (for workout sessions)
  async startMonitoring(callback: (data: HealthKitData) => void): Promise<string> {
    const id = Math.random().toString(36).substr(2, 9);
    this.listeners.set(id, callback);

    if (this.isAvailable) {
      // Start periodic queries for real-time data
      const interval = setInterval(async () => {
        const now = new Date();
        const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);

        const [heartRate, steps, distance] = await Promise.all([
          this.queryHeartRate(oneMinuteAgo, now),
          this.querySteps(oneMinuteAgo, now),
          this.queryDistance(oneMinuteAgo, now)
        ]);

        callback({
          heartRate: heartRate || undefined,
          steps: steps || undefined,
          distance: distance || undefined
        });
      }, 5000); // Query every 5 seconds

      // Store interval for cleanup
      (this.listeners as any)[`${id}_interval`] = interval;
    } else {
      // Fallback: simulate data for testing in browser
      const interval = setInterval(() => {
        callback({
          heartRate: 70 + Math.floor(Math.random() * 50),
          steps: Math.floor(Math.random() * 10),
          distance: Math.random() * 0.01
        });
      }, 2000);
      
      (this.listeners as any)[`${id}_interval`] = interval;
    }

    return id;
  }

  stopMonitoring(id: string) {
    const interval = (this.listeners as any)[`${id}_interval`];
    if (interval) {
      clearInterval(interval);
      delete (this.listeners as any)[`${id}_interval`];
    }
    this.listeners.delete(id);
  }

  isHealthKitAvailable(): boolean {
    return this.isAvailable;
  }

  getPlatform(): string {
    return Capacitor.getPlatform();
  }
}

export const healthKitService = new HealthKitService();
