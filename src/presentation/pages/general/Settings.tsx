import React from 'react'; // Removed unused useState

// Import components from index files for better organization following clean architecture
import { useTheme } from '@/application/hooks/ui/useTheme'; // Corrected alias
import type { ThemeMode } from '@domain/types/theme'; // Changed from type-only import
// Remove unused imports
// import { DocumentTitle, Card, Button } from '@presentation/atoms';
// import { Header } from '@presentation/molecules';
// Correct Tabs import path
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Use correct path

/**
 * Settings page component
 *
 * This page allows users to configure application settings, preferences, and account details
 */
const Settings: React.FC = () => {
  const { theme, setTheme } = useTheme();
  // Remove unused state and handlers
  // const [isDirty, setIsDirty] = useState(false);
  // const [notificationSettings, setNotificationSettings] = useState({ ... });
  // const [dataPrivacySettings, setDataPrivacySettings] = useState({ ... });
  // const [visualizationSettings, setVisualizationSettings] = useState({ ... });
  // const handleThemeChange = (...) => { ... };
  // const handleNotificationChange = (...) => { ... };
  // const handleDataPrivacyChange = (...) => { ... };
  // const handleVisualizationChange = (...) => { ... };
  // const handleSaveSettings = () => { ... };

  // Simplified theme change for example content
  const exampleThemeChange = (value: string) => {
    setTheme(value as ThemeMode);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Tabs for different settings sections */}
      <Tabs defaultValue="appearance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="data">Data & Privacy</TabsTrigger>
        </TabsList>

        {/* Profile Settings Tab Example */}
        <TabsContent value="profile">
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-2">Profile Settings</h3>
            <p>User profile configuration options would go here (e.g., change password, name).</p>
            {/* Placeholder for actual form/components */}
          </div>
        </TabsContent>

        {/* Appearance Settings Tab Example */}
        <TabsContent value="appearance">
          <div className="p-4 border rounded-md space-y-4">
            <h3 className="text-lg font-medium">Appearance Settings</h3>
            <div>
              <label htmlFor="theme-select" className="block text-sm font-medium mb-1">
                Theme
              </label>
              <select
                id="theme-select"
                value={theme}
                onChange={(e) => exampleThemeChange(e.target.value)}
                className="w-full p-2 border rounded-md bg-background"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                {/* Add other theme options if available */}
              </select>
            </div>
            {/* Add other appearance settings here */}
          </div>
        </TabsContent>

        {/* Data Settings Tab Example */}
        <TabsContent value="data">
          <div className="p-4 border rounded-md">
            <h3 className="text-lg font-medium mb-2">Data & Privacy Settings</h3>
            <p>Data management, export, and privacy controls would go here.</p>
            {/* Placeholder for actual form/components */}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
