import type { Metadata } from "next";
import "./assets/styles/globals.css";

export const metadata: Metadata = {
  title: "MoneyLens",
  description: "Your financial management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}