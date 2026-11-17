import type { Metadata } from "next";
import { Jost } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Intro from "@/components/Intro";
import { Curtain } from "@/components/PageTransition";
import ScrollFX from "@/components/ScrollFX";
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

// Roda antes da primeira pintura: decide se a intro toca (1x por sessão,
// nunca com "reduzir movimento") e quanto ela dura (curta em /lista).
const bootScript = `(function(){var d=document.documentElement;d.classList.add("js");
try{var rm=matchMedia("(prefers-reduced-motion: reduce)").matches;
var seen=sessionStorage.getItem("orbe-intro");
if(rm||seen){d.dataset.intro="skip";d.style.setProperty("--io","0s")}
else{d.dataset.intro="play";d.style.setProperty("--io",location.pathname==="/lista"?"1.4s":"2.4s")}
}catch(e){d.dataset.intro="skip";d.style.setProperty("--io","0s")}
setTimeout(function(){d.classList.add("reveal-all")},5000)})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body className={jost.variable}>
        <Intro />
        <Curtain />
        <ScrollFX />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
