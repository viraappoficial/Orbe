import type { Metadata } from "next";
import CheckinApp from "@/components/admin/CheckinApp";

export const metadata: Metadata = { title: "Check-in · ORBE", robots: { index: false, follow: false } };

export default function CheckinPage() {
  return <CheckinApp />;
}
