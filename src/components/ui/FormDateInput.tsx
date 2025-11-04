import { forwardRef } from "react";
import { FieldError } from "react-hook-form";
import { Calendar } from "lucide-react";

interface FormDateInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: FieldError | string;
  helperText?: string;
}

/**
 * Componente DateInput compatível com React Hook Form
 * Todo o campo é clicável para abrir o calendário
 */
export const FormDateInput = forwardRef<HTMLInputElement, FormDateInputProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    const handleWrapperClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const input = e.currentTarget.querySelector("input") as HTMLInputElement;
      if (input && !props.disabled) {
        input.showPicker?.();
      }
    };

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div
          className="relative cursor-pointer"
          onClick={handleWrapperClick}
        >
          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary pointer-events-none" />
          <input
            ref={ref}
            type="date"
            className={`
              w-full pl-10 pr-3 py-2 rounded-lg border
              bg-background-primary
              text-text-primary
              placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              cursor-pointer
              ${errorMessage ? "border-red-500" : "border-border-primary"}
              ${className}
            `}
            {...props}
          />
        </div>

        {errorMessage && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {errorMessage}
          </p>
        )}

        {helperText && !errorMessage && <p className="text-sm text-text-secondary">{helperText}</p>}
      </div>
    );
  }
);

FormDateInput.displayName = "FormDateInput";
