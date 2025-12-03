import React from "react";
import { AdBannerManager } from "./AdBannerManager";

type BannerArea =
  | "large"
  | "daily-planner-row"
  | "planner-side"
  | "xl-large"
  | "medium"
  | "small";

interface AdBannerResponsiveProps {
  area: BannerArea;
  provider?: "adsense" | "propeller" | "custom";
  className?: string;
}

export const AdBannerResponsive: React.FC<AdBannerResponsiveProps> = ({
  area,
  provider = "adsense",
  className = "",
}) => {
  const render = () => {
    return null; // TODO: Remove this to show the ads
    switch (area) {
      case "small":
        return (
          <div
            className={`flex justify-center max-w-screen-sm mx-auto ${className}`}
          >
            <AdBannerManager
              size="300x100"
              placement="small"
              provider={provider}
            />
          </div>
        );
      case "medium":
        return (
          <>
            {/* LG+ (≥1024px): banner horizontal 728x90 */}
            <div
              className={`hidden lg:flex justify-center max-w-screen-lg mx-auto ${className}`}
            >
              <AdBannerManager
                size="728x90"
                placement="medium-wide"
                provider={provider}
              />
            </div>

            {/* MD (768–1023px): banner más corto 468x60 */}
            <div
              className={`hidden md:flex lg:hidden justify-center max-w-screen-md mx-auto ${className}`}
            >
              <AdBannerManager
                size="468x60"
                placement="medium-narrow"
                provider={provider}
              />
            </div>

            {/* SM (<768px): banner compacto para mobile */}
            <div
              className={`flex md:hidden justify-center max-w-screen-sm mx-auto ${className}`}
            >
              <AdBannerManager
                size="300x250"
                placement="medium-mobile"
                provider={provider}
              />
            </div>
          </>
        );

      case "large":
        return (
          <>
            {/* Desktop: >= 1024px */}
            <div className={`hidden lg:flex justify-center ${className}`}>
              <AdBannerManager
                size="728x90"
                placement="homepage-top"
                provider={provider}
                useSupportMessage={true}
              />
            </div>
            {/* Mobile: < 1024px */}
            <div className={`flex lg:hidden justify-center ${className}`}>
              <AdBannerManager
                size="300x250"
                placement="homepage-top"
                provider={provider}
                useSupportMessage={false}
              />
            </div>
          </>
        );

      case "daily-planner-row":
        return (
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
            <AdBannerManager
              size="300x250"
              placement="planner-under-1"
              provider={provider}
            />
            <AdBannerManager
              size="300x250"
              placement="planner-under-2"
              provider={provider}
            />
            <AdBannerManager
              size="300x250"
              placement="planner-under-3"
              provider={provider}
            />
          </div>
        );

      case "planner-side":
        return (
          <div className={`w-full max-w-[300px] mx-auto ${className}`}>
            <AdBannerManager
              size="300x250"
              placement="planner-side"
              provider={provider}
            />
          </div>
        );

      case "xl-large":
        return (
          <>
            {/* 2XL: tres banners lado a lado */}
            <div
              className={`hidden 2xl:grid grid-cols-3 gap-6 max-w-screen-2xl mx-auto ${className}`}
            >
              <AdBannerManager
                size="336x280"
                placement="xl-large-left"
                provider={provider}
              />
              <AdBannerManager
                size="336x280"
                placement="xl-large-center"
                provider={provider}
              />
              <AdBannerManager
                size="336x280"
                placement="xl-large-right"
                provider={provider}
              />
            </div>

            {/* LG to XL (1024px–1535px): dos banners lado a lado */}
            <div
              className={`hidden lg:flex 2xl:hidden justify-center gap-6 max-w-screen-xl mx-auto ${className}`}
            >
              <div className="w-[336px]">
                <AdBannerManager
                  size="336x280"
                  placement="xl-large-left"
                  provider={provider}
                />
              </div>
              <div className="w-[336px]">
                <AdBannerManager
                  size="336x280"
                  placement="xl-large-right"
                  provider={provider}
                />
              </div>
            </div>

            {/* < LG (<1024px): solo un banner centrado */}
            <div
              className={`flex lg:hidden justify-center max-w-screen-sm mx-auto ${className}`}
            >
              <AdBannerManager
                size="300x250"
                placement="xl-mobile"
                provider={provider}
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return <div className={className}>{render()}</div>;
};
