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
          w-full rounded-md border border-line bg-white/70 py-1.5 pl-8 pr-7 text-[13px]
          text-ash-800 placeholder:text-ash-400 outline-none
          transition-all duration-150 focus:border-signal focus:bg-white focus:ring-2 focus:ring-signal/30
          dark:border-graphite-line dark:bg-graphite-soft/70 dark:text-ash-100 dark:focus:bg-graphite-soft
        "
      />
      {value && (
        <button
          type="button"
          aria-label={t("clearSearch")}
          title={t("clearSearch")}
          onClick={() => onChange("")}
          className="absolute right-5.5 rounded-full p-0.5 text-ash-400 hover:text-ash-700 hover:bg-ash-100 dark:hover:text-ash-100 dark:hover:bg-graphite-line cursor-pointer transition-colors"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
