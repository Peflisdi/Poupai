"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DonutChartWithIconsProps {
  data: Array<{
    category: string;
    amount: number;
    percentage: number;
    icon?: string;
    color?: string;
  }>;
  selectedMonth: Date;
  onMonthChange: (date: Date) => void;
}

export function DonutChartWithIcons({
  data,
  selectedMonth,
  onMonthChange,
}: DonutChartWithIconsProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const handlePreviousMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
    setPinnedIndex(null); // Reset pinned when changing month
  };

  const handleNextMonth = () => {
    const newDate = new Date(selectedMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
    setPinnedIndex(null); // Reset pinned when changing month
  };

  const handleSegmentClick = (index: number) => {
    if (pinnedIndex === index) {
      setPinnedIndex(null); // Unpin if clicking the same segment
    } else {
      setPinnedIndex(index); // Pin the clicked segment
    }
  };

  // Use pinned index if set, otherwise use hovered index
  const displayIndex = pinnedIndex !== null ? pinnedIndex : hoveredIndex;

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
  };

  // Componente de navegação de mês (reutilizável)
  const MonthNavigation = () => (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePreviousMonth}
        className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors"
        aria-label="Mês anterior"
      >
        <ChevronLeft className="h-5 w-5 text-text-secondary" />
      </button>
      <span className="text-sm font-medium text-text-secondary min-w-[140px] text-center capitalize">
        {formatMonthYear(selectedMonth)}
      </span>
      <button
        onClick={handleNextMonth}
        className="p-1.5 rounded-lg hover:bg-background-tertiary transition-colors"
        aria-label="Próximo mês"
      >
        <ChevronRight className="h-5 w-5 text-text-secondary" />
      </button>
    </div>
  );

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Despesas por Categoria</CardTitle>
              <CardDescription>Distribuição dos seus gastos</CardDescription>
            </div>
            <MonthNavigation />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex h-[400px] items-center justify-center text-text-tertiary">
            Nenhuma despesa registrada neste mês
          </div>
        </CardContent>
      </Card>
    );
  }

  const centerX = 200;
  const centerY = 200;
  const outerRadius = 135;
  const outerStrokeWidth = 28;
  const iconRadius = 170;
  const gap = 3;

  // Converter coordenadas polares para cartesianas
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angle: number) => {
    const angleInRadians = ((angle - 90) * Math.PI) / 180.0;
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians),
    };
  };

  // Criar path do arco
  const createArc = (startAngle: number, endAngle: number, radius: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle);
    const end = polarToCartesian(centerX, centerY, radius, startAngle);
    const largeArc = endAngle - startAngle <= 180 ? "0" : "1";

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArc} 0 ${end.x} ${end.y}`;
  };

  // Função para obter cor mais clara (pastel)
  const getLightColor = (color: string) => {
    // Converte hex para RGB e clareia
    const hex = color.replace("#", "");
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);

    // Clareia a cor (mix com branco)
    const lightenAmount = 0.5;
    const newR = Math.round(r + (255 - r) * lightenAmount);
    const newG = Math.round(g + (255 - g) * lightenAmount);
    const newB = Math.round(b + (255 - b) * lightenAmount);

    return `rgb(${newR}, ${newG}, ${newB})`;
  };

  // Cores padrão caso não venham do backend
  const defaultColors = [
    "#EF4444",
    "#F97316",
    "#F59E0B",
    "#EAB308",
    "#84CC16",
    "#22C55E",
    "#14B8A6",
    "#06B6D4",
    "#3B82F6",
    "#6366F1",
    "#8B5CF6",
    "#A855F7",
    "#D946EF",
    "#EC4899",
  ];

  // Calcular segmentos
  let currentAngle = 0;
  const segments = data.map((item, index) => {
    const segmentAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle + gap / 2;
    const endAngle = currentAngle + segmentAngle - gap / 2;
    const middleAngle = currentAngle + segmentAngle / 2;
    const iconPos = polarToCartesian(centerX, centerY, iconRadius, middleAngle);

    const color = item.color || defaultColors[index % defaultColors.length];

    const segment = {
      ...item,
      startAngle,
      endAngle,
      middleAngle,
      iconPos,
      color,
      lightColor: getLightColor(color),
      icon: item.icon || "📊",
    };

    currentAngle += segmentAngle;
    return segment;
  });

  // Calcular total
  const total = data.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>Distribuição dos seus gastos</CardDescription>
          </div>
          <MonthNavigation />
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative flex items-center justify-center">
          <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-lg">
            {/* Anel Externo (cores saturadas) - ÚNICO ANEL */}
            {segments.map((seg, i) => (
              <path
                key={`outer-${i}`}
                d={createArc(seg.startAngle, seg.endAngle, outerRadius)}
                fill="none"
                stroke={seg.color}
                strokeWidth={outerStrokeWidth}
                strokeLinecap="round"
                className="transition-all duration-300 cursor-pointer"
                style={{
                  opacity: displayIndex === null || displayIndex === i ? 1 : 0.4,
                  filter: pinnedIndex === i ? "drop-shadow(0 0 8px rgba(0,0,0,0.3))" : "none",
                }}
                onMouseEnter={() => pinnedIndex === null && setHoveredIndex(i)}
                onMouseLeave={() => pinnedIndex === null && setHoveredIndex(null)}
                onClick={() => handleSegmentClick(i)}
              />
            ))}

            {/* Ícones com círculos */}
            {segments.map((seg, i) => (
              <g
                key={`icon-${i}`}
                className="cursor-pointer transition-transform duration-300"
                style={{
                  transform: displayIndex === i ? "scale(1.1)" : "scale(1)",
                  transformOrigin: `${seg.iconPos.x}px ${seg.iconPos.y}px`,
                }}
                onMouseEnter={() => pinnedIndex === null && setHoveredIndex(i)}
                onMouseLeave={() => pinnedIndex === null && setHoveredIndex(null)}
                onClick={() => handleSegmentClick(i)}
              >
                {/* Sombra do círculo */}
                <circle
                  cx={seg.iconPos.x}
                  cy={seg.iconPos.y}
                  r="20"
                  fill={seg.color}
                  opacity="0.3"
                  filter="blur(4px)"
                />
                {/* Círculo do ícone */}
                <circle
                  cx={seg.iconPos.x}
                  cy={seg.iconPos.y}
                  r="18"
                  fill={seg.color}
                  className="drop-shadow-md"
                  style={{
                    stroke: pinnedIndex === i ? "white" : "none",
                    strokeWidth: pinnedIndex === i ? "3" : "0",
                  }}
                />
                {/* Emoji */}
                <text
                  x={seg.iconPos.x}
                  y={seg.iconPos.y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontSize="22"
                  className="pointer-events-none"
                >
                  {seg.icon}
                </text>
              </g>
            ))}

            {/* Círculo central com informações */}
            <circle
              cx={centerX}
              cy={centerY}
              r="100"
              fill="white"
              className="dark:fill-gray-900 drop-shadow-xl"
            />

            {/* Texto central - muda ao passar o mouse */}
            {displayIndex === null ? (
              <>
                <text
                  x={centerX}
                  y={centerY - 20}
                  textAnchor="middle"
                  className="fill-gray-600 dark:fill-gray-400 text-sm font-medium"
                >
                  Gasto total
                </text>
                <text
                  x={centerX}
                  y={centerY + 15}
                  textAnchor="middle"
                  className="fill-gray-900 dark:fill-white font-bold"
                  style={{ fontSize: "28px" }}
                >
                  {total
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                    .replace("R$", "R$ ")}
                </text>
              </>
            ) : (
              <>
                <text x={centerX} y={centerY - 30} textAnchor="middle" className="text-3xl">
                  {segments[displayIndex].icon}
                </text>
                <text
                  x={centerX}
                  y={centerY - 5}
                  textAnchor="middle"
                  className="fill-gray-600 dark:fill-gray-400 text-sm font-semibold"
                >
                  {segments[displayIndex].category}
                </text>
                <text
                  x={centerX}
                  y={centerY + 20}
                  textAnchor="middle"
                  className="fill-gray-900 dark:fill-white font-bold"
                  style={{ fontSize: "24px" }}
                >
                  {segments[displayIndex].amount
                    .toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })
                    .replace("R$", "R$ ")}
                </text>
                <text
                  x={centerX}
                  y={centerY + 40}
                  textAnchor="middle"
                  className="fill-gray-600 dark:fill-gray-400 text-base font-semibold"
                >
                  {Math.round(segments[displayIndex].percentage)}%
                </text>
              </>
            )}
          </svg>

          {/* Removido o tooltip flutuante - agora mostra no centro */}
        </div>

        {/* Legenda abaixo do gráfico */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          {segments.map((seg, i) => (
            <div
              key={i}
              className="flex items-center gap-2 cursor-pointer transition-opacity duration-200"
              style={{
                opacity: displayIndex === null || displayIndex === i ? 1 : 0.5,
              }}
              onMouseEnter={() => pinnedIndex === null && setHoveredIndex(i)}
              onMouseLeave={() => pinnedIndex === null && setHoveredIndex(null)}
              onClick={() => handleSegmentClick(i)}
            >
              <div
                className="w-3 h-3 rounded-full flex-shrink-0 transition-all"
                style={{
                  backgroundColor: seg.color,
                  boxShadow: pinnedIndex === i ? `0 0 0 2px white, 0 0 0 3px ${seg.color}` : "none",
                }}
              />
              <span className="text-sm flex items-center gap-1.5">
                <span>{seg.icon}</span>
                <span className="text-text-secondary truncate">{seg.category}</span>
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
