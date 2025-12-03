import { useState, useEffect } from "react";
import { useUserAuthContext } from "../contexts/useUserAuthContext";

export function useWalkthrough() {
  const [showWalkthrough, setShowWalkthrough] = useState(false);
  const [hasSeenWalkthrough, setHasSeenWalkthrough] = useState(false);
  const { user, loading } = useUserAuthContext();

  useEffect(() => {
    // Don't show walkthrough if user is not authenticated or still loading
    if (loading || !user) {
      return;
    }

    // Check if user has dismissed the walkthrough
    const dismissed = localStorage.getItem("travix-walkthrough-dismissed");
    const hasSeenBefore = localStorage.getItem("travix-walkthrough-seen");

    setHasSeenWalkthrough(!!hasSeenBefore);

    // Show walkthrough automatically for new users ONLY after successful login
    if (!dismissed && !hasSeenBefore) {
      const timer = setTimeout(() => {
        setShowWalkthrough(true);
        localStorage.setItem("travix-walkthrough-seen", "true");
      }, 1500); // Show after 1.5 seconds to ensure user is logged in

      return () => clearTimeout(timer);
    }
  }, [user, loading]);

  const openWalkthrough = () => {
    setShowWalkthrough(true);
  };

  const closeWalkthrough = () => {
    setShowWalkthrough(false);
  };

  return {
    showWalkthrough,
    hasSeenWalkthrough,
    openWalkthrough,
    closeWalkthrough,
  };
}
