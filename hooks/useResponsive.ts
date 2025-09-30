import { useWindowDimensions, Platform } from 'react-native';

export type BreakpointSize = 'mobile' | 'tablet' | 'desktop';

export interface ResponsiveValues {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  breakpoint: BreakpointSize;
  horizontalPadding: number;
  maxContentWidth: number;
}

const BREAKPOINTS = {
  tablet: 600,
  desktop: 1024,
};

export function useResponsive(): ResponsiveValues {
  const { width } = useWindowDimensions();

  // モバイルアプリの場合は常にモバイルとして扱う
  if (Platform.OS !== 'web') {
    return {
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      breakpoint: 'mobile',
      horizontalPadding: 16,
      maxContentWidth: width,
    };
  }

  const isTablet = width >= BREAKPOINTS.tablet;
  const isDesktop = width >= BREAKPOINTS.desktop;
  const isMobile = !isTablet;

  let breakpoint: BreakpointSize = 'mobile';
  let horizontalPadding = 16;

  if (isDesktop) {
    breakpoint = 'desktop';
    horizontalPadding = 32;
  } else if (isTablet) {
    breakpoint = 'tablet';
    horizontalPadding = 24;
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    breakpoint,
    horizontalPadding,
    maxContentWidth: 1024,
  };
}