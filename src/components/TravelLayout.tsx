// components/TravelLayout.tsx
import { Outlet } from "react-router-dom";
// TravelProvider eliminado - usando nuevas vistas SQL

export const TravelLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto">
        <Outlet />
      </div>
    </div>
  );
};
