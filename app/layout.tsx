import type { Metadata } from "next";
import AtlasGlobalNav from "./components/AtlasGlobalNav";
import { AtlasLanguageProvider } from "./i18n/AtlasLanguage";
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
          {children}
          <AtlasLegacyTranslator />
          <AtlasGlobalNav />
        </AtlasLanguageProvider>
      </body>
    </html>
  );
}
