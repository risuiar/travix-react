import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const AuthLogin: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const loginWithGoogle = async () => {
      try {
        const { supabase } = await import("../supabaseClient");
        await supabase.auth.signOut();
        const redirectUrl = window.location.origin + "/travels";
        await supabase.auth.signInWithOAuth({
          provider: "google",
          options: {
            redirectTo: redirectUrl,
          },
        });
      } catch {
        // Si hay error, redirigir al login normal
        navigate("/login");
      }
    };
    loginWithGoogle();
  }, [navigate]);

  return (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t("login.redirectingToGoogle", "Redirigiendo a Google para iniciar sesión...")}
          </h2>
          <p className="text-gray-600">
            {t("login.pleaseWait", "Por favor espera mientras te autenticamos.")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthLogin;
