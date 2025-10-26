import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface FormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  error?: FieldError | string;
  helperText?: string;
}

/**
 * Componente Checkbox compatível com React Hook Form
 * Usa forwardRef para permitir registro com {...register()}
 */
export const FormCheckbox = forwardRef<HTMLInputElement, FormCheckboxProps>(
  ({ label, error, helperText, className = "", ...props }, ref) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    return (
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <input
            ref={ref}
            type="checkbox"
            className={`
              w-4 h-4 rounded border-border-primary
              text-primary
              focus:ring-2 focus:ring-primary focus:ring-offset-0
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errorMessage ? "border-red-500" : ""}
              ${className}
            `}
            {...props}
          />
          <label className="text-sm font-medium text-text-primary cursor-pointer select-none">
            {label}
          </label>
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

        {helperText && !errorMessage && (
          <p className="text-sm text-text-secondary ml-6">{helperText}</p>
        )}
      </div>
    );
  }
);

FormCheckbox.displayName = "FormCheckbox";
