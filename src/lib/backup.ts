/**
 * Yedekleme ve Geri Yükleme Çekirdek Servisi (Backup Core Service)
 * 
 * - Eklentiler, profiller ve ayarları evrensel JSON formatında paketler.
 * - Geri yükleme öncesinde mevcut sistemle karşılaştırarak Fark Önizlemesi (Diff) üretir.
 * - Tarayıcıda henüz kurulu olmayan eklentileri (Eksikler) tespit eder.
 */

import { listManagedItems, setItemEnabled } from "./chrome-management";
import { getPreferLocal, storageGet, storageSet } from "./storage";
import { resolveStoreUrls } from "./store-resolver";
import type { ExtendedOptions, ItemKind, ManagedItem } from "./types";
import { DEFAULT_OPTIONS } from "./types";

export interface BackupExtensionItem {
  id: string;
  name: string;
  kind: ItemKind;
  enabled: boolean;
  isDevelopment: boolean;
}

export interface BackupPayload {
  version: number;
  app: "ExtensityPlus-HaYTooL";
  exportedAt: string;
  sourceBrowser: string;
  options: ExtendedOptions;
  profiles: Record<string, string[]>;
  extensions: BackupExtensionItem[];
}

export interface MissingExtensionItem {
  id: string;
  name: string;
  kind: ItemKind;
  wasEnabled: boolean;
  isDevelopment: boolean;
  storeName: string;
  storeUrl: string;
  searchUrl: string;
}

export interface BackupDiffSummary {
  toEnableCount: number;
  toDisableCount: number;
  newProfilesCount: number;
  updatedProfilesCount: number;
  missingExtensions: MissingExtensionItem[];
  currentInstalledCount: number;
  backupExtensionsCount: number;
}

/**
 * Mevcut tarayıcı ortamındaki tüm ayarları, profilleri ve kurulu eklentileri
 * standart yedekleme JSON şemasına dönüştürür.
 */
export async function exportBackupData(): Promise<BackupPayload> {
  const preferLocal = await getPreferLocal();
  const options = await storageGet<ExtendedOptions>("options", DEFAULT_OPTIONS, preferLocal);
  const profiles = await storageGet<Record<string, string[]>>("profiles", {}, preferLocal);
  const managedItems = await listManagedItems();

  const extensions: BackupExtensionItem[] = managedItems.map((item) => ({
    id: item.id,
    name: item.name,
    kind: item.kind,
    enabled: item.enabled,
    isDevelopment: item.isDevelopment,
  }));

  return {
    version: 1,
    app: "ExtensityPlus-HaYTooL",
    exportedAt: new Date().toISOString(),
    sourceBrowser: typeof navigator !== "undefined" ? navigator.userAgent : "Unknown",
    options,
    profiles,
    extensions,
  };
}

/**
 * JSON formatındaki yedek metnini doğrular ve tip güvenli nesneye dönüştürür.
 */
export function validateAndParseBackup(rawJson: string): BackupPayload {
  let parsed: any;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error("Invalid JSON format.");
  }

  if (!parsed || typeof parsed !== "object") {
    throw new Error("Backup file must contain a valid JSON object.");
  }

  if (parsed.app !== "ExtensityPlus-HaYTooL") {
    throw new Error("This file is not a valid Extensity+ HaYTooL backup.");
  }

  if (!parsed.options || !parsed.profiles || !Array.isArray(parsed.extensions)) {
    throw new Error("Corrupted backup schema: missing options, profiles, or extensions.");
  }

  return parsed as BackupPayload;
}

/**
 * Geri yükleme öncesinde mevcut sistemle karşılaştırarak bir fark (diff) özeti üretir.
 */
