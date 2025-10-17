"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowRightLeft,
  CreditCard,
  Target,
  FolderOpen,
  BarChart3,
  Settings,
  Wallet,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";

const menuItems = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "Transações",
    href: "/transactions",
    icon: ArrowRightLeft,
  },
  {
    label: "Cartões",
    href: "/cards",
    icon: CreditCard,
  },
  {
    label: "Objetivos",
    href: "/goals",
    icon: Target,
  },
  {
    label: "Categorias",
    href: "/categories",
    icon: FolderOpen,
  },
  {
    label: "Relatórios",
    href: "/reports",
    icon: BarChart3,
  },
  {
    label: "Configurações",
    href: "/settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 border-r border-border-primary bg-background-secondary">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border-primary px-6">
          <Wallet className="h-6 w-6 text-text-primary" />
          <span className="text-lg font-semibold text-text-primary">FinControl</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-background-tertiary text-text-primary"
                    : "text-text-secondary hover:bg-background-tertiary hover:text-text-primary"
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle */}
        <div className="border-t border-border-primary p-4">
          <ThemeToggle />
        </div>
      </div>
    </aside>
  );
}
