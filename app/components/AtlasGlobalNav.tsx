"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Info, MapPinned, Microscope } from "lucide-react";
import { AtlasLanguage, useAtlasLanguage } from "../i18n/AtlasLanguage";
import styles from "./AtlasGlobalNav.module.css";

const items = [
  { href: "/", key: "profiles", icon: Microscope },
  { href: "/overview", key: "overview", icon: BarChart3 },
  { href: "/insights", key: "map", icon: MapPinned },
  { href: "/reference", key: "reference", icon: BookOpen },
  { href: "/about", key: "about", icon: Info },
];

const languages: { id: AtlasLanguage; label: string }[] = [
  { id: "ru", label: "RU" },
  { id: "kk", label: "KZ" },
  { id: "en", label: "EN" },
];

export default function AtlasGlobalNav() {
  const pathname = usePathname();
  const { language, setLanguage, t } = useAtlasLanguage();
  return (
    <nav className={styles.dock} aria-label="AMR Atlas">
      <div className={styles.links}>
        {items.map(({ href, key, icon: Icon }) => {
          const active = key === "map" ? pathname.startsWith("/insights") || pathname.startsWith("/regions/") : href === "/" ? pathname === "/" : pathname.startsWith(href);
          return <Link key={href} href={href} className={active ? styles.active : ""}><Icon size={15}/><span>{t(key)}</span></Link>;
        })}
      </div>
      <div className={styles.languages} aria-label="Language">
        {languages.map((item) => <button key={item.id} type="button" className={language === item.id ? styles.languageActive : ""} onClick={() => setLanguage(item.id)}>{item.label}</button>)}
      </div>
    </nav>
  );
}
