import { Switch } from "./Switch";

interface SettingRowProps {
  title: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export function SettingRow({ title, description, checked, onChange }: SettingRowProps) {
  return (
    <div className="flex items-start justify-between gap-6 border-b border-line py-4 last:border-b-0 dark:border-graphite-line">
      <div>
        <p className="text-[13.5px] font-medium text-ash-800 dark:text-ash-100">{title}</p>
        <p className="mt-0.5 text-[12.5px] leading-snug text-ash-500 dark:text-ash-400">
          {description}
        </p>
      </div>
      <div className="pt-0.5">
        <Switch checked={checked} onChange={onChange} label={title} />
      </div>
    </div>
  );
}
