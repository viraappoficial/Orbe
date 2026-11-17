import type { Metadata } from "next";

// Área restrita: fora dos buscadores.
export const metadata: Metadata = {
  title: "Admin · ORBE",
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-svh bg-black">{children}</div>;
}
