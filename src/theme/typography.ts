export const typography = {
  sizes: {
    xxs: 10,
    xs: 11,
    sm: 12,
    md: 13,
    base: 14,
    lg: 16,
    xl: 18,
    xxl: 22,
    huge: 26,
  },
  weights: {
    regular: '400' as const,
    medium: '500' as const,
    semiBold: '600' as const,
    bold: '700' as const,
    extraBold: '800' as const,
  },
  lineHeights: {
    tight: 14,
    normal: 18,
    relaxed: 22,
    title: 26,
  },
};

export type TypographyType = typeof typography;
