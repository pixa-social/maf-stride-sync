import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { activityStore, type DailyStats } from "@/lib/activityStore";
import { cn } from "@/lib/utils";

export function CalendarView({ onBack }: { onBack: () => void }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [monthStats, setMonthStats] = useState<DailyStats[]>([]);
  const [selectedDay, setSelectedDay] = useState<DailyStats | null>(null);

  useEffect(() => {
    const stats = activityStore.getMonthlyStats();
    setMonthStats(stats);
  }, []);

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentDate);

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getStatsForDay = (day: number): DailyStats | null => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return monthStats.find(s => s.date === dateStr) || null;
  };

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="min-h-screen bg-gradient-hero px-4 py-6 pb-safe">
      <div className="mx-auto max-w-5xl space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack} className="min-w-[44px]">
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Activity Calendar</h1>
            <p className="text-sm text-muted-foreground">Track your progress</p>
          </div>
        </div>

        {/* Calendar Card */}
        <Card className="bg-gradient-card border-0 shadow-soft p-4 md:p-6">
          {/* Month Navigation */}
          <div className="flex items-center justify-between mb-4">
            <Button variant="ghost" size="icon" onClick={previousMonth} className="min-w-[44px]">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <h2 className="text-lg md:text-xl font-bold">{monthName}</h2>
            <Button variant="ghost" size="icon" onClick={nextMonth} className="min-w-[44px]">
              <ChevronRight className="h-6 w-6" />
            </Button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
            {weekDays.map(day => (
              <div key={day} className="text-center text-xs md:text-sm font-medium text-muted-foreground py-2">
                {day.slice(0, 3)}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {Array.from({ length: startingDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {days.map(day => {
              const stats = getStatsForDay(day);
              const hasActivity = stats && stats.totalSteps > 0;
              const isToday = day === new Date().getDate() && 
                            month === new Date().getMonth() && 
                            year === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(stats)}
                  className={cn(
                    "aspect-square rounded-lg p-1 md:p-2 text-xs md:text-sm font-medium transition-all hover:scale-105 min-h-[44px]",
                    isToday && "ring-2 ring-primary",
                    hasActivity ? "bg-gradient-primary text-primary-foreground shadow-soft" : "bg-muted/50",
                    selectedDay?.date === stats?.date && "ring-2 ring-secondary"
                  )}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span>{day}</span>
                    {hasActivity && (
                      <Activity className="h-2.5 w-2.5 md:h-3 md:w-3 mt-0.5 md:mt-1" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="bg-gradient-card border-0 shadow-soft p-5 md:p-6">
            <h3 className="text-lg md:text-xl font-bold mb-4">
              {new Date(selectedDay.date).toLocaleDateString('default', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Steps</p>
                <p className="text-xl md:text-2xl font-bold text-primary">{selectedDay.totalSteps.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Distance</p>
                <p className="text-xl md:text-2xl font-bold text-secondary">{selectedDay.totalDistance.toFixed(2)} km</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">Duration</p>
                <p className="text-xl md:text-2xl font-bold">{selectedDay.totalDuration} min</p>
              </div>
              <div>
                <p className="text-xs md:text-sm text-muted-foreground">MAF Time</p>
                <p className="text-xl md:text-2xl font-bold text-success">{selectedDay.timeInMAFZone} min</p>
              </div>
            </div>
            {selectedDay.sessions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">Sessions ({selectedDay.sessions.length})</p>
                <div className="space-y-2">
                  {selectedDay.sessions.map(session => (
                    <div key={session.id} className="bg-muted/50 rounded-lg p-3 text-xs md:text-sm">
                      <div className="flex justify-between">
                        <span>{new Date(session.startTime).toLocaleTimeString()}</span>
                        <span className="font-medium">{session.duration} min</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}
