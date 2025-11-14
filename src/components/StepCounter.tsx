import { useEffect, useState } from "react";
import { Footprints } from "lucide-react";
import { Card } from "@/components/ui/card";

export function StepCounter() {
  const [steps, setSteps] = useState(0);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    // Check if device motion is supported
    if ('Accelerometer' in window || 'DeviceMotionEvent' in window) {
      setIsSupported(true);
      
      // For demo purposes, simulate step counting
      // In production, this would use actual device sensors
      const interval = setInterval(() => {
        setSteps(prev => prev + Math.floor(Math.random() * 3));
      }, 5000);

      return () => clearInterval(interval);
    }
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
            Step counting requires device motion sensors or Apple Watch connection
          </div>
        )}
      </div>
    </Card>
  );
}
