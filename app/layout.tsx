import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Geist, Geist_Mono, Sora } from "next/font/google";
import LanguageProvider from "@/components/LanguageProvider";
import PageViewTracker from "@/components/PageViewTracker";
import PwaRegister from "@/components/PwaRegister";
import { normalizeLanguage, LANGUAGE_COOKIE_NAME } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin"],
});

const displayPreferenceScript = `
(() => {
  const themeKey = "speakflow-appearance-preference";
  const fontSizeKey = "speakflow-font-size-preference";
  const validThemes = new Set(["system", "light", "dark"]);
  const validFontSizes = new Set(["small", "standard", "large"]);

  try {
    const root = document.documentElement;
    const fontSize = localStorage.getItem(fontSizeKey);
    const systemQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolveTheme = (preference) =>
      preference === "system" ? (systemQuery.matches ? "dark" : "light") : preference;

    const applyTheme = () => {
      const theme = localStorage.getItem(themeKey);
      const preference = validThemes.has(theme) ? theme : "system";
      const resolvedTheme = resolveTheme(preference);

      root.dataset.appTheme = resolvedTheme;
      root.dataset.speakflowTheme = preference;
      root.dataset.appThemePreference = preference;
    };

    applyTheme();
    systemQuery.addEventListener?.("change", applyTheme);
    root.dataset.speakflowFontSize = validFontSizes.has(fontSize)
      ? fontSize
      : "standard";
  } catch {
    document.documentElement.dataset.appTheme = "system";
    document.documentElement.dataset.speakflowTheme = "system";
    document.documentElement.dataset.appThemePreference = "system";
    document.documentElement.dataset.speakflowFontSize = "standard";
  }
})();
`;

export const metadata: Metadata = {
  applicationName: "SpeakFlow",
  title: "SpeakFlow",
  description: "English speaking practice workspace",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "SpeakFlow",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      {
        url: "/icons/pwa-icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        url: "/icons/pwa-icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
    apple: [
      {
        url: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#f7f9ff",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const initialLanguage = normalizeLanguage(
    cookieStore.get(LANGUAGE_COOKIE_NAME)?.value
  );

  return (
    <html
      lang={initialLanguage}
      suppressHydrationWarning
      data-app-theme="system"
      data-speakflow-font-size="standard"
      data-speakflow-theme="system"
      data-app-theme-preference="system"
      className={`${geistSans.variable} ${geistMono.variable} ${sora.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col"
      >
        <script dangerouslySetInnerHTML={{ __html: displayPreferenceScript }} />
        <LanguageProvider initialLanguage={initialLanguage}>
          <PwaRegister />
          <PageViewTracker />
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
