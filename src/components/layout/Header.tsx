"use client";

import { useSession, signOut } from "next-auth/react";
import { Search, User, LogOut, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useState, useEffect, useRef } from "react";
import { SearchModal } from "@/components/search/SearchModal";
import { useSearch } from "@/hooks/useSearch";

export function Header() {
  const { data: session } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const { isOpen, open, close } = useSearch();

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserMenu]);

  return (
    <header className="fixed left-64 right-0 top-0 z-10 h-16 border-b border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-950">
      <div className="flex h-full items-center justify-between px-6">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <button onClick={open} className="w-full text-left">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
              <div className="h-10 w-full rounded-lg border border-border-primary bg-background-primary pl-10 pr-20 flex items-center text-text-tertiary hover:border-border-secondary transition-colors">
                Buscar transações...
              </div>
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border-primary bg-background-secondary px-1.5 font-mono text-[10px] font-medium text-text-tertiary">
                <span className="text-xs">⌘</span>K
              </kbd>
            </div>
          </button>
        </div>

        {/* User Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-background-secondary"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-background-tertiary">
              <User className="h-4 w-4" />
            </div>
            <span>{session?.user?.name || session?.user?.email}</span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-border-primary bg-background-primary shadow-lg">
              <button
                onClick={() => signOut({ callbackUrl: "/auth/login" })}
                className="flex w-full items-center gap-2 px-4 py-2 text-sm text-text-secondary transition-colors hover:bg-background-secondary hover:text-text-primary"
              >
                <LogOut className="h-4 w-4" />
                Sair
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search Modal */}
      <SearchModal isOpen={isOpen} onClose={close} />
    </header>
  );
}
