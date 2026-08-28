import { useCallback, useMemo } from "react";
import { useStoredState } from "./useStoredState";
import type { ManagedItem } from "@/lib/types";

interface UseMasterSwitchArgs {
  items: ManagedItem[];
  setManyEnabled: (ids: string[], enabled: boolean) => void;
  alwaysOnIds: string[];
  keepAlwaysOn: boolean;
}

export function useMasterSwitch({
  items,
  setManyEnabled,
  alwaysOnIds,
  keepAlwaysOn,
}: UseMasterSwitchArgs) {
  const [toggledOff, setToggledOff] = useStoredState<string[]>("toggledOff", [], "sync");

  const isTripped = toggledOff.length > 0;

  const extensions = useMemo(() => items.filter((i) => i.kind === "extension"), [items]);

  const flip = useCallback(() => {
    if (isTripped) {
      const idsThatStillExist = toggledOff.filter((id) => items.some((i) => i.id === id));
      setManyEnabled(idsThatStillExist, true);
      setToggledOff([]);
    } else {
      const alwaysOn = new Set(keepAlwaysOn ? alwaysOnIds : []);
      const enabledIds = extensions
        .filter((e) => e.enabled && !alwaysOn.has(e.id))
        .map((e) => e.id);
      setManyEnabled(enabledIds, false);
      setToggledOff(enabledIds);
    }
  }, [isTripped, toggledOff, items, extensions, alwaysOnIds, keepAlwaysOn, setManyEnabled, setToggledOff]);

  return { isTripped, flip };
}
