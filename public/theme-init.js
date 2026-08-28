// Runs before the page paints. Reads the last known theme from
// localStorage (synchronous) and applies the dark class right away, so
// navigating between options.html and profiles.html does not flash light
// before chrome.storage (async) resolves. useTheme() keeps this cache
// updated and remains the source of truth once options finish loading.
(function () {
  try {
    var theme = localStorage.getItem("extensity-theme") || "system";
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var dark = theme === "dark" || (theme === "system" && media.matches);
    if (dark) {
      document.documentElement.classList.add("dark");
    }
  } catch {
    // localStorage may be unavailable; fall back to the default light look.
  }
})();
