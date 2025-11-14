// Local storage utilities for activity data

export interface ActivitySession {
  id: string;
  date: string; // ISO date string
  startTime: number; // timestamp
  endTime?: number; // timestamp
  duration: number; // minutes
  steps: number;
  distance: number; // kilometers
  avgHeartRate?: number;
  maxHeartRate?: number;
  timeInMAFZone: number; // minutes
  calories?: number;
}

export interface DailyStats {
  date: string; // YYYY-MM-DD
  totalSteps: number;
  totalDistance: number;
  totalDuration: number;
  sessions: ActivitySession[];
  avgHeartRate?: number;
  timeInMAFZone: number;
}

const ACTIVITIES_KEY = 'maf_activities';
const DAILY_STATS_KEY = 'maf_daily_stats';
const USER_PROFILE_KEY = 'maf_user_profile';

export interface UserProfile {
  age: number;
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced' | 'recovering';
  healthStatus: 'healthy' | 'recovering-injury' | 'medication' | 'recent-illness';
  weight?: number; // kg
  height?: number; // cm
  dailyStepGoal: number;
}

export const activityStore = {
  // User Profile
  saveUserProfile(profile: UserProfile) {
    localStorage.setItem(USER_PROFILE_KEY, JSON.stringify(profile));
  },

  getUserProfile(): UserProfile | null {
    const data = localStorage.getItem(USER_PROFILE_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Activity Sessions
  saveActivity(activity: ActivitySession) {
    const activities = this.getAllActivities();
    activities.push(activity);
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(activities));
    
    // Update daily stats
    this.updateDailyStats(activity);
  },

  getAllActivities(): ActivitySession[] {
    const data = localStorage.getItem(ACTIVITIES_KEY);
    return data ? JSON.parse(data) : [];
  },

  getActivitiesByDateRange(startDate: string, endDate: string): ActivitySession[] {
    const activities = this.getAllActivities();
    return activities.filter(a => a.date >= startDate && a.date <= endDate);
  },

  // Daily Stats
  updateDailyStats(activity: ActivitySession) {
    const stats = this.getAllDailyStats();
    const dateKey = activity.date.split('T')[0]; // Get YYYY-MM-DD
    
    let dayStats = stats.find(s => s.date === dateKey);
    if (!dayStats) {
      dayStats = {
        date: dateKey,
        totalSteps: 0,
        totalDistance: 0,
        totalDuration: 0,
        sessions: [],
        timeInMAFZone: 0,
      };
      stats.push(dayStats);
    }
    
    dayStats.sessions.push(activity);
    dayStats.totalSteps += activity.steps;
    dayStats.totalDistance += activity.distance;
    dayStats.totalDuration += activity.duration;
    dayStats.timeInMAFZone += activity.timeInMAFZone;
    
    // Calculate average heart rate
    const sessionsWithHR = dayStats.sessions.filter(s => s.avgHeartRate);
    if (sessionsWithHR.length > 0) {
      dayStats.avgHeartRate = sessionsWithHR.reduce((sum, s) => sum + (s.avgHeartRate || 0), 0) / sessionsWithHR.length;
    }
    
    localStorage.setItem(DAILY_STATS_KEY, JSON.stringify(stats));
  },

  getAllDailyStats(): DailyStats[] {
    const data = localStorage.getItem(DAILY_STATS_KEY);
    return data ? JSON.parse(data) : [];
  },

  getDailyStats(date: string): DailyStats | null {
    const stats = this.getAllDailyStats();
    return stats.find(s => s.date === date) || null;
  },

  getWeeklyStats(): DailyStats[] {
    const stats = this.getAllDailyStats();
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekAgoStr = weekAgo.toISOString().split('T')[0];
    
    return stats.filter(s => s.date >= weekAgoStr).sort((a, b) => a.date.localeCompare(b.date));
  },

  getMonthlyStats(): DailyStats[] {
    const stats = this.getAllDailyStats();
    const monthAgo = new Date();
    monthAgo.setDate(monthAgo.getDate() - 30);
    const monthAgoStr = monthAgo.toISOString().split('T')[0];
    
    return stats.filter(s => s.date >= monthAgoStr).sort((a, b) => a.date.localeCompare(b.date));
  },

  // Clear data
  clearAllData() {
    localStorage.removeItem(ACTIVITIES_KEY);
    localStorage.removeItem(DAILY_STATS_KEY);
  }
};
