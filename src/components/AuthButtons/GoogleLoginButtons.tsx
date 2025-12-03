import React from "react";
import { GoogleLoginButton } from "../GoogleLoginButton";
import { ChangeAccountButton } from "./ChangeAccountButton";

interface GoogleLoginButtonsProps {
  onLoginSuccess?: () => void;
  onLoginError?: (error: Error | string) => void;
}

export const GoogleLoginButtons: React.FC<GoogleLoginButtonsProps> = ({
  onLoginSuccess,
  onLoginError,
}) => {


  return (
    <div className="space-y-3">
      {/* Contenedor del botón principal con botón de cambio */}
      <div className="relative">
        {/* Botón principal de Google */}
        <GoogleLoginButton
          onLoginSuccess={onLoginSuccess}
          onLoginError={onLoginError}
          variant="primary"
          hasChangeButton={true}
        />

        {/* Botón pequeño para cambiar cuenta */}
        <div className="absolute -right-3 top-1/2 transform -translate-y-1/2">
          <ChangeAccountButton
            onLoginSuccess={onLoginSuccess}
            onLoginError={onLoginError}
          />
        </div>
      </div>
    </div>
  );
};
