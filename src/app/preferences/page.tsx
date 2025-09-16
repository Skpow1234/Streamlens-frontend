'use client';

import { useState } from 'react';
import { usePreferences } from '@/context/PreferencesContext';
import { useTheme } from '@/context/ThemeContext';
import PageContainer from '@/components/PageContainer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Settings, Palette, Bell, Layout, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';

export default function PreferencesPage(): JSX.Element {
  const { preferences, updatePreferences, resetToDefaults } = usePreferences();
  const { theme, setTheme } = useTheme();

  const [localPrefs, setLocalPrefs] = useState(preferences);

  const handleSave = () => {
    updatePreferences(localPrefs);
    // Update theme separately since it's managed by ThemeContext
    setTheme(localPrefs.theme);
    toast.success('Preferences saved successfully!');
  };

  const handleReset = () => {
    resetToDefaults();
    setLocalPrefs({
      theme: 'system',
      itemsPerPage: 10,
      defaultTimeRange: 30,
      notifications: {
        enabled: true,
        sessionWarnings: true,
        exportCompletion: true,
        errorRecovery: true,
        systemStatus: true,
        progressIndicators: true,
      },
      dashboard: {
        showDailyStats: true,
        showRecentActivity: true,
        showMostWatched: true,
      },
      autoHideDelay: 5000,
    });
    setTheme('system');
    toast.success('Preferences reset to defaults!');
  };

  const updateLocalPrefs = (updates: Partial<typeof localPrefs>) => {
    setLocalPrefs(prev => ({ ...prev, ...updates }));
  };

  const updateNestedPrefs = (section: keyof typeof localPrefs, updates: any) => {
    setLocalPrefs(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
  };

  return (
    <PageContainer title="Preferences" subtitle="Customize your Streamlens experience">
      <div className="max-w-4xl space-y-6">
        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Appearance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="theme-select" className="text-base font-medium">Theme</Label>
                <p className="text-sm text-muted-foreground">Choose your preferred color scheme</p>
              </div>
              <Select
                value={localPrefs.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => updateLocalPrefs({ theme: value })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Data Display Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Data Display
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="items-per-page" className="text-base font-medium">Items per page</Label>
                <p className="text-sm text-muted-foreground">Number of items to show per page in tables</p>
              </div>
              <Select
                value={localPrefs.itemsPerPage.toString()}
                onValueChange={(value) => updateLocalPrefs({ itemsPerPage: parseInt(value) })}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="default-time-range" className="text-base font-medium">Default time range</Label>
                <p className="text-sm text-muted-foreground">Default time period for analytics (in days)</p>
              </div>
              <Select
                value={localPrefs.defaultTimeRange.toString()}
                onValueChange={(value) => updateLocalPrefs({ defaultTimeRange: parseInt(value) })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                  <SelectItem value="90">90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Dashboard Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show daily statistics</Label>
                <p className="text-sm text-muted-foreground">Display daily watch time breakdown</p>
              </div>
              <Switch
                checked={localPrefs.dashboard.showDailyStats}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('dashboard', { showDailyStats: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show recent activity</Label>
                <p className="text-sm text-muted-foreground">Display your recent video watching activity</p>
              </div>
              <Switch
                checked={localPrefs.dashboard.showRecentActivity}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('dashboard', { showRecentActivity: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Show most watched videos</Label>
                <p className="text-sm text-muted-foreground">Display your most frequently watched videos</p>
              </div>
              <Switch
                checked={localPrefs.dashboard.showMostWatched}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('dashboard', { showMostWatched: checked })
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Enable notifications</Label>
                <p className="text-sm text-muted-foreground">Master switch for all notifications</p>
              </div>
              <Switch
                checked={localPrefs.notifications.enabled}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { enabled: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Session warnings</Label>
                <p className="text-sm text-muted-foreground">Warn before your session expires</p>
              </div>
              <Switch
                checked={localPrefs.notifications.sessionWarnings}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { sessionWarnings: checked })
                }
                disabled={!localPrefs.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Export completion</Label>
                <p className="text-sm text-muted-foreground">Notify when data exports are ready</p>
              </div>
              <Switch
                checked={localPrefs.notifications.exportCompletion}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { exportCompletion: checked })
                }
                disabled={!localPrefs.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Error recovery</Label>
                <p className="text-sm text-muted-foreground">Show helpful error recovery messages</p>
              </div>
              <Switch
                checked={localPrefs.notifications.errorRecovery}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { errorRecovery: checked })
                }
                disabled={!localPrefs.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">System status</Label>
                <p className="text-sm text-muted-foreground">Show system status and info messages</p>
              </div>
              <Switch
                checked={localPrefs.notifications.systemStatus}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { systemStatus: checked })
                }
                disabled={!localPrefs.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Progress indicators</Label>
                <p className="text-sm text-muted-foreground">Show progress bars for long operations</p>
              </div>
              <Switch
                checked={localPrefs.notifications.progressIndicators}
                onCheckedChange={(checked) =>
                  updateNestedPrefs('notifications', { progressIndicators: checked })
                }
                disabled={!localPrefs.notifications.enabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-medium">Auto-hide delay</Label>
                <p className="text-sm text-muted-foreground">How long notifications stay visible</p>
              </div>
              <Select
                value={localPrefs.autoHideDelay?.toString()}
                onValueChange={(value) =>
                  setLocalPrefs(prev => ({ ...prev, autoHideDelay: parseInt(value) }))
                }
                disabled={!localPrefs.notifications.enabled}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3000">3 seconds</SelectItem>
                  <SelectItem value="5000">5 seconds</SelectItem>
                  <SelectItem value="8000">8 seconds</SelectItem>
                  <SelectItem value="10000">10 seconds</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reset to Defaults
          </Button>

          <Button
            onClick={handleSave}
            className="flex items-center gap-2"
          >
            <Settings className="h-4 w-4" />
            Save Preferences
          </Button>
        </div>
      </div>
    </PageContainer>
  );
}
