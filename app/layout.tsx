import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Soil Moisture Dashboard",
  description: "Monitoring dashboard for ADC and soil moisture readings"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
