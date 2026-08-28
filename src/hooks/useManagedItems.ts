import { useCallback, useEffect, useState } from "react";
import {
  listManagedItems,
  setItemEnabled,
  subscribeToManagementChanges,
} from "@/lib/chrome-management";
import type { ManagedItem } from "@/lib/types";

export function useManagedItems() {
  const [items, setItems] = useState<ManagedItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = useCallback(async () => {
    const next = await listManagedItems();
    setItems(next);
    setLoaded(true);
  }, []);

  useEffect(() => {
    void refresh();
    return subscribeToManagementChanges(() => void refresh());
  }, [refresh]);

  /** Optimistically flips local state, then calls the management API. */
  const setEnabled = useCallback((id: string, enabled: boolean) => {
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, enabled } : i)));
    void setItemEnabled(id, enabled).catch(() => {
      void refresh();
    });
  }, [refresh]);

  const toggle = useCallback(
    (id: string) => {
      const item = items.find((i) => i.id === id);
      if (item) setEnabled(id, !item.enabled);
    },
    [items, setEnabled],
  );

  const setManyEnabled = useCallback(
    (ids: string[], enabled: boolean) => {
      const idSet = new Set(ids);
      setItems((prev) => prev.map((i) => (idSet.has(i.id) ? { ...i, enabled } : i)));
      for (const id of ids) void setItemEnabled(id, enabled);
    },
    [],
  );

  return { items, loaded, refresh, toggle, setEnabled, setManyEnabled };
}
