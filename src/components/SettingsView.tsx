import { useState, useEffect } from "react";
import { ChevronLeft, Save } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { activityStore, type UserProfile } from "@/lib/activityStore";
import { calculateMAF } from "@/lib/mafCalculator";
import { toast } from "sonner";

export function SettingsView({ onBack }: { onBack: () => void }) {
  const [profile, setProfile] = useState<UserProfile>({
    age: 30,
    fitnessLevel: 'intermediate',
    healthStatus: 'healthy',
    dailyStepGoal: 10000,
  });

  useEffect(() => {
    const saved = activityStore.getUserProfile();
    if (saved) {
      setProfile(saved);
    }
  }, []);

  const mafResult = calculateMAF(profile.age, profile.fitnessLevel, profile.healthStatus);

  const handleSave = () => {
    activityStore.saveUserProfile(profile);
    toast.success("Profile saved successfully!");
    onBack();
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
          <div className="space-y-3">
            <Button variant="outline" className="w-full justify-start" disabled>
              <span className="flex-1 text-left">Apple Watch</span>
              <span className="text-sm text-muted-foreground">Not Connected</span>
            </Button>
            <Button variant="outline" className="w-full justify-start" disabled>
              <span className="flex-1 text-left">Apple Health</span>
              <span className="text-sm text-muted-foreground">Not Connected</span>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            Device sync requires Capacitor setup with HealthKit integration. This enables real-time heart rate monitoring and step tracking from Apple Watch.
          </p>
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
