/* eslint-disable */
/**
 * Atoms index file
 *
 * This file exports all atom-level components from their organized subdirectories,
 * simplifying imports across the application and following clean architecture principles.
 */

// Export components from their respective categories

// Display Atoms
export * from './display/alert'; // Note: Moved alert to feedback, keeping export path for now if desired, or change to './feedback/alert'
export * from './display/Avatar';
export * from './display/Badge';
export * from './display/Card';
export * from './display/DocumentTitle';
export * from './display/table';

// Feedback Atoms
export * from './feedback/ActivityIndicator';
export * from './feedback/alert'; // Corrected location
export * from './feedback/LoadingIndicator';
export * from './feedback/popover';
export * from './feedback/progress';
export * from './feedback/skeleton';
export * from './feedback/Tooltip';

// Form Atoms
export * from './form/form';
export * from './form/input';
export * from './form/label';
export * from './form/select';
export * from './form/slider';
export * from './form/switch'; // Corrected casing from original file content

// Layout Atoms
export * from './layout/scroll-area';
export * from './layout/separator';
export * from './layout/tabs'; // Corrected casing from original file content

// Data Visualization Atoms
export * from './data-visualization/ConnectionLine';
export * from './data-visualization/NeuralCorrelationBadge';
export * from './data-visualization/RegionMesh';
export * from './data-visualization/RegionSelectionIndicator';

// Root/Core Atoms (if any kept at root)
export * from './Button';
