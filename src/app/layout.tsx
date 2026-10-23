import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Agendix", template: "%s | Agendix" },
  description: "Seu negócio, seus horários, tudo organizado.",
  applicationName: "Agendix",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-180.png" },
  appleWebApp: { capable: true, title: "Agendix", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  themeColor: "#1559ef",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
