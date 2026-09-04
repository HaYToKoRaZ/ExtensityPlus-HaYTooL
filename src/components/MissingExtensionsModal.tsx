import { useEffect, useState } from "react";
import { ExternalLink, Check, Copy, AlertTriangle, Search, Puzzle } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import { subscribeToManagementChanges } from "@/lib/chrome-management";
import type { MissingExtensionItem } from "@/lib/backup";

interface MissingExtensionsModalProps {
  missingItems: MissingExtensionItem[];
  onClose: () => void;
}

export function MissingExtensionsModal({ missingItems, onClose }: MissingExtensionsModalProps) {
  const { t } = useTranslation();
  const [installedIds, setInstalledIds] = useState<Set<string>>(new Set());
  const [copiedAll, setCopiedAll] = useState(false);

  // Canlı Kurulum Dinleyicisi: Kullanıcı mağazadan yüklediği anda arayüzde yeşil onay rozeti belirir
  useEffect(() => {
    const unwatch = subscribeToManagementChanges(() => {
      void chrome.management.getAll().then((all) => {
        const currentIds = new Set(all.map((item) => item.id));
        setInstalledIds(currentIds);
      });
    });
    return () => unwatch();
  }, []);

  const openAllInStore = () => {
    missingItems.forEach((item) => {
      const url = item.storeUrl || item.searchUrl;
      if (url) {
        void chrome.tabs.create({ url, active: false });
      }
    });
  };

  const copyAllLinks = async () => {
    const lines = missingItems
      .filter((i) => i.storeUrl || i.searchUrl)
      .map((i) => `${i.name}: ${i.storeUrl || i.searchUrl}`)
      .join("\n");
    await navigator.clipboard.writeText(lines);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-white shadow-2xl dark:border-graphite-line dark:bg-graphite">
        {/* Modal Başlığı */}
        <div className="flex items-start justify-between border-b border-line p-5 dark:border-graphite-line">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ash-900 dark:text-white">
                {t("missingExtensionsModalTitle")} ({missingItems.length})
              </h3>
              <p className="mt-0.5 text-xs text-ash-500 dark:text-ash-400">
                {t("missingExtensionsModalDesc")}
              </p>
            </div>
          </div>
        </div>

        {/* Toplu Eylem Butonları */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-ash-50/50 px-5 py-3 dark:border-graphite-line dark:bg-graphite-soft/40">
          <button
            type="button"
            onClick={openAllInStore}
            className="inline-flex items-center gap-2 rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white shadow-sm transition-all hover:bg-signal-dark active:scale-95"
          >
            <span>{t("openAllInStoreBtn")}</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={copyAllLinks}
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white px-3 py-2 text-xs font-medium text-ash-700 transition-colors hover:bg-ash-100 dark:border-graphite-line dark:bg-graphite dark:text-ash-200 dark:hover:bg-graphite-line"
          >
            {copiedAll ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 text-ash-400" />}
            <span>{copiedAll ? t("copiedToClipboard") : t("copyAllStoreLinksBtn")}</span>
          </button>
        </div>

        {/* Eksik Eklentiler Listesi */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {missingItems.map((item) => {
            const isInstalledNow = installedIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border p-3.5 transition-all ${
                  isInstalledNow
                    ? "border-emerald-500/40 bg-emerald-50/20 dark:border-emerald-500/30 dark:bg-emerald-950/10"
                    : "border-line bg-white hover:border-ash-300 dark:border-graphite-line dark:bg-graphite dark:hover:border-graphite-soft"
                }`}
              >
                <div className="flex items-start gap-3 min-w-0">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-ash-100 text-ash-600 dark:bg-graphite-soft dark:text-ash-300">
                    <Puzzle className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13.5px] text-ash-900 dark:text-white truncate max-w-[280px]">
                        {item.name}
                      </span>
                      {item.wasEnabled ? (
                        <span className="rounded-md bg-signal/10 px-1.5 py-0.5 text-[10px] font-semibold text-signal-dark dark:text-signal">
                          {t("wasEnabledBadge")}
                        </span>
                      ) : (
                        <span className="rounded-md bg-ash-100 px-1.5 py-0.5 text-[10px] font-semibold text-ash-500 dark:bg-graphite-soft dark:text-ash-400">
                          {t("wasDisabledBadge")}
                        </span>
                      )}
                    </div>

                    {item.isDevelopment ? (
                      <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                        {t("unpackedNotice")}
                      </p>
                    ) : (
                      <p className="mt-0.5 text-[11px] text-ash-400 font-mono truncate">
                        ID: {item.id}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {isInstalledNow ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3.5 w-3.5" />
                      {t("installedLiveBadge")}
                    </span>
                  ) : item.isDevelopment ? (
                    <span className="text-[11px] text-ash-400 italic">
                      Unpacked
                    </span>
                  ) : (
                    <>
                      {item.storeUrl && (
                        <a
                          href={item.storeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-ash-50 px-2.5 py-1.5 text-xs font-medium text-signal-dark hover:border-signal hover:bg-signal hover:text-white transition-all dark:border-graphite-line dark:bg-graphite-soft dark:text-signal dark:hover:bg-signal dark:hover:text-white"
                        >
                          <span>{t("openInStore")}</span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      {item.searchUrl && (
                        <a
                          href={item.searchUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 rounded-lg border border-line px-2 py-1.5 text-xs font-medium text-ash-500 hover:text-ash-800 dark:border-graphite-line dark:text-ash-400 dark:hover:text-white transition-colors"
                          title={t("searchInStore")}
                        >
                          <Search className="h-3.5 w-3.5" />
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Alt Çubuğu */}
        <div className="flex justify-end border-t border-line p-4 dark:border-graphite-line">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ash-100 px-5 py-2 text-xs font-semibold text-ash-800 hover:bg-ash-200 dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite-line transition-colors"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
