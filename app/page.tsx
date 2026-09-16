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
          zIndex: 50,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 34,
          padding: "0 13px",
          borderRadius: 9,
          border: "1px solid #d5e2ef",
          background: "rgba(255,255,255,.96)",
          color: "#38618f",
          textDecoration: "none",
          fontSize: 9,
          fontWeight: 800,
          boxShadow: "0 8px 24px rgba(17,104,216,.12)",
        }}
      >
        WHONET Mapping
      </Link>
    </>
  );
}
