import React, { useState } from "react";
import { EmailAuthButton } from "./EmailAuthButton";
import { EmailAuthModal } from "./EmailAuthModal";

interface EmailAuthButtonsProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
}

export const EmailAuthButtons: React.FC<EmailAuthButtonsProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleRegisterClick = () => {
    setIsRegisterModalOpen(true);
  };

  const handleLoginSuccess = () => {
    setIsLoginModalOpen(false);
    onLoginSuccess?.();
  };

  const handleRegisterSuccess = () => {
    setIsRegisterModalOpen(false);
    onLoginSuccess?.();
  };

  const handleError = (error: Error | string) => {
    onLoginError?.(error);
  };

  return (
    <div className="space-y-3">
      {/* Botón de Login */}
      <EmailAuthButton
        onLoginSuccess={handleLoginSuccess}
        onLoginError={handleError}
        mode="login"
        variant="primary"
        onClick={handleLoginClick}
      />

      {/* Botón de Registro */}
      <EmailAuthButton
        onLoginSuccess={handleRegisterSuccess}
        onLoginError={handleError}
        mode="register"
        variant="secondary"
        onClick={handleRegisterClick}
      />

      {/* Modales */}
      <EmailAuthModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        mode="login"
        onSuccess={handleLoginSuccess}
        onError={handleError}
      />

      <EmailAuthModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        mode="register"
        onSuccess={handleRegisterSuccess}
        onError={handleError}
      />
    </div>
  );
};
