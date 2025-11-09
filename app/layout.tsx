import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Privacy-First Analytics | Browser-Based SQL Analytics",
  description: "Query your data locally with complete privacy. Powered by DuckDB WASM. Zero server involvement.",
  openGraph: {
    title: "Privacy-First Analytics | Browser-Based SQL Analytics",
    description: "Query your data locally with complete privacy. Powered by DuckDB WASM. Zero server involvement.",
    tags: ["analytics", "sql", "duckdb", "wasm", "privacy", "browser-based", "zero-server-involvement"],
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Privacy-First Analytics | Browser-Based SQL Analytics",
    description: "Query your data locally with complete privacy. Powered by DuckDB WASM. Zero server involvement.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },

  creator: "Avik Mukherjee",
  publisher: "Avik Mukherjee",
  category: "technology",
  keywords: ["analytics", "sql", "duckdb", "wasm", "privacy", "browser-based", "zero-server-involvement"],


};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
