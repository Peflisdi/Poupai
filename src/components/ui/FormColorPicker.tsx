import { forwardRef } from "react";
import { FieldError } from "react-hook-form";

interface ColorOption {
  name: string;
  value: string;
}

interface FormColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  error?: FieldError | string;
  colors: ColorOption[];
}

/**
 * Componente ColorPicker compatível com React Hook Form
 * Usa setValue() do RHF para atualizar o valor
 */
export const FormColorPicker = forwardRef<HTMLDivElement, FormColorPickerProps>(
  ({ label, value, onChange, error, colors }, ref) => {
    const errorMessage = typeof error === "string" ? error : error?.message;

    return (
      <div ref={ref} className="space-y-2">
        <label className="block text-sm font-medium text-text-primary">{label}</label>

        <div className="grid grid-cols-4 gap-2">
          {colors.map((colorOption) => (
            <button
              key={colorOption.value}
              type="button"
              onClick={() => onChange(colorOption.value)}
              className={`p-3 rounded-lg border-2 transition-all ${
                value === colorOption.value
                  ? "border-blue-500 scale-105 ring-2 ring-blue-200 dark:ring-blue-800"
                  : "border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600"
              }`}
              style={{ backgroundColor: colorOption.value }}
              title={colorOption.name}
              aria-label={colorOption.name}
            >
              {value === colorOption.value && (
                <div className="w-4 h-4 mx-auto">
                  <svg
                    className="w-full h-full text-white drop-shadow-lg"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </button>
          ))}
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
      </div>
    );
  }
);

FormColorPicker.displayName = "FormColorPicker";
