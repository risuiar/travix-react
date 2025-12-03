import React, { useEffect, useState } from "react";
import ItineraryMapToggle from "./ItineraryMapToggle.tsx";
import ItineraryMap from "./ItineraryMap.tsx";
import {
  fetchActivitiesByItinerary,
  ActivityPoint,
} from "../lib/fetchActivitiesByItinerary.ts";

interface ItineraryMapSectionProps {
  groupKey: string;
  rightActions?: React.ReactNode;
  className?: string;
  itineraryId?: string | null;
  // parent just passes itineraryId; this component fetches on demand
  centerLatLng?: [number, number];
}

const MAP_VISIBLE_GROUPS_KEY = "itineraryMapVisibleGroups";

export const ItineraryMapSection: React.FC<ItineraryMapSectionProps> = ({
  groupKey,
  rightActions,
  className = "",
  itineraryId,
  centerLatLng,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [activities, setActivities] = useState<ActivityPoint[]>([]);
  // Note: could be used for a loading spinner later
  const [, setIsLoading] = useState<boolean>(false);

  // Load initial state from localStorage (keeps compatibility with existing array storage)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MAP_VISIBLE_GROUPS_KEY);
      if (saved) {
        const parsed: string[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setIsVisible(parsed.includes(groupKey));
        }
      }
    } catch {
      // ignore localStorage errors
    }
  }, [groupKey]);

  // Persist on change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MAP_VISIBLE_GROUPS_KEY);
      let parsed: string[] = [];
      if (saved) {
        const maybe = JSON.parse(saved);
        parsed = Array.isArray(maybe) ? maybe : [];
      }
      const set = new Set(parsed);
      if (isVisible) set.add(groupKey);
      else set.delete(groupKey);
      localStorage.setItem(
        MAP_VISIBLE_GROUPS_KEY,
        JSON.stringify(Array.from(set))
      );
    } catch {
      // ignore localStorage errors
    }
  }, [groupKey, isVisible]);

  // Fetch on mount/update if already visible (e.g., restored from localStorage)
  useEffect(() => {
    const fetchIfNeeded = async () => {
      if (!isVisible) return;
      if (!itineraryId) return;
      try {
        setIsLoading(true);
        const data = await fetchActivitiesByItinerary(itineraryId);
        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("🗺️ ItineraryMapSection - Error fetching data:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };
    // Fetch when visible and itinerary changes or when no activities yet
    if (isVisible && itineraryId) {
      fetchIfNeeded();
    }
  }, [isVisible, itineraryId]);

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-4 gap-3">
        <ItineraryMapToggle
          isVisible={isVisible}
          onToggle={async () => {
            const next = !isVisible;
            setIsVisible(next);
            if (next) {
              // Fetch activities on demand; if itineraryId not provided, show map without POIs
              if (itineraryId) {
                try {
                  setIsLoading(true);
                  const data = await fetchActivitiesByItinerary(itineraryId);
                  setActivities(data);
                } catch {
                  setActivities([]);
                } finally {
                  setIsLoading(false);
                }
              } else {
                setActivities([]);
              }
            }
          }}
        />
        {rightActions ? (
          <div className="flex justify-end">{rightActions}</div>
        ) : null}
      </div>

      {isVisible && (
        <div className="mb-4">
          {(() => {
            const first =
              Array.isArray(activities) && activities.length > 0
                ? activities[0]
                : undefined;
            const fallbackCenter =
              first && first.lat != null && first.lng != null
                ? ([first.lat as number, first.lng as number] as [
                    number,
                    number
                  ])
                : undefined;

            return (
              <ItineraryMap
                activities={Array.isArray(activities) ? activities : []}
                centerLatLng={centerLatLng ?? fallbackCenter}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default ItineraryMapSection;
