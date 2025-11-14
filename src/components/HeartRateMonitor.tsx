import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { Card } from "@/components/ui/card";
import { type MAFResult, getHeartRateZone } from "@/lib/mafCalculator";
import { cn } from "@/lib/utils";
import { healthKitService } from "@/lib/healthKit";

interface HeartRateMonitorProps {
  mafResult: MAFResult | null;
}

export function HeartRateMonitor({ mafResult }: HeartRateMonitorProps) {
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    setPlatform(healthKitService.getPlatform());
    
    // Request HealthKit authorization on mount
    healthKitService.requestAuthorization().then(authorized => {
      if (authorized) {
        setIsConnected(true);
      }
    });

    // Start monitoring heart rate
    let monitorId: string;
    healthKitService.startMonitoring((data) => {
      if (data.heartRate) {
        setHeartRate(data.heartRate);
        setIsConnected(true);
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

  const zone = heartRate && mafResult ? getHeartRateZone(heartRate, mafResult) : null;
  
  const getZoneColor = () => {
    if (!zone) return "text-muted-foreground";
    switch (zone.zone) {
      case 'below': return "text-primary";
      case 'maf': return "text-success";
      case 'above': return "text-warning";
    }
  };

  const getZoneLabel = () => {
    if (!zone) return "Waiting...";
    switch (zone.zone) {
      case 'below': return "Below MAF Zone";
      case 'maf': return "In MAF Zone ✓";
      case 'above': return "Above MAF Zone";
    }
  };

  return (
    <Card className="bg-gradient-card border-0 shadow-soft p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-destructive/10 p-3 relative">
            <Heart className={cn(
              "h-6 w-6 text-destructive",
              isConnected && heartRate && "animate-pulse"
            )} />
          </div>
          <div>
            <h3 className="font-semibold">Heart Rate</h3>
            <p className="text-sm text-muted-foreground">Live monitoring</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className={cn("text-5xl font-bold mb-2", getZoneColor())}>
            {heartRate ? `${heartRate}` : '--'}
            {heartRate && <span className="text-2xl ml-2">bpm</span>}
          </p>
          <p className={cn("text-sm font-medium", getZoneColor())}>
            {getZoneLabel()}
          </p>
        </div>

        {mafResult && heartRate && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Below</span>
              <span>MAF Zone</span>
              <span>Above</span>
            </div>
            <div className="relative w-full h-3 bg-muted rounded-full overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1/3 bg-primary/30" />
              <div className="absolute inset-y-0 left-1/3 w-1/3 bg-success/30" />
              <div className="absolute inset-y-0 right-0 w-1/3 bg-warning/30" />
              <div 
                className="absolute inset-y-0 w-1 bg-foreground transition-all duration-300"
                style={{ 
                  left: `${Math.min(Math.max((heartRate - (mafResult.minHeartRate - 20)) / ((mafResult.maxHeartRate + 20) - (mafResult.minHeartRate - 20)) * 100, 0), 100)}%` 
                }}
              />
            </div>
            <div className="flex justify-between text-xs font-medium">
              <span>{mafResult.minHeartRate - 20}</span>
              <span className="text-success">{mafResult.minHeartRate}-{mafResult.maxHeartRate}</span>
              <span>{mafResult.maxHeartRate + 20}</span>
            </div>
          </div>
        )}

        {!isConnected && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm text-center text-muted-foreground">
            {platform === 'ios' 
              ? 'Authorize HealthKit access in Settings to connect' 
              : 'HealthKit only available on iOS devices. Showing simulated data.'}
          </div>
        )}
        
        {isConnected && healthKitService.isHealthKitAvailable() && (
          <div className="bg-success/10 rounded-lg p-2 text-xs text-center text-success font-medium">
            ✓ Connected to Apple Health
          </div>
        )}
      </div>
    </Card>
  );
}
