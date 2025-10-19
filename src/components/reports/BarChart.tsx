"use client";

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  height?: number;
}

export function BarChart({ data, height = 300 }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className="w-full overflow-x-auto" style={{ height }}>
      <div className="flex items-end justify-between gap-2 sm:gap-4 h-full pb-8 min-w-max sm:min-w-0">
        {data.map((item, index) => {
          const percentage = maxValue > 0 ? (item.value / maxValue) * 100 : 0;

          return (
            <div
              key={index}
              className="flex-1 flex flex-col items-center gap-2 min-w-[60px] sm:min-w-0"
            >
              {/* Bar */}
              <div className="w-full flex flex-col justify-end" style={{ height: height - 60 }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500 hover:opacity-80 relative group"
                  style={{
                    height: `${percentage}%`,
                    backgroundColor: item.color,
                    minHeight: item.value > 0 ? "4px" : "0",
                  }}
                >
                  {/* Tooltip on hover */}
                  <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-3 py-1.5 rounded-lg text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                    R$ {item.value.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Label */}
              <span className="text-xs text-neutral-600 dark:text-neutral-400 text-center truncate w-full max-w-[80px] sm:max-w-none">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
