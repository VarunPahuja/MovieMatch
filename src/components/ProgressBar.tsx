interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
}

export function ProgressBar({ current, total, className = '' }: ProgressBarProps) {
  const percentage = Math.min((current / total) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="flex justify-between items-center mb-3">
        <span className="text-sm font-medium text-gray-300">
          Movie {current} of {total}
        </span>
        <span className="text-sm font-medium text-gray-400">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="progress-bar h-2">
        <div 
          className="progress-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
