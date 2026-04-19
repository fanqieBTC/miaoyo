"use client";

import { useCallback, useSyncExternalStore } from "react";

const eventName = (key: string) => `local-storage:${key}`;

const readLocalStorage = (key: string, fallback: string) => {
  if (typeof window === "undefined") return fallback;
  return window.localStorage.getItem(key) ?? fallback;
};

const subscribeToLocalStorage = (key: string, onStoreChange: () => void) => {
  if (typeof window === "undefined") return () => {};

  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key !== key) return;
    onStoreChange();
  };

  window.addEventListener("storage", handleChange);
  window.addEventListener(eventName(key), handleChange);

  return () => {
    window.removeEventListener("storage", handleChange);
    window.removeEventListener(eventName(key), handleChange);
  };
};

export function useLocalStorageString(key: string, fallback = "") {
  const subscribe = useCallback(
    (onStoreChange: () => void) => subscribeToLocalStorage(key, onStoreChange),
    [key]
  );
  const getSnapshot = useCallback(() => readLocalStorage(key, fallback), [key, fallback]);
  const getServerSnapshot = useCallback(() => fallback, [fallback]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (nextValue: string) => {
      if (typeof window === "undefined") return;

      if (nextValue) {
        window.localStorage.setItem(key, nextValue);
      } else {
        window.localStorage.removeItem(key);
      }
      window.dispatchEvent(new Event(eventName(key)));
    },
    [key]
  );

  return [value, setValue] as const;
}
