import { useEffect } from "react";
import type { ExtendedOptions } from "@/lib/types";

const THEME_CACHE_KEY = "extensity-theme";

export function useTheme(theme: ExtendedOptions["theme"]) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const dark = theme === "dark" || (theme === "system" && media.matches);
      root.classList.toggle("dark", dark);
    };

    apply();

    // Cache the raw preference so the next page load (index.html,
    // options.html, profiles.html are separate documents) can apply it
    // synchronously via public/theme-init.js, before chrome.storage
    // resolves. This is what removes the flash when switching pages.
    try {
      localStorage.setItem(THEME_CACHE_KEY, theme);
    } catch {
      // Ignore; worst case the next page load falls back to system theme.
    }

    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);
}
