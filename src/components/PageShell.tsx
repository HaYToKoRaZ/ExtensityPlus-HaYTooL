import type { ReactNode } from "react";
import { APP_NAME, WEBSITE_URL } from "@/lib/branding";
import { useTranslation } from "@/hooks/useTranslation";

interface PageShellProps {
  active: "options" | "profiles" | "backup";
  children: ReactNode;
}

export function PageShell({ active, children }: PageShellProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-paper text-ash-800 dark:bg-ink dark:text-ash-100">
      <div className="mx-auto max-w-[720px] px-6 py-8">
        <header className="mb-6 flex items-center gap-3">
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noreferrer"
            title="Extensity+ HaYTooL Resmi Web Sitesi"
            className="group flex items-center gap-3 cursor-pointer rounded-lg p-1 -m-1 transition-all duration-150 hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal"
          >
            <img
              src="/images/icon48.png"
              alt=""
              width={32}
              height={32}
              className="rounded-full shadow-md transition-transform duration-200 group-hover:scale-105"
            />
            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight transition-colors group-hover:text-signal">
                {APP_NAME}
              </h1>
              <p className="text-[12.5px] text-ash-500 dark:text-ash-400">
                {t("settingsAndProfiles")}
              </p>
            </div>
          </a>

          <nav className="ml-auto flex gap-1 rounded-pill border border-line bg-white p-1 dark:border-graphite-line dark:bg-graphite-soft">
            <TabLink href="/options.html" label={t("options")} active={active === "options"} />
            <TabLink href="/profiles.html" label={t("profiles")} active={active === "profiles"} />
            <TabLink href="/backup.html" label={t("backupAndSync")} active={active === "backup"} />
          </nav>
        </header>

        {children}
      </div>
    </div>
  );
}

function TabLink({ href, label, active }: { href: string; label: string; active: boolean }) {
  return (
    <a
      href={href}
      className={`
        rounded-pill px-3 py-1.5 text-[12.5px] font-medium cursor-pointer transition-all duration-150 active:scale-95
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal
        ${
          active
            ? "bg-signal text-white shadow-sm"
            : "text-ash-600 hover:bg-ash-100 hover:text-ash-900 dark:text-ash-300 dark:hover:bg-graphite-line dark:hover:text-white"
        }
      `}
    >
      {label}
    </a>
  );
}
