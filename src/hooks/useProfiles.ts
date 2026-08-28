import { useCallback, useEffect, useState } from "react";
import { getPreferLocal, storageGet, storageSet, watchKey } from "@/lib/storage";
import { RESERVED_PROFILE, isReserved, type Profile } from "@/lib/types";

type ProfilesMap = Record<string, string[]>;

function toSortedProfiles(map: ProfilesMap): Profile[] {
  return Object.entries(map)
    .map(([name, itemIds]) => ({ name, itemIds }))
    .sort((a, b) => {
      // Reserved profiles (Always On, Favorites) always float to the top.
      const aKey = (isReserved(a.name) ? " " : "") + a.name.toUpperCase();
      const bKey = (isReserved(b.name) ? " " : "") + b.name.toUpperCase();
      return aKey.localeCompare(bKey);
    });
}

export function useProfiles() {
  const [map, setMap] = useState<ProfilesMap>({});
  const [loaded, setLoaded] = useState(false);
  const [preferLocal, setPreferLocal] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const local = await getPreferLocal();
      const stored = await storageGet<ProfilesMap>("profiles", {}, local);
      if (!cancelled) {
        setPreferLocal(local);
        setMap(stored);
        setLoaded(true);
      }
    })();
    const unwatch = watchKey("profiles", (newValue) => {
      setMap((newValue as ProfilesMap) ?? {});
    });
    return () => {
      cancelled = true;
      unwatch();
    };
  }, []);

  const persist = useCallback(
    (next: ProfilesMap) => {
      setMap(next);
      void storageSet("profiles", next, preferLocal);
    },
    [preferLocal],
  );

  const profiles = toSortedProfiles(map);

  const find = useCallback((name: string) => map[name], [map]);

  const upsert = useCallback(
    (name: string, itemIds: string[]) => {
      persist({ ...map, [name]: [...new Set(itemIds)] });
    },
    [map, persist],
  );

  const create = useCallback(
    (name: string, itemIds: string[] = []) => {
      if (!name || name in map) return;
      persist({ ...map, [name]: [...new Set(itemIds)] });
    },
    [map, persist],
  );

  const rename = useCallback(
    (oldName: string, newName: string) => {
      if (!newName || oldName === newName || newName in map) return;
      const next = { ...map };
      next[newName] = next[oldName] ?? [];
      delete next[oldName];
      persist(next);
    },
    [map, persist],
  );

  const remove = useCallback(
    (name: string) => {
      const next = { ...map };
      delete next[name];
      persist(next);
    },
    [map, persist],
  );

  const alwaysOnIds = map[RESERVED_PROFILE.ALWAYS_ON] ?? [];
  const favoriteIds = map[RESERVED_PROFILE.FAVORITES] ?? [];

  const isFavorite = useCallback(
    (id: string) => (map[RESERVED_PROFILE.FAVORITES] ?? []).includes(id),
    [map],
  );

  return {
    profiles,
    loaded,
    find,
    upsert,
    create,
    rename,
    remove,
    alwaysOnIds,
    favoriteIds,
    isFavorite,
  };
}
