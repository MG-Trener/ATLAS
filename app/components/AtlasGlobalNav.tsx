"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, BookOpen, Info, MapPinned, Microscope } from "lucide-react";
import styles from "./AtlasGlobalNav.module.css";

const items = [
  { href: "/", label: "Профили", icon: Microscope },
  { href: "/overview", label: "Обзор", icon: BarChart3 },
  { href: "/insights", label: "Карта", icon: MapPinned },
  { href: "/reference", label: "Справочники", icon: BookOpen },
  { href: "/about", label: "О платформе", icon: Info },
];

export default function AtlasGlobalNav() {
  const pathname = usePathname();
  return (
    <nav className={styles.dock} aria-label="Основная навигация AMR Atlas">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === "/"
          ? pathname === "/"
          : href === "/insights"
            ? pathname.startsWith("/insights") || pathname.startsWith("/regions/")
            : pathname.startsWith(href);
        return <Link key={href} href={href} className={active ? styles.active : ""}><Icon size={15}/><span>{label}</span></Link>;
      })}
    </nav>
  );
}
