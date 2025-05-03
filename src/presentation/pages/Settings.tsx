import React, { useState } from 'react'; // Removed unused useEffect

// Import components from index files for better organization following clean architecture
import { useTheme } from '@hooks/useTheme'; // Correct hook path
import type { ThemeMode } from '@domain/types/theme'; // Changed from type-only import
import { DocumentTitle, Card, Button } from '@presentation/atoms';
import { Header } from '@presentation/molecules';
import { Tabs, TabsContent } from '@presentation/atoms/Tabs';

/**
 * Settings page component
 *
 * This page allows users to configure application settings, preferences, and account details
 */
const Settings: React.FC = () => {
  // Removed unused isDarkMode, toggleDarkMode
  const { theme, setTheme } = useTheme();
  // Add state to track if settings have changed
  const [isDirty, setIsDirty] = useState(false);
  // Removed unused selectedTheme state
  const [notificationSettings, setNotificationSettings] = useState({
    emailAlerts: true,
    smsAlerts: false,
    riskAlerts: true,
    treatmentAlerts: true,
    outcomeAlerts: true,
  });
  const [dataPrivacySettings, setDataPrivacySettings] = useState({
    anonymizeData: true,
    shareForResearch: false,
    dataRetentionPeriod: '1-year',
  });
  const [visualizationSettings, setVisualizationSettings] = useState({
    showConfidenceIntervals: true,
    defaultModelView: '3d',
    colorMode: 'clinical',
  });

  // Theme toggle handler
  const handleThemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const themeValue = e.target.value as ThemeMode; // Use ThemeMode type
    setTheme(themeValue);
    setIsDirty(true); // Mark as dirty
  };

  // Notification settings handler
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({
      ...prev,
      [name]: checked,
    }));
    setIsDirty(true); // Mark as dirty
  };

  // Data privacy settings handler
  const handleDataPrivacyChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setDataPrivacySettings((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setIsDirty(true); // Mark as dirty
  };

  // Visualization settings handler
  const handleVisualizationChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    setVisualizationSettings((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    setIsDirty(true); // Mark as dirty
  };

  // Save all settings
  const handleSaveSettings = () => {
    // In a real app, we would call the API to save user settings
    console.log('Saving settings...');
    console.log({
      theme,
      notificationSettings,
      dataPrivacySettings,
      visualizationSettings,
    });

    setIsDirty(false); // Reset dirty state after saving
    alert('Settings saved successfully!');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Settings</h1>

      {/* Tabs for different settings sections */}
      <Tabs defaultValue="profile" className="w-full">
        {/* ... TabsList ... */}

        {/* Profile Settings Tab */}
        <TabsContent value="profile">
          {/* ... Profile content ... */}
        </TabsContent>

        {/* Appearance Settings Tab */}
        <TabsContent value="appearance">
          {/* ... Appearance content ... */}
        </TabsContent>

        {/* Data Settings Tab */}
        <TabsContent value="data">
          {/* ... Data content ... */}
        </TabsContent>

        {/* Add more TabsContent for other settings sections */}

      </Tabs>
    </div>
  );
};

export default Settings;
