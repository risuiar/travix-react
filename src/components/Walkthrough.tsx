import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAnalytics } from "../hooks/useAnalytics";
import welcomeScreen from "../assets/images/walkthrough/welcome-screen.webp";
import travelsPageNewTrip from "../assets/images/walkthrough/travels-page-new-travel.webp";
import travelFormCalendar from "../assets/images/walkthrough/travel-form-calendar.webp";
import travelFormCountries from "../assets/images/walkthrough/travel-form-countries.webp";
import travelCardCreated from "../assets/images/walkthrough/travel-card-created.webp";
import travelOverview from "../assets/images/walkthrough/travel-overview.webp";
import dailyPlanner from "../assets/images/walkthrough/daily-planner.webp";
import createItinerary from "../assets/images/walkthrough/create-itinerary.webp";
import dayViews from "../assets/images/walkthrough/daily-planner-view.webp";
import expenses from "../assets/images/walkthrough/expenses.webp";
import complete from "../assets/images/walkthrough/complete.webp";
import {
  ChevronLeft,
  ChevronRight,
  HelpCircle,
  MapPin,
  Calendar,
  Activity,
  Receipt,
} from "lucide-react";
import ModalClean from "./Modal/ModalClean";

export interface WalkthroughStep {
  id: string;
  title: string;
  description: string;
  page: string;
  target?: string;
  position: "top" | "bottom" | "left" | "right" | "center";
  icon?: React.ComponentType<{ className?: string }>;
  screenshot?: string;
}

interface WalkthroughProps {
  currentPage: string;
  onClose: () => void;
  isOpen: boolean;
}

