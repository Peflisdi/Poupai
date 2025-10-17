import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-small text-primary font-medium mb-2">
            {label}
          </label>
        )}
        <input
          id={inputId}
          ref={ref}
          className={cn(
            "w-full px-4 py-3 text-body bg-primary border border-primary rounded-button",
            "text-primary placeholder:text-tertiary",
            "focus:outline-none focus:ring-2 focus:ring-[rgb(var(--accent))]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "smooth-transition",
            error && "border-alert-error focus:ring-alert-error",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-small text-alert-error dark:text-alert-errorDark">{error}</p>
        )}
        {helperText && !error && <p className="mt-1.5 text-small text-tertiary">{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
