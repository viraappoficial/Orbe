import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const jost = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-jost",
});

export const metadata: Metadata = {
  title: "ORBE",
  description:
    "Selo e comunidade de live sessions de DJs, gravadas em lugares sempre diferentes.",
  openGraph: {
    title: "ORBE",
    description: "Live sessions de DJs em lugares sempre diferentes.",
    images: ["/logo.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className={jost.variable}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
