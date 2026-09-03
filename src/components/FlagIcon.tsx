import type { ReactNode } from "react";
import type { Language } from "@/lib/i18n";

export function FlagIcon({ lang, className = "h-5 w-5" }: { lang: Language; className?: string }): ReactNode {
  switch (lang) {
    case "tr":
      // Türkiye Bayrağı (Kırmızı zemin, beyaz hilal ve yıldız)
      return (
        <svg viewBox="0 0 1200 800" className={className}>
          <rect width="1200" height="800" fill="#E30A17" />
          <circle cx="425" cy="400" r="200" fill="#FFFFFF" />
          <circle cx="475" cy="400" r="160" fill="#E30A17" />
          <polygon
            fill="#FFFFFF"
            points="583.33,400 706.87,440.14 659.73,319.86 659.73,480.14 706.87,359.86"
          />
        </svg>
      );

    case "en":
      // Birleşik Krallık Bayrağı (Union Jack)
      return (
        <svg viewBox="0 0 60 30" className={className}>
          <clipPath id="s">
            <path d="M0,0 v30 h60 v-30 z" />
          </clipPath>
          <clipPath id="t">
            <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
          </clipPath>
          <g clipPath="url(#s)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4" />
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
          </g>
        </svg>
      );

    case "de":
      // Almanya Bayrağı (Siyah, Kırmızı, Sarı)
      return (
        <svg viewBox="0 0 5 3" className={className}>
          <rect width="5" height="3" y="0" fill="#000" />
          <rect width="5" height="2" y="1" fill="#D00" />
          <rect width="5" height="1" y="2" fill="#FFCE00" />
        </svg>
      );

    case "es":
      // İspanya Bayrağı (Kırmızı, Sarı, Kırmızı)
      return (
        <svg viewBox="0 0 750 500" className={className}>
          <rect width="750" height="500" fill="#AA151B" />
          <rect width="750" height="250" y="125" fill="#F1BF00" />
        </svg>
      );

    case "fr":
      // Fransa Bayrağı (Mavi, Beyaz, Kırmızı)
      return (
        <svg viewBox="0 0 3 2" className={className}>
          <rect width="1" height="2" x="0" fill="#002654" />
          <rect width="1" height="2" x="1" fill="#FFFFFF" />
          <rect width="1" height="2" x="2" fill="#CE1126" />
        </svg>
      );

    case "ru":
      // Rusya Bayrağı (Beyaz, Mavi, Kırmızı)
      return (
        <svg viewBox="0 0 9 6" className={className}>
          <rect width="9" height="6" fill="#fff" />
          <rect width="9" height="4" y="2" fill="#0039A6" />
          <rect width="9" height="2" y="4" fill="#D52B1E" />
        </svg>
      );

    case "ar":
      // Suudi Arabistan Bayrağı (Yeşil zemin, kılıç ve kelime-i tevhid sembolü)
      return (
        <svg viewBox="0 0 3 2" className={className}>
          <rect width="3" height="2" fill="#006C35" />
          <circle cx="1.5" cy="0.8" r="0.35" fill="#FFFFFF" opacity="0.9" />
          <rect width="1.4" height="0.1" x="0.8" y="1.3" rx="0.05" fill="#FFFFFF" />
        </svg>
      );

    default:
      return null;
  }
}
