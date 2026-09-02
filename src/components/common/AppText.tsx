import React from 'react';
import { Text, TextStyle, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';

interface AppTextProps {
  children: React.ReactNode;
  variant?: 'regular' | 'medium' | 'semiBold' | 'bold' | 'extraBold';
  color?: string;
  size?: number;
  style?: TextStyle | TextStyle[];
  align?: 'left' | 'center' | 'right';
  numberOfLines?: number;
}

export const AppText: React.FC<AppTextProps> = ({
  children,
  variant = 'regular',
  color = colors.slate[800],
  size = 14,
  style,
  align = 'left',
  numberOfLines,
}) => {
  const fontWeightMap: Record<string, TextStyle['fontWeight']> = {
    regular: '400',
    medium: '500',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  };

  return (
    <Text
      numberOfLines={numberOfLines}
      style={[
        {
          fontWeight: fontWeightMap[variant] || '400',
          color,
          fontSize: size,
          textAlign: align,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
};

export default AppText;
