/**
 * Thin, typed wrapper around chrome.storage.
 *
 * Chrome Sync Storage has a strict per-item quota (~8KB) and item-count quota,
 * which large profile lists can exceed. Extensity's original behavior was to
 * transparently fall back to local storage when that happens; we keep that
 * behavior via `storagePreferLocal`, a single sync-stored flag, so a profile
 * export from one device stays consistent with the rest of the (small)
 * settings, while heavy profile data can live locally when needed.
 */

export type StorageArea = "sync" | "local";

const LOCAL_FALLBACK_FLAG = "storagePreferLocal";

function area(a: StorageArea): chrome.storage.StorageArea {
  return a === "sync" ? chrome.storage.sync : chrome.storage.local;
}

export async function getPreferLocal(): Promise<boolean> {
  const v = await chrome.storage.sync.get(LOCAL_FALLBACK_FLAG);
  return Boolean(v[LOCAL_FALLBACK_FLAG]);
}

async function setPreferLocal(value: boolean): Promise<void> {
  await chrome.storage.sync.set({ [LOCAL_FALLBACK_FLAG]: value });
}

export async function storageGet<T>(key: string, fallback: T, preferLocal = false): Promise<T> {
  const a = preferLocal ? "local" : "sync";
  const result = await area(a).get(key);
  return key in result ? (result[key] as T) : fallback;
}

/**
 * Writes a value, preferring sync storage. If the value is too large for
 * sync (QUOTA_BYTES_PER_ITEM / MAX_ITEMS), transparently retries against
 * local storage and remembers that choice so future writes/reads for this
 * key go straight to local.
 */
export async function storageSet(key: string, value: unknown, preferLocal = false): Promise<void> {
  if (preferLocal) {
    await chrome.storage.local.set({ [key]: value });
    return;
  }

  await new Promise<void>((resolve) => {
    chrome.storage.sync.set({ [key]: value }, () => {
      if (chrome.runtime.lastError) {
        void setPreferLocal(true);
        chrome.storage.local.set({ [key]: value }, () => resolve());
      } else {
        resolve();
      }
    });
  });
}

/**
 * Subscribes to changes for a single key across either storage area.
 * Returns an unsubscribe function.
 */
export function watchKey(key: string, onChange: (newValue: unknown) => void): () => void {
  const listener = (
    changes: { [key: string]: chrome.storage.StorageChange },
    _areaName: string,
  ) => {
    if (key in changes) {
      onChange(changes[key].newValue);
    }
  };
  chrome.storage.onChanged.addListener(listener);
  return () => chrome.storage.onChanged.removeListener(listener);
}
