import { useState, useCallback } from "react";

interface UseModalOptions {
  initialOpen?: boolean;
  onOpen?: () => void;
  onClose?: () => void;
}

export function useModal(options: UseModalOptions = {}) {
  const { initialOpen = false, onOpen, onClose } = options;

  const [isOpen, setIsOpen] = useState(initialOpen);
  const [isLoading, setIsLoading] = useState(false);

  const open = useCallback(() => {
    setIsOpen(true);
    onOpen?.();
  }, [onOpen]);

  const close = useCallback(() => {
    setIsOpen(false);
    onClose?.();
  }, [onClose]);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    isOpen,
    isLoading,
    open,
    close,
    toggle,
    setLoading,
  };
}
