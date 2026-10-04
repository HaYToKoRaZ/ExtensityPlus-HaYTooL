import { useState } from "react";
import {
  Cloud,
  RefreshCw,
  ArrowRight,
  X,
  FileText,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import {
  fetchGistContent,
  deleteBackupFromGist,
  type GistVault,
} from "@/lib/gist-sync";
import { validateAndParseBackup, type BackupPayload } from "@/lib/backup";

export interface SelectedCloudBackup {
  payload: BackupPayload;
  filename: string;
  commitSha?: string;
  sourceLabel: string;
}

interface CloudBackupsModalProps {
  token: string;
  vault: GistVault;
  onSelectBackup: (backup: SelectedCloudBackup) => void;
  onVaultUpdated?: (updatedVault: GistVault) => void;
  onClose: () => void;
}

export function CloudBackupsModal({
  token,
  vault: initialVault,
  onSelectBackup,
  onVaultUpdated,
  onClose,
}: CloudBackupsModalProps) {
  const { t, language } = useTranslation();
  const [vault, setVault] = useState<GistVault>(initialVault);
  const [loadingContentKey, setLoadingContentKey] = useState<string | null>(null);
  const [deletingFilename, setDeletingFilename] = useState<string | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Yerelleştirme metinleri (tr / en / diğer)
  const isTr = language === "tr";

  const labels = {
    title: isTr ? "Bulut Yedekleri (Cihaz Slotları)" : "Cloud Backups (Device Slots)",
    desc: isTr
      ? "GitHub Gist kasanızdaki yedekleri inceleyin, dilediğinizi tek tıkla geri yükleyin veya silin."
      : "Browse backups in your GitHub Gist vault, restore them with one click, or delete unwanted slots.",
    selectAndRestore: isTr ? "Seç & Yükle" : "Select & Restore",
    noSlots: isTr ? "Hesabınızdaki kasada henüz bir yedek dosyası bulunamadı." : "No backup files found in vault yet.",
    lastUpdated: isTr ? "Son Güncelleme" : "Last Updated",
    vaultId: isTr ? "Kasa ID" : "Vault ID",
    deleteTooltip: isTr ? "Bu yedeği kasanızdan silin" : "Delete this backup slot",
    deleteConfirmTitle: isTr ? "Yedeği Silmek İstiyor Musunuz?" : "Delete Backup?",
    deleteConfirmDesc: (name: string) =>
      isTr
        ? `'${name}' adlı bulut yedek dosyası Gist kasanızdan kalıcı olarak silinecek. Onaylıyor musunuz?`
        : `The backup file '${name}' will be permanently deleted from your Gist vault. Continue?`,
    deleteBtn: isTr ? "Evet, Sil" : "Yes, Delete",
    cancelBtn: isTr ? "Vazgeç" : "Cancel",
    deleteSuccess: (name: string) =>
      isTr ? `'${name}' yedeği başarıyla silindi.` : `'${name}' was deleted successfully.`,
    deleteLastSlotWarning: isTr
      ? "Kasadaki son yedek dosyasını silemezsiniz. Gist kasasının varlığını korumak için en az bir yedek bulunmalıdır."
      : "Cannot delete the last remaining backup file in your vault.",
  };

  // Gist'teki dosyalar/slotlar
  const slotFiles = Object.values(vault.files || {});

  const handleChooseSlot = async (filename: string) => {
    setLoadingContentKey(`slot-${filename}`);
    setErrorMsg(null);
    try {
      const raw = await fetchGistContent(token, vault.id, filename);
      const parsed = validateAndParseBackup(raw);
      onSelectBackup({
        payload: parsed,
        filename,
        sourceLabel: filename,
      });
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to load backup");
    } finally {
      setLoadingContentKey(null);
    }
  };

  const handleDeleteSlot = async (filename: string) => {
    if (slotFiles.length <= 1) {
      setErrorMsg(labels.deleteLastSlotWarning);
      setConfirmDeleteTarget(null);
      return;
    }

    setDeletingFilename(filename);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const updated = await deleteBackupFromGist(token, vault.id, filename);
      setVault(updated);
      onVaultUpdated?.(updated);
      setSuccessMsg(labels.deleteSuccess(filename));
      setConfirmDeleteTarget(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to delete backup file");
    } finally {
      setDeletingFilename(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-white shadow-2xl dark:border-graphite-line dark:bg-graphite relative">
        {/* Modal Başlık Çubuğu */}
        <div className="flex items-center justify-between border-b border-line p-5 dark:border-graphite-line">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-signal/15 text-signal">
              <Cloud className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-ash-900 dark:text-white flex items-center gap-2">
                <span>{labels.title}</span>
                <span className="rounded-full bg-signal/10 px-2 py-0.5 text-xs font-semibold text-signal">
                  {slotFiles.length}
                </span>
              </h3>
              <p className="text-xs text-ash-500 dark:text-ash-400">
                {labels.desc}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-ash-400 hover:bg-ash-100 hover:text-ash-700 dark:hover:bg-graphite-soft dark:hover:text-ash-200 transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Bilgilendirme / Hata Bildirimleri */}
        {errorMsg && (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-600 dark:text-red-400 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button
              type="button"
              onClick={() => setErrorMsg(null)}
              className="text-red-600 hover:text-red-800 dark:text-red-400"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mx-5 mt-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400">
            {successMsg}
          </div>
        )}

        {/* Silme Onay Penceresi (Inline Modal) */}
        {confirmDeleteTarget && (
          <div className="mx-5 mt-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 animate-fade-in space-y-3">
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 font-bold text-xs">
              <AlertTriangle className="h-4 w-4" />
              <span>{labels.deleteConfirmTitle}</span>
            </div>
            <p className="text-xs text-ash-700 dark:text-ash-300">
              {labels.deleteConfirmDesc(confirmDeleteTarget)}
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setConfirmDeleteTarget(null)}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-ash-600 hover:bg-ash-200/50 dark:text-ash-300 dark:hover:bg-graphite-soft transition-colors cursor-pointer"
              >
                {labels.cancelBtn}
              </button>
              <button
                type="button"
                onClick={() => void handleDeleteSlot(confirmDeleteTarget)}
                disabled={Boolean(deletingFilename)}
                className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-3.5 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-700 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {deletingFilename ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Trash2 className="h-3.5 w-3.5" />
                )}
                <span>{labels.deleteBtn}</span>
              </button>
            </div>
          </div>
        )}

        {/* Liste Alanı */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {slotFiles.length === 0 ? (
            <div className="py-12 text-center text-xs text-ash-400">
              {labels.noSlots}
            </div>
          ) : (
            slotFiles.map((f) => {
              const isLoading = loadingContentKey === `slot-${f.filename}`;
              const isDeleting = deletingFilename === f.filename;
              const sizeKb = (f.size / 1024).toFixed(1);
              return (
                <div
                  key={f.filename}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-line bg-ash-50/40 p-4 transition-all hover:border-signal/50 hover:bg-ash-50 dark:border-graphite-line dark:bg-graphite-soft/30 dark:hover:border-signal/40 dark:hover:bg-graphite-soft/60"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ash-100 text-ash-600 dark:bg-graphite dark:text-ash-300">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-xs text-ash-900 dark:text-white truncate">
                          {f.filename}
                        </span>
                        <span className="rounded bg-ash-200/60 px-1.5 py-0.5 text-[10px] font-mono text-ash-600 dark:bg-graphite dark:text-ash-300">
                          {sizeKb} KB
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-ash-400">
                        {labels.lastUpdated}: {new Date(vault.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                    {/* Silme Butonu */}
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteTarget(f.filename)}
                      disabled={Boolean(loadingContentKey) || Boolean(deletingFilename)}
                      title={labels.deleteTooltip}
                      className="inline-flex items-center justify-center rounded-xl border border-red-500/20 bg-red-50 p-2 text-red-600 hover:bg-red-100 hover:border-red-500/40 active:scale-95 disabled:opacity-40 dark:border-red-500/20 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-900/30 transition-all cursor-pointer"
                    >
                      {isDeleting ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>

                    {/* Seç & Yükle Butonu */}
                    <button
                      type="button"
                      onClick={() => void handleChooseSlot(f.filename)}
                      disabled={Boolean(loadingContentKey) || Boolean(deletingFilename)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-signal-dark active:scale-95 disabled:opacity-50 transition-all shrink-0 cursor-pointer"
                    >
                      {isLoading ? (
                        <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <ArrowRight className="h-3.5 w-3.5" />
                      )}
                      <span>{labels.selectAndRestore}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Altı */}
        <div className="flex items-center justify-between border-t border-line p-4 dark:border-graphite-line">
          <span className="text-[11px] text-ash-400">
            {labels.vaultId}: <span className="font-mono">{vault.id.slice(0, 12)}...</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-ash-100 px-5 py-2 text-xs font-semibold text-ash-800 hover:bg-ash-200 dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite-line transition-colors cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
