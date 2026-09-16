import Link from "next/link";
import OverviewDashboard from "./OverviewDashboard";

export default function OverviewPage() {
  return (
    <>
      <OverviewDashboard />
      <Link
        href="/about"
        style={{
          position: "fixed",
          right: 18,
          bottom: 18,
          zIndex: 20,
          minHeight: 36,
          padding: "0 13px",
          border: "1px solid #cfe1f2",
          borderRadius: 9,
          background: "#fff",
          color: "#315f8d",
          display: "inline-flex",
          alignItems: "center",
          textDecoration: "none",
          fontSize: 10,
          fontWeight: 800,
          boxShadow: "0 8px 24px rgba(17,104,216,.12)",
        }}
      >
        О платформе · методология →
      </Link>
    </>
  );
}
