'use client';

import { usePathname } from "next/navigation";
import NavBar from "./NavBar";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const isLoginPage = pathname === "/"; // Hide navbar on login

  return (
    <div className="layout">
      {!isLoginPage && <NavBar />}
      <main className={isLoginPage ? "noNav" : "content"}>{children}</main>
    </div>
  );
}