export async function computeBackupDiff(
  backup: BackupPayload
): Promise<BackupDiffSummary> {
  const currentItems = await listManagedItems();
  const currentMap = new Map<string, ManagedItem>(currentItems.map((i) => [i.id, i]));
  const preferLocal = await getPreferLocal();
  const currentProfiles = await storageGet<Record<string, string[]>>("profiles", {}, preferLocal);

  let toEnableCount = 0;
  let toDisableCount = 0;
  const missingExtensions: MissingExtensionItem[] = [];

  for (const item of backup.extensions) {
    const current = currentMap.get(item.id);
    if (!current) {
      const storeInfo = resolveStoreUrls(item.name, item.id, item.isDevelopment);
      missingExtensions.push({
        id: item.id,
        name: item.name,
        kind: item.kind,
        wasEnabled: item.enabled,
        isDevelopment: item.isDevelopment,
        storeName: storeInfo.storeName,
        storeUrl: storeInfo.storeUrl,
        searchUrl: storeInfo.searchUrl,
      });
    } else {
      if (item.enabled && !current.enabled) {
        toEnableCount++;
      } else if (!item.enabled && current.enabled && current.mayDisable) {
        toDisableCount++;
      }
    }
  }

  let newProfilesCount = 0;
  let updatedProfilesCount = 0;

  for (const [name, ids] of Object.entries(backup.profiles)) {
    if (!(name in currentProfiles)) {
      newProfilesCount++;
    } else {
      const existing = currentProfiles[name] || [];
      if (JSON.stringify(existing.sort()) !== JSON.stringify([...ids].sort())) {
        updatedProfilesCount++;
      }
    }
  }

  return {
    toEnableCount,
    toDisableCount,
    newProfilesCount,
    updatedProfilesCount,
    missingExtensions,
    currentInstalledCount: currentItems.length,
    backupExtensionsCount: backup.extensions.length,
  };
}

/**
 * Yedek verisini tarayıcıya uygular:
 * 1. Seçenekleri (`options`) geri yükler.
 * 2. Profilleri (`profiles`) geri yükler.
 * 3. Kurulu olan eklentilerin aktiflik durumunu günceller.
 * 4. Eksik eklentilerin listesini asistan için döner.
 */
export async function applyBackup(
  backup: BackupPayload
): Promise<{ missingExtensions: MissingExtensionItem[] }> {
  const preferLocal = await getPreferLocal();

  // 1. Ayarları ve Profilleri yaz
  await storageSet("options", backup.options, preferLocal);
  await storageSet("profiles", backup.profiles, preferLocal);

  // 2. Kurulu olanları ayarla
  const currentItems = await listManagedItems();
  const currentMap = new Map<string, ManagedItem>(currentItems.map((i) => [i.id, i]));
  const missingExtensions: MissingExtensionItem[] = [];

  for (const item of backup.extensions) {
    const current = currentMap.get(item.id);
    if (!current) {
      const storeInfo = resolveStoreUrls(item.name, item.id, item.isDevelopment);
      missingExtensions.push({
        id: item.id,
        name: item.name,
        kind: item.kind,
        wasEnabled: item.enabled,
        isDevelopment: item.isDevelopment,
        storeName: storeInfo.storeName,
        storeUrl: storeInfo.storeUrl,
        searchUrl: storeInfo.searchUrl,
      });
    } else if (current.mayDisable && current.enabled !== item.enabled) {
      try {
        await setItemEnabled(item.id, item.enabled);
      } catch {
        // Tarayıcı izin vermeyebilir, yok say
      }
    }
  }

  return { missingExtensions };
}

/**
 * Yedek verisini kullanıcının cihazına .json dosyası olarak indirtir.
 */
export function downloadBackupFile(data: BackupPayload, filenamePrefix = "extensityplus-backup"): void {
  const dateStr = new Date().toISOString().slice(0, 10);
  const filename = `${filenamePrefix}-${dateStr}.json`;
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Yedek JSON verisini panoya kopyalar.
 */
export async function copyBackupToClipboard(data: BackupPayload): Promise<void> {
  const jsonStr = JSON.stringify(data, null, 2);
  await navigator.clipboard.writeText(jsonStr);
}
