import { useState } from "react";
import { Cloud, Cog, Puzzle, UserRound, Zap } from "lucide-react";
import { APP_NAME } from "@/lib/branding";
import { useTranslation } from "@/hooks/useTranslation";

interface HeaderProps {
  tripped: boolean;
  onFlip: () => void;
  onOpenOptions: () => void;
  onOpenProfiles: () => void;
  onOpenBackup: () => void;
  onOpenChromeExtensions: () => void;
  userAvatarUrl?: string | null;
  userLogin?: string | null;
}

export function Header({
  tripped,
  onFlip,
  onOpenOptions,
  onOpenProfiles,
  onOpenBackup,
  onOpenChromeExtensions,
  userAvatarUrl,
  userLogin,
}: HeaderProps) {
  const { t } = useTranslation();

  return (
    <header className="flex items-center gap-2 border-b border-line px-3 py-2.5 dark:border-graphite-line">
      <img src="/images/icon48.png" alt="" width={20} height={20} className="rounded-full shadow-sm" />
      <h1 className="font-display text-[14px] font-semibold tracking-tight text-ash-900 dark:text-white">
        {APP_NAME}
      </h1>

      <div className="ml-auto flex items-center gap-0.5">
        <IconLink label={t("options")} onClick={onOpenOptions} icon={Cog} />
        <IconLink
          label={userLogin ? `${userLogin} • ${t("profiles")}` : t("profiles")}
          onClick={onOpenProfiles}
          icon={UserRound}
          avatarUrl={userAvatarUrl}
        />
        <IconLink label={t("backupAndSync")} onClick={onOpenBackup} icon={Cloud} />
        <IconLink label={t("chromeExtensions")} onClick={onOpenChromeExtensions} icon={Puzzle} />

        {/* The signature control: a breaker-style master switch, not a menu item. */}
        <button
          type="button"
          onClick={onFlip}
          aria-pressed={tripped}
          title={tripped ? t("restoreExtensions") : t("turnAllOff")}
          className={`
            ml-1 inline-flex items-center gap-1 rounded-pill border px-2 py-1 text-[11px] font-semibold
            transition-colors duration-150
            ${
              tripped
                ? "border-warn/40 bg-warn/10 text-warn"
                : "border-signal/40 bg-signal/10 text-signal-dark"
            }
          `}
        >
          <Zap className={`h-3 w-3 ${tripped ? "" : "fill-current"}`} />
          {tripped ? "OFF" : "ON"}
        </button>
      </div>
    </header>
  );
}

function IconLink({
  label,
  icon: Icon,
  onClick,
  avatarUrl,
}: {
  label: string;
  icon?: typeof Cog;
  onClick: () => void;
  avatarUrl?: string | null;
}) {
  const [imgError, setImgError] = useState(false);

  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className="flex items-center justify-center rounded-sm p-1.5 text-ash-500 transition-colors hover:bg-ash-100 hover:text-ash-800 dark:text-ash-400 dark:hover:bg-graphite-soft dark:hover:text-ash-100"
    >
      {avatarUrl && !imgError ? (
        <img
          src={avatarUrl}
          alt={label}
          className="h-[15px] w-[15px] rounded-full object-cover ring-1 ring-black/15 dark:ring-white/25 shrink-0"
          onError={() => setImgError(true)}
        />
      ) : (
        Icon && <Icon className="h-[15px] w-[15px] shrink-0" />
      )}
    </button>
  );
}
