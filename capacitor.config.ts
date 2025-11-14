import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.dc2f0795d4ad4aa3aa0d7659585adbde',
  appName: 'MAF Walking',
  webDir: 'dist',
  server: {
    url: 'https://dc2f0795-d4ad-4aa3-aa0d-7659585adbde.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    CapacitorHealthKit: {
      // Request permissions for HealthKit data
      readPermissions: [
        'HKQuantityTypeIdentifierHeartRate',
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKQuantityTypeIdentifierActiveEnergyBurned'
      ],
      writePermissions: [
        'HKQuantityTypeIdentifierStepCount',
        'HKQuantityTypeIdentifierDistanceWalkingRunning',
        'HKWorkoutTypeIdentifier'
      ]
    }
  }
};

export default config;
