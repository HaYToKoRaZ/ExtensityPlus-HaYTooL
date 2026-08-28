import { PackageSearch } from "lucide-react";

export function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
      <PackageSearch className="h-6 w-6 text-ash-300 dark:text-graphite-line" />
      <p className="text-[12.5px] text-ash-500 dark:text-ash-400">{message}</p>
    </div>
  );
}
