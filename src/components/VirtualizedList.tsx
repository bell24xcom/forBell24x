'use client';

import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Box, SxProps, Theme } from '@mui/material';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  containerHeight: number | string;
  containerWidth?: number | string;
  overscanCount?: number;
  onScroll?: (scrollTop: number) => void;
  scrollToIndex?: number;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  className?: string;
  keyExtractor?: (item: T, index: number) => string | number;
}

const VirtualizedList = <T,>({
  items,
  renderItem,
  itemHeight,
  containerHeight = '100%',
  containerWidth = '100%',
  overscanCount = 3,
  onScroll,
  scrollToIndex,
  style = {},
  sx = {},
  className = '',
  keyExtractor = (_, index) => index,
}: VirtualizedListProps<T>) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const [height, setHeight] = useState<number>(0);
  
  // Update height when container ref is available
  useEffect(() => {
    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          setHeight(entry.contentRect.height);
        }
      });
      
      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);
  
  // Handle scroll events
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const newScrollTop = e.currentTarget.scrollTop;
    setScrollTop(newScrollTop);
    onScroll?.(newScrollTop);
  }, [onScroll]);
  
  // Scroll to specific index
  useEffect(() => {
    if (scrollToIndex !== undefined && containerRef.current) {
      const scrollPosition = scrollToIndex * itemHeight;
      containerRef.current.scrollTo({
        top: scrollPosition,
        behavior: 'smooth',
      });
    }
  }, [scrollToIndex, itemHeight]);
  
  // Calculate visible items
  const { startIndex, endIndex, paddingTop, paddingBottom } = useMemo(() => {
    const visibleItemCount = Math.ceil(height / itemHeight) + 1;
    const startIndex = Math.max(
      0,
      Math.floor(scrollTop / itemHeight) - overscanCount
    );
    
    const endIndex = Math.min(
      items.length - 1,
      startIndex + visibleItemCount - 1 + overscanCount * 2
    );
    
    const paddingTop = startIndex * itemHeight;
    const paddingBottom = Math.max(0, (items.length - endIndex - 1) * itemHeight);
    
    return { startIndex, endIndex, paddingTop, paddingBottom };
  }, [height, itemHeight, items.length, overscanCount, scrollTop]);
  
  // Get visible items
  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => {
      const actualIndex = startIndex + index;
      return {
        key: keyExtractor(item, actualIndex),
        item,
        index: actualIndex,
      };
    });
  }, [endIndex, items, keyExtractor, startIndex]);

  return (
    <Box
      ref={containerRef}
      sx={{
        height: containerHeight,
        width: containerWidth,
        overflowY: 'auto',
        position: 'relative',
        ...sx,
      }}
      style={style}
      className={`virtualized-list ${className}`}
      onScroll={handleScroll}
    >
      <Box
        style={{
          height: items.length * itemHeight,
          position: 'relative',
        }}
      >
        <Box
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            paddingTop: `${paddingTop}px`,
            paddingBottom: `${paddingBottom}px`,
          }}
        >
          {visibleItems.map(({ key, item, index }) => (
            <Box
              key={key}
              style={{
                height: `${itemHeight}px`,
                position: 'relative',
              }}
            >
              {renderItem(item, index)}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default VirtualizedList;

// Example usage:
/*
<VirtualizedList
  items={largeArray}
  itemHeight={60}
  containerHeight={400}
  overscanCount={5}
  renderItem={(item, index) => (
    <Box key={item.id} sx={{ p: 2, borderBottom: '1px solid #eee' }}>
      {item.name} - {index}
    </Box>
  )}
  keyExtractor={(item) => item.id}
  onScroll={(scrollTop) => console.log('Scrolled to:', scrollTop)}
  scrollToIndex={currentIndex}
/>
*/
