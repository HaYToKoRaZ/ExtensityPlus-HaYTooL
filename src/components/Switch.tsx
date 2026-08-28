interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  size?: "sm" | "md";
  disabled?: boolean;
}

export function Switch({ checked, onChange, label, size = "md", disabled }: SwitchProps) {
  const dims = size === "sm" ? "h-[18px] w-[32px]" : "h-[22px] w-[38px]";
  const thumb = size === "sm" ? "h-[14px] w-[14px]" : "h-[18px] w-[18px]";
  const travel = size === "sm" ? "translate-x-[14px]" : "translate-x-[16px]";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={`
        relative inline-flex shrink-0 items-center rounded-pill border
        transition-colors duration-150 ease-out
        disabled:cursor-not-allowed disabled:opacity-40
        ${dims}
        ${checked ? "bg-signal border-signal" : "bg-ash-200 border-ash-300 dark:bg-graphite-line dark:border-graphite-line"}
      `}
    >
      <span
        className={`
          ${thumb} pointer-events-none block rounded-full bg-white shadow-row
          transition-transform duration-150 ease-spring
          ${checked ? travel : "translate-x-[3px]"}
        `}
      />
    </button>
  );
}
