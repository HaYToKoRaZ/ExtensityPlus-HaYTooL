/**
 * Extensity's background service worker.
 *
 * This is intentionally tiny. Manifest V3 service workers are event-driven and non-persistent, so there is no long-lived state here. All app state lives in chrome.storage and is read directly by the popup/options/profiles pages. We only use the worker for one-time lifecycle events.
 */

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Seed sensible defaults on first install so the Options page never
    // renders a flash of "undefined" before storage resolves.
    void chrome.storage.sync.get("options").then((existing) => {
      if (!existing.options) {
        void chrome.storage.sync.set({
          options: {
            showHeader: true,
            groupApps: true,
            appsFirst: false,
            enabledFirst: false,
            searchBox: true,
            showExtensionOptions: true,
            keepAlwaysOnWhenSwitchingOff: false,
            showReservedProfiles: false,
            theme: "system",
          },
        });
      }
    });
  }
});
