export const ExpensesSkeleton = () => (
  <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
    {/* Header Skeleton */}
    <div className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        <Skeleton variant="circular" width="24px" height="24px" />
        <Skeleton variant="text" width="150px" height="28px" />
      </div>
      <Skeleton variant="rectangular" width="120px" height="36px" />
    </div>

    {/* Filters Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Skeleton variant="rectangular" height="40px" />
        <Skeleton variant="rectangular" height="40px" />
        <Skeleton variant="rectangular" height="40px" />
        <Skeleton variant="rectangular" height="40px" />
      </div>
    </div>

    {/* Content Grid */}
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Expense List */}
      <div className="lg:col-span-3">
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center gap-3">
                <Skeleton variant="circular" width="40px" height="40px" />
                <div className="flex-1 space-y-2">
                  <Skeleton variant="text" width="70%" height="16px" />
                  <Skeleton variant="text" width="50%" height="12px" />
                  <Skeleton variant="text" width="60%" height="12px" />
                </div>
                <div className="text-right space-y-1">
                  <Skeleton variant="text" width="60px" height="18px" />
                  <Skeleton variant="text" width="40px" height="12px" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Stats Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton variant="text" width="60%" height="16px" className="mb-3" />
          <div className="space-y-2">
            <Skeleton variant="text" width="100%" height="14px" />
            <Skeleton variant="text" width="80%" height="14px" />
            <Skeleton variant="text" width="90%" height="14px" />
          </div>
        </div>

        {/* Chart Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <Skeleton variant="text" width="50%" height="16px" className="mb-3" />
          <Skeleton variant="circular" width="120px" height="120px" className="mx-auto mb-3" />
          <div className="space-y-1">
            <Skeleton variant="rectangular" height="20px" count={4} />
          </div>
        </div>
      </div>
    </div>
  </div>
);
interface SkeletonProps {
  className?: string;
  variant?: 'rectangular' | 'circular' | 'text' | 'card' | 'full';
  width?: string | number;
  height?: string | number;
  count?: number;
}

export const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  width = '100%',
  height = '1rem',
  count = 1
}: SkeletonProps) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'circular':
        return 'rounded-full';
      case 'text':
        return 'rounded-md h-4';
      case 'card':
        return 'rounded-lg';
      case 'full':
        return 'rounded-lg min-h-screen';
      default:
        return 'rounded-md';
    }
  };

  const skeletonElement = (
    <div
      className={`
        bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700
        animate-pulse bg-[length:200%_100%] bg-[position:-200%_0] animate-[shimmer_2s_infinite]
        ${getVariantClasses()} ${className}
      `}
      style={{ 
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height 
      }}
    />
  );

  if (count === 1) {
    return skeletonElement;
  }

  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index}>
          {skeletonElement}
        </div>
      ))}
    </div>
  );
};

// Skeleton presets for common layouts
export const OverviewSkeleton = () => (
  <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
    {/* Main Travel Card Skeleton */}
    <Skeleton variant="card" height="12rem" className="mb-4" />
    
    {/* Ad Banner Skeleton */}
    <Skeleton variant="rectangular" height="4rem" className="mb-4" />
    
    <div className="overview-cards-container flex flex-col gap-3 pt-4">
      {/* Today Section Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-3">
          <Skeleton variant="circular" width="20px" height="20px" />
          <Skeleton variant="text" width="60%" height="14px" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center space-y-2">
            <Skeleton variant="text" width="80%" height="12px" />
            <Skeleton variant="rectangular" height="60px" />
          </div>
          <div className="text-center space-y-2">
            <Skeleton variant="text" width="80%" height="12px" />
            <Skeleton variant="rectangular" height="60px" />
          </div>
        </div>
      </div>

      {/* Upcoming Days Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width="20px" height="20px" />
            <Skeleton variant="text" width="40%" height="14px" />
          </div>
          <Skeleton variant="text" width="20%" height="12px" />
        </div>
        <div className="space-y-2">
          <Skeleton variant="rectangular" height="80px" />
          <Skeleton variant="rectangular" height="80px" />
        </div>
      </div>

      {/* Expense Distribution Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton variant="circular" width="20px" height="20px" />
          <Skeleton variant="text" width="50%" height="14px" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width="64px" height="64px" />
          <div className="flex-1 space-y-1">
            <Skeleton variant="rectangular" height="24px" count={4} />
          </div>
        </div>
      </div>

      {/* Recent Expenses Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Skeleton variant="circular" width="20px" height="20px" />
            <Skeleton variant="text" width="40%" height="14px" />
          </div>
          <Skeleton variant="text" width="20%" height="12px" />
        </div>
        <div className="space-y-1.5">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="flex items-center gap-2 p-2">
              <Skeleton variant="circular" width="24px" height="24px" />
              <div className="flex-1 space-y-1">
                <Skeleton variant="text" width="60%" height="12px" />
                <Skeleton variant="text" width="40%" height="10px" />
              </div>
              <Skeleton variant="text" width="20%" height="14px" />
            </div>
          ))}
        </div>
      </div>

      {/* General Activities Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton variant="circular" width="20px" height="20px" />
          <Skeleton variant="text" width="40%" height="14px" />
        </div>
        <div className="space-y-1">
          <Skeleton variant="rectangular" height="32px" count={3} />
        </div>
      </div>

      {/* General Expenses Skeleton */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Skeleton variant="circular" width="20px" height="20px" />
          <Skeleton variant="text" width="40%" height="14px" />
        </div>
        <div className="space-y-1">
          <Skeleton variant="rectangular" height="32px" count={3} />
        </div>
      </div>
    </div>
  </div>
);


