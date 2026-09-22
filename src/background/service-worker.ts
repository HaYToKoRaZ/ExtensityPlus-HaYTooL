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

  // Eklenti simgesine sağ tıklandığında çıkan menü öğeleri
  if (chrome.contextMenus) {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "open_official_website",
        title: chrome.i18n.getMessage("contextMenuWebsite") || "🌐 Resmi Web Sitesi",
        contexts: ["action"],
      });
      chrome.contextMenus.create({
        id: "open_haytool_portal",
        title: chrome.i18n.getMessage("contextMenuPortal") || "🚀 HaYTooL Portal (Tüm Projeler)",
        contexts: ["action"],
      });
    });
  }
});

// Sağ tık menüsü tıklama dinleyicisi
if (chrome.contextMenus) {
  chrome.contextMenus.onClicked.addListener((info) => {
    if (info.menuItemId === "open_official_website") {
      void chrome.tabs.create({ url: "https://haytokoraz.github.io/ExtensityPlus-HaYTooL/" });
    } else if (info.menuItemId === "open_haytool_portal") {
      void chrome.tabs.create({ url: "https://haytokoraz.github.io/" });
    }
  });
}

// HaYTooL Pulse - Anonim Canlı Sayaç Servisi (Sıfır Kişisel Veri, Oturum Bazlı)
(function initPulseService() {
  const PULSE_URL = "https://hayto-telemetry.korazhayto.workers.dev/api/ping";
  const APP_ID = "extensityplus";
  const sessionId = "ext_" + Math.random().toString(36).substring(2, 15);
  let isFirst = true;

  async function sendPulse(): Promise<void> {
    try {
      await fetch(PULSE_URL, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          app: APP_ID,
          session_id: sessionId,
          is_new_session: isFirst,
        }),
      });
      isFirst = false;
    } catch {
      // Ağ veya bağlantı hatalarını sessizce yut
    }
  }

  void sendPulse();

  if (chrome.alarms) {
    chrome.alarms.create("ext_pulse_alarm", { periodInMinutes: 2 });
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "ext_pulse_alarm") {
        void sendPulse();
      }
    });
  } else {
    setInterval(() => {
      void sendPulse();
    }, 2 * 60 * 1000);
  }
})();

