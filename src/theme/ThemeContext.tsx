import React, { createContext, useContext, ReactNode } from 'react';
import { colors, ColorsType } from './colors';
import { spacing, SpacingType } from './spacing';
import { typography, TypographyType } from './typography';

interface ThemeContextValue {
  colors: ColorsType;
  spacing: SpacingType;
  typography: TypographyType;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  colors,
  spacing,
  typography,
  isDark: false,
});

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <ThemeContext.Provider
      value={{
        colors,
        spacing,
        typography,
        isDark: false,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
