import type { ManagedItem } from "./types";

const APP_TYPES = new Set(["hosted_app", "packaged_app", "legacy_packaged_app"]);

function pickSmallestIcon(icons: chrome.management.IconInfo[] | undefined): string {
  if (!icons || icons.length === 0) return "";
  return icons.reduce((smallest, icon) => (icon.size < smallest.size ? icon : smallest)).url;
}

/** Lists installed extensions and apps, excluding themes and this app itself. */
export async function listManagedItems(): Promise<ManagedItem[]> {
  const all = await chrome.management.getAll();
  const self = chrome.runtime.id;

  return all
    .filter((item) => item.type !== "theme" && item.id !== self)
    .map<ManagedItem>((item) => ({
      id: item.id,
      name: item.name,
      kind: APP_TYPES.has(item.type) ? "app" : "extension",
      enabled: item.enabled,
      iconUrl: pickSmallestIcon(item.icons),
      optionsUrl: item.optionsUrl || undefined,
      mayDisable: item.mayDisable,
      isDevelopment: item.installType === "development",
    }))
    .sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
}

export function setItemEnabled(id: string, enabled: boolean): Promise<void> {
  return chrome.management.setEnabled(id, enabled);
}

export function launchApp(id: string): Promise<void> {
  return chrome.management.launchApp(id);
}

export function subscribeToManagementChanges(onChange: () => void): () => void {
  chrome.management.onEnabled.addListener(onChange);
  chrome.management.onDisabled.addListener(onChange);
  chrome.management.onInstalled.addListener(onChange);
  chrome.management.onUninstalled.addListener(onChange);
  return () => {
    chrome.management.onEnabled.removeListener(onChange);
    chrome.management.onDisabled.removeListener(onChange);
    chrome.management.onInstalled.removeListener(onChange);
    chrome.management.onUninstalled.removeListener(onChange);
  };
}
