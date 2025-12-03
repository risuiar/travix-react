import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export function useScrollToTopOnRouteChange() {
  const { pathname } = useLocation();

  useEffect(() => {
    // No hacer scroll automático en cualquier ruta de Daily Planner
    if (pathname.includes("/daily-planner")) {
      return;
    }

    let tries = 0;
    function scrollAll() {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const main = document.getElementById("main-scroll");
      if (main) main.scrollTop = 0;
      tries++;
      if (tries < 5) setTimeout(scrollAll, 50);
    }
    scrollAll();
  }, [pathname]);
}
