import { useEffect, useMemo, useState } from "react";
import { Lightbulb, Plus, Star, Trash2, UserRound } from "lucide-react";
import { PageShell } from "@/components/PageShell";
import { Switch } from "@/components/Switch";
import { useManagedItems } from "@/hooks/useManagedItems";
import { useOptions } from "@/hooks/useOptions";
import { useProfiles } from "@/hooks/useProfiles";
import { useTheme } from "@/hooks/useTheme";
import { RESERVED_LABELS, RESERVED_PROFILE, isReserved } from "@/lib/types";

export function ProfilesPage() {
  const { items, loaded } = useManagedItems();
  const { options } = useOptions();
  const { profiles, find, create, upsert, remove } = useProfiles();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [newName, setNewName] = useState("");
  useTheme(options.theme);

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
    if (!confirm(`Remove the profile "${RESERVED_LABELS[name] ?? name}"? This can't be undone.`)) {
      return;
    }
    remove(name);
    if (selected === name) setSelected(undefined);
  };

  return (
    <PageShell active="profiles">
      <div className="rounded-lg border border-line bg-white shadow-panel dark:border-graphite-line dark:bg-graphite">
        <div className="border-b border-line px-5 py-3 dark:border-graphite-line">
          <p className="text-[12.5px] leading-relaxed text-ash-500 dark:text-ash-400">
            Switching to a profile enables exactly the extensions you've selected and disables
            the rest. <span className="font-medium text-ash-700 dark:text-ash-200">Always On</span>{" "}
            items stay enabled across every profile switch;{" "}
            <span className="font-medium text-ash-700 dark:text-ash-200">Favorites</span> pin
            items to the top of the popup.
          </p>
        </div>

        <div className="grid grid-cols-[220px_1fr] divide-x divide-line dark:divide-graphite-line">
          {/* Sidebar */}
          <div className="p-3">
            <ul className="mb-2 space-y-0.5">
              <ReservedRow
                icon={Lightbulb}
                label="Always On"
                active={selected === RESERVED_PROFILE.ALWAYS_ON}
                onClick={() => selectReserved(RESERVED_PROFILE.ALWAYS_ON)}
              />
              <ReservedRow
                icon={Star}
                label="Favorites"
                active={selected === RESERVED_PROFILE.FAVORITES}
                onClick={() => selectReserved(RESERVED_PROFILE.FAVORITES)}
              />
            </ul>

            <div className="my-2 h-px bg-line dark:bg-graphite-line" />

            <ul className="space-y-0.5">
              {profiles
                .filter((p) => !isReserved(p.name))
                .map((p) => (
                  <li key={p.name} className="group flex items-center">
                    <button
                      type="button"
                      onClick={() => setSelected(p.name)}
                      className={`
                        flex flex-1 items-center gap-2 truncate rounded-sm px-2 py-1.5 text-left text-[13px]
                        transition-colors
                        ${
                          selected === p.name
                            ? "bg-signal/10 text-signal-dark font-medium"
                            : "text-ash-700 hover:bg-ash-100 dark:text-ash-300 dark:hover:bg-graphite-soft"
                        }
                      `}
                    >
                      <UserRound className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{p.name}</span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Delete ${p.name}`}
                      onClick={() => handleDelete(p.name)}
                      className="mr-1 rounded-sm p-1 text-ash-300 opacity-0 transition-opacity hover:text-warn group-hover:opacity-100"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
            </ul>

            <div className="mt-2 flex items-center gap-1">
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="New profile name"
                className="min-w-0 flex-1 rounded-sm border border-line bg-transparent px-2 py-1.5 text-[12.5px] outline-none focus:border-signal dark:border-graphite-line"
              />
              <button
                type="button"
                onClick={handleCreate}
                aria-label="Create profile"
                className="rounded-sm bg-signal p-1.5 text-white transition-opacity hover:opacity-90"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Editor */}
          <div className="p-4">
            {!selected ? (
              <p className="py-10 text-center text-[13px] text-ash-400">
                Select or create a profile to edit which extensions it includes.
              </p>
            ) : (
              <>
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="font-display text-[14px] font-semibold">
                    {RESERVED_LABELS[selected] ?? selected}
                  </h3>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={selectAll}
                      className="rounded-sm border border-line px-2 py-1 text-[11.5px] text-ash-600 hover:bg-ash-100 dark:border-graphite-line dark:text-ash-300 dark:hover:bg-graphite-soft"
                    >
                      Select all
                    </button>
                    <button
                      type="button"
                      onClick={selectNone}
                      className="rounded-sm border border-line px-2 py-1 text-[11.5px] text-ash-600 hover:bg-ash-100 dark:border-graphite-line dark:text-ash-300 dark:hover:bg-graphite-soft"
                    >
                      Select none
                    </button>
                  </div>
                </div>

                {!loaded ? (
                  <p className="text-[12.5px] text-ash-400">Loading extensions…</p>
                ) : (
                  <ul className="max-h-[380px] space-y-0.5 overflow-y-auto pr-1">
                    {extensions.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-center gap-2.5 rounded-sm px-2 py-1.5 hover:bg-ash-100 dark:hover:bg-graphite-soft"
                      >
                        <img src={item.iconUrl} alt="" width={16} height={16} className="rounded-[3px]" />
                        <span className="flex-1 truncate text-[13px]">{item.name}</span>
                        <Switch
                          size="sm"
                          checked={currentSet.has(item.id)}
                          onChange={() => toggleMember(item.id)}
                          label={`Include ${item.name} in ${selected}`}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </>
            )}
          </div>
        </div>
      </div>
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
          flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-left text-[13px] font-medium
          transition-colors
          ${
            active
              ? "bg-signal/10 text-signal-dark"
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
