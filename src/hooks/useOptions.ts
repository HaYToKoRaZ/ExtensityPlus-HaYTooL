import { useCallback } from "react";
import { useStoredState } from "./useStoredState";
import { DEFAULT_OPTIONS, type ExtendedOptions } from "@/lib/types";

export function useOptions() {
  const [options, setOptions, loaded] = useStoredState<ExtendedOptions>(
    "options",
    DEFAULT_OPTIONS,
    "sync",
  );

  const setOption = useCallback(
    <K extends keyof ExtendedOptions>(key: K, value: ExtendedOptions[K]) => {
      setOptions({ ...options, [key]: value });
    },
    [options, setOptions],
  );

  return { options, setOption, setOptions, loaded };
}
