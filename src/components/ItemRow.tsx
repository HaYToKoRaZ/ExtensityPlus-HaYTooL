import { FlaskConical, Settings2, Star } from "lucide-react";
import { StatusLed } from "./StatusLed";
import { Switch } from "./Switch";
import type { ManagedItem } from "@/lib/types";

interface ItemRowProps {
  item: ManagedItem;
  showOptionsGear: boolean;
  isFavorite?: boolean;
  onToggle: (id: string) => void;
  onLaunchApp?: (id: string) => void;
  onOpenOptions?: (url: string) => void;
}

export function ItemRow({
  item,
  showOptionsGear,
  isFavorite,
  onToggle,
  onLaunchApp,
  onOpenOptions,
}: ItemRowProps) {
  const isApp = item.kind === "app";
  const disabled = !item.enabled;

  const handleRowClick = () => {
    if (isApp) {
      if (item.enabled) onLaunchApp?.(item.id);
    } else {
      onToggle(item.id);
    }
  };

  return (
    <li
      onClick={handleRowClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleRowClick();
        }
      }}
      className={`
        group flex items-center gap-2.5 rounded-sm px-3 py-[7px] outline-none
        transition-colors duration-100
        hover:bg-ash-100 dark:hover:bg-graphite-soft
        focus-visible:bg-ash-100 dark:focus-visible:bg-graphite-soft
        ${disabled ? "opacity-55" : ""}
      `}
    >
      <StatusLed on={item.enabled} />

      <img
        src={item.iconUrl}
        alt=""
        width={16}
        height={16}
        className="h-4 w-4 shrink-0 rounded-[3px] object-contain"
      />

      <span className="min-w-0 flex-1 truncate text-[13px] leading-tight text-ash-800 dark:text-ash-100">
        {item.name}
      </span>

      {isFavorite && <Star className="h-3 w-3 shrink-0 fill-signal text-signal" />}

      {item.isDevelopment && (
        <FlaskConical
          className="h-3.5 w-3.5 shrink-0 text-ash-400"
          aria-label="Unpacked / development build"
        />
      )}

      {showOptionsGear && item.optionsUrl && item.enabled && (
        <button
          type="button"
          aria-label={`Open ${item.name} options`}
          onClick={(e) => {
            e.stopPropagation();
            onOpenOptions?.(item.optionsUrl!);
          }}
          className="
            shrink-0 rounded-sm p-1 text-ash-400 opacity-0 transition-opacity
            hover:text-ash-700 group-hover:opacity-100 dark:hover:text-ash-200
          "
        >
          <Settings2 className="h-3.5 w-3.5" />
        </button>
      )}

      {!isApp && (
        <Switch
          size="sm"
          checked={item.enabled}
          onChange={() => onToggle(item.id)}
          label={`${item.enabled ? "Disable" : "Enable"} ${item.name}`}
        />
      )}
    </li>
  );
}
