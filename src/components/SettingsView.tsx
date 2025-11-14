import { useState, useEffect } from "react";
import { ChevronLeft, Save, CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityStore, type UserProfile } from "@/lib/activityStore";
import { calculateMAF } from "@/lib/mafCalculator";
import { healthKitService } from "@/lib/healthKit";
import { toast } from "sonner";

export function SettingsView({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    fitnessLevel: 'intermediate',
    healthStatus: 'healthy',
    dailyStepGoal: 10000,
  });
  const [healthKitConnected, setHealthKitConnected] = useState(false);
  const [platform, setPlatform] = useState('web');

  useEffect(() => {
    const saved = activityStore.getUserProfile();
    if (saved) {
      setProfile(saved);
    }
    
    setPlatform(healthKitService.getPlatform());
    setHealthKitConnected(healthKitService.isHealthKitAvailable());
  }, []);

  const mafResult = calculateMAF(profile.age, profile.fitnessLevel, profile.healthStatus);

  const handleSave = () => {
    activityStore.saveUserProfile(profile);
    toast.success("Profile saved successfully!");
    onBack();
  };

  const handleConnectHealthKit = async () => {
    const authorized = await healthKitService.requestAuthorization();
    if (authorized) {
      setHealthKitConnected(true);
      toast.success("HealthKit connected successfully!");
    } else {
      toast.error("Failed to connect to HealthKit. Please check permissions in Settings.");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-6">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">Configure your profile</p>
          </div>
        </div>

        {/* Profile Settings */}
        <Card className="bg-gradient-card border-0 shadow-soft p-6">
          <h2 className="text-xl font-bold mb-6">Personal Information</h2>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                value={profile.age}
                onChange={(e) => setProfile({ ...profile, age: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={profile.weight || ''}
                onChange={(e) => setProfile({ ...profile, weight: parseFloat(e.target.value) || undefined })}
                className="mt-1"
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={profile.height || ''}
                onChange={(e) => setProfile({ ...profile, height: parseFloat(e.target.value) || undefined })}
                className="mt-1"
                placeholder="Optional"
              />
            </div>

            <div>
              <Label htmlFor="fitness">Fitness Level</Label>
              <Select
                value={profile.fitnessLevel}
                onValueChange={(value: any) => setProfile({ ...profile, fitnessLevel: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (MAF - 5)</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced (MAF + 5)</SelectItem>
                  <SelectItem value="recovering">Recovering (MAF - 10)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="health">Health Status</Label>
              <Select
                value={profile.healthStatus}
                onValueChange={(value: any) => setProfile({ ...profile, healthStatus: value })}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="healthy">Healthy</SelectItem>
                  <SelectItem value="recovering-injury">Recovering from Injury (MAF - 10)</SelectItem>
                  <SelectItem value="medication">On Medication (MAF - 10)</SelectItem>
                  <SelectItem value="recent-illness">Recent Illness (MAF - 5)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="stepGoal">Daily Step Goal</Label>
              <Input
                id="stepGoal"
                type="number"
                value={profile.dailyStepGoal}
                onChange={(e) => setProfile({ ...profile, dailyStepGoal: parseInt(e.target.value) || 0 })}
                className="mt-1"
              />
            </div>
          </div>
        </Card>

        {/* MAF Zone Preview */}
        <Card className="bg-gradient-card border-0 shadow-soft p-6">
          <h2 className="text-xl font-bold mb-4">Your MAF Zone</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Base MAF</p>
              <p className="text-2xl font-bold">{mafResult.baseMAF} bpm</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Adjusted MAF</p>
              <p className="text-2xl font-bold text-primary">{mafResult.adjustedMAF} bpm</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-muted-foreground">Training Zone</p>
              <p className="text-3xl font-bold text-success">{mafResult.zone}</p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Your MAF zone is calculated using the 180 Formula with adjustments based on your fitness level and health status.
          </p>
        </Card>

        {/* Device Connection */}
        <Card className="bg-gradient-card border-0 shadow-soft p-6">
          <h2 className="text-xl font-bold mb-4">Device Connections</h2>
          
          {platform === 'ios' ? (
            <div className="space-y-3">
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                healthKitConnected ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'
              }`}>
                <div className="flex items-center gap-3">
                  {healthKitConnected && <CheckCircle2 className="h-5 w-5 text-success" />}
                  <div>
                    <p className="font-medium">Apple Health</p>
                    <p className="text-sm text-muted-foreground">
                      {healthKitConnected ? 'Connected & Syncing' : 'Not Connected'}
                    </p>
                  </div>
                </div>
                {!healthKitConnected && (
                  <Button onClick={handleConnectHealthKit} size="sm">
                    Connect
                  </Button>
                )}
              </div>
              
              <div className={`flex items-center justify-between p-4 rounded-lg border ${
                healthKitConnected ? 'bg-success/10 border-success' : 'bg-muted/50 border-border'
              }`}>
                <div className="flex items-center gap-3">
                  {healthKitConnected && <CheckCircle2 className="h-5 w-5 text-success" />}
                  <div>
                    <p className="font-medium">Apple Watch</p>
                    <p className="text-sm text-muted-foreground">
                      {healthKitConnected ? 'Synced via Apple Health' : 'Not Connected'}
                    </p>
                  </div>
                </div>
              </div>

              {healthKitConnected && (
                <div className="bg-primary-light rounded-lg p-4">
                  <p className="text-sm font-medium mb-2">✓ HealthKit Features Enabled:</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time heart rate monitoring</li>
                    <li>• Automatic step counting</li>
                    <li>• Distance tracking</li>
                    <li>• Workout data sync</li>
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  HealthKit is only available on iOS devices
                </p>
                <p className="text-xs text-muted-foreground">
                  Current platform: {platform}
                </p>
              </div>
              <p className="text-sm text-muted-foreground">
                To use Apple Watch and HealthKit features, you need to:
              </p>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Export project to GitHub</li>
                <li>Build the app with Capacitor</li>
                <li>Run on a real iOS device</li>
              </ol>
            </div>
          )}
        </Card>

        {/* Save Button */}
        <Button 
          size="lg" 
          className="w-full bg-gradient-primary shadow-glow"
          onClick={handleSave}
        >
          <Save className="mr-2 h-5 w-5" />
          Save Settings
        </Button>
      </div>
    </div>
  );
}
