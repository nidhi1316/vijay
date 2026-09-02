/**
 * Typography Tokens & Raleway Font Definitions
 */

export const typography = {
  fonts: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
    extraBold: 'System',
    black: 'System',
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
    black: '900' as const,
  },
  sizes: {
    xs: 10,
    sm: 12,
    base: 14,
    md: 16,
    lg: 18,
    xl: 20,
    xxl: 24,
    display: 28,
  },
  lineHeights: {
    tight: 14,
    normal: 20,
    relaxed: 24,
    loose: 28,
  },
  letterSpacing: {
    tight: -0.3,
    normal: 0,
    wide: 0.5,
    wider: 0.8,
  },
};

export default typography;
