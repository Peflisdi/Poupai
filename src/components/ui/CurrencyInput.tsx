/**
 * Input de moeda com formato brasileiro (BRL)
 * Digita da direita para esquerda, como um caixa eletrônico
 */

"use client";

import { useState, useEffect } from "react";
import { Input } from "./Input";

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "0,00",
  className = "",
  disabled = false,
}: CurrencyInputProps) {
  // Mantém o valor interno em centavos para facilitar cálculo
  const [displayValue, setDisplayValue] = useState("");

  // Atualiza display quando valor externo muda
  useEffect(() => {
    const formatted = formatValueForDisplay(value);
    setDisplayValue(formatted);
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
      onChange(0);
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
    onChange(numericValue);
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

    // Permite: Ctrl/Cmd + A, C, V, X
    if ((e.ctrlKey || e.metaKey) && ["a", "c", "v", "x"].includes(e.key.toLowerCase())) {
      return;
    }

    // Bloqueia tudo que não é número
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  }

  return (
    <div>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 dark:text-neutral-400 font-medium pointer-events-none z-10">
          R$
        </span>
        <Input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={`pl-10 text-left font-mono text-lg ${className}`}
          disabled={disabled}
          inputMode="numeric"
        />
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400 mt-1 text-left">
        Digite apenas números • Ex: 5000 = R$ 50,00
      </div>
    </div>
  );
}
