import React, { useEffect } from "react";
import ReactDOM from "react-dom";
import { useKeyboardOffset } from "../../hooks/useKeyboardOffset";

interface ModalCleanProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const ModalClean: React.FC<ModalCleanProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
}) => {
  // Use keyboard offset hook for mobile keyboard handling
  useKeyboardOffset();

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscKey);
    }

    return () => {
      document.removeEventListener("keydown", handleEscKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;
  return ReactDOM.createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(30, 41, 59, 0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 50,
      }}
    >
      <div
        className={`w-full max-w-md mx-2 sm:mx-4 max-h-[95vh] overflow-y-auto ${className}`}
        style={{
          maxHeight: "calc(var(--keyboard-offset, 95vh) - 2rem)",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
};

export default ModalClean;
