import { useCallback, useEffect, useRef, useState } from "react";
import { storageGet, storageSet, watchKey, type StorageArea } from "@/lib/storage";

/**
 * React state backed by chrome.storage, kept in sync across every open
 * popup/options/profiles instance via chrome.storage.onChanged.
 */
export function useStoredState<T>(
  key: string,
  fallback: T,
  area: StorageArea = "sync",
): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(fallback);
  const [loaded, setLoaded] = useState(false);
  const writingSelf = useRef(false);

  useEffect(() => {
    let cancelled = false;
    void storageGet<T>(key, fallback, area === "local").then((v) => {
      if (!cancelled) {
        setValue(v);
        setLoaded(true);
      }
    });
    const unwatch = watchKey(key, (newValue) => {
      if (writingSelf.current) {
        writingSelf.current = false;
        return;
      }
      setValue((newValue as T) ?? fallback);
    });
    return () => {
      cancelled = true;
      unwatch();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, area]);

  const update = useCallback(
    (next: T) => {
      writingSelf.current = true;
      setValue(next);
      void storageSet(key, next, area === "local");
    },
    [key, area],
  );

  return [value, update, loaded];
}
