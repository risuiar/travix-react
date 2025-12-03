interface ProgressBarProps {
  percent: number;
  height?: string;
  showPercentage?: boolean;
  className?: string;
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  percent,
  height = "h-2",
  showLabel = false,
  label,
}) => {
  const clampedPercent = Math.min(percent, 100);

  return (
    <div className="mt-2 mb-3">
      {showLabel && (
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{label}</span>
          <span>{Math.round(clampedPercent)}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`${height} rounded-full bg-gradient-to-r from-green-400 via-blue-400 to-purple-400 transition-all duration-500`}
          style={{ width: `${clampedPercent}%` }}
        ></div>
      </div>
    </div>
  );
};
