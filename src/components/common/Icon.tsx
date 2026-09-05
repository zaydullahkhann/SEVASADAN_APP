import React from 'react';
import { Text, TextStyle, StyleSheet, View } from 'react-native';

export type IconName =
  | 'stethoscope'
  | 'calendar'
  | 'clock'
  | 'phone'
  | 'video'
  | 'user'
  | 'location'
  | 'check'
  | 'token'
  | 'prescription'
  | 'pill'
  | 'chevron-right'
  | 'chevron-left'
  | 'chevron-down'
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
  | 'check-circle';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
  style?: TextStyle;
}

const ICON_MAP: Record<IconName, string> = {
  stethoscope: '🩺',
  calendar: '📅',
  clock: '⏱️',
  phone: '📞',
  video: '📹',
  user: '👤',
  location: '📍',
  check: '✓',
  token: '🎫',
  prescription: '📋',
  pill: '💊',
  'chevron-right': '›',
  'chevron-left': '‹',
  'chevron-down': '▾',
  star: '★',
  heart: '❤️',
  close: '✕',
  plus: '+',
  alert: '⚠️',
  hospital: '🏥',
  shield: '🛡️',
  refresh: '↻',
  search: '🔍',
  baby: '👶',
  bone: '🦴',
  home: '🏠',
  receipt: '🧾',
  info: 'ℹ️',
  mic: '🎙️',
  'mic-off': '🔇',
  'video-off': '🚫',
  'switch-camera': '🔄',
  'call-end': '📞',
  sparkles: '✨',
  'check-circle': '✅',
};

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  color,
  style,
}) => {
  const glyph = ICON_MAP[name] || '•';
  const isGlyphChar = ['›', '‹', '▾', '✓', '✕', '+', '★', '↻'].includes(glyph);

  return (
    <View style={[styles.container, { width: size + 2, height: size + 2 }]}>
      <Text
        style={[
          styles.text,
          {
            fontSize: isGlyphChar ? size * 1.1 : size,
            lineHeight: isGlyphChar ? size * 1.1 : size + 2,
            color: color || '#0F172A',
          },
          style,
        ]}
      >
        {glyph}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    textAlign: 'center',
    includeFontPadding: false,
  },
});
