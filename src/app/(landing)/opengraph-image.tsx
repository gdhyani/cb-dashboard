import { ImageResponse } from "next/og";
import { PRODUCT_NAME } from "@/constants";

export const alt = "cb: develop with zero secrets";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Share card for `/`, in the landing page's look: paper, highlighted placeholder keys, a black bar for the real key. */
export default function OpengraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 72,
        background: "#0b0c0e",
        color: "#ecece7",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
        <div
          style={{
            background: "#ffd84a",
            color: "#121212",
            padding: "4px 14px",
            fontSize: 44,
            fontWeight: 800,
            letterSpacing: -2,
          }}
        >
          {PRODUCT_NAME}
        </div>
        <div style={{ fontSize: 26, color: "#a6aab1" }}>Credential broker for development teams</div>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          fontSize: 76,
          fontWeight: 800,
          letterSpacing: -3,
          lineHeight: 1,
        }}
      >
        <span>Develop with</span>
        <span>zero secrets.</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, fontSize: 26, fontFamily: "monospace" }}>
        <span style={{ color: "#ff5b3d", textDecoration: "line-through" }}>sk_live_••••••••</span>
        <span style={{ color: "#a6aab1" }}>→</span>
        <span style={{ background: "#ffd84a", color: "#121212", padding: "4px 10px" }}>
          sk_test_cb_amber-otter-falls
        </span>
      </div>
    </div>,
    size,
  );
}
