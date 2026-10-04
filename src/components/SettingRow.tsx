import { Switch } from "./Switch";

interface SettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingRow({ title, description, checked, onChange }: SettingRowProps) {
  return (
    <div
      onClick={() => onChange(!checked)}
      className="group flex cursor-pointer items-start justify-between gap-6 border-b border-line py-4 -mx-2 px-2 rounded-lg transition-colors duration-150 hover:bg-ash-50/80 dark:hover:bg-graphite-soft/60 last:border-b-0 dark:border-graphite-line"
    >
      <div className="select-none">
        <p className="text-[13.5px] font-medium text-ash-800 transition-colors group-hover:text-signal dark:text-ash-100 dark:group-hover:text-signal">
          {title}
        </p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ash-500 dark:text-ash-400">
          {description}
        </p>
      </div>
      <div className="pt-0.5" onClick={(e) => e.stopPropagation()}>
        <Switch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}
