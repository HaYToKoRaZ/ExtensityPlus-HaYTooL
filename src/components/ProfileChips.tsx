import { Check, Lightbulb, Star, UserRound } from "lucide-react";
import { RESERVED_PROFILE, RESERVED_LABELS, isReserved, type Profile } from "@/lib/types";

interface ProfileChipsProps {
  profiles: Profile[];
  activeProfile: string | undefined;
  onSelect: (profile: Profile) => void;
}

function profileIcon(name: string) {
  if (name === RESERVED_PROFILE.ALWAYS_ON) return Lightbulb;
  if (name === RESERVED_PROFILE.FAVORITES) return Star;
  return UserRound;
}

function displayName(name: string) {
  return RESERVED_LABELS[name] ?? (name.length > 30 ? `${name.slice(0, 30)}…` : name);
}

export function ProfileChips({ profiles, activeProfile, onSelect }: ProfileChipsProps) {
  if (profiles.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {profiles.map((profile) => {
        const active = profile.name === activeProfile;
        const Icon = active ? Check : profileIcon(profile.name);
        return (
          <button
            key={profile.name}
            type="button"
            onClick={() => onSelect(profile)}
            className={`
              inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-1 text-[12px]
              transition-colors duration-100
              ${
                active
                  ? "border-signal bg-signal/10 text-signal-dark dark:text-signal-dark"
                  : "border-line bg-white text-ash-600 hover:border-ash-300 dark:border-graphite-line dark:bg-graphite-soft dark:text-ash-300 dark:hover:border-ash-500"
              }
              ${isReserved(profile.name) ? "font-medium" : ""}
            `}
          >
            <Icon className="h-3 w-3" />
            {displayName(profile.name)}
          </button>
        );
      })}
    </div>
  );
}
