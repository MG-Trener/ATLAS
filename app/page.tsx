import Link from "next/link";
import AtlasFlow from "./AtlasFlow";

const baseButton = {
  zIndex: 20,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 9,
  textDecoration: "none",
  fontSize: 11,
  fontWeight: 800,
  boxShadow: "0 8px 24px rgba(17,104,216,.16)",
} as const;

export default function Page() {
  return (
    <>
      <AtlasFlow />
      <div
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 20,
          display: "grid",
          gap: 7,
        }}
      >
        <Link
          href="/overview"
          style={{
            ...baseButton,
            border: "1px solid #075ec7",
            background: "linear-gradient(#1478e8,#0860c7)",
            color: "#fff",
          }}
        >
          Национальный обзор →
        </Link>
        <Link
          href="/insights"
          style={{
            ...baseButton,
            minHeight: 34,
            border: "1px solid #bcdcf9",
            background: "#eaf5ff",
            color: "#195a96",
            fontSize: 10,
          }}
        >
          Карта · аналитика
        </Link>
        <Link
          href="/reference"
          style={{
            ...baseButton,
            minHeight: 34,
            border: "1px solid #bcdcf9",
            background: "#eaf5ff",
            color: "#195a96",
            fontSize: 10,
          }}
        >
          Справочники
        </Link>
        <Link
          href="/about"
          style={{
            ...baseButton,
            minHeight: 34,
            border: "1px solid #cfe1f2",
            background: "#f5faff",
            color: "#345f8a",
            fontSize: 10,
          }}
        >
          О платформе · методология
        </Link>
        <Link
          href="/whonet"
          style={{
            ...baseButton,
            minHeight: 32,
            border: "1px solid #d5e2ef",
            background: "#fff",
            color: "#38618f",
            fontSize: 10,
          }}
        >
          WHONET Mapping
        </Link>
      </div>
    </>
  );
}
