/**
 * NOVAMIND Neural-Safe Atomic Component
 * NeuralCorrelationBadge - Quantum-level neural correlation visualization
 * with clinical precision and type-safe implementation
 */

import { useState, useMemo } from 'react';
import { Badge } from '@/presentation/atoms'; // Corrected import
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/presentation/atoms'; // Corrected import
// import { cn } from '@/lib/utils';
import type { NeuralCorrelation as NeuralCorrelationType } from '@domain/types/clinical/events';

// Icons
import { Brain, Activity, Zap } from 'lucide-react';

/**
 * Props with neural-safe typing
 */
interface NeuralCorrelationBadgeProps {
  correlation: NeuralCorrelationType;
  showIcon?: boolean;
  showStrength?: boolean;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: (correlation: NeuralCorrelationType) => void;
}

/**
 * NeuralCorrelationBadge - Atomic component for visualizing neural correlations
 * with clinical precision and HIPAA-compliant data presentation
 */
export const NeuralCorrelationBadge: React.FC<NeuralCorrelationBadgeProps> = ({
  correlation,
  showIcon = true,
  showStrength = true,
  showTooltip = true,
  size = 'md',
  className = '',
  onClick,
}) => {
  // These state variables are currently unused but kept for future interactive features
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_isHovered, _setIsHovered] = useState(false);

  // Calculate badge color based on correlation strength
  const badgeColor = useMemo(() => {
    if (correlation.strength >= 0.8) {
      return 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200';
    } else if (correlation.strength >= 0.5) {
      return 'bg-blue-100 text-blue-800 border-blue-300 hover:bg-blue-200';
    } else if (correlation.strength >= 0.3) {
      return 'bg-amber-100 text-amber-800 border-amber-300 hover:bg-amber-200';
    } else {
      return 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200';
    }
  }, [correlation.strength]);

  // Calculate icon based on correlation strength
  const correlationIcon = useMemo(() => {
    if (correlation.strength >= 0.8) {
      return <Zap className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />;
    } else if (correlation.strength >= 0.5) {
      return (
        <Brain className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      );
    } else {
      return (
        <Activity className={size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-5 w-5' : 'h-4 w-4'} />
      );
    }
  }, [correlation.strength, size]);

  // Format strength as percentage
  const formattedStrength = useMemo(() => {
    return `${Math.round(correlation.strength * 100)}%`;
  }, [correlation.strength]);

  // Size-based classes
  const sizeClasses = useMemo(() => {
    switch (size) {
      case 'sm':
        return 'text-xs py-0.5 px-1.5';
      case 'lg':
        return 'text-sm py-1 px-3';
      default:
        return 'text-xs py-0.5 px-2';
    }
  }, [size]);

  // Generate tooltip content
  const tooltipContent = useMemo(() => {
    return (
      <div className="space-y-1">
        <p className="font-medium">Neural Correlation: {formattedStrength}</p>

        {correlation.description && <p>{correlation.description}</p>}

        {correlation.regions && correlation.regions.length > 0 && (
          <div>
            <p className="text-xs text-slate-300 mt-1">Involved Regions:</p>
            <div className="flex flex-wrap gap-1 mt-0.5">
              {correlation.regions.map((region, i) => (
                <span
                  key={i}
                  className="text-xs bg-indigo-900/60 text-indigo-100 px-1.5 py-0.5 rounded"
                >
                  {region}
                </span>
              ))}
            </div>
          </div>
        )}

        {correlation.confidence !== undefined && (
          <p className="text-xs mt-1">Confidence: {Math.round(correlation.confidence * 100)}%</p>
        )}
      </div>
    );
  }, [correlation, formattedStrength]);

  // Determine badge variant based on correlation strength
  const badgeVariant = useMemo(() => {
    if (correlation.strength >= 0.8) return 'destructive';
    if (correlation.strength >= 0.5) return 'secondary';
    return 'default';
  }, [correlation.strength]);

  const handleClick = () => {
    if (onClick) {
      onClick(correlation);
    }
  };

  // Basic badge without tooltip
  if (!showTooltip) {
    return (
      <Badge
        variant={badgeVariant}
        className={`${badgeColor} ${sizeClasses} ${className} flex items-center`}
        onClick={onClick ? handleClick : undefined}
        style={{ cursor: onClick ? 'pointer' : 'default' }}
      >
        {showIcon && <span className="mr-1">{correlationIcon}</span>}
        {showStrength ? `Neural Match: ${formattedStrength}` : 'Neural Match'}
      </Badge>
    );
  }

  // Badge with tooltip
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant={badgeVariant}
            className={`${badgeColor} ${sizeClasses} ${className} flex items-center cursor-help`}
            onClick={onClick ? handleClick : undefined}
            style={{ cursor: onClick ? 'pointer' : 'default' }}
          >
            {showIcon && <span className="mr-1">{correlationIcon}</span>}
            {showStrength ? `Neural Match: ${formattedStrength}` : 'Neural Match'}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">{tooltipContent}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default NeuralCorrelationBadge;