export function Walkthrough({
  currentPage,
  onClose,
  isOpen,
}: WalkthroughProps) {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const walkthroughSteps: WalkthroughStep[] = useMemo(() => [
    {
      id: "welcome",
      title: t("walkthrough.welcome.title"),
      description: t("walkthrough.welcome.description"),
      page: "travels",
      position: "center",
      icon: MapPin,
      screenshot: welcomeScreen,
    },
    {
      id: "create-travel",
      title: t("walkthrough.createTravel.title"),
      description: t("walkthrough.createTravel.description"),
      page: "travels",
      target: '[data-walkthrough="new-travel-button"]',
      position: "bottom",
      icon: MapPin,
      screenshot: travelsPageNewTrip,
    },
    {
      id: "travel-form-dates",
      title: t("walkthrough.travelFormDates.title"),
      description: t("walkthrough.travelFormDates.description"),
      page: "travels",
      position: "center",
      icon: Calendar,
      screenshot: travelFormCalendar,
    },
    {
      id: "travel-form-countries",
      title: t("walkthrough.travelFormCountries.title"),
      description: t("walkthrough.travelFormCountries.description"),
      page: "travels",
      position: "center",
      icon: MapPin,
      screenshot: travelFormCountries,
    },
    {
      id: "travel-created",
      title: t("walkthrough.travelCreated.title"),
      description: t("walkthrough.travelCreated.description"),
      page: "travels",
      target: '[data-walkthrough="travel-card"]',
      position: "top",
      icon: MapPin,
      screenshot: travelCardCreated,
    },
    {
      id: "travel-overview",
      title: t("walkthrough.travelOverview.title"),
      description: t("walkthrough.travelOverview.description"),
      page: "travel-detail",
      position: "center",
      icon: Activity,
      screenshot: travelOverview,
    },
    {
      id: "daily-planner",
      title: t("walkthrough.dailyPlanner.title"),
      description: t("walkthrough.dailyPlanner.description"),
      page: "daily-planner",
      target: '[data-walkthrough="add-destination"]',
      position: "bottom",
      icon: MapPin,
      screenshot: dailyPlanner,
    },
    {
      id: "create-itinerary",
      title: t("walkthrough.createItinerary.title"),
      description: t("walkthrough.createItinerary.description"),
      page: "daily-planner",
      position: "center",
      icon: MapPin,
      screenshot: createItinerary,
    },
    {
      id: "daily-view",
      title: t("walkthrough.dailyView.title"),
      description: t("walkthrough.dailyView.description"),
      page: "daily-planner",
      position: "center",
      icon: Calendar,
      screenshot: dayViews,
    },
    {
      id: "expenses-view",
      title: t("walkthrough.expensesView.title"),
      description: t("walkthrough.expensesView.description"),
      page: "expenses",
      position: "center",
      icon: Receipt,
      screenshot: expenses,
    },
    {
      id: "complete",
      title: t("walkthrough.complete.title"),
      description: t("walkthrough.complete.description"),
      page: "any",
      position: "center",
      icon: MapPin,
      screenshot: complete,
    },
  ], [t]); // useMemo dependency on translation function

  const currentStep = walkthroughSteps[currentStepIndex];
  const isLastStep = currentStepIndex === walkthroughSteps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  useEffect(() => {
    // Find the first relevant step for the current page
    const firstRelevantStepIndex = walkthroughSteps.findIndex(
      (step) => step.page === currentPage || step.page === "any"
    );

    if (firstRelevantStepIndex !== -1 && isOpen) {
      setCurrentStepIndex(firstRelevantStepIndex);
      
      // Track walkthrough started - simplified
      try {
        trackEvent("walkthrough_started", {
          current_page: currentPage,
          step_started: firstRelevantStepIndex,
          step_id: walkthroughSteps[firstRelevantStepIndex]?.id,
        });
      } catch (error) {
        console.warn("Analytics tracking failed:", error);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, isOpen, walkthroughSteps]);

  const handleNext = () => {
    if (!isLastStep) {
      const nextStepIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextStepIndex);
      
      // Track walkthrough step progression
      if (trackEvent) {
        try {
          trackEvent("walkthrough_step_next", {
            current_step: currentStepIndex,
            current_step_id: currentStep?.id,
            next_step: nextStepIndex,
            next_step_id: walkthroughSteps[nextStepIndex]?.id,
            current_page: currentPage,
          });
        } catch (error) {
          console.warn("Analytics tracking failed:", error);
        }
      }
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStepIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevStepIndex);
      
      // Track walkthrough step going back
      if (trackEvent) {
        try {
          trackEvent("walkthrough_step_previous", {
            current_step: currentStepIndex,
            current_step_id: currentStep?.id,
            previous_step: prevStepIndex,
            previous_step_id: walkthroughSteps[prevStepIndex]?.id,
            current_page: currentPage,
          });
        } catch (error) {
          console.warn("Analytics tracking failed:", error);
        }
      }
    }
  };

  const handleClose = () => {
    // Track walkthrough close - simplified
    try {
      trackEvent("walkthrough_closed", {
        step_closed_at: currentStepIndex,
        step_id: currentStep.id,
        current_page: currentPage,
        completed_percentage: Math.round(((currentStepIndex + 1) / walkthroughSteps.length) * 100),
      });
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
    
    onClose();
  };

  const handleSkip = () => {
    // Track walkthrough skip - simplified
    try {
      trackEvent("walkthrough_skipped", {
        step_skipped_at: currentStepIndex,
        step_id: currentStep.id,
        current_page: currentPage,
        completed_percentage: Math.round(((currentStepIndex + 1) / walkthroughSteps.length) * 100),
      });
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
    
    setCurrentStepIndex(walkthroughSteps.length - 1);
  };

  const handleDontShowAgain = () => {
    // Track walkthrough dismissed permanently - simplified
    try {
      trackEvent("walkthrough_dismissed_permanently", {
        step_dismissed_at: currentStepIndex,
        step_id: currentStep.id,
        current_page: currentPage,
        completed_percentage: Math.round(((currentStepIndex + 1) / walkthroughSteps.length) * 100),
      });
    } catch (error) {
      console.warn("Analytics tracking failed:", error);
    }
    
    localStorage.setItem("travix-walkthrough-dismissed", "true");
    handleClose();
  };

  const Icon = currentStep.icon || MapPin;

  return (
    <ModalClean isOpen={isOpen} onClose={handleClose} className="max-w-md">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-2xl text-white relative overflow-hidden">
          {/* Background decorations */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-2 right-2 w-16 h-16 border border-white/30 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-12 h-12 border border-white/20 rounded-full"></div>
          </div>

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold">{currentStep.title}</h2>
                <p className="text-white/80 text-sm">
                  {t("walkthrough.step")} {currentStepIndex + 1} {t("walkthrough.of")} {walkthroughSteps.length}
                </p>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-4 w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  ((currentStepIndex + 1) / walkthroughSteps.length) * 100
                }%`,
              }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Screenshot */}
          {currentStep.screenshot && (
            <div className="mb-6">
              <img
                src={currentStep.screenshot}
                alt={currentStep.title}
                className="w-full max-h-48 rounded-xl border border-gray-200 dark:border-gray-600 shadow-sm bg-gray-50 dark:bg-gray-700"
              />
            </div>
          )}

          <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6">
            {currentStep.description}
          </p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {!isFirstStep && (
                <button
                  onClick={handlePrevious}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("walkthrough.previous")}
                </button>
              )}

              {!isLastStep && (
                <button
                  onClick={handleSkip}
                  className="px-4 py-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors text-sm"
                >
                  {t("walkthrough.skipTutorial")}
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isLastStep ? (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => {
                      // Track walkthrough completion - simplified
                      try {
                        trackEvent("walkthrough_completed", {
                          current_page: currentPage,
                          total_steps: walkthroughSteps.length,
                          final_step_id: currentStep.id,
                        });
                      } catch (error) {
                        console.warn("Analytics tracking failed:", error);
                      }
                      handleClose();
                    }}
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                  >
                    {t("walkthrough.startUsingTravix")}
                  </button>
                  <button
                    onClick={handleDontShowAgain}
                    className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                  >
                    {t("walkthrough.dontShowAgain")}
                  </button>
                </div>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium"
                >
                  {t("walkthrough.next")}
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Don't show again option for first step */}
          {isFirstStep && (
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
              <button
                onClick={handleDontShowAgain}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                {t("walkthrough.dontShowTutorialAgain")}
              </button>
            </div>
          )}
        </div>
      </div>
    </ModalClean>
  );
}

// Help Button Component
interface HelpButtonProps {
  onClick: () => void;
}

export function HelpButton({ onClick }: HelpButtonProps) {
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  
  const handleClick = () => {
    // Track help button click
    trackEvent("help_button_clicked", {
      page: window.location.pathname,
    });
    
    onClick();
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-110 z-40 flex items-center justify-center"
      title={t("walkthrough.helpAndTutorial")}
    >
      <HelpCircle className="w-6 h-6" />
    </button>
  );
}
