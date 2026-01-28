import { useEffect, useRef } from "react";

const SESSION_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutos
const INACTIVITY_CHECK_INTERVAL = 1000; // Verificar cada segundo

export function useSessionTimeout(onTimeout: () => void) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastActivityRef = useRef<number>(Date.now());

  const resetTimeout = () => {
    lastActivityRef.current = Date.now();

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      onTimeout();
    }, SESSION_TIMEOUT_MS);
  };

  useEffect(() => {
    // Escuchar eventos de actividad del usuario
    const handleActivity = () => {
      resetTimeout();
    };

    // Eventos que indican actividad
    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Iniciar el timeout
    resetTimeout();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [onTimeout]);
}
