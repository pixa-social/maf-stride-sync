// MAF (Maximum Aerobic Function) Calculator
// Formula: 180 - Age with adjustments

export interface MAFResult {
  baseMAF: number;
  adjustedMAF: number;
  minHeartRate: number;
  maxHeartRate: number;
  zone: string;
}

export type FitnessLevel = 
  | 'beginner' // subtract 5
  | 'intermediate' // no change
  | 'advanced' // add 5
  | 'recovering'; // subtract 10

export type HealthStatus = 
  | 'healthy' // no change
  | 'recovering-injury' // subtract 10
  | 'medication' // subtract 10
  | 'recent-illness'; // subtract 5

export function calculateMAF(
  age: number,
  fitnessLevel: FitnessLevel = 'intermediate',
  healthStatus: HealthStatus = 'healthy'
): MAFResult {
  // Base calculation
  const baseMAF = 180 - age;
  
  // Fitness level adjustments
  let adjustment = 0;
  switch (fitnessLevel) {
    case 'beginner':
      adjustment -= 5;
      break;
    case 'advanced':
      adjustment += 5;
      break;
    case 'recovering':
      adjustment -= 10;
      break;
  }
  
  // Health status adjustments
  switch (healthStatus) {
    case 'recovering-injury':
    case 'medication':
      adjustment -= 10;
      break;
    case 'recent-illness':
      adjustment -= 5;
      break;
  }
  
  const adjustedMAF = baseMAF + adjustment;
  
  // MAF range is typically adjustedMAF ± 10 bpm
  const minHeartRate = adjustedMAF - 10;
  const maxHeartRate = adjustedMAF;
  
  return {
    baseMAF,
    adjustedMAF,
    minHeartRate,
    maxHeartRate,
    zone: `${minHeartRate}-${maxHeartRate} bpm`
  };
}

export function getHeartRateZone(currentHR: number, mafResult: MAFResult): {
  zone: 'below' | 'maf' | 'above';
  percentage: number;
} {
  const { minHeartRate, maxHeartRate } = mafResult;
  
  if (currentHR < minHeartRate) {
    return { zone: 'below', percentage: (currentHR / minHeartRate) * 100 };
  } else if (currentHR <= maxHeartRate) {
    const range = maxHeartRate - minHeartRate;
    const position = currentHR - minHeartRate;
    return { zone: 'maf', percentage: (position / range) * 100 };
  } else {
    return { zone: 'above', percentage: Math.min(((currentHR - maxHeartRate) / maxHeartRate) * 100 + 100, 150) };
  }
}

export function isInMAFZone(currentHR: number, mafResult: MAFResult): boolean {
  return currentHR >= mafResult.minHeartRate && currentHR <= mafResult.maxHeartRate;
}
