import { useMemo } from "react";
import { useManagedItems } from "@/hooks/useManagedItems";
import { useOptions } from "@/hooks/useOptions";
import { useProfiles } from "@/hooks/useProfiles";
import { useStoredState } from "@/hooks/useStoredState";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { useMasterSwitch } from "@/hooks/useMasterSwitch";
import { Header } from "@/components/Header";
import { SearchBox } from "@/components/SearchBox";
import { SectionLabel } from "@/components/SectionLabel";
import { ItemRow } from "@/components/ItemRow";
import { ProfileChips } from "@/components/ProfileChips";
import { EmptyState } from "@/components/EmptyState";
import type { ManagedItem, Profile } from "@/lib/types";

function matches(item: ManagedItem, query: string) {
  return !query || item.name.toUpperCase().includes(query.toUpperCase());
}

export function Popup() {
  const { items, loaded, toggle, setEnabled, setManyEnabled } = useManagedItems();
  const { options } = useOptions();
  const { profiles, alwaysOnIds, isFavorite } = useProfiles();
  const { t } = useTranslation();
  const [query, setQuery] = useStoredState("searchQuery", "", "local");
  const [activeProfile, setActiveProfile] = useStoredState<string | undefined>(
    "activeProfile",
    undefined,
    "sync",
  );

  useTheme(options.theme);

  const { isTripped, flip } = useMasterSwitch({
    items,
    setManyEnabled,
    alwaysOnIds,
    keepAlwaysOn: options.keepAlwaysOnWhenSwitchingOff,
  });

  const visibleProfiles = useMemo(
    () => profiles.filter((p) => !p.name.startsWith("__") || options.showReservedProfiles),
    [profiles, options.showReservedProfiles],
  );

  const extensions = useMemo(
    () => items.filter((i) => i.kind === "extension" && matches(i, query)),
    [items, query],
  );
  const apps = useMemo(() => items.filter((i) => i.kind === "app" && matches(i, query)), [items, query]);
  const favorites = useMemo(
    () => items.filter((i) => i.kind === "extension" && isFavorite(i.id) && matches(i, query)),
    [items, isFavorite, query],
  );

  const sortItems = (list: ManagedItem[]) =>
    [...list].sort((a, b) => {
      if (options.enabledFirst && a.enabled !== b.enabled) return a.enabled ? -1 : 1;
      return a.name.toUpperCase().localeCompare(b.name.toUpperCase());
    });

  const sortedExtensions = useMemo(() => sortItems(extensions), [extensions, options.enabledFirst]);
  const sortedApps = useMemo(() => sortItems(apps), [apps, options.enabledFirst]);
  const sortedFavorites = useMemo(() => sortItems(favorites), [favorites, options.enabledFirst]);

  const isEmpty = loaded && extensions.length === 0 && apps.length === 0;

  const handleToggle = (id: string) => {
    toggle(id);
    setActiveProfile(undefined);
  };

  const handleSetProfile = (profile: Profile) => {
    setActiveProfile(profile.name);
    const targetIds = new Set([...profile.itemIds, ...alwaysOnIds]);
    for (const item of items) {
      if (item.kind !== "extension") continue;
      const shouldBeEnabled = targetIds.has(item.id);
      if (item.enabled !== shouldBeEnabled) setEnabled(item.id, shouldBeEnabled);
    }
  };

  const openTab = (url: string) => {
    void chrome.tabs.create({ url });
    window.close();
  };

  const groupedSections = () => {
    const extBlock = sortedExtensions.length > 0 && (
      <section key="extensions">
        <SectionLabel count={sortedExtensions.length}>{t("extensions")}</SectionLabel>
        <ul>
          {sortedExtensions.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              showOptionsGear={options.showExtensionOptions}
              isFavorite={isFavorite(item.id)}
              onToggle={handleToggle}
              onOpenOptions={openTab}
            />
          ))}
        </ul>
      </section>
    );
    const appBlock = sortedApps.length > 0 && (
      <section key="apps">
        <SectionLabel count={sortedApps.length}>{t("apps")}</SectionLabel>
        <ul>
          {sortedApps.map((item) => (
            <ItemRow
              key={item.id}
              item={item}
              showOptionsGear={options.showExtensionOptions}
              onToggle={handleToggle}
              onLaunchApp={(id) => void chrome.management.launchApp(id)}
              onOpenOptions={openTab}
            />
          ))}
        </ul>
      </section>
    );

    if (!options.groupApps) {
      const all = sortItems([...extensions, ...apps]);
      return (
        <section>
          <SectionLabel count={all.length}>{`${t("extensions")} & ${t("apps")}`}</SectionLabel>
          <ul>
            {all.map((item) => (
              <ItemRow
                key={item.id}
                item={item}
                showOptionsGear={options.showExtensionOptions}
                isFavorite={isFavorite(item.id)}
                onToggle={handleToggle}
                onLaunchApp={(id) => void chrome.management.launchApp(id)}
                onOpenOptions={openTab}
              />
            ))}
          </ul>
        </section>
      );
    }

    return options.appsFirst ? [appBlock, extBlock] : [extBlock, appBlock];
  };

  return (
    <div className="flex w-[360px] flex-col bg-paper text-ash-800 dark:bg-ink dark:text-ash-100">
      {options.showHeader && (
        <Header
          tripped={isTripped}
          onFlip={flip}
          onOpenOptions={() => openTab(chrome.runtime.getURL("options.html"))}
          onOpenProfiles={() => openTab(chrome.runtime.getURL("profiles.html"))}
          onOpenChromeExtensions={() => openTab("chrome://extensions")}
        />
      )}

      {options.searchBox && <SearchBox value={query} onChange={setQuery} />}

      <div className="max-h-[440px] overflow-y-auto pb-2">
        {visibleProfiles.length > 0 && !query && (
          <>
            <SectionLabel>{t("profiles")}</SectionLabel>
            <ProfileChips
              profiles={visibleProfiles}
              activeProfile={activeProfile}
              onSelect={handleSetProfile}
            />
          </>
        )}

        {sortedFavorites.length > 0 && (
          <section>
            <SectionLabel count={sortedFavorites.length}>{t("favorites")}</SectionLabel>
            <ul>
              {sortedFavorites.map((item) => (
                <ItemRow
                  key={item.id}
                  item={item}
                  showOptionsGear={options.showExtensionOptions}
                  isFavorite
                  onToggle={handleToggle}
                  onOpenOptions={openTab}
                />
              ))}
            </ul>
          </section>
        )}

        {isEmpty ? (
          <EmptyState message={t("noExtensionsInstalled")} />
        ) : (
          groupedSections()
        )}
      </div>
    </div>
  );
}
