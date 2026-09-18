import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #1c1814 0%, #0a0907 100%)",
        }}
      >
        <div
          style={{
            fontSize: "96px",
            fontWeight: 400,
            fontFamily: "serif",
            fontStyle: "italic",
            color: "#fef3c7",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          t<span style={{ color: "#f59e0b" }}>.</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

