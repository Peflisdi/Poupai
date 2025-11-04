import { forwardRef, useState, useEffect } from "react";
import { FieldError } from "react-hook-form";

interface FormCurrencyInputProps {
  label: string;
  error?: FieldError | string;
  helperText?: string;
  value?: number;
  onChange?: (value: number) => void;
  onBlur?: () => void;
  name?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Input de moeda formatado em BRL compatível com React Hook Form
 * Digita da direita para esquerda, como caixa eletrônico
 * Uso: <FormCurrencyInput {...register("amount", { valueAsNumber: true })} />
 */
export const FormCurrencyInput = forwardRef<HTMLInputElement, FormCurrencyInputProps>(
  (
    {
      label,
      error,
      helperText,
      value = 0,
      onChange,
      onBlur,
      name,
      required,
      disabled,
      className = "",
    },
    ref
  ) => {
    const errorMessage = typeof error === "string" ? error : error?.message;
    const [displayValue, setDisplayValue] = useState("");

    // Atualiza display quando valor externo muda
    useEffect(() => {
      if (value === 0 || value === undefined) {
        setDisplayValue("");
      } else {
        const formatted = formatValueForDisplay(value);
        setDisplayValue(formatted);
      }
    }, [value]);

    /**
     * Formata número para exibição (ex: 12450.50 → "12.450,50")
     */
    function formatValueForDisplay(num: number): string {
      if (!num || num === 0) return "";

      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(num);
    }

    /**
     * Converte string de centavos para número decimal
     * Ex: "1245050" → 12450.50
     */
    function centsToNumber(cents: string): number {
      if (!cents || cents === "0") return 0;
      const numCents = parseInt(cents, 10);
      return numCents / 100;
    }

    /**
     * Handle de mudança - aceita apenas dígitos
     */
    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const input = e.target.value;

      // Remove tudo que não é número
      const digitsOnly = input.replace(/\D/g, "");

      if (digitsOnly === "") {
        setDisplayValue("");
        onChange?.(0);
        return;
      }

      // Limita a 12 dígitos (999.999.999,99)
      const limitedDigits = digitsOnly.slice(0, 12);

      // Converte centavos para número decimal
      const numericValue = centsToNumber(limitedDigits);

      // Formata para exibição
      const formatted = formatValueForDisplay(numericValue);
      setDisplayValue(formatted);

      // Notifica mudança
      onChange?.(numericValue);
    }

    /**
     * Handle de teclas especiais
     */
    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      // Permite: backspace, delete, tab, escape, enter, setas
      const specialKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
      ];

      if (specialKeys.includes(e.key)) {
        return;
      }

      // Permite apenas números
      if (!/^\d$/.test(e.key)) {
        e.preventDefault();
      }
    }

    return (
      <div className="space-y-1">
        <label className="block text-sm font-medium text-text-primary">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary">R$</span>
          <input
            ref={ref}
            name={name}
            type="text"
            inputMode="numeric"
            value={displayValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={onBlur}
            disabled={disabled}
            placeholder="0,00"
            className={`
              w-full pl-12 pr-3 py-2 rounded-lg border
              bg-background-primary
              text-text-primary
              placeholder:text-text-tertiary
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
              disabled:opacity-50 disabled:cursor-not-allowed
              ${errorMessage ? "border-red-500" : "border-border-primary"}
              ${className}
            `}
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

FormCurrencyInput.displayName = "FormCurrencyInput";
