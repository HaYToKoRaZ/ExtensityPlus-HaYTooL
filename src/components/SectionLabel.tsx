interface SectionLabelProps {
  children: string;
  count?: number;
}

export function SectionLabel({ children, count }: SectionLabelProps) {
  return (
    <div className="flex items-center gap-2 px-3 pb-1.5 pt-3 first:pt-1">
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ash-500 dark:text-ash-400">
        {children}
      </span>
      <span className="h-px flex-1 bg-line dark:bg-graphite-line" />
      {typeof count === "number" && (
        <span className="font-mono text-[10px] tabular-nums text-ash-400 dark:text-ash-500">
          {String(count).padStart(2, "0")}
        </span>
      )}
    </div>
  );
}
