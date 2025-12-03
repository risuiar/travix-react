import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AI_API_URL } from '../../utils/env';
import ModalClean from './ModalClean';
import { useUserAuthContext } from '../../contexts/useUserAuthContext';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const { t, i18n } = useTranslation();
  const { userAuthData } = useUserAuthContext();

  // Efecto para cargar automáticamente los datos del usuario
  useEffect(() => {
    if (userAuthData && isOpen) {
      // Cargar el nombre completo o email como nombre si está disponible
      if (userAuthData.full_name) {
        setName(userAuthData.full_name);
      } else if (userAuthData.email) {
        setName(userAuthData.email.split('@')[0]); // Usar la parte antes del @ como nombre
      }
      
      // Cargar el email automáticamente
      if (userAuthData.email) {
        setEmail(userAuthData.email);
      }
    }
  }, [userAuthData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const payload = {
        name,
        email,
        message,
        language: i18n.language || 'es',
      };
      const res = await fetch(AI_API_URL + '/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Error enviando feedback');
      setSuccess(true);
      
      // Solo limpiar el mensaje, mantener nombre y email del usuario autenticado
      setMessage('');
      // Si no está autenticado, limpiar también nombre y email
      if (!userAuthData?.full_name) {
        setName('');
      }
      if (!userAuthData?.email) {
        setEmail('');
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Error desconocido');
      }
    } finally {
      setLoading(false);
    }
  };

  // Función para resetear el formulario cuando se cierre
  const handleClose = () => {
    setMessage('');
    setSuccess(false);
    setError('');
    // Si no está autenticado, limpiar también nombre y email
    if (!userAuthData?.full_name) {
      setName('');
    }
    if (!userAuthData?.email) {
      setEmail('');
    }
    onClose();
  };

  return (
    <ModalClean isOpen={isOpen} onClose={handleClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-full">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">{t('feedback.title', 'Reportar bug / Dejar mensaje')}</h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          {/* Campos de nombre y email ocultos */}
          <input
            type="hidden"
            value={name}
            onChange={e => setName(e.target.value)}
          />
          <input
            type="hidden"
            value={email}
            onChange={e => setEmail(e.target.value)}
          />
          
          <textarea
            className="border border-gray-300 dark:border-gray-600 rounded p-2 resize-none bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            required
            placeholder={t('feedback.message', 'Describe el bug o deja tu mensaje...')}
            value={message}
            onChange={e => setMessage(e.target.value)}
          />
          <div className="flex gap-2 mt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 transition-colors"
              disabled={loading}
            >
              {loading ? t('feedback.sending', 'Enviando...') : t('feedback.send', 'Enviar')}
            </button>
            <button
              type="button"
              className="bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 px-4 py-2 rounded hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
              onClick={handleClose}
            >
              {t('feedback.close', 'Cerrar')}
            </button>
          </div>
          {success && <div className="text-green-600 dark:text-green-400 mt-2">{t('feedback.success', '¡Mensaje enviado!')}</div>}
          {error && <div className="text-red-600 dark:text-red-400 mt-2">{error}</div>}
        </form>
      </div>
    </ModalClean>
  );
};

export default FeedbackModal;
