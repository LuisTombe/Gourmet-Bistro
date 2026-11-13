import React, { useState, useRef, useMemo } from 'react';

interface VirtualListProps<T> {
  items: T[];
  rowHeight: number;
  viewportHeight?: number;
  overscan?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string | number;
  className?: string;
}

/**
 * Lista virtualizada ligera (windowing): cuando la lista supera el umbral (ej. > 24 filas),
 * renderiza únicamente los elementos visibles en el viewport más un margen de overscan.
 */
export function VirtualList<T>({
  items,
  rowHeight,
  viewportHeight = 520,
  overscan = 4,
  renderItem,
  keyExtractor,
  className = '',
}: VirtualListProps<T>) {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const shouldVirtualize = items.length > 24;

  const { startIndex, endIndex, totalHeight, offsetY } = useMemo(() => {
    if (!shouldVirtualize) {
      return {
        startIndex: 0,
        endIndex: items.length,
        totalHeight: items.length * rowHeight,
        offsetY: 0,
      };
    }
    const start = Math.max(0, Math.floor(scrollTop / rowHeight) - overscan);
    const visibleCount = Math.ceil(viewportHeight / rowHeight) + overscan * 2;
    const end = Math.min(items.length, start + visibleCount);
    return {
      startIndex: start,
      endIndex: end,
      totalHeight: items.length * rowHeight,
      offsetY: start * rowHeight,
    };
  }, [items.length, overscan, rowHeight, scrollTop, shouldVirtualize, viewportHeight]);

  if (!shouldVirtualize) {
    return (
      <div className={className}>
        {items.map((item, idx) => (
          <React.Fragment key={keyExtractor(item, idx)}>{renderItem(item, idx)}</React.Fragment>
        ))}
      </div>
    );
  }

  const visibleItems = items.slice(startIndex, endIndex);

  return (
    <div
      ref={containerRef}
      onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
      style={{ maxHeight: viewportHeight, overflowY: 'auto', position: 'relative' }}
      className={className}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, i) => {
            const actualIndex = startIndex + i;
            return (
              <div key={keyExtractor(item, actualIndex)} style={{ minHeight: rowHeight }}>
                {renderItem(item, actualIndex)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

