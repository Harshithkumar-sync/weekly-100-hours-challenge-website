import React from 'react';

interface ProgressBarProps {
  progress: number; // 0 to 100+
  height?: 'sm' | 'md' | 'lg';
  color?: string; // hex or tailwind class
  showLabel?: boolean;
  animate?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  height = 'md',
  color,
  showLabel = false,
  className = '',
}) => {
  const clamped = Math.min(100, Math.max(0, progress));
  const isOver = progress > 100;

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-400 mb-1.5">
          <span>Progress</span>
          <span className={isOver ? 'text-emerald-400 font-semibold' : 'text-slate-200'}>
            {Math.round(progress)}%
          </span>
        </div>
      )}
      <div className={`w-full ${heights[height]} bg-slate-200 dark:bg-slate-800/80 rounded-full overflow-hidden p-0.5`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${
            color
              ? ''
              : isOver
              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
              : 'bg-gradient-to-r from-brand-600 to-brand-400'
          }`}
          style={{
            width: `${clamped}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
};

