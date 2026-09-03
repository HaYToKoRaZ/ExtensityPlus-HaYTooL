import { useEffect } from "react";
import type { ExtendedOptions } from "@/lib/types";

const THEME_CACHE_KEY = "extensity-theme";
const CUSTOM_THEME_CLASSES = ["theme-youtube", "theme-discord", "theme-matrix"];

export function useTheme(theme: ExtendedOptions["theme"]) {
  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      // Onceki ozel tema siniflarini temizle
      CUSTOM_THEME_CLASSES.forEach((cls) => root.classList.remove(cls));

      if (theme === "youtube") {
        root.classList.add("dark", "theme-youtube");
      } else if (theme === "discord") {
        root.classList.add("dark", "theme-discord");
      } else if (theme === "matrix") {
        root.classList.add("dark", "theme-matrix");
      } else {
        const dark = theme === "dark" || (theme === "system" && media.matches);
        root.classList.toggle("dark", dark);
      }
    };

    apply();

    try {
      localStorage.setItem(THEME_CACHE_KEY, theme);
    } catch {
      // Ignore
    }

    if (theme === "system") {
      media.addEventListener("change", apply);
      return () => media.removeEventListener("change", apply);
    }
  }, [theme]);
}
