/**
 * Sistema de validações reutilizáveis para formulários
 */

export type ValidationError = {
  field: string;
  message: string;
};

export type ValidationResult = {
  isValid: boolean;
  errors: ValidationError[];
};

/**
 * Validadores individuais
 */
export const validators = {
  required: (value: unknown, fieldName: string): ValidationError | null => {
    if (value === null || value === undefined || value === "") {
      return { field: fieldName, message: `${fieldName} é obrigatório` };
    }
    return null;
  },

  minLength: (value: string, min: number, fieldName: string): ValidationError | null => {
    if (value && value.length < min) {
      return {
        field: fieldName,
        message: `${fieldName} deve ter no mínimo ${min} caracteres`,
      };
    }
    return null;
  },

  maxLength: (value: string, max: number, fieldName: string): ValidationError | null => {
    if (value && value.length > max) {
      return {
        field: fieldName,
        message: `${fieldName} deve ter no máximo ${max} caracteres`,
      };
    }
    return null;
  },

  minValue: (value: number, min: number, fieldName: string): ValidationError | null => {
    if (value !== null && value !== undefined && value < min) {
      return {
        field: fieldName,
        message: `${fieldName} deve ser no mínimo ${min}`,
      };
    }
    return null;
  },

  maxValue: (value: number, max: number, fieldName: string): ValidationError | null => {
    if (value !== null && value !== undefined && value > max) {
      return {
        field: fieldName,
        message: `${fieldName} deve ser no máximo ${max}`,
      };
    }
    return null;
  },

  positiveNumber: (value: number, fieldName: string): ValidationError | null => {
    if (value !== null && value !== undefined && value <= 0) {
      return {
        field: fieldName,
        message: `${fieldName} deve ser um valor positivo`,
      };
    }
    return null;
  },

  validDate: (value: Date | string, fieldName: string): ValidationError | null => {
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return { field: fieldName, message: `${fieldName} inválida` };
    }
    return null;
  },

  futureDate: (value: Date | string, fieldName: string): ValidationError | null => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (date < now) {
      return {
        field: fieldName,
        message: `${fieldName} deve ser uma data futura`,
      };
    }
    return null;
  },

  pastDate: (value: Date | string, fieldName: string): ValidationError | null => {
    const date = new Date(value);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (date > now) {
      return {
        field: fieldName,
        message: `${fieldName} não pode ser uma data futura`,
      };
    }
    return null;
  },

  reasonableDate: (value: Date | string, fieldName: string): ValidationError | null => {
    const date = new Date(value);
    const now = new Date();
    const fiveYearsAgo = new Date();
    fiveYearsAgo.setFullYear(now.getFullYear() - 5);
    const oneYearAhead = new Date();
    oneYearAhead.setFullYear(now.getFullYear() + 1);

    if (date < fiveYearsAgo || date > oneYearAhead) {
      return {
        field: fieldName,
        message: `${fieldName} deve estar entre 5 anos atrás e 1 ano à frente`,
      };
    }
    return null;
  },

  email: (value: string, fieldName: string): ValidationError | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (value && !emailRegex.test(value)) {
      return { field: fieldName, message: `${fieldName} inválido` };
    }
    return null;
  },

  hexColor: (value: string, fieldName: string): ValidationError | null => {
    const hexRegex = /^#[0-9A-F]{6}$/i;
    if (value && !hexRegex.test(value)) {
      return {
        field: fieldName,
        message: `${fieldName} deve ser uma cor hexadecimal válida`,
      };
    }
    return null;
  },

  dayOfMonth: (value: number, fieldName: string): ValidationError | null => {
    if (value !== null && value !== undefined && (value < 1 || value > 31)) {
      return {
        field: fieldName,
        message: `${fieldName} deve estar entre 1 e 31`,
      };
    }
    return null;
  },

  installments: (value: number, fieldName: string): ValidationError | null => {
    if (value !== null && value !== undefined && (value < 1 || value > 48)) {
      return {
        field: fieldName,
        message: `${fieldName} deve estar entre 1 e 48`,
      };
    }
    return null;
  },
};

/**
 * Validações específicas por entidade
 */
