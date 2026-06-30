import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import Surface from '../Surface';

export interface BarDatum {
  label: string;
  value: number;
}

export interface BarSeries {
  id: string;
  color?: string;
  data: BarDatum[];
}

interface D3BarChartProps {
  series: BarSeries[];
  type?: 'category' | 'datetime';
  color?: string;
  margin?: { top: number; right: number; bottom: number; left: number; };
}

const DEFAULT_MARGIN = { top: 16, right: 16, bottom: 64, left: 56 };
const LEGEND_ITEM_WIDTH = 120;
const DEFAULT_CHART_WIDTH = 500;
const DEFAULT_CHART_HEIGHT = 320;

const D3BarChart: React.FC<D3BarChartProps> = ({
  series,
  type = 'category',
  color = '#4f86c6',
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
    () =>
      d3
        .scaleBand()
        .domain(labels)
        .range([0, innerWidth])
        .padding(0.25),
    [labels, innerWidth]
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

  const datetimeColumnWidth = useMemo(() => {
    if (!isDatetime) {
      return xScale.bandwidth();
    }

    const xs = sortedDatetimeLabels
      .map((label) => labelDateMap.get(label))
      .filter((date): date is Date => Boolean(date))
      .map((date) => timeScale(date))
      .sort((a, b) => a - b);

    if (xs.length <= 1) {
      return Math.max(16, Math.min(80, innerWidth * 0.2));
    }

    let minDistance = Number.POSITIVE_INFINITY;
    for (let i = 1; i < xs.length; i++) {
      minDistance = Math.min(minDistance, xs[i] - xs[i - 1]);
    }

    const desired = minDistance * 0.8;
    return Math.max(12, Math.min(80, desired));
  }, [innerWidth, isDatetime, labelDateMap, sortedDatetimeLabels, timeScale, xScale]);

  const getColumnX = (label: string) => {
    if (!isDatetime) {
      return xScale(label) ?? 0;
    }
    const date = labelDateMap.get(label);
    if (!date) {
      return 0;
    }
    const rawX = timeScale(date) - datetimeColumnWidth / 2;
    return Math.max(0, Math.min(innerWidth - datetimeColumnWidth, rawX));
  };

  const columnWidth = isDatetime ? datetimeColumnWidth : xScale.bandwidth();
  const seriesSlotKeys = useMemo(() => series.map((_, index) => String(index)), [series]);

  const seriesScale = useMemo(
    () =>
      d3
        .scaleBand()
        .domain(seriesSlotKeys)
        .range([0, columnWidth])
        .padding(0.12),
    [columnWidth, seriesSlotKeys]
  );

  const yScale = useMemo(
    () =>
      d3
        .scaleLinear()
        .domain([0, d3.max(series.flatMap((s) => s.data.map((d) => d.value))) ?? 0])
        .nice()
        .range([innerHeight, 0]),
    [innerHeight, series]
  );

  const yTicks = yScale.ticks(5);

  const [hovered, setHovered] = useState<string | null>(null);

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
            const barX = getColumnX(label);
            return (
              <rect
                key={`sleeve-${label}`}
                x={barX}
                y={0}
                width={columnWidth}
                height={innerHeight}
                fill="transparent"
                style={{ cursor: 'pointer' }}
                onMouseEnter={() => setHovered(label)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Bars */}
          {sortedDatetimeLabels.map((label) => {
            const isHovered = hovered === label;
            const barX = getColumnX(label);

            const values = series
              .map((currentSeries, seriesIndex) => {
                const point = currentSeries.data.find((d) => d.label === label);
                if (!point) {
                  return null;
                }
                return {
                  slotKey: String(seriesIndex),
                  seriesId: currentSeries.id,
                  value: point.value,
                  color: currentSeries.color ?? color,
                };
              })
              .filter((value): value is { slotKey: string; seriesId: string; value: number; color: string; } => value !== null);

            return (
              <g key={label} style={{ pointerEvents: 'none' }}>
                {values.map((entry) => {
                  const slotX = seriesScale(entry.slotKey) ?? 0;
                  const barY = yScale(entry.value);
                  const barHeight = innerHeight - barY;

                  return (
                    <g key={`${entry.seriesId}-${entry.slotKey}`}>
                      <rect
                        x={barX + slotX}
                        y={barY}
                        width={seriesScale.bandwidth()}
                        height={barHeight}
                        fill={entry.color}
                        rx={3}
                        opacity={hovered === null || isHovered ? 1 : 0.4}
                        style={{ transition: 'opacity 0.15s' }}
                      />
                      {isHovered && (
                        <text
                          x={barX + slotX + seriesScale.bandwidth() / 2}
                          y={barY - 6}
                          textAnchor="middle"
                          fontSize={12}
                          fontWeight={600}
                          fill={entry.color}
                        >
                          {entry.value}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            );
          })}

          {/* X axis */}
          <line x1={0} x2={innerWidth} y1={innerHeight} y2={innerHeight} stroke="currentColor" />
          {!isDatetime && labels.map((label) => (
            <text
              key={label}
              x={(xScale(label) ?? 0) + xScale.bandwidth() / 2}
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

export default D3BarChart;
