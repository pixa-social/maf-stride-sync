import { useState, useEffect } from "react";
import { Dashboard } from "@/components/Dashboard";
import { CalendarView } from "@/components/CalendarView";
import { WorkoutSession } from "@/components/WorkoutSession";
import { SettingsView } from "@/components/SettingsView";
import { activityStore } from "@/lib/activityStore";

type View = 'dashboard' | 'calendar' | 'workout' | 'settings';

const Index = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    // Initialize default user profile if none exists
    const profile = activityStore.getUserProfile();
    if (!profile) {
      activityStore.saveUserProfile({
        age: 30,
        fitnessLevel: 'intermediate',
        healthStatus: 'healthy',
        dailyStepGoal: 10000,
      });
    }
  }, []);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} />;
      case 'calendar':
        return <CalendarView onBack={() => setCurrentView('dashboard')} />;
      case 'workout':
        return <WorkoutSession onBack={() => setCurrentView('dashboard')} />;
      case 'settings':
        return <SettingsView onBack={() => setCurrentView('dashboard')} />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return renderView();
};

export default Index;
