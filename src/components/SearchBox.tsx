import { Search, X } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBox({ value, onChange }: SearchBoxProps) {
  const { t } = useTranslation();

  return (
    <div className="relative flex items-center px-3 py-2">
      <Search className="pointer-events-none absolute left-6 h-3.5 w-3.5 text-ash-400" />
      <input
        autoFocus
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchPlaceholder")}
        className="
          w-full rounded-sm border border-line bg-white/60 py-1.5 pl-8 pr-7 text-[13px]
          text-ash-800 placeholder:text-ash-400 outline-none
          transition-colors focus:border-signal focus:bg-white
          dark:border-graphite-line dark:bg-graphite-soft/60 dark:text-ash-100 dark:focus:bg-graphite-soft
        "
      />
      {value && (
        <button
          type="button"
          aria-label={t("clearSearch")}
          title={t("clearSearch")}
          onClick={() => onChange("")}
          className="absolute right-6 rounded-sm p-0.5 text-ash-400 hover:text-ash-600 dark:hover:text-ash-200"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
