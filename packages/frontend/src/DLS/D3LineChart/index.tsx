import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import Surface from '../Surface';

export interface LineDatum {
  label: string;
  value: number;
}

export type PointShape = 'circle' | 'square' | 'triangle' | 'diamond' | 'cross' | 'star' | 'wye';

export interface LineSeries {
  id: string;
  color?: string;
  pointShape?: PointShape;
  data: LineDatum[];
}

interface D3LineChartProps {
  series: LineSeries[];
  type?: 'category' | 'datetime';
  color?: string;
  strokeWidth?: number;
  margin?: { top: number; right: number; bottom: number; left: number; };
}

const DEFAULT_MARGIN = { top: 16, right: 16, bottom: 64, left: 56 };
const LEGEND_ITEM_WIDTH = 120;
const DEFAULT_CHART_WIDTH = 500;
const DEFAULT_CHART_HEIGHT = 320;

const pointShapeMap: Record<PointShape, d3.SymbolType> = {
  circle: d3.symbolCircle,
  square: d3.symbolSquare,
  triangle: d3.symbolTriangle,
  diamond: d3.symbolDiamond,
  cross: d3.symbolCross,
  star: d3.symbolStar,
  wye: d3.symbolWye,
};

const D3LineChart: React.FC<D3LineChartProps> = ({
  series,
  type = 'category',
  color = '#4f86c6',
  strokeWidth = 2,
  margin = DEFAULT_MARGIN,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [size, setSize] = useState({ width: DEFAULT_CHART_WIDTH, height: DEFAULT_CHART_HEIGHT });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) {
        return;
      }

      const nextWidth = Math.max(0, Math.floor(entry.contentRect.width));
      const nextHeight = Math.max(0, Math.floor(entry.contentRect.height));

      setSize((prev) => {
        if (prev.width === nextWidth && prev.height === nextHeight) {
          return prev;
        }
        return {
          width: nextWidth || DEFAULT_CHART_WIDTH,
          height: nextHeight || DEFAULT_CHART_HEIGHT,
        };
      });
    });

    observer.observe(container);
    return () => {
      observer.disconnect();
    };
  }, []);

  const width = size.width;
  const height = size.height;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const labels = useMemo(() => {
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const group of series) {
      for (const point of group.data) {
        if (seen.has(point.label)) {
          continue;
        }
        seen.add(point.label);
        ordered.push(point.label);
      }
    }
    return ordered;
  }, [series]);

  const xScale = useMemo(
    () => d3.scalePoint().domain(labels).range([0, innerWidth]).padding(0.5),
    [innerWidth, labels]
  );

  const labelDateMap = useMemo(() => {
    const map = new Map<string, Date>();
    for (const label of labels) {
      const parsed = d3.isoParse(label) ?? new Date(label);
      if (!Number.isNaN(parsed.getTime())) {
        map.set(label, parsed);
      }
    }
    return map;
  }, [labels]);

  const isDatetime = type === 'datetime' && labelDateMap.size > 0;

  const sortedDatetimeLabels = useMemo(
    () =>
      isDatetime
        ? [...labels].sort((a, b) => (labelDateMap.get(a)?.getTime() ?? 0) - (labelDateMap.get(b)?.getTime() ?? 0))
        : labels,
    [isDatetime, labelDateMap, labels]
  );

  const timeDomain = useMemo(() => {
    if (!isDatetime) {
      return [new Date(0), new Date(1)] as [Date, Date];
    }
    const values = sortedDatetimeLabels
      .map((label) => labelDateMap.get(label))
      .filter((date): date is Date => Boolean(date));

    const first = values[0] ?? new Date(0);
    const last = values[values.length - 1] ?? new Date(1);
    return first.getTime() === last.getTime()
      ? [new Date(first.getTime() - 1), new Date(first.getTime() + 1)] as [Date, Date]
      : [first, last] as [Date, Date];
  }, [isDatetime, labelDateMap, sortedDatetimeLabels]);

  const timeScale = useMemo(
    () =>
      d3
        .scaleTime()
        .domain(timeDomain)
        .range([0, innerWidth]),
    [innerWidth, timeDomain]
  );

  const getX = (label: string) => {
    if (isDatetime) {
      const date = labelDateMap.get(label);
      if (!date) {
        return 0;
      }
      return timeScale(date);
    }
    return xScale(label) ?? 0;
  };

  const labelPositions = useMemo(
    () =>
      sortedDatetimeLabels.map((label) => ({
        label,
        x: getX(label),
      })),
    [sortedDatetimeLabels]
  );

  const sleeveBounds = useMemo(() => {
    if (labelPositions.length === 0) {
      return new Map<string, { x: number; width: number; }>();
    }

    if (labelPositions.length === 1) {
      const only = labelPositions[0];
      const widthValue = Math.max(16, Math.min(80, innerWidth * 0.5));
      return new Map([[only.label, { x: Math.max(0, only.x - widthValue / 2), width: widthValue }]]);
    }

    const bounds = new Map<string, { x: number; width: number; }>();
    for (let i = 0; i < labelPositions.length; i++) {
      const current = labelPositions[i];
      const prev = labelPositions[i - 1];
      const next = labelPositions[i + 1];

      const leftHalf = prev ? (current.x - prev.x) / 2 : (next.x - current.x) / 2;
      const rightHalf = next ? (next.x - current.x) / 2 : (current.x - prev.x) / 2;

      const x = Math.max(0, current.x - leftHalf);
      const widthValue = Math.max(10, leftHalf + rightHalf);
      bounds.set(current.label, { x, width: widthValue });
    }

    return bounds;
  }, [innerWidth, labelPositions]);

  const yScale = useMemo(
    () => {
      const values = series.flatMap((s) => s.data.map((d) => d.value));
      const minValue = d3.min(values) ?? 0;
      const maxValue = d3.max(values) ?? 1;
      if (minValue === maxValue) {
        return d3
          .scaleLinear()
          .domain([minValue - 1, maxValue + 1])
          .nice()
          .range([innerHeight, 0]);
      }

      return d3
        .scaleLinear()
        .domain([Math.min(0, minValue), maxValue])
        .nice()
        .range([innerHeight, 0]);
    },
    [innerHeight, series]
  );

  const yTicks = yScale.ticks(5);

  const [hovered, setHovered] = useState<string | null>(null);

  const lineBuilder = useMemo(
    () =>
      d3
        .line<{ label: string; value: number; }>()
        .defined((point) => Number.isFinite(point.value))
        .x((point) => getX(point.label))
        .y((point) => yScale(point.value)),
    [yScale, isDatetime, labelDateMap, timeScale, xScale]
  );

  const orderedSeriesPoints = useMemo(
    () =>
      series.map((entry) => {
        const pointMap = new Map(entry.data.map((point) => [point.label, point.value]));
        return {
          id: entry.id,
          color: entry.color ?? color,
          pointShape: entry.pointShape,
          points: sortedDatetimeLabels
            .map((label) => {
              const value = pointMap.get(label);
              if (value === undefined) {
                return null;
              }
              return { label, value };
            })
            .filter((point): point is { label: string; value: number; } => point !== null),
        };
      }),
    [color, series, sortedDatetimeLabels]
  );

  const getPointSymbolPath = (shape: PointShape, size: number) =>
    d3.symbol().type(pointShapeMap[shape]).size(size)() ?? '';

  return (
    <Surface ref={containerRef} style={{ width: '100%', height: '40rem', minHeight: `${DEFAULT_CHART_HEIGHT}px` }}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Grid lines */}
          {yTicks.map((tick) => (
            <line
              key={tick}
              x1={0}
              x2={innerWidth}
              y1={yScale(tick)}
              y2={yScale(tick)}
              stroke="currentColor"
              strokeWidth={1}
            />
          ))}

          {/* One hover sleeve per unique label */}
          {sortedDatetimeLabels.map((label) => {
            const bounds = sleeveBounds.get(label);
            if (!bounds) {
              return null;
            }

            return (
              <rect
                key={`sleeve-${label}`}
                x={bounds.x}
                y={0}
                width={bounds.width}
                height={innerHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Lines */}
          <g style={{ pointerEvents: 'none' }}>
            {orderedSeriesPoints.map((entry) => {
              const linePath = lineBuilder(entry.points);
              if (!linePath) {
                return null;
              }

              return (
                <path
                  key={`line-${entry.id}`}
                  d={linePath}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth={strokeWidth}
                  opacity={hovered === null ? 1 : 0.35}
                />
              );
            })}

            {orderedSeriesPoints.map((entry) => {
              if (!entry.pointShape) {
                return null;
              }

              return entry.points.map((point) => {
                const x = getX(point.label);
                const y = yScale(point.value);
                const isHovered = hovered === point.label;

                return (
                  <path
                    key={`point-${entry.id}-${point.label}`}
                    d={getPointSymbolPath(entry.pointShape, isHovered ? 72 : 48)}
                    transform={`translate(${x},${y})`}
                    fill={entry.color}
                    opacity={hovered === null || isHovered ? 1 : 0.4}
                  />
                );
              });
            })}

            {orderedSeriesPoints.map((entry) => {
              const hoveredPoint = hovered
                ? entry.points.find((point) => point.label === hovered)
                : undefined;

              if (!hoveredPoint) {
                return null;
              }

              const x = getX(hoveredPoint.label);
              const y = yScale(hoveredPoint.value);

              return (
                <g key={`hover-${entry.id}`}>
                  {entry.pointShape ? (
                    <path
                      d={getPointSymbolPath(entry.pointShape, 72)}
                      transform={`translate(${x},${y})`}
                      fill={entry.color}
                    />
                  ) : (
                    <circle cx={x} cy={y} r={4} fill={entry.color} />
                  )}
                  <text
                    x={x}
                    y={y - 8}
                    textAnchor="middle"
                    fontSize={12}
                    fontWeight={600}
                    fill={entry.color}
                  >
                    {hoveredPoint.value}
                  </text>
                </g>
              );
            })}

            {hovered && (
              <line
                x1={getX(hovered)}
                x2={getX(hovered)}
                y1={0}
                y2={innerHeight}
                stroke="currentColor"
                strokeOpacity={0.25}
                strokeDasharray="3 3"
              />
            )}
          </g>

          {/* X axis */}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="currentColor" />
          {!isDatetime && labels.map((label) => (
            <text
              key={label}
              x={xScale(label) ?? 0}
              y={innerHeight + 20}
              textAnchor="middle"
              fontSize={12}
              fill="currentColor"
            >
              {label}
            </text>
          ))}
          {isDatetime && timeScale.ticks(Math.max(2, Math.min(8, Math.floor(innerWidth / 90)))).map((tick) => (
            <text
              key={tick.toISOString()}
              x={timeScale(tick)}
              y={innerHeight + 20}
              textAnchor="middle"
              fontSize={12}
              fill="currentColor"
            >
              {d3.timeFormat('%b %-d')(tick)}
            </text>
          ))}

          {/* Legend */}
          {series.map((currentSeries, index) => {
            const totalWidth = series.length * LEGEND_ITEM_WIDTH;
            const startX = (innerWidth - totalWidth) / 2;
            return (
              <g key={currentSeries.id} transform={`translate(${startX + index * LEGEND_ITEM_WIDTH}, ${innerHeight + 44})`}>
                <rect width={10} height={10} fill={currentSeries.color ?? color} rx={2} />
                <text x={16} y={8} fontSize={12} fill="currentColor">
                  {currentSeries.id}
                </text>
              </g>
            );
          })}

          {/* Y axis */}
          <line x1={0} x2={0} y1={0} y2={innerHeight} stroke="currentColor" />
          {yTicks.map((tick) => (
            <text
              key={tick}
              x={-8}
              y={yScale(tick)}
              textAnchor="end"
              dominantBaseline="middle"
              fontSize={12}
              fill="currentColor"
            >
              {tick}
            </text>
          ))}
        </g>
      </svg>
    </Surface>
  );
};

export default D3LineChart;
