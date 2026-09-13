import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, G, Line, Polygon } from 'react-native-svg';

export type IconName =
  | 'stethoscope'
  | 'calendar'
  | 'clock'
  | 'phone'
  | 'video'
  | 'user'
  | 'location'
  | 'check'
  | 'check-circle'
  | 'token'
  | 'prescription'
  | 'pill'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'star'
  | 'heart'
  | 'close'
  | 'plus'
  | 'alert'
  | 'hospital'
  | 'shield'
  | 'refresh'
  | 'search'
  | 'baby'
  | 'bone'
  | 'home'
  | 'receipt'
  | 'info'
  | 'mic'
  | 'mic-off'
  | 'video-off'
  | 'switch-camera'
  | 'call-end'
  | 'sparkles'
  | 'doctor'
  | 'credit-card'
  | 'bell'
  | 'desk'
  | 'ambulance'
  | 'activity'
  | 'award'
  | 'log-out'
  | 'printer'
  | 'shield-check';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: ViewStyle;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 18,
  color = '#0F172A',
  style,
}) => {
  const renderSvgContent = () => {
    switch (name) {
      case 'hospital':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 21h18M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
            <Path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
            <Path d="M10 9h4M12 7v4" strokeWidth="2" />
          </G>
        );

      case 'stethoscope':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4.5 3v5a4.5 4.5 0 0 0 9 0V3" />
            <Path d="M3 3h3M12 3h3" />
            <Path d="M9 12.5v3.5a4 4 0 0 0 8 0v-2.5" />
            <Circle cx="17" cy="13.5" r="2.5" fill={color} fillOpacity="0.2" />
          </G>
        );

      case 'doctor':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 2a4 4 0 1 0 0 8 4 4 0 0 0 0-8z" />
            <Path d="M5 21v-2a7 7 0 0 1 14 0v2" />
            <Path d="M12 11v4M10 13h4" strokeWidth="2" />
          </G>
        );

      case 'baby':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="8" />
            <Path d="M9 10h.01M15 10h.01" strokeWidth="2.5" />
            <Path d="M9.5 15a3.5 3.5 0 0 0 5 0" />
            <Path d="M12 4c.5-1.5 2-2 3-2" />
          </G>
        );

      case 'bone':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M17.5 4.5a2.5 2.5 0 0 0-3.5 0l-9 9a2.5 2.5 0 1 0 3.5 3.5l9-9a2.5 2.5 0 0 0 0-3.5z" />
            <Circle cx="6.5" cy="17.5" r="1.5" />
            <Circle cx="17.5" cy="6.5" r="1.5" />
          </G>
        );

      case 'heart':
      case 'activity':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 12h-4l-3 9L9 3l-3 9H2" />
          </G>
        );

      case 'pill':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M10.5 20.5 3.5 13.5a4.95 4.95 0 1 1 7-7l7 7a4.95 4.95 0 0 1-7 7Z" />
            <Path d="m8.5 8.5 7 7" />
          </G>
        );

      case 'prescription':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <Path d="M14 2v6h6" />
            <Path d="M8 13h4a2 2 0 0 0 0-4H8v8" />
            <Path d="m11 13 3 4" />
          </G>
        );

      case 'token':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M2 9a3 3 0 0 1 0 6v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4a3 3 0 0 1 0-6V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4z" />
            <Path d="M12 7v10" strokeDasharray="2 2" />
            <Path d="M8 12h8" strokeWidth="1.5" />
          </G>
        );

      case 'calendar':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <Line x1="16" y1="2" x2="16" y2="6" />
            <Line x1="8" y1="2" x2="8" y2="6" />
            <Line x1="3" y1="10" x2="21" y2="10" />
            <Path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeWidth="2.5" />
          </G>
        );

      case 'clock':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Path d="M12 6v6l4 2" />
          </G>
        );

      case 'phone':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </G>
        );

      case 'video':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Polygon points="23 7 16 12 23 17 23 7" />
            <Rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </G>
        );

      case 'user':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <Circle cx="12" cy="7" r="4" />
          </G>
        );

      case 'location':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <Circle cx="12" cy="10" r="3" />
          </G>
        );

      case 'check':
        return (
          <G fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M20 6L9 17l-5-5" />
          </G>
        );

      case 'check-circle':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <Path d="M22 4L12 14.01l-3-3" strokeWidth="2" />
          </G>
        );

      case 'chevron-right':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 18l6-6-6-6" />
          </G>
        );

      case 'chevron-left':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M15 18l-6-6 6-6" />
          </G>
        );

      case 'chevron-down':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 9l6 6 6-6" />
          </G>
        );

      case 'chevron-up':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 15l-6-6-6 6" />
          </G>
        );

      case 'star':
        return (
          <G fill={color} stroke={color} strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </G>
        );

      case 'close':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 6L6 18M6 6l12 12" />
          </G>
        );

      case 'plus':
        return (
          <G fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 5v14M5 12h14" />
          </G>
        );

      case 'alert':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <Line x1="12" y1="9" x2="12" y2="13" strokeWidth="2" />
            <Line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5" />
          </G>
        );

      case 'shield':
      case 'shield-check':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <Path d="M9 12l2 2 4-4" strokeWidth="2" />
          </G>
        );

      case 'refresh':
      case 'switch-camera':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M23 4v6h-6" />
            <Path d="M1 20v-6h6" />
            <Path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </G>
        );

      case 'search':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="11" cy="11" r="8" />
            <Path d="m21 21-4.35-4.35" strokeWidth="2" />
          </G>
        );

      case 'home':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <Path d="M9 22V12h6v10" />
          </G>
        );

      case 'receipt':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z" />
            <Path d="M8 7h8M8 11h8M8 15h5" strokeWidth="1.5" />
          </G>
        );

      case 'info':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Line x1="12" y1="16" x2="12" y2="12" strokeWidth="2" />
            <Line x1="12" y1="8" x2="12.01" y2="8" strokeWidth="2.5" />
          </G>
        );

      case 'credit-card':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
            <Line x1="1" y1="10" x2="23" y2="10" />
            <Path d="M5 15h4" strokeWidth="2" />
          </G>
        );

      case 'bell':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <Path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </G>
        );

      case 'desk':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Rect x="2" y="3" width="20" height="14" rx="2" />
            <Line x1="8" y1="21" x2="16" y2="21" />
            <Line x1="12" y1="17" x2="12" y2="21" />
            <Path d="M6 8h4M6 11h8" strokeWidth="1.5" />
          </G>
        );

      case 'award':
      case 'sparkles':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="8" r="6" />
            <Path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
          </G>
        );

      case 'ambulance':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M10 6H3a1 1 0 0 0-1 1v10h2" />
            <Path d="M18 17h1a1 1 0 0 0 1-1v-4l-3-4H10v9h4" />
            <Circle cx="7" cy="17" r="2" />
            <Circle cx="16" cy="17" r="2" />
            <Path d="M6 10h4M8 8v4" strokeWidth="1.5" />
          </G>
        );

      case 'log-out':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <Path d="M16 17l5-5-5-5" />
            <Line x1="21" y1="12" x2="9" y2="12" />
          </G>
        );

      case 'mic':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <Path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <Line x1="12" y1="19" x2="12" y2="23" />
            <Line x1="8" y1="23" x2="16" y2="23" />
          </G>
        );

      case 'mic-off':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
            <Path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
            <Path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2a7 7 0 0 1-.11 1.23" />
            <Line x1="12" y1="19" x2="12" y2="23" />
            <Line x1="8" y1="23" x2="16" y2="23" />
          </G>
        );

      case 'video-off':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" />
            <Path d="M21 7l-5.18 3.7M21 17v-4" />
            <Path d="M1 5a2 2 0 0 1 2-2h1.17L17 15.83V19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2z" />
          </G>
        );

      case 'call-end':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
            <Line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" stroke="#EF4444" />
          </G>
        );

      case 'printer':
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Path d="M6 9V2h12v7" />
            <Path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
            <Rect x="6" y="14" width="12" height="8" />
          </G>
        );

      default:
        return (
          <G fill="none" stroke={color} strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <Circle cx="12" cy="12" r="10" />
            <Line x1="12" y1="8" x2="12" y2="12" />
            <Line x1="12" y1="16" x2="12.01" y2="16" strokeWidth="2" />
          </G>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size }, style]}>
      <Svg width={size} height={size} viewBox="0 0 24 24">
        {renderSvgContent()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
