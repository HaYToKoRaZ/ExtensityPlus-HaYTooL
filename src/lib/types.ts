export type ItemKind = "extension" | "app";

/** A single installed extension or app, normalized from chrome.management. */
export interface ManagedItem {
  id: string;
  name: string;
  kind: ItemKind;
  enabled: boolean;
  iconUrl: string;
  optionsUrl?: string;
  mayDisable: boolean;
  isDevelopment: boolean;
}

/** Reserved profile names carry special meaning and can't be deleted. */
export const RESERVED_PROFILE = {
  ALWAYS_ON: "__always_on",
  FAVORITES: "__favorites",
} as const;

export type ReservedProfileName = (typeof RESERVED_PROFILE)[keyof typeof RESERVED_PROFILE];

export interface Profile {
  name: string;
  itemIds: string[];
}

export function isReserved(name: string): boolean {
  return name.startsWith("__");
}

export const RESERVED_LABELS: Record<string, string> = {
  [RESERVED_PROFILE.ALWAYS_ON]: "Always On",
  [RESERVED_PROFILE.FAVORITES]: "Favorites",
};

export interface ExtendedOptions {
  showHeader: boolean;
  groupApps: boolean;
  appsFirst: boolean;
  enabledFirst: boolean;
  searchBox: boolean;
  showExtensionOptions: boolean;
  keepAlwaysOnWhenSwitchingOff: boolean;
  showReservedProfiles: boolean;
  theme: "system" | "light" | "dark";
}

export const DEFAULT_OPTIONS: ExtendedOptions = {
  showHeader: true,
  groupApps: true,
  appsFirst: false,
  enabledFirst: false,
  searchBox: true,
  showExtensionOptions: true,
  keepAlwaysOnWhenSwitchingOff: false,
  showReservedProfiles: false,
  theme: "system",
};
