(function () {
  try {
    var theme = localStorage.getItem("extensity-theme") || "system";
    var media = window.matchMedia("(prefers-color-scheme: dark)");
    var root = document.documentElement;

    root.classList.remove("theme-youtube", "theme-discord", "theme-matrix");

    if (theme === "youtube") {
      root.classList.add("dark", "theme-youtube");
    } else if (theme === "discord") {
      root.classList.add("dark", "theme-discord");
    } else if (theme === "matrix") {
      root.classList.add("dark", "theme-matrix");
    } else {
      var dark = theme === "dark" || (theme === "system" && media.matches);
      if (dark) {
        root.classList.add("dark");
      }
    }
  } catch {
    // localStorage may be unavailable
  }
})();
