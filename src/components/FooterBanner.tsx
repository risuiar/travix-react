import React from "react";
import { AdBannerManager } from "./AdBannerManager";

/**
 * Banner del footer que siempre se muestra (excepto para usuarios premium/ultimate)
 */
export const FooterBanner: React.FC = () => {
  return (
    <div className="mt-8 border-t pt-4">
      <AdBannerManager
        size="728x90"
        placement="footer-fixed"
        provider="custom"
        forceShow={true}
        className="mb-4"
      />
    </div>
  );
};
