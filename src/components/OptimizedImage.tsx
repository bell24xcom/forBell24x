'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, BoxProps, SxProps, Theme } from '@mui/material';

interface OptimizedImageProps extends Omit<BoxProps, 'component'> {
  src: string;
  alt: string;
  width?: number | string;
  height?: number | string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  placeholderSrc?: string;
  threshold?: number;
  rootMargin?: string;
  lazyLoad?: boolean;
  priority?: boolean;
  quality?: number;
  sizes?: string;
  style?: React.CSSProperties;
  sx?: SxProps<Theme>;
  onLoad?: () => void;
  onError?: () => void;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width = '100%',
  height = 'auto',
  objectFit = 'cover',
  placeholderSrc = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiNlZWVlZWUiLz48L3N2Zz4=',
  threshold = 0.01,
  rootMargin = '0px',
  lazyLoad = true,
  priority = false,
  quality = 75,
  sizes = '100vw',
  style = {},
  sx = {},
  onLoad,
  onError,
  ...boxProps
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(!lazyLoad || priority);
  const [imageSrc, setImageSrc] = useState(priority ? src : placeholderSrc);
  const imgRef = useRef<HTMLImageElement>(null);
  const observer = useRef<IntersectionObserver | null>(null);

  // Handle image load
  const handleLoad = useCallback(() => {
    if (isInView && src) {
      setImageSrc(src);
      setIsLoaded(true);
      if (onLoad) onLoad();
    }
  }, [isInView, onLoad, src]);

  // Handle image error
  const handleError = useCallback(() => {
    console.error(`Failed to load image: ${src}`);
    if (onError) onError();
  }, [onError, src]);

  // Set up intersection observer for lazy loading
  useEffect(() => {
    if (!lazyLoad || priority) return;

    const imgElement = imgRef.current;
    if (!imgElement) return;

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.current?.disconnect();
        }
      });
    };

    observer.current = new IntersectionObserver(observerCallback, {
      threshold,
      rootMargin,
    });

    observer.current.observe(imgElement);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [lazyLoad, priority, rootMargin, threshold]);

  // Update image source when in view
  useEffect(() => {
    let mounted = true;
    if (isInView && src && !isLoaded) {
      if (typeof window !== 'undefined') {
        const img = new window.Image();
        img.src = src;
        img.onload = () => { if (mounted) handleLoad(); };
        img.onerror = () => { if (mounted) handleError(); };
      }
    }
    return () => { mounted = false; };
  }, [isInView, src, isLoaded, handleLoad, handleError]);

  // Generate responsive srcSet for better performance
  const generateSrcSet = useCallback((url: string) => {
    if (!url || typeof url !== 'string') return '';
    
    // Example: Convert 'image.jpg' to 'image-300w.jpg 300w, image-600w.jpg 600w, ...'
    const baseUrl = url.split('.');
    const extension = baseUrl.pop();
    const baseName = baseUrl.join('.');
    
    // Define responsive image widths (customize as needed)
    const widths = [300, 600, 900, 1200, 1600, 2000];
    
    return widths
      .map(width => `${baseName}-${width}w.${extension} ${width}w`)
      .join(', ');
  }, []);

  const srcSet = generateSrcSet(src);

  return (
    <Box
      component="div"
      position="relative"
      width={width}
      height={height}
      overflow="hidden"
      sx={{
        backgroundColor: 'background.paper',
        ...sx,
      }}
      {...boxProps}
    >
      <Box
        component="img"
        ref={imgRef}
        src={imageSrc}
        alt={alt}
        width="100%"
        height="100%"
        loading={lazyLoad && !priority ? 'lazy' : 'eager'}
        decoding="async"
        style={{
          objectFit,
          objectPosition: 'center',
          transition: 'opacity 0.3s ease-in-out',
          opacity: isLoaded ? 1 : 0.7,
          filter: isLoaded ? 'none' : 'blur(5px)',
          ...style,
        }}
        srcSet={srcSet}
        sizes={sizes}
        onLoad={handleLoad}
        onError={handleError}
      />
    </Box>
  );
};

export default OptimizedImage;
