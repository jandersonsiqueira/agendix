import type { Metadata, Viewport } from "next";
import "./globals.css";

// Apply the saved theme before the first paint to avoid a light flash.
const themeInitializationScript = `
  (() => {
    let saved;
    try { saved = localStorage.getItem('agendix-theme'); } catch {}
    const dark = saved === 'dark' || (
      saved !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches
    );
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      'content', dark ? '#151e2e' : '#ffffff'
    );
  })();
`;

export const metadata: Metadata = {
  title: { default: "Agendix", template: "%s | Agendix" },
  description: "Seu negócio, seus horários, tudo organizado.",
  applicationName: "Agendix",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icons/icon-192.png", apple: "/icons/apple-180.png" },
  appleWebApp: { capable: true, title: "Agendix", statusBarStyle: "default" },
};
export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeInitializationScript }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
