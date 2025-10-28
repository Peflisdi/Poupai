"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { FormInput } from "@/components/ui/FormInput";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { Select } from "@/components/ui/Select";
import { usePeople } from "@/hooks/usePeople";
import PersonModal from "@/components/people/PersonModal";
import type { Loan } from "@/services/loanService";
import type { CreatePersonData } from "@/hooks/usePeople";

// Schema para o formulário do modal (similar ao loanSchema mas adaptado para o form)
const loanFormSchema = z.object({
  type: z.enum(["LENT", "BORROWED"]),
  personName: z.string().min(1, "Nome da pessoa é obrigatório"),
  description: z.string().max(255, "Descrição muito longa").optional(),
  totalAmount: z.number().positive("Valor deve ser positivo"),
  installments: z.number().int().min(1).max(24),
  dueDate: z.string().optional(),
  notes: z.string().max(500, "Notas muito longas").optional(),
});

type LoanFormData = z.infer<typeof loanFormSchema>;

interface LoanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  loan?: Loan;
}

export function LoanModal({ isOpen, onClose, onSave, loan }: LoanModalProps) {
  const { people, createPerson } = usePeople();
  const [isLoading, setIsLoading] = useState(false);
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<LoanFormData>({
    resolver: zodResolver(loanFormSchema),
    defaultValues: {
      type: "LENT",
      personName: "",
      description: "",
      totalAmount: 0,
      installments: 1,
      dueDate: "",
      notes: "",
    },
  });

  const selectedType = watch("type");
  const selectedPersonName = watch("personName");
  const totalAmount = watch("totalAmount");

  // Populate form when editing
  useEffect(() => {
    if (loan) {
      setValue("type", loan.type);
      setValue("personName", loan.personName);
      setValue("description", loan.description || "");
      setValue("totalAmount", loan.totalAmount);
      setValue("installments", loan.installments || 1);
      setValue("dueDate", loan.dueDate ? new Date(loan.dueDate).toISOString().split("T")[0] : "");
      setValue("notes", loan.notes || "");
    } else {
      reset();
    }
  }, [loan, setValue, reset]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: LoanFormData) => {
    setIsLoading(true);
    try {
      await onSave({
        ...data,
        totalAmount: data.totalAmount,
        date: new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
      });
      reset();
      onClose();
    } catch (error) {
      console.error("Error saving loan:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreatePerson = async (personData: CreatePersonData) => {
    try {
      await createPerson(personData);
      setValue("personName", personData.name);
      setIsPersonModalOpen(false);
    } catch (error) {
      console.error("Error creating person:", error);
    }
  };

  if (!isOpen) return null;

  const selectedPerson = people.find((p) => p.name === selectedPersonName);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
            {loan ? "Editar Empréstimo" : "Novo Empréstimo"}
          </h2>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
            disabled={isLoading}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-6">
            {/* Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Tipo *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setValue("type", "LENT")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedType === "LENT"
                      ? "border-green-500 bg-green-50 dark:bg-green-950/30"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-green-300"
                  }`}
                >
                  <span className="text-sm font-semibold">💸 Emprestei</span>
                </button>
                <button
                  type="button"
                  onClick={() => setValue("type", "BORROWED")}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    selectedType === "BORROWED"
                      ? "border-orange-500 bg-orange-50 dark:bg-orange-950/30"
                      : "border-neutral-200 dark:border-neutral-800 hover:border-orange-300"
                  }`}
                >
                  <span className="text-sm font-semibold">💰 Peguei</span>
                </button>
              </div>
              {errors.type && (
                <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>
              )}
            </div>

            {/* Person Name with Avatar */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                  Nome da Pessoa *
                </label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPersonModalOpen(true)}
                  className="text-xs"
                >
                  <UserPlus className="h-3 w-3 mr-1" />
                  Nova Pessoa
                </Button>
              </div>
              <div className="relative">
                {selectedPerson && (
                  <div
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full z-10 pointer-events-none"
                    style={{
                      backgroundColor: selectedPerson.color,
                    }}
                  />
                )}
                <select
                  {...register("personName")}
                  className={`w-full px-4 py-2 bg-white dark:bg-neutral-800 border ${
                    errors.personName
                      ? "border-red-500"
                      : "border-neutral-300 dark:border-neutral-700"
                  } rounded-lg focus:ring-2 focus:ring-purple-500 dark:focus:ring-purple-400 focus:border-transparent outline-none transition-all ${
                    selectedPerson ? "pl-9" : ""
                  }`}
                >
                  <option value="">Selecione uma pessoa</option>
                  {people.map((person) => (
                    <option key={person.id} value={person.name}>
                      {person.name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.personName && (
                <p className="text-red-500 text-xs mt-1">{errors.personName.message}</p>
              )}
            </div>

            {/* Total Amount */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Valor Total *
              </label>
              <CurrencyInput
                value={totalAmount}
                onChange={(value) => setValue("totalAmount", value)}
                placeholder="0,00"
              />
              {errors.totalAmount && (
                <p className="text-red-500 text-xs mt-1">{errors.totalAmount.message}</p>
              )}
            </div>

            {/* Description */}
            <FormInput
              label="Descrição (Opcional)"
              error={errors.description?.message}
              {...register("description")}
              placeholder="Ex: Ajuda com contas, Viagem..."
            />

            {/* Grid: Installments + Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Installments */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Número de Parcelas
                </label>
                <Select {...register("installments", { valueAsNumber: true })}>
                  <option value="1">1x (À vista)</option>
                  {Array.from({ length: 23 }, (_, i) => i + 2).map((num) => (
                    <option key={num} value={num}>
                      {num}x parcelas
                    </option>
                  ))}
                </Select>
                {errors.installments && (
                  <p className="text-red-500 text-xs mt-1">{errors.installments.message}</p>
                )}
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Data de Vencimento (Opcional)
                </label>
                <input
                  type="date"
                  {...register("dueDate")}
                  onClick={(e) => (e.target as HTMLInputElement).showPicker?.()}
                  className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.dueDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.dueDate.message}</p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                Notas/Observações (Opcional)
              </label>
              <textarea
                {...register("notes")}
                placeholder="Anotações adicionais..."
                rows={3}
                className="w-full px-4 py-2 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              {errors.notes && (
                <p className="text-red-500 text-xs mt-1">{errors.notes.message}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                onClick={onClose}
                variant="secondary"
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" className="flex-1" disabled={isLoading}>
                {isLoading ? "Salvando..." : loan ? "Atualizar" : "Criar"}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Person Modal */}
      <PersonModal
        isOpen={isPersonModalOpen}
        onClose={() => setIsPersonModalOpen(false)}
        onSave={handleCreatePerson}
      />
    </div>
  );
}
