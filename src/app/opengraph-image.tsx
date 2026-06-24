import { ImageResponse } from "next/og";
import { SITE } from "@/lib/site";

export const alt = "Arcea Estudio — Menos ruido, más presencia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          background: "#2C382A",
          color: "#F4EEE3",
          padding: "80px",
        }}
      >
        <div
          style={{
            fontSize: 28,
            letterSpacing: 12,
            textTransform: "uppercase",
            color: "#C3CBB2",
          }}
        >
          Invierno 2026
        </div>
        <div style={{ fontSize: 120, fontWeight: 600, lineHeight: 1.05, marginTop: 24 }}>
          {SITE.name}
        </div>
        <div style={{ fontSize: 44, fontStyle: "italic", color: "#E3D8C2", marginTop: 16 }}>
          {`${SITE.slogan}.`}
        </div>
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#8E9C78", marginTop: 48 }}>
          {SITE.instagram}
        </div>
      </div>
    ),
    { ...size },
  );
}
