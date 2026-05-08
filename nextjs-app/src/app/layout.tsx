import type { Metadata, Viewport } from "next";
import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/personas.css";
import "@/styles/components.css";
import "@/styles/transit-card.css";
import "@/styles/transit-assistant.css";
import "@/styles/hkg-push-demo.css";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "JourneyKit - 香港行程规划",
  description: "JourneyKit 香港线路 demo",
  icons: { icon: "data:," },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
  themeColor: "#bac1d8",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
