import "./globals.css";
import { ReactNode } from "react";

export const metadata = {
  title: "Wildcard Maintenance",
  description: "J/105 maintenance and regatta planner"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
