import type { Metadata } from "next";

import "@/styles/tokens.css";
import "@/styles/base.css";
import "@/styles/personas.css";
import "@/styles/components.css";
import "@/styles/hkg-push-demo.css";

export const metadata: Metadata = {
  title: "JourneyKit - 行程规划 H5",
  description: "JourneyKit 香港行程规划演示",
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
