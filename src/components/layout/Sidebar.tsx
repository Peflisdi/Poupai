"use client";

import { useState } from "react";
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
  Menu,
  X,
  HandCoins,
  Users,
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
    label: "Empréstimos",
    href: "/emprestimos",
    icon: HandCoins,
  },
  {
    label: "Gastos por Pessoa",
    href: "/reports/by-person",
    icon: Users,
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
  const [isOpen, setIsOpen] = useState(false);

  const closeSidebar = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-4 z-50 flex items-center justify-center rounded-lg bg-background-secondary p-2 text-text-primary shadow-lg lg:hidden"
        aria-label="Toggle menu"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 bg-black/80 lg:hidden" onClick={closeSidebar} />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full w-64 border-r border-border-primary bg-white dark:bg-neutral-950 transition-transform duration-300 lg:translate-x-0 shadow-2xl lg:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col bg-white dark:bg-neutral-950">
          {/* Logo */}
          <div className="flex h-16 items-center gap-2 border-b border-border-primary px-6 bg-white dark:bg-neutral-950">
            <Wallet className="h-6 w-6 text-text-primary" />
            <span className="text-lg font-semibold text-text-primary">FinControl</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 overflow-y-auto p-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={closeSidebar}
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
    </>
  );
}
