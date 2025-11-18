import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { Input } from '../ui/Input';
import { useTheme } from '../../hooks/useTheme';
import settingsService from '../../services/settingsService';
import { useToastContext } from '../../contexts/ToastContext';

export const SettingsPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('Africa/Cairo');
  const [language, setLanguage] = useState('en');
  const [pipeline, setPipeline] = useState('standard');
  const [notifications, setNotifications] = useState({
    leadAlerts: true,
    ticketUpdates: false,
    dailyDigest: true,
    taskReminders: true
  });
  const [compactMode, setCompactMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { success: showSuccess, error: showError } = useToastContext();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        const data = await settingsService.getWorkspaceSettings();
        setCurrency(data.defaultCurrency);
        setTimezone(data.defaultTimezone);
        setLanguage(data.defaultLanguage);
        setPipeline(data.pipelineMode);
        setNotifications({
          leadAlerts: data.leadAlerts,
          ticketUpdates: data.ticketUpdates,
          dailyDigest: data.dailyDigest,
          taskReminders: data.taskReminders
        });
        setCompactMode(data.compactMode);
        setHighContrast(data.highContrast);
      } catch (error: any) {
        console.error('Failed to load workspace settings', error);
        showError('Failed to load settings', error.response?.data?.message || error.message);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await settingsService.updateWorkspaceSettings({
        defaultCurrency: currency,
        defaultTimezone: timezone,
        defaultLanguage: language,
        pipelineMode: pipeline as 'standard' | 'enterprise' | 'custom',
        leadAlerts: notifications.leadAlerts,
        ticketUpdates: notifications.ticketUpdates,
        dailyDigest: notifications.dailyDigest,
        taskReminders: notifications.taskReminders,
        compactMode,
        highContrast,
        theme
      });
      showSuccess('Workspace settings updated');
    } catch (error: any) {
      console.error('Failed to update workspace settings', error);
      showError('Failed to update settings', error.response?.data?.message || error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="border border-gray-200 dark:border-gray-700">
        <CardContent className="py-12 text-center text-gray-500 dark:text-gray-400">
          Loading workspace settings...
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workspace Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configure CRM defaults, collaboration preferences, and appearance.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Regional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              label="Default Currency"
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EGP">Egyptian Pound (EGP)</option>
              <option value="EUR">Euro (EUR)</option>
            </Select>

            <Select
              label="Timezone"
              value={timezone}
              onChange={(event) => setTimezone(event.target.value)}
            >
              <option value="Africa/Cairo">(UTC +02:00) Cairo</option>
              <option value="Asia/Dubai">(UTC +04:00) Dubai</option>
              <option value="Europe/London">(UTC) London</option>
            </Select>

            <Select
              label="Language"
              value={language}
              onChange={(event) => setLanguage(event.target.value)}
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
            </Select>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Deals Pipeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">Default Pipeline</p>
              <div className="space-y-2">
                {[
                  { label: 'Standard (5 stages)', value: 'standard' },
                  { label: 'Enterprise (8 stages)', value: 'enterprise' },
                  { label: 'Custom', value: 'custom' }
                ].map((option) => (
                  <label
                    key={option.value}
                    className="flex cursor-pointer items-center gap-2 text-sm text-gray-600 dark:text-gray-300"
                  >
                    <input
                      type="radio"
                      name="pipeline"
                      value={option.value}
                      checked={pipeline === option.value}
                      onChange={(event) => setPipeline(event.target.value)}
                      className="h-4 w-4"
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </div>

            {pipeline === 'custom' && (
              <Input label="Pipeline Name" placeholder="Luxury Travel Enterprise" />
            )}

            <Button variant="outline">Manage Stages</Button>
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { key: 'leadAlerts', label: 'Email alerts for new leads' },
              { key: 'ticketUpdates', label: 'Slack updates for support tickets' },
              { key: 'dailyDigest', label: 'Daily activity digest' },
              { key: 'taskReminders', label: 'Task reminders' }
            ].map((item) => (
              <label
                key={item.key}
                className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300"
              >
                {item.label}
                <input
                  type="checkbox"
                  checked={notifications[item.key as keyof typeof notifications]}
                  onChange={() =>
                    setNotifications((prev) => ({
                      ...prev,
                      [item.key]: !prev[item.key as keyof typeof notifications]
                    }))
                  }
                  className="h-4 w-4 accent-blue-600"
                />
              </label>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-gray-200 dark:border-gray-700">
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4 dark:border-gray-700">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Toggle between light and dark interfaces.
                </p>
              </div>
              <Button onClick={toggleTheme} variant="outline">
                Switch to {theme === 'light' ? 'dark' : 'light'}
              </Button>
            </div>

            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
              Compact mode
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={compactMode}
                onChange={(event) => setCompactMode(event.target.checked)}
              />
            </label>
            <label className="flex cursor-pointer items-center justify-between rounded-lg border border-gray-200 px-4 py-3 text-sm text-gray-600 dark:border-gray-700 dark:text-gray-300">
              High contrast mode
              <input
                type="checkbox"
                className="h-4 w-4 accent-blue-600"
                checked={highContrast}
                onChange={(event) => setHighContrast(event.target.checked)}
              />
            </label>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

