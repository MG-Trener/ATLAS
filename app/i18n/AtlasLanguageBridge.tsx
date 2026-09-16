"use client";

import { useEffect } from "react";
import { AtlasLanguage, useAtlasLanguage } from "./AtlasLanguage";

const PREVIEW_KEY = "atlas-preview-language";
const APP_KEY = "atlas-language";

function isLanguage(value: string | null): value is AtlasLanguage {
  return value === "ru" || value === "kk" || value === "en";
}

export default function AtlasLanguageBridge() {
  const { language, setLanguage } = useAtlasLanguage();

  useEffect(() => {
    const preview = window.localStorage.getItem(PREVIEW_KEY);
    const app = window.localStorage.getItem(APP_KEY);
    const saved = isLanguage(preview) ? preview : isLanguage(app) ? app : null;
    if (saved) setLanguage(saved);
  }, [setLanguage]);

  useEffect(() => {
    window.localStorage.setItem(PREVIEW_KEY, language);
    window.localStorage.setItem(APP_KEY, language);
    document.documentElement.lang = language === "kk" ? "kk" : language;
    document.dispatchEvent(new CustomEvent("atlas:language-changed", { detail: { language } }));
  }, [language]);

  useEffect(() => {
    const onLanguage = (event: Event) => {
      const next = (event as CustomEvent<{ language?: string }>).detail?.language ?? null;
      if (isLanguage(next) && next !== language) setLanguage(next);
    };
    const onStorage = (event: StorageEvent) => {
      if (event.key !== PREVIEW_KEY && event.key !== APP_KEY) return;
      if (isLanguage(event.newValue) && event.newValue !== language) setLanguage(event.newValue);
    };
    document.addEventListener("atlas:language-changed", onLanguage as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("atlas:language-changed", onLanguage as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, [language, setLanguage]);

  return null;
}
