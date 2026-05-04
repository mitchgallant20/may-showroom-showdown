import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "The May Showroom Showdown · Winnipeg Hyundai",
  description:
    "Live monthly sales contest scoreboard for the Winnipeg Hyundai sales floor. Team Bill vs. Team Sumit.",
  icons: {
    icon: "/showroom-showdown-logo.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070d",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
