import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface HospitalLogoProps {
  size?: number;
  color?: string;
  badgeBg?: string;
  style?: ViewStyle;
}

export const HospitalLogo: React.FC<HospitalLogoProps> = ({
  size = 36,
  color = colors.primary,
  badgeBg = '#FFFFFF',
  style,
}) => {
  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: badgeBg,
          borderColor: '#E2E8F0',
          borderWidth: 1,
        },
        style,
      ]}
    >
      <Svg width={size * 0.72} height={size * 0.72} viewBox="0 0 48 48">
        {/* Medical Cross Foundation */}
        <G fill={color}>
          <Rect x="18" y="6" width="12" height="36" rx="4" />
          <Rect x="6" y="18" width="36" height="12" rx="4" />
        </G>

        {/* Inner Hospital Lifeline (ECG Pulse) in Crisp White */}
        <Path
          d="M8 24 H18 L21 16 L25 32 L29 20 L32 26 L34 24 H40"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="2.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Center Golden Healing Point */}
        <Circle cx="24" cy="24" r="2.2" fill="#F59E0B" />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
});
