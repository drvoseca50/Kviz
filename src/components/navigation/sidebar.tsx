"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./nav-items";
import { Shield } from "lucide-react";

interface SidebarProps {
  roles: string[];
}

export function Sidebar({ roles }: SidebarProps) {
  const pathname = usePathname();
  const { items, roleLabel } = getNavItemsForRole(roles);

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col bg-[#1E1E2D] text-[#B0B0C3]">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <Shield className="h-6 w-6 text-blue-500" />
        <span className="text-lg font-bold text-white">Testikko</span>
      </div>

      {/* Role badge */}
      <div className="px-6 pb-4">
        <span className="inline-block rounded-md bg-blue-500/10 px-2.5 py-1 text-xs font-medium text-blue-400">
          {roleLabel}
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 overflow-y-auto">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-500/15 text-blue-400"
                  : "text-[#B0B0C3] hover:bg-[#2A2A3C] hover:text-gray-200"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
