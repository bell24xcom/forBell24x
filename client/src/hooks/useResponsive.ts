import { useState, useEffect } from 'react';

interface BreakpointConfig {
  mobile: number;
  tablet: number;
  desktop: number;
  wide: number;
}

const defaultBreakpoints: BreakpointConfig = {
  mobile: 768,
  tablet: 1024,
  desktop: 1280,
  wide: 1536,
};

export const useResponsive = (breakpoints: BreakpointConfig = defaultBreakpoints) => {
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setScreenSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return {
    ...screenSize,
    isMobile: screenSize.width < breakpoints.mobile,
    isTablet: screenSize.width >= breakpoints.mobile && screenSize.width < breakpoints.tablet,
    isDesktop: screenSize.width >= breakpoints.tablet && screenSize.width < breakpoints.desktop,
    isWide: screenSize.width >= breakpoints.desktop,
    isSmallScreen: screenSize.width < breakpoints.tablet,
  };
};
