"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  children: React.ReactNode;
}

export function Select({ className, children, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(
          "w-full pl-4 pr-12 py-3 bg-primary border border-primary rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))] text-primary appearance-none cursor-pointer",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-tertiary pointer-events-none transition-transform duration-200" />
    </div>
  );
}