export const transactionValidations = {
  validate: (data: {
    description: string;
    amount: number;
    date: Date | string;
    categoryId?: string;
    installments?: number;
  }): ValidationResult => {
    const errors: ValidationError[] = [];

    // Descrição
    const descError = validators.required(data.description, "Descrição");
    if (descError) errors.push(descError);
    else {
      const minError = validators.minLength(data.description, 3, "Descrição");
      if (minError) errors.push(minError);
      const maxError = validators.maxLength(data.description, 100, "Descrição");
      if (maxError) errors.push(maxError);
    }

    // Valor
    const amountError = validators.required(data.amount, "Valor");
    if (amountError) errors.push(amountError);
    else {
      const positiveError = validators.positiveNumber(data.amount, "Valor");
      if (positiveError) errors.push(positiveError);
      const maxError = validators.maxValue(data.amount, 1000000, "Valor");
      if (maxError) errors.push(maxError);
    }

    // Data
    const dateError = validators.required(data.date, "Data");
    if (dateError) errors.push(dateError);
    else {
      const validError = validators.validDate(data.date, "Data");
      if (validError) errors.push(validError);
      else {
        const reasonableError = validators.reasonableDate(data.date, "Data");
        if (reasonableError) errors.push(reasonableError);
      }
    }

    // Categoria
    const categoryError = validators.required(data.categoryId, "Categoria");
    if (categoryError) errors.push(categoryError);

    // Parcelas (se informado)
    if (data.installments !== undefined && data.installments !== null) {
      const installmentsError = validators.installments(data.installments, "Parcelas");
      if (installmentsError) errors.push(installmentsError);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export const categoryValidations = {
  validate: (data: {
    name: string;
    icon: string;
    color: string;
    budget?: number;
  }): ValidationResult => {
    const errors: ValidationError[] = [];

    // Nome
    const nameError = validators.required(data.name, "Nome");
    if (nameError) errors.push(nameError);
    else {
      const minError = validators.minLength(data.name, 2, "Nome");
      if (minError) errors.push(minError);
      const maxError = validators.maxLength(data.name, 50, "Nome");
      if (maxError) errors.push(maxError);
    }

    // Ícone
    const iconError = validators.required(data.icon, "Ícone");
    if (iconError) errors.push(iconError);

    // Cor
    const colorError = validators.required(data.color, "Cor");
    if (colorError) errors.push(colorError);
    else {
      const hexError = validators.hexColor(data.color, "Cor");
      if (hexError) errors.push(hexError);
    }

    // Orçamento (opcional)
    if (data.budget !== undefined && data.budget !== null && data.budget > 0) {
      const positiveError = validators.positiveNumber(data.budget, "Orçamento");
      if (positiveError) errors.push(positiveError);
      const maxError = validators.maxValue(data.budget, 1000000, "Orçamento");
      if (maxError) errors.push(maxError);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export const goalValidations = {
  validate: (data: {
    name: string;
    targetAmount: number;
    currentAmount?: number;
    targetDate: Date | string;
  }): ValidationResult => {
    const errors: ValidationError[] = [];

    // Nome
    const nameError = validators.required(data.name, "Nome");
    if (nameError) errors.push(nameError);
    else {
      const minError = validators.minLength(data.name, 3, "Nome");
      if (minError) errors.push(minError);
      const maxError = validators.maxLength(data.name, 50, "Nome");
      if (maxError) errors.push(maxError);
    }

    // Valor alvo
    const targetError = validators.required(data.targetAmount, "Valor alvo");
    if (targetError) errors.push(targetError);
    else {
      const positiveError = validators.positiveNumber(data.targetAmount, "Valor alvo");
      if (positiveError) errors.push(positiveError);
      const maxError = validators.maxValue(data.targetAmount, 10000000, "Valor alvo");
      if (maxError) errors.push(maxError);
    }

    // Valor atual (opcional)
    if (data.currentAmount !== undefined && data.currentAmount !== null && data.currentAmount > 0) {
      const positiveError = validators.positiveNumber(data.currentAmount, "Valor atual");
      if (positiveError) errors.push(positiveError);

      // Valor atual não pode ser maior que valor alvo
      if (data.currentAmount > data.targetAmount) {
        errors.push({
          field: "Valor atual",
          message: "Valor atual não pode ser maior que o valor alvo",
        });
      }
    }

    // Data alvo
    const dateError = validators.required(data.targetDate, "Data alvo");
    if (dateError) errors.push(dateError);
    else {
      const validError = validators.validDate(data.targetDate, "Data alvo");
      if (validError) errors.push(validError);
      else {
        const futureError = validators.futureDate(data.targetDate, "Data alvo");
        if (futureError) errors.push(futureError);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

export const cardValidations = {
  validate: (data: {
    name: string;
    limit: number;
    closingDay: number;
    dueDay: number;
    color: string;
  }): ValidationResult => {
    const errors: ValidationError[] = [];

    // Nome
    const nameError = validators.required(data.name, "Nome");
    if (nameError) errors.push(nameError);
    else {
      const minError = validators.minLength(data.name, 2, "Nome");
      if (minError) errors.push(minError);
      const maxError = validators.maxLength(data.name, 50, "Nome");
      if (maxError) errors.push(maxError);
    }

    // Limite
    const limitError = validators.required(data.limit, "Limite");
    if (limitError) errors.push(limitError);
    else {
      const positiveError = validators.positiveNumber(data.limit, "Limite");
      if (positiveError) errors.push(positiveError);
      const maxError = validators.maxValue(data.limit, 1000000, "Limite");
      if (maxError) errors.push(maxError);
    }

    // Dia de fechamento
    const closingError = validators.required(data.closingDay, "Dia de fechamento");
    if (closingError) errors.push(closingError);
    else {
      const dayError = validators.dayOfMonth(data.closingDay, "Dia de fechamento");
      if (dayError) errors.push(dayError);
    }

    // Dia de vencimento
    const dueError = validators.required(data.dueDay, "Dia de vencimento");
    if (dueError) errors.push(dueError);
    else {
      const dayError = validators.dayOfMonth(data.dueDay, "Dia de vencimento");
      if (dayError) errors.push(dayError);
    }

    // Cor
    const colorError = validators.required(data.color, "Cor");
    if (colorError) errors.push(colorError);
    else {
      const hexError = validators.hexColor(data.color, "Cor");
      if (hexError) errors.push(hexError);
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  },
};

/**
 * Hook para usar validações em componentes
 */
export const useValidation = () => {
  const getErrorMessage = (errors: ValidationError[], field: string): string | undefined => {
    const error = errors.find((e) => e.field === field);
    return error?.message;
  };

  const hasError = (errors: ValidationError[], field: string): boolean => {
    return errors.some((e) => e.field === field);
  };

  return {
    getErrorMessage,
    hasError,
  };
};
