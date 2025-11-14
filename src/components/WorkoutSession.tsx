import { useState, useEffect } from "react";
import { Play, Pause, Square, Heart, Footprints } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { activityStore, type ActivitySession } from "@/lib/activityStore";
import { calculateMAF, getHeartRateZone } from "@/lib/mafCalculator";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export function WorkoutSession({ onBack }: { onBack: () => void }) {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [steps, setSteps] = useState(0);
  const [heartRate, setHeartRate] = useState<number | null>(null);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [timeInMAF, setTimeInMAF] = useState(0);

  const userProfile = activityStore.getUserProfile();
  const mafResult = userProfile ? calculateMAF(
    userProfile.age,
    userProfile.fitnessLevel,
    userProfile.healthStatus
  ) : null;

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setDuration(prev => prev + 1);
        
        // Simulate step counting
        if (Math.random() > 0.7) {
          setSteps(prev => prev + 1);
        }
        
        // Simulate heart rate
        const simulatedHR = 70 + Math.floor(Math.random() * 50);
        setHeartRate(simulatedHR);
        
        // Track time in MAF zone
        if (mafResult && simulatedHR >= mafResult.minHeartRate && simulatedHR <= mafResult.maxHeartRate) {
          setTimeInMAF(prev => prev + 1);
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isActive, isPaused, mafResult]);

  const startWorkout = () => {
    setIsActive(true);
    setIsPaused(false);
    setStartTime(Date.now());
    toast.success("Workout started!");
  };

  const pauseWorkout = () => {
    setIsPaused(!isPaused);
    toast.info(isPaused ? "Workout resumed" : "Workout paused");
  };

  const stopWorkout = () => {
    if (!startTime) return;

    const session: ActivitySession = {
      id: `${Date.now()}`,
      date: new Date().toISOString(),
      startTime,
      endTime: Date.now(),
      duration: Math.floor(duration / 60),
      steps,
      distance: steps * 0.000762, // Average step length in km
      avgHeartRate: heartRate || undefined,
      timeInMAFZone: Math.floor(timeInMAF / 60),
    };

    activityStore.saveActivity(session);
    toast.success("Workout saved!");
    
    // Reset
    setIsActive(false);
    setDuration(0);
    setSteps(0);
    setHeartRate(null);
    setTimeInMAF(0);
    setStartTime(null);
    
    onBack();
  };

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const zone = heartRate && mafResult ? getHeartRateZone(heartRate, mafResult) : null;
  const getZoneColor = () => {
    if (!zone) return "text-muted-foreground";
    switch (zone.zone) {
      case 'below': return "text-primary";
      case 'maf': return "text-success";
      case 'above': return "text-warning";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Timer Display */}
        <Card className="bg-gradient-card border-0 shadow-soft p-8">
          <div className="text-center mb-8">
            <h2 className="text-6xl font-bold mb-2">{formatTime(duration)}</h2>
            <p className="text-muted-foreground">
              {!isActive ? "Ready to start" : isPaused ? "Paused" : "Workout in progress"}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-primary-light rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Footprints className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">Steps</span>
              </div>
              <p className="text-3xl font-bold text-primary">{steps.toLocaleString()}</p>
            </div>

            <div className="bg-destructive/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Heart className={cn(
                  "h-4 w-4 text-destructive",
                  isActive && !isPaused && "animate-pulse"
                )} />
                <span className="text-sm text-muted-foreground">Heart Rate</span>
              </div>
              <p className={cn("text-3xl font-bold", getZoneColor())}>
                {heartRate || '--'} {heartRate && 'bpm'}
              </p>
            </div>

            <div className="bg-secondary-light rounded-xl p-4">
              <span className="text-sm text-muted-foreground">Distance</span>
              <p className="text-2xl font-bold text-secondary mt-1">
                {(steps * 0.000762).toFixed(2)} km
              </p>
            </div>

            <div className="bg-success/10 rounded-xl p-4">
              <span className="text-sm text-muted-foreground">MAF Time</span>
              <p className="text-2xl font-bold text-success mt-1">
                {Math.floor(timeInMAF / 60)} min
              </p>
            </div>
          </div>

          {/* MAF Zone Indicator */}
          {mafResult && heartRate && (
            <div className="bg-muted/50 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium mb-2">MAF Zone Status</p>
              <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
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
              <div className="flex justify-between text-xs font-medium mt-2">
                <span>Below</span>
                <span className="text-success">MAF: {mafResult.minHeartRate}-{mafResult.maxHeartRate}</span>
                <span>Above</span>
              </div>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex gap-3">
            {!isActive ? (
              <Button 
                size="lg" 
                className="flex-1 bg-gradient-primary shadow-glow"
                onClick={startWorkout}
              >
                <Play className="mr-2 h-5 w-5" />
                Start Workout
              </Button>
            ) : (
              <>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="flex-1"
                  onClick={pauseWorkout}
                >
                  {isPaused ? <Play className="mr-2 h-5 w-5" /> : <Pause className="mr-2 h-5 w-5" />}
                  {isPaused ? 'Resume' : 'Pause'}
                </Button>
                <Button 
                  size="lg" 
                  variant="destructive"
                  className="flex-1"
                  onClick={stopWorkout}
                >
                  <Square className="mr-2 h-5 w-5" />
                  Stop & Save
                </Button>
              </>
            )}
          </div>
        </Card>

        {!isActive && (
          <Button variant="ghost" className="w-full" onClick={onBack}>
            Back to Dashboard
          </Button>
        )}
      </div>
    </div>
  );
}
