"use client";

interface LineChartProps {
  data: { label: string; income: number; expense: number }[];
  height?: number;
}

export function LineChart({ data, height = 300 }: LineChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-500">
        Sem dados para exibir
      </div>
    );
  }

  const maxValue = Math.max(...data.map((d) => Math.max(d.income, d.expense)));

  const incomePoints = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.income / maxValue) * 80;
    return `${x},${y}`;
  });

  const expensePoints = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (item.expense / maxValue) * 80;
    return `${x},${y}`;
  });

  return (
    <div className="w-full relative" style={{ height }}>
      {/* Chart Area */}
      <div className="px-4 pb-2">
        <svg
          viewBox="0 0 100 100"
          className="w-full"
          style={{ height: height - 80 }}
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          <line
            x1="0"
            y1="20"
            x2="100"
            y2="20"
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-neutral-200 dark:text-neutral-800"
          />
          <line
            x1="0"
            y1="40"
            x2="100"
            y2="40"
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-neutral-200 dark:text-neutral-800"
          />
          <line
            x1="0"
            y1="60"
            x2="100"
            y2="60"
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-neutral-200 dark:text-neutral-800"
          />
          <line
            x1="0"
            y1="80"
            x2="100"
            y2="80"
            stroke="currentColor"
            strokeWidth="0.1"
            className="text-neutral-200 dark:text-neutral-800"
          />

          {/* Income Line */}
          <polyline
            points={incomePoints.join(" ")}
            fill="none"
            stroke="#22C55E"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Expense Line */}
          <polyline
            points={expensePoints.join(" ")}
            fill="none"
            stroke="#EF4444"
            strokeWidth="0.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Income Dots */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.income / maxValue) * 80;
            return (
              <circle
                key={`income-${index}`}
                cx={x}
                cy={y}
                r="1"
                fill="#22C55E"
                className="hover:r-2 transition-all cursor-pointer"
              />
            );
          })}

          {/* Expense Dots */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (item.expense / maxValue) * 80;
            return (
              <circle
                key={`expense-${index}`}
                cx={x}
                cy={y}
                r="1"
                fill="#EF4444"
                className="hover:r-2 transition-all cursor-pointer"
              />
            );
          })}
        </svg>

        {/* Labels */}
        <div className="flex justify-between px-1 mt-3">
          {data.map((item, index) => (
            <span
              key={index}
              className="text-xs text-neutral-600 dark:text-neutral-400 text-center"
              style={{ width: `${100 / data.length}%` }}
            >
              {item.label}
            </span>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Receitas</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm text-neutral-600 dark:text-neutral-400">Despesas</span>
        </div>
      </div>
    </div>
  );
}
