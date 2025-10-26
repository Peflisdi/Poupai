import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: FieldError | string;
  helperText?: string;
  options: Array<{ value: string; label: string }>;
  placeholder?: string;
}

/**
 * Componente Select compatível com React Hook Form
 * Usa forwardRef para permitir registro com {...register()}
 */
export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, helperText, options, placeholder, className = "", ...props }, ref) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <select
          ref={ref}
          className={`
            w-full px-3 py-2 rounded-lg border
            bg-background-primary
            text-text-primary
            focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${errorMessage ? "border-red-500" : "border-border-primary"}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

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

FormSelect.displayName = "FormSelect";
