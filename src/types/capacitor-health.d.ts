// Type declarations for @capacitor-community/health
// This module will be installed when setting up Capacitor locally

declare module '@capacitor-community/health' {
  export interface CapacitorHealthKitPlugin {
    requestAuthorization(options: {
      read: string[];
      write: string[];
    }): Promise<void>;

    queryHKitSampleType(options: {
      sampleName: string;
      startDate: string;
      endDate: string;
      limit?: number;
    }): Promise<{
      resultData: Array<{
        quantity: number;
        startDate: string;
        endDate: string;
      }>;
    }>;

    saveWorkout(options: {
      activityType: string;
      startDate: string;
      endDate: string;
      duration: number;
      distance: number;
      energyBurned: number;
    }): Promise<void>;
  }

  export const CapacitorHealthKit: CapacitorHealthKitPlugin;
}
