import { useEffect } from "react";

export const useKeyboardOffset = () => {
  useEffect(() => {
    const onResize = () => {
      const bottomOffset = window.visualViewport?.height || window.innerHeight;
      document.body.style.setProperty("--keyboard-offset", `${bottomOffset}px`);
    };

    // Set initial value
    onResize();

    // Add event listener for viewport changes
    window.visualViewport?.addEventListener("resize", onResize);

    return () => {
      window.visualViewport?.removeEventListener("resize", onResize);
      // Clean up CSS variable when component unmounts
      document.body.style.removeProperty("--keyboard-offset");
    };
  }, []);
};
