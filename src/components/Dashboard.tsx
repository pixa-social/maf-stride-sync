import { useEffect, useState } from "react";
import { Activity, Heart, Target, TrendingUp, Calendar, Settings } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { activityStore, type DailyStats } from "@/lib/activityStore";
import { calculateMAF } from "@/lib/mafCalculator";
import { StepCounter } from "./StepCounter";
import { HeartRateMonitor } from "./HeartRateMonitor";

type ViewType = 'dashboard' | 'calendar' | 'workout' | 'settings';

export function Dashboard({ onNavigate }: { onNavigate: (view: ViewType) => void }) {
  const [todayStats, setTodayStats] = useState<DailyStats | null>(null);
  const [userProfile, setUserProfile] = useState(activityStore.getUserProfile());
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    const stats = activityStore.getDailyStats(today);
    setTodayStats(stats);
    setStreak(activityStore.getCurrentStreak());
  }, []);

  const mafResult = userProfile ? calculateMAF(
    userProfile.age,
    userProfile.fitnessLevel,
    userProfile.healthStatus
  ) : null;

  const stepProgress = userProfile 
    ? ((todayStats?.totalSteps || 0) / userProfile.dailyStepGoal) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-6 pb-safe">
      <div className="mx-auto max-w-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">MAF Walking</h1>
            <p className="text-sm text-muted-foreground">Train smarter, walk better</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => onNavigate('settings')}
            className="hover:bg-primary-light min-w-[44px]"
          >
            <Settings className="h-6 w-6" />
          </Button>
        </div>

        {/* MAF Zone Card */}
        {mafResult && (
          <Card className="bg-gradient-card border-0 shadow-soft p-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="rounded-xl bg-gradient-primary p-2.5">
                <Target className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-base font-semibold">Your MAF Zone</h2>
                <p className="text-xs text-muted-foreground">Maximum Aerobic Function</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Target Range</p>
                <p className="text-xl font-bold text-primary">{mafResult.zone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Time Today</p>
                <p className="text-xl font-bold text-secondary">
                  {todayStats?.timeInMAFZone || 0} min
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Streak</p>
                <p className="text-xl font-bold text-accent">
                  {streak} {streak === 1 ? 'day' : 'days'}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-3">
          {/* Steps */}
          <Card className="bg-gradient-card border-0 shadow-soft p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-xl bg-primary-light p-2">
                <Activity className="h-4 w-4 text-primary" />
              </div>
              <h3 className="font-semibold text-sm">Steps Today</h3>
            </div>
            <p className="text-3xl font-bold mb-2">{todayStats?.totalSteps.toLocaleString() || 0}</p>
            <div className="w-full bg-muted rounded-full h-2.5">
              <div 
                className="bg-gradient-primary h-2.5 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(stepProgress, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Goal: {userProfile?.dailyStepGoal.toLocaleString() || 10000}
            </p>
          </Card>

          {/* Distance */}
          <Card className="bg-gradient-card border-0 shadow-soft p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-xl bg-secondary-light p-2">
                <TrendingUp className="h-4 w-4 text-secondary" />
              </div>
              <h3 className="font-semibold text-sm">Distance</h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {(todayStats?.totalDistance || 0).toFixed(2)} km
            </p>
            <p className="text-xs text-muted-foreground">
              {todayStats?.sessions.length || 0} sessions
            </p>
          </Card>

          {/* Avg Heart Rate */}
          <Card className="bg-gradient-card border-0 shadow-soft p-5">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="rounded-xl bg-destructive/10 p-2">
                <Heart className="h-4 w-4 text-destructive" />
              </div>
              <h3 className="font-semibold text-sm">Avg Heart Rate</h3>
            </div>
            <p className="text-3xl font-bold mb-2">
              {todayStats?.avgHeartRate?.toFixed(0) || '--'} bpm
            </p>
            <p className="text-xs text-muted-foreground">Resting rate</p>
          </Card>
        </div>

        {/* Live Monitoring */}
        <div className="grid grid-cols-1 gap-3">
          <StepCounter />
          <HeartRateMonitor mafResult={mafResult} />
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            size="lg" 
            className="bg-gradient-primary shadow-glow hover:shadow-soft h-14"
            onClick={() => onNavigate('workout')}
          >
            <Activity className="mr-2 h-5 w-5" />
            Start Workout
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            className="h-14"
            onClick={() => onNavigate('calendar')}
          >
            <Calendar className="mr-2 h-5 w-5" />
            View Calendar
          </Button>
        </div>
      </div>
    </div>
  );
}