export const DailyPlannerSkeleton = () => (
  <div className="max-w-7xl mx-auto pt-0 pb-6 px-0 sm:px-0">
    {/* Header Card Skeleton */}
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Skeleton variant="circular" width="24px" height="24px" />
          <Skeleton variant="text" width="200px" height="24px" />
        </div>
        <Skeleton variant="rectangular" width="120px" height="36px" />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center space-y-2">
          <Skeleton variant="text" width="60%" height="12px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton variant="text" width="60%" height="12px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton variant="text" width="60%" height="12px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </div>
        <div className="text-center space-y-2">
          <Skeleton variant="text" width="60%" height="12px" />
          <Skeleton variant="text" width="40%" height="16px" />
        </div>
      </div>
    </div>

    {/* Itinerary Groups Skeleton */}
    <div className="space-y-6">
      {Array.from({ length: 2 }).map((_, groupIndex) => (
        <div key={groupIndex} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          {/* Group Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Skeleton variant="circular" width="20px" height="20px" />
              <Skeleton variant="text" width="150px" height="18px" />
            </div>
            <Skeleton variant="text" width="80px" height="14px" />
          </div>

          {/* Days in Group */}
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, dayIndex) => (
              <div key={dayIndex} className="border-l-4 border-blue-500 pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton variant="text" width="120px" height="16px" />
                  <Skeleton variant="rectangular" width="60px" height="20px" />
                </div>
                
                {/* Activities */}
                <div className="space-y-2 ml-4">
                  {Array.from({ length: 2 }).map((_, actIndex) => (
                    <div key={actIndex} className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                      <Skeleton variant="circular" width="16px" height="16px" />
                      <div className="flex-1 space-y-1">
                        <Skeleton variant="text" width="60%" height="14px" />
                        <Skeleton variant="text" width="40%" height="12px" />
                      </div>
                      <Skeleton variant="text" width="50px" height="14px" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* General Items Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton variant="circular" width="20px" height="20px" />
          <Skeleton variant="text" width="120px" height="18px" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* General Activities */}
          <div>
            <Skeleton variant="text" width="100px" height="16px" className="mb-3" />
            <div className="space-y-2">
              <Skeleton variant="rectangular" height="40px" count={3} />
            </div>
          </div>
          
          {/* General Expenses */}
          <div>
            <Skeleton variant="text" width="100px" height="16px" className="mb-3" />
            <div className="space-y-2">
              <Skeleton variant="rectangular" height="40px" count={3} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Add shimmer animation to global CSS
const shimmerStyles = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
  const style = document.createElement('style');
  style.id = 'skeleton-styles';
  style.textContent = shimmerStyles;
  document.head.appendChild(style);
}
