import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BackupPage } from "./BackupPage";
import { LanguageProvider } from "@/hooks/useTranslation";
import "@/styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <LanguageProvider>
      <BackupPage />
    </LanguageProvider>
  </StrictMode>,
);
