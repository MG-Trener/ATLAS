import type { Metadata } from "next";
import AtlasGlobalNav from "./components/AtlasGlobalNav";
import AtlasPrototypeStatus from "./components/AtlasPrototypeStatus";
import { AtlasLanguageProvider } from "./i18n/AtlasLanguage";
import AtlasLanguageBridge from "./i18n/AtlasLanguageBridge";
import AtlasLegacyTranslator from "./i18n/AtlasLegacyTranslator";
import "./globals.css";

export const metadata: Metadata = {
  title: "AMR Atlas — мониторинг антимикробной резистентности",
  description: "Платформа визуализации и анализа данных по антимикробной резистентности.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru">
      <body>
        <AtlasLanguageProvider>
          <AtlasLanguageBridge />
          {children}
          <AtlasLegacyTranslator />
          <AtlasGlobalNav />
          <AtlasPrototypeStatus />
        </AtlasLanguageProvider>
      </body>
    </html>
  );
}
