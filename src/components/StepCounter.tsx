import { useEffect, useState } from "react";
import { Footprints } from "lucide-react";
import { Card } from "@/components/ui/card";
import { healthKitService } from "@/lib/healthKit";

export function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Query today's steps from HealthKit
    const fetchTodaySteps = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const now = new Date();
      
      const todaySteps = await healthKitService.querySteps(today, now);
      if (todaySteps !== null) {
        setSteps(todaySteps);
        setIsSupported(true);
      }
    };

    fetchTodaySteps();

    // Start monitoring for real-time updates
    let monitorId: string;
    healthKitService.startMonitoring((data) => {
      if (data.steps) {
        setSteps(prev => prev + data.steps);
        setIsSupported(true);
      }
    }).then(id => {
      monitorId = id;
    });

    return () => {
      if (monitorId) {
        healthKitService.stopMonitoring(monitorId);
      }
    };
  }, []);

  return (
    <Card className="bg-gradient-card border-0 shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary-light p-3">
            <Footprints className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Live Steps</h3>
            <p className="text-sm text-muted-foreground">Real-time counting</p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="text-center">
          <p className="text-5xl font-bold text-primary mb-2">{steps.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">
            {isSupported ? 'Tracking active' : 'Connect device for live tracking'}
          </p>
        </div>

        {!isSupported && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-center text-muted-foreground">
            {healthKitService.getPlatform() === 'ios' 
              ? 'Authorize HealthKit access to track steps' 
              : 'Step counting requires iOS device. Showing simulated data.'}
          </div>
        )}
        
        {isSupported && healthKitService.isHealthKitAvailable() && (
          <div className="bg-success/10 rounded-lg p-2 text-xs text-center text-success font-medium">
            ✓ Synced with Apple Health
          </div>
        )}
      </div>
    </Card>
  );
}
