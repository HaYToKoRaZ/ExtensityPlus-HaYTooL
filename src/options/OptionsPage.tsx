import { Check, ChevronDown, ExternalLink, Globe, Mail, MessageSquare, Palette } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SettingRow } from "@/components/SettingRow";
import { FlagIcon } from "@/components/FlagIcon";
import { useOptions } from "@/hooks/useOptions";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { LANGUAGE_OPTIONS, THEME_OPTIONS, type Language, type TranslationKey } from "@/lib/i18n";
import { APP_VERSION, CONTACT_EMAIL, REPO_URL, WEBSITE_URL } from "@/lib/branding";
import type { ExtendedOptions } from "@/lib/types";

export function OptionsPage() {
  const { options, setOption, loaded } = useOptions();
  const { t, language, setLanguage } = useTranslation();
  const [savedPing, setSavedPing] = useState(false);
  useTheme(options.theme);

  const set = <K extends keyof ExtendedOptions>(key: K, value: ExtendedOptions[K]) => {
    setOption(key, value);
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 1400);
  };

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    set("language", lang);
  };

  return (
    <PageShell active="options">
      {/* Görünüm ve Dil Ayarları */}
      <div className="rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            {t("appearance")}
          </h2>
          <SavedBadge visible={savedPing} label={t("saved")} />
        </div>
        <div className="px-5">
          {/* Bayraklı Dil Değiştirme */}
          <LanguageRow currentLang={language} onChange={handleLanguageChange} />

          {/* Tema Seçici */}
          <ThemeRow value={options.theme} onChange={(v) => set("theme", v)} />

          <SettingRow
            title={t("showHeader")}
            description={t("showHeaderDesc")}
            checked={options.showHeader}
            onChange={(v) => set("showHeader", v)}
          />
          <SettingRow
            title={t("showSearchBox")}
            description={t("showSearchBoxDesc")}
            checked={options.searchBox}
            onChange={(v) => set("searchBox", v)}
          />
        </div>
      </div>

      {/* Liste Davranış Ayarları */}
      <div className="mt-5 rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            {t("listBehavior")}
          </h2>
        </div>
        <div className="px-5">
          <SettingRow
            title={t("groupApps")}
            description={t("groupAppsDesc")}
            checked={options.groupApps}
            onChange={(v) => set("groupApps", v)}
          />
          <SettingRow
            title={t("appsFirst")}
            description={t("appsFirstDesc")}
            checked={options.appsFirst}
            onChange={(v) => set("appsFirst", v)}
          />
          <SettingRow
            title={t("enabledFirst")}
            description={t("enabledFirstDesc")}
            checked={options.enabledFirst}
            onChange={(v) => set("enabledFirst", v)}
          />
          <SettingRow
            title={t("showGear")}
            description={t("showGearDesc")}
            checked={options.showExtensionOptions}
            onChange={(v) => set("showExtensionOptions", v)}
          />
        </div>
      </div>

      {/* Profil Ayarları */}
      <div className="mt-5 rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            {t("profilesHeading")}
          </h2>
        </div>
        <div className="px-5">
          <SettingRow
            title={t("keepAlwaysOn")}
            description={t("keepAlwaysOnDesc")}
            checked={options.keepAlwaysOnWhenSwitchingOff}
            onChange={(v) => set("keepAlwaysOnWhenSwitchingOff", v)}
          />
          <SettingRow
            title={t("showReservedProfiles")}
            description={t("showReservedProfilesDesc")}
            checked={options.showReservedProfiles}
            onChange={(v) => set("showReservedProfiles", v)}
          />
        </div>
      </div>

      {/* Hakkında, Tıklanabilir Sürüm & İletişim (Öneri & Şikayet) */}
      <div className="mt-5 rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            {t("aboutAndSupport")}
          </h2>
        </div>
        <div className="divide-y divide-line px-5 dark:divide-graphite-line">
          {/* Tıklanabilir Sürüm Bilgisi (Web Sitesine Gider) */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">
                {t("versionLabel")}
              </p>
              <p className="mt-0.5 text-[12.5px] text-ash-500 dark:text-ash-400">
                {t("visitWebsite")}
              </p>
            </div>
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-ash-50 px-3 py-1 text-[12.5px] font-semibold text-signal-dark transition-all hover:border-signal hover:bg-signal hover:text-white dark:border-graphite-line dark:bg-graphite-soft dark:text-signal dark:hover:bg-signal dark:hover:text-white"
            >
              <span>v{APP_VERSION}</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>

          {/* Tıklanabilir Öneri & Şikayet (Mail Açar) */}
          <div className="flex items-center justify-between py-4">
            <div>
              <div className="flex items-center gap-1.5">
                <MessageSquare className="h-4 w-4 text-signal-dark dark:text-signal" />
                <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">
                  {t("feedbackTitle")}
                </p>
              </div>
              <p className="mt-0.5 text-[12.5px] text-ash-500 dark:text-ash-400">
                {t("feedbackDesc")}
              </p>
            </div>
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Extensity%2B%20Geri%20Bildirim%20/%20Öneri&body=Merhaba,%0D%0A%0D%0AUygulama%20hakkındaki%20görüşüm:%0D%0A`}
              className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-ash-50 px-3 py-1.5 text-[12.5px] font-medium text-ash-700 transition-colors hover:border-ash-300 hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-200 dark:hover:bg-graphite-line"
            >
              <Mail className="h-3.5 w-3.5 text-signal-dark dark:text-signal" />
              <span>{t("sendEmail")}</span>
            </a>
          </div>

          {/* GitHub Repo Bağlantısı */}
          <div className="flex items-center justify-between py-4">
            <p className="text-[12.5px] text-ash-500 dark:text-ash-400">
              {t("githubRepo")}
            </p>
            <a
              href={REPO_URL}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-[12.5px] font-medium text-ash-600 hover:text-signal-dark dark:text-ash-300 dark:hover:text-signal"
            >
              <span>HaYToKoRaZ/ExtensityPlus-HaYTooL</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>

      {!loaded && (
        <p className="mt-4 text-[12px] text-ash-400">{t("loadingSettings")}</p>
      )}
    </PageShell>
  );
}

/** Bayraklı Dil Seçim Satırı */
function LanguageRow({
  currentLang,
  onChange,
}: {
  currentLang: Language;
  onChange: (code: Language) => void;
}) {
  const { t } = useTranslation();

  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 dark:border-graphite-line">
      <div>
        <div className="flex items-center gap-1.5">
          <Globe className="h-4 w-4 text-signal-dark dark:text-signal" />
          <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">{t("language")}</p>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ash-500 dark:text-ash-400">
          {t("languageDesc")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        {LANGUAGE_OPTIONS.map((opt) => {
          const isSelected = currentLang === opt.code;
          return (
            <button
              key={opt.code}
              type="button"
              title={opt.label}
              aria-label={opt.label}
              onClick={() => onChange(opt.code)}
              className={`
                relative flex h-10 w-10 items-center justify-center rounded-full border text-xl
                transition-all duration-200 shadow-sm
                hover:scale-110 active:scale-95
                ${
                  isSelected
                    ? "border-signal bg-signal/15 ring-2 ring-signal ring-offset-2 ring-offset-white dark:ring-offset-graphite scale-105"
                    : "border-line bg-ash-50 hover:border-ash-300 hover:bg-white dark:border-graphite-line dark:bg-graphite-soft dark:hover:border-graphite-line opacity-75 hover:opacity-100"
                }
              `}
            >
              <div className="h-6 w-6 overflow-hidden rounded-full shadow-inner flex items-center justify-center">
                <FlagIcon lang={opt.code} className="h-full w-full object-cover" />
              </div>
              {isSelected && (
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-signal text-[9px] text-white">
                  ✓
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Tema Seçim Satırı - Şık ve Kompakt Açılır Menü (Dropdown) */
function ThemeRow({
  value,
  onChange,
}: {
  value: ExtendedOptions["theme"];
  onChange: (v: ExtendedOptions["theme"]) => void;
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const activeTheme = THEME_OPTIONS.find((item) => item.key === value) ?? THEME_OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-6 border-b border-line py-4 dark:border-graphite-line">
      <div>
        <div className="flex items-center gap-1.5">
          <Palette className="h-4 w-4 text-signal-dark dark:text-signal" />
          <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">{t("theme")}</p>
        </div>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ash-500 dark:text-ash-400">
          {t("themeDesc")}
        </p>
      </div>

      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setOpen((prev) => !prev)}
          className={`
            flex items-center gap-2 rounded-pill border px-3.5 py-1.5 text-[13px] font-medium
            transition-all duration-150 shadow-sm
            border-line bg-white hover:border-ash-300 dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-100
            ${open ? "ring-2 ring-signal/50 border-signal" : ""}
          `}
        >
          <span className="text-sm">{activeTheme.badge}</span>
          <span className="min-w-[70px] text-left">{t(activeTheme.labelKey as TranslationKey)}</span>
          <ChevronDown className={`h-3.5 w-3.5 text-ash-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
        </button>

        {open && (
          <>
            {/* Arka plan tıklamasında kapatma katmanı */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setOpen(false)}
            />

            <div className="absolute right-0 top-full z-20 mt-1.5 w-44 rounded-lg border border-line bg-white p-1 shadow-lg dark:border-graphite-line dark:bg-graphite-soft animate-pop-in">
              {THEME_OPTIONS.map((item) => {
                const isSelected = value === item.key;
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => {
                      onChange(item.key as ExtendedOptions["theme"]);
                      setOpen(false);
                    }}
                    className={`
                      flex w-full items-center justify-between gap-2 rounded-sm px-2.5 py-2 text-[12.5px] font-medium
                      transition-colors
                      ${
                        isSelected
                          ? "bg-signal text-white"
                          : "text-ash-700 hover:bg-ash-100 dark:text-ash-200 dark:hover:bg-graphite-line"
                      }
                    `}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{item.badge}</span>
                      <span>{t(item.labelKey as TranslationKey)}</span>
                    </div>
                    {isSelected && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function SavedBadge({ visible, label }: { visible: boolean; label: string }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 text-[11.5px] font-medium text-signal-dark
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      <Check className="h-3 w-3" /> {label}
    </span>
  );
}
