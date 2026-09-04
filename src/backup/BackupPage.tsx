import { useEffect, useRef, useState } from "react";
import {
  Cloud,
  Download,
  Upload,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  History,
  Eye,
  EyeOff,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  HardDrive,
  CheckCircle2,
} from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { MissingExtensionsModal } from "@/components/MissingExtensionsModal";
import { useTheme } from "@/hooks/useTheme";
import { useOptions } from "@/hooks/useOptions";
import { useTranslation } from "@/hooks/useTranslation";
import {
  applyBackup,
  computeBackupDiff,
  copyBackupToClipboard,
  downloadBackupFile,
  exportBackupData,
  validateAndParseBackup,
  type BackupDiffSummary,
  type BackupPayload,
  type MissingExtensionItem,
} from "@/lib/backup";
import {
  createBackupGist,
  fetchGistContent,
  findExistingBackupGist,
  getGistCommitHistory,
  getGistVault,
  pushBackupToGist,
  verifyGitHubToken,
  STORAGE_KEY_TOKEN,
  STORAGE_KEY_GIST_ID,
  STORAGE_KEY_USER_PROFILE,
  type GistCommitInfo,
  type GistVault,
  type GitHubUserProfile,
} from "@/lib/gist-sync";
import { detectCurrentBrowser } from "@/lib/store-resolver";
import { storageGet, storageSet } from "@/lib/storage";

function getDefaultSlotName(): string {
  const browser = detectCurrentBrowser();
  const browserLabel =
    browser === "helium"
      ? "Helium"
      : browser === "edge"
      ? "Edge"
      : browser === "chrome"
      ? "Chrome"
      : browser === "brave"
      ? "Brave"
      : "Browser";

  const ua = (typeof navigator !== "undefined" ? navigator.userAgent : "").toLowerCase();
  const osLabel = ua.includes("win")
    ? "Windows"
    : ua.includes("mac")
    ? "macOS"
    : ua.includes("linux")
    ? "Linux"
    : "Device";

  return `${browserLabel} / ${osLabel}`;
}

