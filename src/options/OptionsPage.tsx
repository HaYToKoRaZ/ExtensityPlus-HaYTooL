import { Check } from "lucide-react";
import { useState } from "react";
import { PageShell } from "@/components/PageShell";
import { SettingRow } from "@/components/SettingRow";
import { useOptions } from "@/hooks/useOptions";
import { useTheme } from "@/hooks/useTheme";
import type { ExtendedOptions } from "@/lib/types";

const THEME_LABELS: Record<ExtendedOptions["theme"], string> = {
  system: "Match system",
  light: "Light",
  dark: "Dark",
};

export function OptionsPage() {
  const { options, setOption, loaded } = useOptions();
  const [savedPing, setSavedPing] = useState(false);
  useTheme(options.theme);

  const set = <K extends keyof ExtendedOptions>(key: K, value: ExtendedOptions[K]) => {
    setOption(key, value);
    setSavedPing(true);
    setTimeout(() => setSavedPing(false), 1400);
  };

  return (
    <PageShell active="options">
      <div className="rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="flex items-center justify-between border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            Appearance
          </h2>
          <SavedBadge visible={savedPing} />
        </div>
        <div className="px-5">
          <ThemeRow value={options.theme} onChange={(v) => set("theme", v)} />
          <SettingRow
            title="Show header bar"
            description="Display the top bar with the master switch, search, and navigation icons."
            checked={options.showHeader}
            onChange={(v) => set("showHeader", v)}
          />
          <SettingRow
            title="Show search box"
            description="Show a search field to quickly filter your extension list."
            checked={options.searchBox}
            onChange={(v) => set("searchBox", v)}
          />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            List behavior
          </h2>
        </div>
        <div className="px-5">
          <SettingRow
            title="Group apps separately"
            description="Show Apps in their own section instead of mixed in with Extensions."
            checked={options.groupApps}
            onChange={(v) => set("groupApps", v)}
          />
          <SettingRow
            title="Apps before extensions"
            description="When grouped, list the Apps section above Extensions."
            checked={options.appsFirst}
            onChange={(v) => set("appsFirst", v)}
          />
          <SettingRow
            title="Enabled items first"
            description="Sort enabled extensions and apps above disabled ones."
            checked={options.enabledFirst}
            onChange={(v) => set("enabledFirst", v)}
          />
          <SettingRow
            title="Show extension options gear"
            description="Show a quick-access gear icon for extensions that have an options page."
            checked={options.showExtensionOptions}
            onChange={(v) => set("showExtensionOptions", v)}
          />
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <h2 className="font-display text-[13px] font-semibold uppercase tracking-[0.06em] text-ash-600 dark:text-ash-300">
            Profiles
          </h2>
        </div>
        <div className="px-5">
          <SettingRow
            title="Keep Always On extensions enabled"
            description='Don\u2019t disable your "Always On" extensions when using the master switch to turn everything off.'
            checked={options.keepAlwaysOnWhenSwitchingOff}
            onChange={(v) => set("keepAlwaysOnWhenSwitchingOff", v)}
          />
          <SettingRow
            title="Show reserved profiles in list"
            description='Show the "Always On" and "Favorites" reserved profiles as chips in the popup.'
            checked={options.showReservedProfiles}
            onChange={(v) => set("showReservedProfiles", v)}
          />
        </div>
      </div>

      {!loaded && (
        <p className="mt-4 text-[12px] text-ash-400">Loading your settings\u2026</p>
      )}
    </PageShell>
  );
}

function ThemeRow({
  value,
  onChange,
}: {
  value: ExtendedOptions["theme"];
  onChange: (v: ExtendedOptions["theme"]) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 dark:border-graphite-line">
      <div>
        <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">Theme</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ash-500 dark:text-ash-400">
          Choose how Extensity+ looks. "Match system" follows your OS setting automatically.
        </p>
      </div>
      <div className="flex shrink-0 gap-1 rounded-pill border border-line bg-ash-50 p-1 dark:border-graphite-line dark:bg-graphite-soft">
        {(Object.keys(THEME_LABELS) as ExtendedOptions["theme"][]).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`
              rounded-pill px-2.5 py-1 text-[12px] font-medium transition-colors
              ${
                value === key
                  ? "bg-signal text-white"
                  : "text-ash-600 hover:bg-white dark:text-ash-300 dark:hover:bg-graphite-line"
              }
            `}
          >
            {THEME_LABELS[key]}
          </button>
        ))}
      </div>
    </div>
  );
}

function SavedBadge({ visible }: { visible: boolean }) {
  return (
    <span
      className={`
        inline-flex items-center gap-1 text-[11.5px] font-medium text-signal-dark
        transition-opacity duration-300
        ${visible ? "opacity-100" : "opacity-0"}
      `}
    >
      <Check className="h-3 w-3" /> Saved
    </span>
  );
}
