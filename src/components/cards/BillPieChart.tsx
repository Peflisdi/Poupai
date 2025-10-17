"use client";

import { useState } from "react";

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  color: string;
  spent: number;
  percentage: number;
}

interface BillPieChartProps {
  categories: CategoryData[];
  total: number;
}

export function BillPieChart({ categories, total }: BillPieChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [pinnedIndex, setPinnedIndex] = useState<number | null>(null);

  const centerX = 200;
  const centerY = 200;
  const outerRadius = 135;
  const outerStrokeWidth = 28;
  const iconRadius = 170;
  const gap = 3;

  // Usar pinned index se definido, caso contrário usar hovered index
  const displayIndex = pinnedIndex !== null ? pinnedIndex : hoveredIndex;

  const handleSegmentClick = (index: number) => {
    if (pinnedIndex === index) {
      setPinnedIndex(null);
    } else {
      setPinnedIndex(index);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-text-secondary">Nenhum gasto neste período</p>
      </div>
    );
  }

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

  // Calcular segmentos
  let currentAngle = 0;
  const segments = categories.map((item) => {
    const segmentAngle = (item.percentage / 100) * 360;
    const startAngle = currentAngle + gap / 2;
    const endAngle = currentAngle + segmentAngle - gap / 2;
    const middleAngle = currentAngle + segmentAngle / 2;
    const iconPos = polarToCartesian(centerX, centerY, iconRadius, middleAngle);

    const segment = {
      ...item,
      startAngle,
      endAngle,
      middleAngle,
      iconPos,
    };

    currentAngle += segmentAngle;
    return segment;
  });

  return (
    <div className="flex justify-center">
      <svg width="400" height="400" viewBox="0 0 400 400" className="drop-shadow-lg">
        {/* Anel com cores das categorias */}
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
              {total.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </text>
          </>
        ) : (
          <>
            <text
              x={centerX}
              y={centerY - 30}
              textAnchor="middle"
              className="fill-gray-600 dark:fill-gray-400"
              style={{ fontSize: "14px" }}
            >
              {segments[displayIndex].name}
            </text>
            <text
              x={centerX}
              y={centerY}
              textAnchor="middle"
              className="fill-gray-900 dark:fill-white font-bold"
              style={{ fontSize: "26px" }}
            >
              {segments[displayIndex].spent.toLocaleString("pt-BR", {
                style: "currency",
                currency: "BRL",
              })}
            </text>
            <text
              x={centerX}
              y={centerY + 25}
              textAnchor="middle"
              className="fill-gray-600 dark:fill-gray-400"
              style={{ fontSize: "14px" }}
            >
              {segments[displayIndex].percentage.toFixed(1)}% do total
            </text>
          </>
        )}
      </svg>
    </div>
  );
}
