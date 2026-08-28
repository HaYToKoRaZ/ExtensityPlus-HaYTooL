import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ProfilesPage } from "./ProfilesPage";
import "@/styles/globals.css";

const root = document.getElementById("root");
if (!root) throw new Error("Missing #root element");

createRoot(root).render(
  <StrictMode>
    <ProfilesPage />
  </StrictMode>,
);