export function BackupPage() {
  const { options } = useOptions();
  const { t } = useTranslation();
  useTheme(options.theme);

  // GitHub Auth State
  const [tokenInput, setTokenInput] = useState("");
  const [showToken, setShowToken] = useState(false);
  const [userProfile, setUserProfile] = useState<GitHubUserProfile | null>(null);
  const [activeGist, setActiveGist] = useState<GistVault | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Cloud Backup & Slot State (Otomatik tespit edilen tarayıcı ve OS)
  const [slotName, setSlotName] = useState(getDefaultSlotName);
  const [cloudPushing, setCloudPushing] = useState(false);
  const [cloudSuccessMsg, setCloudSuccessMsg] = useState<string | null>(null);

  // Cloud Pull & Time Machine State
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [commitHistory, setCommitHistory] = useState<GistCommitInfo[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<string>("");
  const [showTimeMachine, setShowTimeMachine] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Diff & Preview State
  const [stagedBackup, setStagedBackup] = useState<BackupPayload | null>(null);
  const [diffSummary, setDiffSummary] = useState<BackupDiffSummary | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreSuccessPing, setRestoreSuccessPing] = useState(false);

  // Local Clipboard / Paste Modal
  const [showPasteModal, setShowPasteModal] = useState(false);
  const [pasteInput, setPasteInput] = useState("");
  const [copiedPing, setCopiedPing] = useState(false);

  // Missing Extensions Assistant
  const [missingItems, setMissingItems] = useState<MissingExtensionItem[]>([]);
  const [showMissingModal, setShowMissingModal] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tarayıcı başlangıcında kayıtlı Token ve Gist'i yükle
  useEffect(() => {
    void (async () => {
      const savedToken = await storageGet<string>(STORAGE_KEY_TOKEN, "", true);
      const savedGistId = await storageGet<string>(STORAGE_KEY_GIST_ID, "", true);
      const savedProfile = await storageGet<GitHubUserProfile | null>(STORAGE_KEY_USER_PROFILE, null, true);

      if (savedProfile) {
        setUserProfile(savedProfile);
      }

      if (savedToken) {
        setTokenInput(savedToken);
        await handleConnect(savedToken, savedGistId);
      }
    })();
  }, []);

  // GitHub Token ile Bağlanma ve Akıllı Gist Keşfi
  const handleConnect = async (tokenToUse: string, preferredGistId?: string) => {
    const token = tokenToUse.trim();
    if (!token) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      // 1. Token'ı doğrula ve profil çek
      const profile = await verifyGitHubToken(token);
      setUserProfile(profile);
      await storageSet(STORAGE_KEY_TOKEN, token, true);
      await storageSet(STORAGE_KEY_USER_PROFILE, profile, true);

      // 2. Akıllı Gist Keşfi: İster kayıtlı ID'den ister otomatik taramadan kasayı bul
      let vault: GistVault | null = null;
      if (preferredGistId) {
        try {
          vault = await getGistVault(token, preferredGistId);
        } catch {
          vault = null;
        }
      }

      if (!vault) {
        vault = await findExistingBackupGist(token);
      }

      if (vault) {
        setActiveGist(vault);
        await storageSet(STORAGE_KEY_GIST_ID, vault.id, true);

        // Dosya / Slot listesini hazırla
        const files = Object.keys(vault.files || {});
        setAvailableSlots(files);
        if (files.length > 0) {
          setSelectedSlot(files[0]);
        }
      }
    } catch (err: any) {
      setAuthError(err.message || "Failed to connect to GitHub");
      setUserProfile(null);
      setActiveGist(null);
      await storageSet(STORAGE_KEY_USER_PROFILE, null, true);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDisconnect = async () => {
    await storageSet(STORAGE_KEY_TOKEN, "", true);
    await storageSet(STORAGE_KEY_GIST_ID, "", true);
    await storageSet(STORAGE_KEY_USER_PROFILE, null, true);
    setUserProfile(null);
    setActiveGist(null);
    setTokenInput("");
    setStagedBackup(null);
    setDiffSummary(null);
  };

  // Buluta Yedek Gönderme (Gist Push)
  const handlePushToCloud = async () => {
    if (!userProfile || !tokenInput) return;

    setCloudPushing(true);
    setCloudSuccessMsg(null);

    try {
      const data = await exportBackupData();
      const rawJson = JSON.stringify(data, null, 2);

      // Slot dosya ismi (ör. "helium-work.json" veya "extensityplus-backup.json")
      const cleanSlot = (slotName.trim().replace(/[^a-zA-Z0-9_-]/g, "-") || "backup").toLowerCase();
      const filename = cleanSlot.endsWith(".json") ? cleanSlot : `${cleanSlot}.json`;

      let updatedVault: GistVault;
      if (activeGist) {
        updatedVault = await pushBackupToGist(tokenInput, activeGist.id, rawJson, filename);
      } else {
        updatedVault = await createBackupGist(tokenInput, rawJson, filename);
      }

      setActiveGist(updatedVault);
      await storageSet(STORAGE_KEY_GIST_ID, updatedVault.id, true);

      const files = Object.keys(updatedVault.files || {});
      setAvailableSlots(files);
      setSelectedSlot(filename);

      setCloudSuccessMsg(t("pushSuccess"));
      setTimeout(() => setCloudSuccessMsg(null), 3000);
    } catch (err: any) {
      alert(err.message || "Cloud push failed");
    } finally {
      setCloudPushing(false);
    }
  };

  // Buluttan Yedeği Çekme ve Fark Hazırlama (Stage & Diff)
  const handleStageCloudBackup = async (filename: string, commitSha?: string) => {
    if (!tokenInput || !activeGist) return;

    setRestoring(true);
    try {
      const content = await fetchGistContent(tokenInput, activeGist.id, filename, commitSha);
      const parsed = validateAndParseBackup(content);
      const diff = await computeBackupDiff(parsed);

      setStagedBackup(parsed);
      setDiffSummary(diff);
    } catch (err: any) {
      alert(err.message || "Failed to load cloud backup");
    } finally {
      setRestoring(false);
    }
  };

  // Zaman Makinesi Commit Listesini Çekme
  const handleToggleTimeMachine = async () => {
    if (!tokenInput || !activeGist) return;

    if (!showTimeMachine) {
      setHistoryLoading(true);
      try {
        const history = await getGistCommitHistory(tokenInput, activeGist.id);
        setCommitHistory(history);
        setShowTimeMachine(true);
      } catch (err: any) {
        alert(err.message || "Failed to load history");
      } finally {
        setHistoryLoading(false);
      }
    } else {
      setShowTimeMachine(false);
    }
  };

  // Yedeği Onaylayıp Tarayıcıya Geri Yükleme
  const handleConfirmRestore = async () => {
    if (!stagedBackup) return;

    setRestoring(true);
    try {
      const result = await applyBackup(stagedBackup);
      setRestoreSuccessPing(true);
      setTimeout(() => setRestoreSuccessPing(false), 2500);

      // Eksik eklentiler varsa asistan modalını tetikle
      if (result.missingExtensions.length > 0) {
        setMissingItems(result.missingExtensions);
        setShowMissingModal(true);
      }
    } catch (err: any) {
      alert(err.message || "Restore failed");
    } finally {
      setRestoring(false);
    }
  };

  // Yerel Dosyadan Yükleme (.json)
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = validateAndParseBackup(text);
      const diff = await computeBackupDiff(parsed);
      setStagedBackup(parsed);
      setDiffSummary(diff);
    } catch (err: any) {
      alert(err.message || "Invalid backup file");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Panodan Yapıştırma
  const handlePasteImport = async () => {
    try {
      const parsed = validateAndParseBackup(pasteInput);
      const diff = await computeBackupDiff(parsed);
      setStagedBackup(parsed);
      setDiffSummary(diff);
      setShowPasteModal(false);
      setPasteInput("");
    } catch (err: any) {
      alert(err.message || "Invalid JSON code");
    }
  };

  return (
    <PageShell active="backup">
      {/* 💡 FORMAT / YENİ CİHAZ BİLGİLENDİRME REHBERİ */}
      <div className="mb-6 rounded-2xl border border-sky-500/20 bg-sky-500/5 p-5 shadow-sm dark:border-sky-400/20 dark:bg-sky-400/5">
        <div className="flex items-start gap-3.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-sky-500/15 text-sky-600 dark:text-sky-400">
            <HelpCircle className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-display text-[14.5px] font-bold text-ash-900 dark:text-white">
              {t("formatNoticeTitle")}
            </h2>
            <p className="mt-1 text-[12.8px] leading-relaxed text-ash-600 dark:text-ash-300">
              {t("formatNoticeDesc")}
            </p>
          </div>
        </div>
      </div>

      {/* 1. GITHUB BULUT SENKRONİZASYONU KARTI */}
      <div className="rounded-2xl border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="flex items-center justify-between border-b border-line px-6 py-4 dark:border-graphite-line">
          <div className="flex items-center gap-2.5">
            <Cloud className="h-5 w-5 text-signal" />
            <h3 className="font-display text-[14px] font-bold uppercase tracking-wider text-ash-800 dark:text-ash-100">
              {t("cloudSyncSection")}
            </h3>
          </div>
          {userProfile && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {t("connectSuccess")} (@{userProfile.login})
            </span>
          )}
        </div>

        <div className="p-6">
          {/* Bağlantı Yoksa Token Giriş Formu */}
          {!userProfile ? (
            <div className="space-y-4">
              <p className="text-xs text-ash-500 dark:text-ash-400 leading-relaxed">
                {t("cloudSyncDesc")}
              </p>

              <div>
                <label className="block text-xs font-semibold text-ash-700 dark:text-ash-200 mb-1.5">
                  {t("githubTokenLabel")}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? "text" : "password"}
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder={t("githubTokenPlaceholder")}
                      className="w-full rounded-xl border border-line bg-ash-50/50 px-3.5 py-2.5 pr-10 text-xs font-mono text-ash-800 placeholder-ash-400 focus:border-signal focus:outline-none dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100"
                    />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-ash-400 hover:text-ash-600 dark:hover:text-ash-200"
                    >
                      {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleConnect(tokenInput)}
                    disabled={authLoading || !tokenInput.trim()}
                    className="inline-flex items-center gap-2 rounded-xl bg-signal px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-signal-dark active:scale-95 disabled:opacity-50"
                  >
                    {authLoading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>{t("saveAndConnect")}</span>
                  </button>
                </div>

                {authError && (
                  <p className="mt-2 text-xs font-medium text-red-500 flex items-center gap-1.5">
                    <AlertCircle className="h-4 w-4" />
                    {authError}
                  </p>
                )}
              </div>

              <div className="pt-2">
                <a
                  href={`https://github.com/settings/tokens/new?description=ExtensityPlus-${detectCurrentBrowser().toUpperCase()}-${new Date().toISOString().slice(0, 10)}&scopes=gist`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-signal hover:underline"
                >
                  <span>{t("howToGetToken")}</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          ) : (
            /* Bağlı Durum: Profil & Bulut Yedekleme İşlemleri */
            <div className="space-y-6">
              {/* Profil & Gist Durum Çubuğu */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-line bg-ash-50/50 p-4 dark:border-graphite-line dark:bg-graphite-soft/40">
                <div className="flex items-center gap-3">
                  <img
                    src={userProfile.avatarUrl}
                    alt={userProfile.login}
                    className="h-10 w-10 rounded-full border border-line shadow-sm"
                  />
                  <div>
                    <h4 className="text-sm font-bold text-ash-900 dark:text-white">
                      {userProfile.name || userProfile.login}
                    </h4>
                    <span className="text-xs text-ash-400 font-mono">@{userProfile.login}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {activeGist && (
                    <a
                      href={activeGist.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-xs font-medium text-ash-700 hover:text-signal dark:border-graphite-line dark:bg-graphite dark:text-ash-200 transition-colors"
                    >
                      <span>{t("viewOnGist")}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => void handleDisconnect()}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-ash-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
                  >
                    {t("disconnect")}
                  </button>
                </div>
              </div>

              {/* Alt Bölüm A: Buluta Yedekleme (Gist Push) */}
              <div className="rounded-xl border border-line p-4 dark:border-graphite-line space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-ash-700 dark:text-ash-200">
                  {t("pushToCloudBtn")}
                </h4>
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <input
                    type="text"
                    value={slotName}
                    onChange={(e) => setSlotName(e.target.value)}
                    placeholder={t("backupNamePlaceholder")}
                    className="flex-1 rounded-xl border border-line bg-ash-50/50 px-3.5 py-2 text-xs text-ash-800 focus:border-signal focus:outline-none dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100"
                  />
                  <button
                    type="button"
                    onClick={() => void handlePushToCloud()}
                    disabled={cloudPushing}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-signal px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-signal-dark active:scale-95 disabled:opacity-50 transition-all"
                  >
                    {cloudPushing && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                    <span>{t("pushToCloudBtn")}</span>
                  </button>
                </div>
                {cloudSuccessMsg && (
                  <p className="text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                    <Check className="h-4 w-4" />
                    {cloudSuccessMsg}
                  </p>
                )}
              </div>

              {/* Alt Bölüm B: Buluttan Geri Yükleme & Çoklu Slot & Zaman Makinesi */}
              <div className="rounded-xl border border-line p-4 dark:border-graphite-line space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-ash-700 dark:text-ash-200">
                    {t("pullFromCloudSection")}
                  </h4>
                  <button
                    type="button"
                    onClick={handleToggleTimeMachine}
                    disabled={!activeGist || historyLoading}
                    className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-950/20 transition-colors"
                  >
                    <History className="h-3.5 w-3.5" />
                    <span>{t("timeMachineBtn")}</span>
                  </button>
                </div>

                {availableSlots.length > 0 ? (
                  <div className="flex flex-col sm:flex-row gap-2.5">
                    <select
                      value={selectedSlot}
                      onChange={(e) => {
                        setSelectedSlot(e.target.value);
                        setSelectedCommit("");
                      }}
                      className="flex-1 rounded-xl border border-line bg-ash-50/50 px-3.5 py-2 text-xs text-ash-800 focus:border-signal focus:outline-none dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100"
                    >
                      {availableSlots.map((file) => (
                        <option key={file} value={file}>
                          📦 {file}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => void handleStageCloudBackup(selectedSlot, selectedCommit)}
                      disabled={restoring}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-white px-5 py-2 text-xs font-semibold text-ash-800 hover:border-signal hover:text-signal dark:border-graphite-line dark:bg-graphite dark:text-ash-100 transition-colors"
                    >
                      {restoring && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                      <span>{t("selectBackupSlot")} & {t("previewTitle")}</span>
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-ash-400 italic">{t("noGistFound")}</p>
                )}

                {/* Zaman Makinesi Açılır Paneli */}
                {showTimeMachine && (
                  <div className="mt-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-purple-700 dark:text-purple-300">
                        {t("timeMachineTitle")}
                      </span>
                    </div>
                    <select
                      value={selectedCommit}
                      onChange={(e) => setSelectedCommit(e.target.value)}
                      className="w-full rounded-lg border border-line bg-white px-3 py-1.5 text-xs text-ash-800 dark:border-graphite-line dark:bg-graphite dark:text-ash-100"
                    >
                      <option value="">-- En Son Güncel Sürüm (Latest) --</option>
                      {commitHistory.map((c) => (
                        <option key={c.version} value={c.version}>
                          🕒 {new Date(c.committedAt).toLocaleString()} ({c.version.slice(0, 7)})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. FARK ÖNİZLEME & GERİ YÜKLEME KARTI (DIFF PREVIEW) */}
      {stagedBackup && diffSummary && (
        <div className="mt-6 rounded-2xl border-2 border-signal/40 bg-white p-6 shadow-xl dark:border-signal/30 dark:bg-graphite animate-fade-in">
          <div className="flex items-center justify-between border-b border-line pb-4 dark:border-graphite-line">
            <div>
              <h3 className="font-display text-base font-bold text-ash-900 dark:text-white">
                {t("diffTitle")}
              </h3>
              <p className="text-xs text-ash-400 mt-0.5">
                {t("previewDate")}: {new Date(stagedBackup.exportedAt).toLocaleString()}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void handleConfirmRestore()}
              disabled={restoring}
              className="inline-flex items-center gap-2 rounded-xl bg-signal px-6 py-2.5 text-xs font-bold text-white shadow-md hover:bg-signal-dark active:scale-95 disabled:opacity-50 transition-all"
            >
              {restoring ? <RefreshCw className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              <span>{restoring ? t("restoring") : t("restoreBtn")}</span>
            </button>
          </div>

          {/* Fark İstatistikleri */}
          <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl bg-emerald-500/10 p-3 text-center dark:bg-emerald-950/20">
              <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                +{diffSummary.toEnableCount}
              </span>
              <p className="text-[11px] font-medium text-ash-500 dark:text-ash-400 mt-0.5">
                {t("diffToEnable")}
              </p>
            </div>

            <div className="rounded-xl bg-amber-500/10 p-3 text-center dark:bg-amber-950/20">
              <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                -{diffSummary.toDisableCount}
              </span>
              <p className="text-[11px] font-medium text-ash-500 dark:text-ash-400 mt-0.5">
                {t("diffToDisable")}
              </p>
            </div>

            <div className="rounded-xl bg-blue-500/10 p-3 text-center dark:bg-blue-950/20">
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                +{diffSummary.newProfilesCount}
              </span>
              <p className="text-[11px] font-medium text-ash-500 dark:text-ash-400 mt-0.5">
                {t("diffNewProfiles")}
              </p>
            </div>

            <div className="rounded-xl bg-purple-500/10 p-3 text-center dark:bg-purple-950/20">
              <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
                {diffSummary.missingExtensions.length}
              </span>
              <p className="text-[11px] font-medium text-ash-500 dark:text-ash-400 mt-0.5">
                {t("diffMissing")}
              </p>
            </div>
          </div>

          {restoreSuccessPing && (
            <div className="mt-4 rounded-xl bg-emerald-500/15 p-3 text-center text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-center gap-2">
              <Check className="h-4 w-4" />
              <span>{t("restoreSuccess")}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. YEREL DOSYA & PANO YEDEKLEME KARTI (OFFLINE) */}
      <div className="mt-6 rounded-2xl border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-6 py-4 dark:border-graphite-line flex items-center gap-2.5">
          <HardDrive className="h-5 w-5 text-ash-500 dark:text-ash-300" />
          <h3 className="font-display text-[14px] font-bold uppercase tracking-wider text-ash-800 dark:text-ash-100">
            {t("localBackupSection")}
          </h3>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-ash-500 dark:text-ash-400 leading-relaxed">
            {t("localBackupDesc")}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* JSON İndir */}
            <button
              type="button"
              onClick={async () => {
                const data = await exportBackupData();
                downloadBackupFile(data);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-ash-50/70 p-3.5 text-xs font-semibold text-ash-800 hover:border-signal hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite transition-all"
            >
              <Download className="h-4 w-4 text-signal" />
              <span>{t("downloadJsonBtn")}</span>
            </button>

            {/* Panoya Kopyala */}
            <button
              type="button"
              onClick={async () => {
                const data = await exportBackupData();
                await copyBackupToClipboard(data);
                setCopiedPing(true);
                setTimeout(() => setCopiedPing(false), 2000);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-ash-50/70 p-3.5 text-xs font-semibold text-ash-800 hover:border-signal hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite transition-all"
            >
              {copiedPing ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-ash-400" />}
              <span>{copiedPing ? t("copiedToClipboard") : t("copyClipboardBtn")}</span>
            </button>

            {/* Dosyadan Yükle */}
            <div>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleFileImport}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-ash-50/70 p-3.5 text-xs font-semibold text-ash-800 hover:border-signal hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite transition-all"
              >
                <Upload className="h-4 w-4 text-purple-500" />
                <span>{t("importJsonBtn")}</span>
              </button>
            </div>

            {/* Panodan Yapıştır */}
            <button
              type="button"
              onClick={() => setShowPasteModal(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-line bg-ash-50/70 p-3.5 text-xs font-semibold text-ash-800 hover:border-signal hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100 dark:hover:bg-graphite transition-all"
            >
              <Copy className="h-4 w-4 text-amber-500" />
              <span>{t("pasteClipboardBtn")}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Panodan JSON Yapıştırma Modalı */}
      {showPasteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border border-line bg-white p-5 shadow-2xl dark:border-graphite-line dark:bg-graphite">
            <h3 className="font-display text-sm font-bold text-ash-900 dark:text-white">
              {t("pasteModalTitle")}
            </h3>
            <textarea
              value={pasteInput}
              onChange={(e) => setPasteInput(e.target.value)}
              placeholder={t("pasteModalPlaceholder")}
              rows={8}
              className="mt-3 w-full rounded-xl border border-line bg-ash-50/50 p-3 text-xs font-mono text-ash-800 placeholder-ash-400 focus:border-signal focus:outline-none dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100"
            />
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowPasteModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-ash-500 hover:bg-ash-100 dark:hover:bg-graphite-soft"
              >
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={() => void handlePasteImport()}
                className="rounded-xl bg-signal px-4 py-2 text-xs font-semibold text-white hover:bg-signal-dark"
              >
                {t("pasteModalConfirm")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Eksik Eklentiler Asistanı Modalı */}
      {showMissingModal && (
        <MissingExtensionsModal
          missingItems={missingItems}
          onClose={() => setShowMissingModal(false)}
        />
      )}
    </PageShell>
  );
}
