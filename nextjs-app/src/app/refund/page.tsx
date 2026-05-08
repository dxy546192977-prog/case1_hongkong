"use client";

import { useEffect } from "react";

export default function RefundPage() {
  useEffect(() => {
    window.location.replace("/refund.html");
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "system-ui, sans-serif",
        background: "#bac1d8",
        color: "#1a1a2e",
      }}
    >
      <p>正在加载退改链路 demo...</p>
    </main>
  );
}
