import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type RefObject,
} from "react";

// Spec 08: pantalla completa de un elemento y Wake Lock mientras dure.
// El estado sale de `fullscreenchange`, no se supone al pulsar: así Esc y
// cualquier otra salida del navegador mantienen la interfaz correcta.

const noopSubscribe = () => () => {};
const readSupported = () => document.fullscreenEnabled;
const serverSupported = () => false;

export function useFullscreen<T extends HTMLElement>(): {
  ref: RefObject<T | null>;
  /** `document.fullscreenEnabled`; `false` en el servidor y al hidratar. */
  supported: boolean;
  /** ¿Está `ref.current` en pantalla completa ahora mismo? */
  active: boolean;
  /** Entra o sale. El rechazo del navegador se ignora. */
  toggle: () => void;
} {
  const ref = useRef<T>(null);
  // `useSyncExternalStore` da `false` en el servidor y al hidratar, y el valor
  // real después: el HTML del servidor y el del cliente coinciden.
  const supported = useSyncExternalStore(
    noopSubscribe,
    readSupported,
    serverSupported,
  );
  const [active, setActive] = useState(false);

  useEffect(() => {
    const sync = () =>
      setActive(
        document.fullscreenElement !== null &&
          document.fullscreenElement === ref.current,
      );
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  // Al abandonar la pantalla se sale de pantalla completa. Con `cacheComponents`
  // Next no desmonta la ruta anterior: la deja oculta (`display: none`), y un
  // elemento oculto no saca al navegador de pantalla completa por sí solo.
  useEffect(() => {
    const element = ref.current;
    return () => {
      if (element && document.fullscreenElement === element) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // Wake Lock: pedido al entrar, liberado al salir o al desmontar. El navegador
  // lo suelta al ocultar la pestaña, así que se repite al volver a verla.
  // Sin soporte o con rechazo no pasa nada: la pantalla completa sigue igual.
  useEffect(() => {
    // `navigator.wakeLock` no existe en todos los navegadores (ni en contextos
    // no seguros), aunque el tipo diga lo contrario.
    if (!active || !(navigator as { wakeLock?: unknown }).wakeLock) return;
    let sentinel: WakeLockSentinel | null = null;
    let cancelled = false;

    const request = async () => {
      try {
        const lock = await navigator.wakeLock.request("screen");
        if (cancelled) {
          lock.release().catch(() => {});
          return;
        }
        sentinel = lock;
      } catch {
        // Rechazado (batería baja, pestaña oculta…): se ignora.
      }
    };
    const onVisible = () => {
      if (
        document.visibilityState === "visible" &&
        (!sentinel || sentinel.released)
      ) {
        void request();
      }
    };

    void request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisible);
      sentinel?.release().catch(() => {});
    };
  }, [active]);

  const toggle = useCallback(() => {
    const element = ref.current;
    if (!element || !document.fullscreenEnabled) return;
    const change = document.fullscreenElement
      ? document.exitFullscreen()
      : element.requestFullscreen();
    change.catch(() => {});
  }, []);

  return { ref, supported, active, toggle };
}
