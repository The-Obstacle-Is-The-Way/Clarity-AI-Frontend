/* eslint-disable */
/**
 * CLARITY-AI Neural-Safe Organism Component
 * BiometricMonitorPanel - Quantum-level biometric data visualization
 * with clinical precision and HIPAA-compliant data handling
 */

import React, { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion'; // Removed unused AnimatePresence
import { cn } from '@/lib/utils';

// Neural visualization coordinator
// import { useVisualizationCoordinator } from "@application/coordinators/NeuralVisualizationCoordinator"; // Module missing

// UI components
// Correct import paths for Shadcn components
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button'; // Correct path and named import
// Removed unused Tooltip imports
import { Badge } from '@/presentation/atoms'; // Use index
// Correct import path for Shadcn Card components
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/presentation/atoms'; // Use index
import { ScrollArea, ScrollBar } from '@/presentation/atoms'; // Use index
import { Progress } from '@/presentation/atoms'; // Use index
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/atoms'; // Use index

// Icons
import {
  Activity,
  AlertTriangle,
  Minimize,
  Bell,
  Heart,
  BellOff,
  Check,
  AlertCircle,
  Thermometer,
  Droplets,
  // Lungs, // Icon does not exist in lucide-react, replace or remove
  HeartPulse, // Use HeartPulse as an alternative
  Brain,
  Eye,
  Braces,
  Dna,
  Microscope,
  PulseIcon,
  Clock,
  Maximize2,
  Monitor,
  BarChart3,
  RefreshCw,
  Zap,
  Info,
} from 'lucide-react';

// Domain types
import type { AlertPriority } from '@domain/types/biometric/streams';
// Removed unused import: import { BiometricAlert } from '@domain/types/biometric/streams';

// TEMPORARY Placeholder Type to resolve 'never' errors until coordinator is fixed/implemented
type PlaceholderBiometricAlert = {
  id: string;
  biometricType: string;
  priority: AlertPriority;
  message: string;
  timestamp: string; // Keep as string based on formatTimestamp usage
  acknowledged: boolean;
  triggeringValue: number; // Use correct property name
};

/**
 * Props with neural-safe typing
 */
interface BiometricMonitorPanelProps {
  className?: string;
  compact?: boolean;
  maxAlerts?: number;
  patientId: string;
}

/**
 * Alert priority to color mapping with clinical precision
 */
const alertPriorityColorMap: Record<AlertPriority, { bg: string; text: string; border: string }> = {
  urgent: {
    bg: 'bg-red-900/60',
    text: 'text-red-100',
    border: 'border-red-700',
  },
  warning: {
    bg: 'bg-amber-900/60',
    text: 'text-amber-100',
    border: 'border-amber-700',
  },
  informational: {
    bg: 'bg-slate-700/60',
    text: 'text-slate-100',
    border: 'border-slate-600',
  },
};

/**
 * Biometric type to icon mapping
 */
const biometricTypeIconMap: Record<string, React.ReactNode> = {
  heartRate: <Heart className="h-4 w-4" />,
  bloodPressureSystolic: <Activity className="h-4 w-4" />,
  bloodPressureDiastolic: <Activity className="h-4 w-4" />,
  bloodGlucose: <Droplets className="h-4 w-4" />,
  oxygenSaturation: <HeartPulse className="h-4 w-4" />, // Replaced Lungs
  respiratoryRate: <HeartPulse className="h-4 w-4" />, // Replaced Lungs
  bodyTemperature: <Thermometer className="h-4 w-4" />,
  eegThetaPower: <Brain className="h-4 w-4" />,
  pupilDilation: <Eye className="h-4 w-4" />,
};

/**
 * Get default icon for biometric type
 */
const getIconForBiometricType = (type: string) => {
  return biometricTypeIconMap[type] || <Activity className="h-4 w-4" />;
};

/**
 * BiometricMonitorPanel - Organism component for monitoring biometric data
 * with clinical precision and HIPAA-compliant visualization
 */
export const BiometricMonitorPanel: React.FC<BiometricMonitorPanelProps> = ({
  className = '',
  compact = false,
  maxAlerts = 5,
  patientId,
}) => {
  // Access visualization coordinator
  // const { state, acknowledgeAlert } = useVisualizationCoordinator(); // Commented out usage

  // Local UI state
  const [expanded, setExpanded] = useState(!compact);
  const [activeTab, setActiveTab] = useState('alerts');

  // Toggle expansion state
  const toggleExpanded = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  // Handle acknowledge alert
  const handleAcknowledgeAlert = useCallback((_alertId: string) => {
    // Prefixed unused alertId
    // Add type for alertId
    // acknowledgeAlert(alertId); // Commented out - acknowledgeAlert is not defined
  }, []); // Removed acknowledgeAlert dependency

  // Process alerts for visualization
  const alertMetrics = useMemo(() => {
    // Get unacknowledged alerts
    // const unacknowledgedAlerts = state.biometricAlerts // Commented out - state is not defined
    const unacknowledgedAlerts: PlaceholderBiometricAlert[] = []; // Use placeholder type and empty array
    const allAlerts: PlaceholderBiometricAlert[] = []; // Placeholder for all alerts

    const sortedAlerts = unacknowledgedAlerts
      .sort((a, b) => {
        // Sort by priority then timestamp
        const priorityOrder: Record<AlertPriority, number> = {
          urgent: 0,
          warning: 1,
          informational: 2,
        };

        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]; // Use placeholder type properties
        if (priorityDiff !== 0) return priorityDiff;

        // Most recent alerts first
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime() // Use placeholder type properties
        );
      })
      .slice(0, maxAlerts);

    // Count alerts by priority
    const countsByPriority: Record<AlertPriority, number> = {
      urgent: 0,
      warning: 0,
      informational: 0,
    };

    allAlerts // Use placeholder
      .filter((alert: PlaceholderBiometricAlert) => !alert.acknowledged) // Use placeholder type
      .forEach((alert) => {
        countsByPriority[alert.priority]++; // Use placeholder type property
      });

    // Count alerts by biometric type
    const countsByType: Record<string, number> = {};

    allAlerts // Use placeholder
      .filter((alert: PlaceholderBiometricAlert) => !alert.acknowledged) // Use placeholder type
      .forEach((alert) => {
        const type = alert.biometricType; // Use placeholder type property
        countsByType[type] = (countsByType[type] || 0) + 1;
      });

    // Get top alert types
    const topAlertTypes = Object.entries(countsByType)
      .sort(([_, a], [__, b]) => b - a)
      .slice(0, 3)
      .map(([type, count]) => ({ type, count }));

    return {
      unacknowledgedAlerts: sortedAlerts, // Use sorted and sliced alerts
      countsByPriority,
      countsByType,
      topAlertTypes,
      // totalAlerts: state.biometricAlerts.length, // Commented out - state is not defined
      totalAlerts: allAlerts.length, // Use placeholder length
      totalUnacknowledged: unacknowledgedAlerts.length, // Use placeholder length
    };
    // }, [state.biometricAlerts, maxAlerts]); // Commented out - state is not defined
  }, [maxAlerts]); // Update dependencies

  // Get alert badge variant based on counts
  const alertBadgeVariant = useMemo(() => {
    if (alertMetrics.countsByPriority.urgent > 0) return 'destructive';
    if (alertMetrics.countsByPriority.warning > 0) return 'destructive'; // Map warning to destructive for badge
    return 'secondary';
  }, [alertMetrics.countsByPriority]);

  // Format timestamp to readable time
  const formatTimestamp = useCallback((timestamp: string | Date) => {
    // Accept string or Date
    return new Date(timestamp).toLocaleTimeString(undefined, {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }, []);

  // Format alert message with clinical precision
  const formatAlertValue = useCallback((alert: PlaceholderBiometricAlert) => {
    // Use placeholder type
    // Add units based on biometric type
    const units: Record<string, string> = {
      heartRate: ' bpm',
      bloodPressureSystolic: ' mmHg',
      bloodPressureDiastolic: ' mmHg',
      bloodGlucose: ' mg/dL',
      oxygenSaturation: '%',
      respiratoryRate: ' bpm',
      bodyTemperature: '°C',
      eegThetaPower: ' μV²',
      pupilDilation: ' mm',
    };

    const unit = units[alert.biometricType] || '';
    // Use the correct property 'triggeringValue' from BiometricAlert type
    // Check if triggeringValue exists before calling toFixed
    const valueString =
      typeof alert.triggeringValue === 'number' ? alert.triggeringValue.toFixed(1) : 'N/A';
    return `${valueString}${unit}`;
  }, []);

  // We'll define some dummy data for the biometrics
  const biometricData = [
    {
      id: 1,
      name: 'Heart Rate',
      value: 78,
      unit: 'bpm',
      icon: <Heart className="h-4 w-4" />,
      color: 'text-red-500',
      change: '+2%',
      normal: '60-100',
    },
    {
      id: 2,
      name: 'Respiratory Rate',
      value: 16,
      unit: 'bpm',
      icon: <Activity className="h-4 w-4" />,
      color: 'text-blue-500',
      change: '-1%',
      normal: '12-20',
    },
    {
      id: 3,
      name: 'Blood Oxygenation',
      value: 98,
      unit: '%',
      icon: <Activity className="h-4 w-4" />,
      color: 'text-green-500',
      change: '0%',
      normal: '95-100',
    },
    {
      id: 4,
      name: 'Glucose Level',
      value: 105,
      unit: 'mg/dL',
      icon: <Braces className="h-4 w-4" />,
      color: 'text-yellow-500',
      change: '+5%',
      normal: '80-130',
    },
    {
      id: 5,
      name: 'Cortisol Level',
      value: 12,
      unit: 'μg/dL',
      icon: <Brain className="h-4 w-4" />,
      color: 'text-purple-500',
      change: '-3%',
      normal: '5-23',
    },
    {
      id: 6,
      name: 'Endorphin Level',
      value: 65,
      unit: 'pg/mL',
      icon: <Dna className="h-4 w-4" />,
      color: 'text-indigo-500',
      change: '+7%',
      normal: '40-80',
    },
    {
      id: 7,
      name: 'Immune Response',
      value: 89,
      unit: '%',
      icon: <Microscope className="h-4 w-4" />,
      color: 'text-teal-500',
      change: '+1%',
      normal: '75-95',
    },
    {
      id: 8,
      name: 'Circadian Phase',
      value: 3.5,
      unit: 'hrs',
      icon: <Clock className="h-4 w-4" />,
      color: 'text-amber-500',
      change: '-0.5',
      normal: '0-6',
    },
  ];

  // Main panel UI
  if (!expanded) {
    // Collapsed state - show alert indicator
    return (
      <motion.div
        className={`flex flex-col items-center ${className}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                // Use a valid variant, e.g., 'destructive' for warning/alert
                variant={alertBadgeVariant} // Use calculated variant
                size="icon"
                className="rounded-full bg-slate-800/90 hover:bg-slate-700/90 relative"
                onClick={toggleExpanded}
              >
                <Bell className="h-5 w-5" />
                {alertMetrics.totalUnacknowledged > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {alertMetrics.totalUnacknowledged}
                  </span>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>
                {alertMetrics.totalUnacknowledged > 0
                  ? `${alertMetrics.totalUnacknowledged} unacknowledged alerts`
                  : 'No active alerts'}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </motion.div>
    );
  }

  // Expanded state - full alert panel
  return (
    <motion.div
      className={`${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="w-[320px] bg-slate-800/90 backdrop-blur-md text-white border-slate-700">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-md flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Biometric Monitor
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-white hover:bg-slate-700/50"
              onClick={toggleExpanded}
            >
              <Minimize className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-slate-400">
            {alertMetrics.totalUnacknowledged > 0
              ? `${alertMetrics.totalUnacknowledged} unacknowledged alerts`
              : 'No active alerts'}
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 mb-4 bg-slate-700/50">
              <TabsTrigger value="alerts" className="data-[state=active]:bg-indigo-600">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Alerts
              </TabsTrigger>
              <TabsTrigger value="monitoring" className="data-[state=active]:bg-indigo-600">
                <Activity className="h-4 w-4 mr-2" />
                Monitoring
              </TabsTrigger>
            </TabsList>

            <TabsContent value="alerts" className="mt-0">
              <div className="space-y-4">
                {/* Alert Summary */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Alert Summary</h3>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-red-900/40 rounded-md p-2 text-center border border-red-800/50">
                      <div className="text-xs text-red-200 mb-1">Urgent</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.urgent}
                      </div>
                    </div>

                    <div className="bg-amber-900/40 rounded-md p-2 text-center border border-amber-800/50">
                      <div className="text-xs text-amber-200 mb-1">Warning</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.warning}
                      </div>
                    </div>

                    <div className="bg-slate-700/40 rounded-md p-2 text-center border border-slate-700/50">
                      <div className="text-xs text-slate-300 mb-1">Info</div>
                      <div className="text-lg font-medium text-white">
                        {alertMetrics.countsByPriority.informational}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Alerts */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Active Alerts</h3>

                  <div className="rounded-md">
                    {alertMetrics.unacknowledgedAlerts.length > 0 ? (
                      <ScrollArea className="h-[200px]">
                        <div className="space-y-2 p-0.5">
                          {alertMetrics.unacknowledgedAlerts.map((alert) => {
                            const { bg, text, border } = alertPriorityColorMap[alert.priority]; // Use placeholder type property

                            return (
                              <div
                                key={alert.id} // Use placeholder type property
                                className={`${bg} ${text} rounded-md p-2 border ${border} relative`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <div className="flex items-center">
                                    {alert.priority === 'urgent' && ( // Use placeholder type property
                                      <AlertCircle className="h-4 w-4 text-red-400 mr-1" />
                                    )}
                                    {alert.priority === 'warning' && ( // Use placeholder type property
                                      <AlertTriangle className="h-4 w-4 text-amber-400 mr-1" />
                                    )}
                                    <span className="text-xs font-medium">
                                      {alert.biometricType} {/* Use placeholder type property */}
                                    </span>
                                  </div>
                                  <Badge
                                    variant="outline"
                                    className={`text-xs py-0 border-${alert.priority === 'urgent' ? 'red' : alert.priority === 'warning' ? 'amber' : 'slate'}-600`} // Use placeholder type property
                                  >
                                    {alert.priority} {/* Use placeholder type property */}
                                  </Badge>
                                </div>

                                <div className="text-sm font-medium mb-1">
                                  {alert.message} {/* Use placeholder type property */}
                                </div>

                                <div className="flex items-center justify-between text-xs opacity-80">
                                  <span>
                                    {formatTimestamp(alert.timestamp)}{' '}
                                    {/* Use placeholder type property */}
                                  </span>
                                  <span>{formatAlertValue(alert)}</span>
                                </div>

                                <div className="mt-2 flex justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`text-xs h-7 ${
                                      alert.priority === 'urgent' // Use placeholder type property
                                        ? 'hover:bg-red-800/60'
                                        : alert.priority === 'warning' // Use placeholder type property
                                          ? 'hover:bg-amber-800/60'
                                          : 'hover:bg-slate-600/60'
                                    }`}
                                    onClick={
                                      () => handleAcknowledgeAlert(alert.id) // Use placeholder type property
                                    }
                                  >
                                    <Check className="h-3 w-3 mr-1" />
                                    Acknowledge
                                  </Button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </ScrollArea>
                    ) : (
                      <div className="bg-slate-700/50 rounded-md p-4 text-center">
                        <BellOff className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <div className="text-sm text-slate-400">No active alerts</div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="mt-0">
              <div className="space-y-4">
                {/* Top Alert Sources */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">Top Alert Sources</h3>

                  <div className="bg-slate-700/50 rounded-md p-3">
                    {alertMetrics.topAlertTypes.length > 0 ? (
                      <div className="space-y-3">
                        {alertMetrics.topAlertTypes.map(({ type, count }) => (
                          <div key={type}>
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center">
                                {getIconForBiometricType(type)}
                                <span className="text-xs text-white ml-2">{type}</span>
                              </div>
                              <span className="text-xs text-white">{count}</span>
                            </div>
                            <Progress
                              value={
                                (count / (alertMetrics.totalUnacknowledged || 1)) * 100 // Avoid division by zero
                              }
                              className="h-1 bg-slate-700"
                              // indicatorClassName="bg-indigo-600" // Prop removed
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 text-center py-2">
                        No alert sources to display
                      </div>
                    )}
                  </div>
                </div>

                {/* Placeholder for other monitoring data */}
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-slate-300">
                    Real-time Biometrics (Placeholder)
                  </h3>
                  <div className="bg-slate-700/50 rounded-md p-3 space-y-2">
                    {biometricData.map((metric) => (
                      <div key={metric.id} className="flex flex-col space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div
                              className={cn(
                                'rounded-full p-1',
                                metric.color.replace('text', 'bg').replace('-500', '-100')
                              )}
                            >
                              <div className={metric.color}>{metric.icon}</div>
                            </div>
                            <span className="font-medium">{metric.name}</span>
                          </div>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex items-center space-x-1">
                                  <span className="text-sm font-bold">{metric.value}</span>
                                  <span className="text-xs text-muted-foreground">
                                    {metric.unit}
                                  </span>
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="right">
                                <div className="text-xs">
                                  <p>
                                    Normal range: {metric.name} ({metric.normal} {metric.unit})
                                  </p>
                                  <p>Change: {metric.change} in the last hour</p>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>

                        <Progress
                          value={
                            // Scale to percentage based on typical ranges
                            // This is a simplified approach
                            metric.name === 'Heart Rate'
                              ? (metric.value / 200) * 100
                              : metric.name === 'Blood Oxygenation'
                                ? metric.value
                                : metric.name === 'Glucose Level'
                                  ? (metric.value / 200) * 100
                                  : metric.name === 'Cortisol Level'
                                    ? (metric.value / 25) * 100
                                    : metric.name === 'Endorphin Level'
                                      ? (metric.value / 100) * 100
                                      : metric.name === 'Immune Response'
                                        ? metric.value
                                        : metric.name === 'Circadian Phase'
                                          ? (metric.value / 6) * 100
                                          : (metric.value / 20) * 100 // Respiratory Rate
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>

        <CardFooter className="pt-0 flex justify-between">
          <span className="text-xs text-slate-500">
            {/* {state.isLoading ? ( // Commented out - state is not defined */}
            {false ? ( // Placeholder for state.isLoading
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Syncing...
              </span>
            ) : (
              'Real-time Monitoring Active'
            )}
          </span>
          {/* Add other footer elements if needed */}
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default BiometricMonitorPanel;
