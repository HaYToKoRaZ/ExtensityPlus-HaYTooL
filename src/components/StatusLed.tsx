export function StatusLed({ on, pulse = false }: { on: boolean; pulse?: boolean }) {
  return (
    <span
      aria-hidden
      className={`
        block h-[7px] w-[7px] rounded-full transition-colors duration-150
        ${on ? "bg-signal shadow-[0_0_6px_rgba(61,85,123,0.7)]" : "bg-ash-300 dark:bg-graphite-line"}
        ${on && pulse ? "animate-led-pulse" : ""}
      `}
    />
  );
}
