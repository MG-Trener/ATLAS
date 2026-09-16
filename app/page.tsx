import Link from "next/link";
import AtlasFlow from "./AtlasFlow";

export default function Page() {
  return (
    <>
      <AtlasFlow />
      <Link
        href="/whonet"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 20,
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          minHeight: 38,
          padding: "0 14px",
          borderRadius: 9,
          border: "1px solid #075ec7",
          background: "linear-gradient(#1478e8,#0860c7)",
          color: "#fff",
          textDecoration: "none",
          fontSize: 11,
          fontWeight: 800,
          boxShadow: "0 8px 24px rgba(17,104,216,.24)",
        }}
      >
        WHONET Mapping →
      </Link>
    </>
  );
}
