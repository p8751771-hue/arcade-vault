"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

export interface SessionUser {
  name: string; // en mayúsculas, máximo 14 caracteres
}

export interface SessionContextValue {
  user: SessionUser | null;
  signIn(name: string): void; // guarda en localStorage["av_user"]
  signOut(): void; // borra localStorage["av_user"]
}

const STORAGE_KEY = "av_user";
const MAX_NAME_LENGTH = 14;

// Pequeño store externo sobre localStorage. En el servidor y en la hidratación
// el snapshot es `null`, así que servidor y primer render de cliente coinciden;
// React vuelve a renderizar con el valor real justo después.
// `memoryValue` mantiene la sesión viva si localStorage no está disponible.
let memoryValue: string | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

function getSnapshot(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryValue;
  }
}

function getServerSnapshot(): string | null {
  return null;
}

function write(value: string | null) {
  memoryValue = value;
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, value);
  } catch {
    // Sin localStorage el usuario simulado simplemente no persiste.
  }
  listeners.forEach((listener) => listener());
}

function parseUser(raw: string | null): SessionUser | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      "name" in parsed &&
      typeof parsed.name === "string" &&
      parsed.name
    ) {
      return { name: parsed.name };
    }
  } catch {
    // JSON corrupto: se trata como sin sesión.
  }
  return null;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const user = useMemo(() => parseUser(raw), [raw]);

  const signIn = useCallback((name: string) => {
    const normalized = name.trim().slice(0, MAX_NAME_LENGTH).toUpperCase();
    if (!normalized) return;
    write(JSON.stringify({ name: normalized } satisfies SessionUser));
  }, []);

  const signOut = useCallback(() => write(null), []);

  const value = useMemo(
    () => ({ user, signIn, signOut }),
    [user, signIn, signOut],
  );

  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession debe usarse dentro de <SessionProvider>.");
  return ctx;
}
