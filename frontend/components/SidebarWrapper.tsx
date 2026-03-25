"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const SIDEBAR_ROUTES = ["/events", "/tickets", "/dashboard"];

export default function SidebarWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = SIDEBAR_ROUTES.some((r) => pathname.startsWith(r));

  if (!showSidebar) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <div className="ml-64 flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
