import { useEffect, useMemo, useState } from "react";
import { FlaskConical, Lightbulb, Plus, Star, Trash2, UserRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Switch } from "@/components/Switch";
import { useManagedItems } from "@/hooks/useManagedItems";
import { useOptions } from "@/hooks/useOptions";
import { useProfiles } from "@/hooks/useProfiles";
import { useTheme } from "@/hooks/useTheme";
import { useTranslation } from "@/hooks/useTranslation";
import { RESERVED_PROFILE, isReserved } from "@/lib/types";

export function ProfilesPage() {
  const { items, loaded } = useManagedItems();
  const { options } = useOptions();
  const { profiles, find, create, upsert, remove } = useProfiles();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [newName, setNewName] = useState("");
  useTheme(options.theme);

  const getProfileLabel = (name: string) => {
    if (name === RESERVED_PROFILE.ALWAYS_ON) return t("alwaysOn");
    if (name === RESERVED_PROFILE.FAVORITES) return t("favorites");
    return name;
  };

  const extensions = useMemo(
    () => items.filter((i) => i.kind === "extension"),
    [items],
  );

  useEffect(() => {
    if (!selected && profiles.length > 0) setSelected(profiles[0].name);
  }, [profiles, selected]);

  const currentIds = useMemo(() => (selected ? find(selected) ?? [] : []), [selected, find]);
  const currentSet = useMemo(() => new Set(currentIds), [currentIds]);

  const handleCreate = () => {
    const name = newName.trim();
    if (!name || name.startsWith("__")) return;
    create(name, []);
    setSelected(name);
    setNewName("");
  };

  const selectReserved = (name: string) => {
    if (!find(name)) create(name, []);
    setSelected(name);
  };

  const toggleMember = (id: string) => {
    if (!selected) return;
    const next = currentSet.has(id)
      ? currentIds.filter((i) => i !== id)
      : [...currentIds, id];
    upsert(selected, next);
  };

  const selectAll = () => selected && upsert(selected, extensions.map((e) => e.id));
  const selectNone = () => selected && upsert(selected, []);

  const handleDelete = (name: string) => {
    if (isReserved(name)) return;
    remove(name);
    if (selected === name) setSelected(undefined);
  };

  return (
    <PageShell active="profiles">
      <section className="rounded-xl border border-line bg-white shadow-sm transition-shadow hover:shadow-md dark:border-graphite-line dark:bg-graphite">
        <div className="flex items-start justify-between border-b border-line px-6 py-4 dark:border-graphite-line">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 rounded-full bg-signal" />
              <h2 className="font-display text-[15px] font-semibold text-ash-900 dark:text-ash-100">
                {t("profilesHeading")}
              </h2>
            </div>
            <p className="mt-1 text-[13px] text-ash-500 dark:text-ash-400">
              {t("profilesDescriptionPart1")}{" "}
              <span className="font-medium text-ash-700 dark:text-ash-200">{t("alwaysOn")}</span>{" "}
              {t("profilesDescriptionPart2")}{" "}
              <span className="font-medium text-ash-700 dark:text-ash-200">{t("favorites")}</span>{" "}
              {t("profilesDescriptionPart3")}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-[230px_1fr] divide-x divide-line dark:divide-graphite-line">
          {/* Sidebar */}
          <div className="p-3.5 bg-ash-50/40 dark:bg-graphite-soft/20">
            <ul className="mb-2 space-y-1">
              <ReservedRow
                icon={Lightbulb}
                label={t("alwaysOn")}
                active={selected === RESERVED_PROFILE.ALWAYS_ON}
                onClick={() => selectReserved(RESERVED_PROFILE.ALWAYS_ON)}
              />
              <ReservedRow
                icon={Star}
                label={t("favorites")}
                active={selected === RESERVED_PROFILE.FAVORITES}
                onClick={() => selectReserved(RESERVED_PROFILE.FAVORITES)}
              />
            </ul>

            <div className="my-2.5 h-px bg-line dark:bg-graphite-line" />

            <ul className="space-y-1">
              {profiles
                .filter((p) => !isReserved(p.name))
                .map((p) => (
                  <li key={p.name} className="group flex items-center">
                    <button
                      type="button"
                      onClick={() => setSelected(p.name)}
                      className={`
                        flex flex-1 items-center gap-2 truncate rounded-lg px-2.5 py-2 text-left text-[13px] cursor-pointer
                        transition-all duration-150 active:scale-[0.98]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal
                        ${
                          selected === p.name
                            ? "bg-signal/15 text-signal-dark dark:text-signal font-semibold shadow-xs"
                            : "text-ash-700 hover:bg-ash-100 dark:text-ash-300 dark:hover:bg-graphite-soft"
                        }
                      `}
                    >
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`${t("deleteProfile")}: ${p.name}`}
                      title={`${t("deleteProfile")}: ${p.name}`}
                      onClick={() => handleDelete(p.name)}
                      className="mr-1 rounded-md p-1.5 text-ash-400 opacity-0 transition-all hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 group-hover:opacity-100 cursor-pointer focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
            </ul>

            <div className="mt-3 flex items-center gap-1.5">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder={t("newProfilePlaceholder")}
                className="min-w-0 flex-1 rounded-lg border border-line bg-white px-2.5 py-1.5 text-[12.5px] outline-none transition-colors focus:border-signal focus:ring-2 focus:ring-signal/30 dark:border-graphite-line dark:bg-graphite-soft"
              />
              <button
                type="button"
                onClick={handleCreate}
                aria-label={t("createProfile")}
                title={t("createProfile")}
                className="rounded-lg bg-signal p-2 text-white shadow-xs cursor-pointer transition-all hover:bg-signal-dark active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="p-5">
            {!selected ? (
              <p className="py-12 text-center text-[13px] text-ash-400">
                {t("noProfileSelected")}
              </p>
            ) : (
              <>
                <div className="mb-4 flex items-center justify-between pb-3 border-b border-line dark:border-graphite-line">
                  <h3 className="font-display text-[14.5px] font-semibold text-ash-900 dark:text-white">
                    {getProfileLabel(selected)}
                  </h3>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-ash-700 shadow-xs cursor-pointer transition-all hover:bg-ash-100 hover:text-ash-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-200 dark:hover:bg-graphite-line"
                    >
                      {t("selectAll")}
                    </button>
                    <button
                      type="button"
                      onClick={selectNone}
                      className="rounded-lg border border-line bg-white px-2.5 py-1 text-[12px] font-medium text-ash-700 shadow-xs cursor-pointer transition-all hover:bg-ash-100 hover:text-ash-900 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-200 dark:hover:bg-graphite-line"
                    >
                      {t("selectNone")}
                    </button>
                  </div>
                </div>

                {!loaded ? (
                  <p className="text-[12.5px] text-ash-400">{t("loadingExtensions")}</p>
                ) : (
                  <ul className="max-h-[380px] space-y-1 overflow-y-auto pr-1">
                    {extensions.map((item) => (
                      <li
                        key={item.id}
                        onClick={() => toggleMember(item.id)}
                        className="group flex items-center gap-2.5 rounded-lg px-2.5 py-2 cursor-pointer transition-colors duration-150 hover:bg-ash-50 dark:hover:bg-graphite-soft select-none"
                      >
                        <img src={item.iconUrl} alt="" width={18} height={18} className="rounded-[4px] shadow-xs shrink-0" />
                        <span className="flex-1 truncate text-[13px] font-medium text-ash-800 transition-colors group-hover:text-signal dark:text-ash-100">
                          {item.name}
                        </span>
                        {item.isDevelopment && (
                          <span
                            title={t("unpackedNotice")}
                            className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium bg-amber-500/15 text-amber-600 dark:text-amber-400 shrink-0"
                          >
                            <FlaskConical className="h-3 w-3" />
                            <span>Dev</span>
                          </span>
                        )}
                        <div onClick={(e) => e.stopPropagation()}>
                          <Switch
                            size="sm"
                            checked={currentSet.has(item.id)}
                            onChange={() => toggleMember(item.id)}
                            label={`${item.name} - ${getProfileLabel(selected)}`}
                          />
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function ReservedRow({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Lightbulb;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        className={`
          flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left text-[13px] cursor-pointer
          transition-all duration-150 active:scale-[0.98]
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal
          ${
            active
              ? "bg-signal/15 text-signal-dark dark:text-signal font-semibold shadow-xs"
              : "text-ash-700 hover:bg-ash-100 dark:text-ash-300 dark:hover:bg-graphite-soft"
          }
        `}
      >
        <Icon className="h-3.5 w-3.5 shrink-0" />
        {label}
      </button>
    </li>
  );
}
