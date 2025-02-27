import type { Metadata } from "next";
import { Jost } from "next/font/google";
import "./assets/globals.css";
import LayoutWrapper from "./components/LayoutWrapper";

const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MoneyLens",
  description: "Simplify your finances",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={jost.variable}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}