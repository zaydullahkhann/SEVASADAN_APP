import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G } from 'react-native-svg';
import { colors } from '../../theme/colors';

interface DoctorAvatarProps {
  gender?: 'male' | 'female';
  size?: number;
  isHeadSurgeon?: boolean;
  style?: ViewStyle;
}

export const DoctorAvatar: React.FC<DoctorAvatarProps> = ({
  gender = 'male',
  size = 56,
  isHeadSurgeon = false,
  style,
}) => {
  const isFemale = gender === 'female';
  const badgeColor = isHeadSurgeon ? '#0A365C' : '#0F4C81';
  const coatColor = '#FFFFFF';
  const scrubColor = isHeadSurgeon ? '#0D9488' : '#0284C7';
  const stethoscopeColor = '#334155';

  return (
    <View
      style={[
        styles.container,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: '#E6F0FA',
          borderColor: isHeadSurgeon ? '#0F4C81' : '#BAE6FD',
          borderWidth: 1.5,
        },
        style,
      ]}
    >
      <Svg width={size} height={size} viewBox="0 0 64 64">
        {/* Background Aura */}
        <Circle cx="32" cy="32" r="30" fill={isHeadSurgeon ? '#E0F2FE' : '#F0F9FF'} />

        {/* Doctor Shoulders & White Coat */}
        <Path
          d="M12 60 C12 45, 20 40, 32 40 C44 40, 52 45, 52 60 Z"
          fill={coatColor}
          stroke="#CBD5E1"
          strokeWidth="1.5"
        />

        {/* Inner Scrubs / Shirt */}
        <Path
          d="M26 40 L32 49 L38 40 Z"
          fill={scrubColor}
        />

        {/* Stethoscope around neck */}
        <Path
          d="M23 40 C23 47, 28 52, 32 52 C36 52, 41 47, 41 40"
          fill="none"
          stroke={stethoscopeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <Circle cx="32" cy="53" r="2.5" fill="#64748B" />

        {/* Doctor Head / Face */}
        <Circle cx="32" cy="24" r="13" fill="#FED7AA" />

        {/* Hair */}
        {isFemale ? (
          <Path
            d="M19 24 C19 14, 25 11, 32 11 C39 11, 45 14, 45 24 C45 27, 44 32, 44 32 C41 24, 38 22, 32 22 C26 22, 23 24, 20 32 Z"
            fill="#334155"
          />
        ) : (
          <Path
            d="M19 22 C19 13, 25 11, 32 11 C39 11, 45 13, 45 22 C43 18, 39 15, 32 15 C25 15, 21 18, 19 22 Z"
            fill="#1E293B"
          />
        )}

        {/* Surgical Head Cap / Headband for Head Surgeon */}
        {isHeadSurgeon && (
          <Path
            d="M19 20 C19 12, 25 10, 32 10 C39 10, 45 12, 45 20 L19 20 Z"
            fill="#0F4C81"
          />
        )}

        {/* Subtle Specs / Professional Doctor Accent */}
        <Circle cx="27.5" cy="24" r="1.5" fill="#334155" />
        <Circle cx="36.5" cy="24" r="1.5" fill="#334155" />
        <Path d="M29 28 C30.5 29.5, 33.5 29.5, 35 28" stroke="#D97706" strokeWidth="1.2" strokeLinecap="round" fill="none" />
      </Svg>

      {/* Verified Medical Council Stamp */}
      <View
        style={[
          styles.verifiedBadge,
          {
            backgroundColor: isHeadSurgeon ? colors.primary : colors.secondary,
            width: Math.max(16, size * 0.3),
            height: Math.max(16, size * 0.3),
            borderRadius: Math.max(8, (size * 0.3) / 2),
          },
        ]}
      >
        <Svg width={Math.max(10, size * 0.2)} height={Math.max(10, size * 0.2)} viewBox="0 0 24 24">
          <Path
            d="M20 6L9 17l-5-5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'visible',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
});
