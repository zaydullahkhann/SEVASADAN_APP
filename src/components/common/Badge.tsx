import React from 'react';
import { View, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

export type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'accent'
  | 'purple'
  | 'neutral'
  | 'outline';

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  icon?: IconName;
  size?: 'sm' | 'md';
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Badge: React.FC<BadgeProps> = ({
  label,
  variant = 'primary',
  icon,
  size = 'md',
  style,
  textStyle,
}) => {
  const getColors = () => {
    switch (variant) {
      case 'primary':
        return { bg: colors.primaryLight, text: colors.primary };
      case 'secondary':
      case 'success':
        return { bg: colors.secondaryLight, text: colors.secondaryDark };
      case 'warning':
        return { bg: colors.warningLight, text: colors.warning };
      case 'danger':
        return { bg: colors.dangerLight, text: colors.danger };
      case 'accent':
        return { bg: colors.accentLight, text: colors.primaryDeep };
      case 'purple':
        return { bg: colors.purpleLight, text: colors.purple };
      case 'outline':
        return { bg: 'transparent', text: colors.textSecondary, border: colors.border };
      case 'neutral':
      default:
        return { bg: colors.surfaceSecondary, text: colors.textSecondary };
    }
  };

  const c = getColors();
  const isSm = size === 'sm';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: c.bg,
          borderColor: c.border || 'transparent',
          borderWidth: c.border ? 1 : 0,
          paddingVertical: isSm ? 2 : 3,
          paddingHorizontal: isSm ? 6 : 8,
        },
        style,
      ]}
    >
      {icon && (
        <View style={styles.iconContainer}>
          <Icon name={icon} size={isSm ? 10 : 12} color={c.text} />
        </View>
      )}
      <Text
        style={[
          styles.label,
          {
            color: c.text,
            fontSize: isSm ? typography.sizes.xxs : typography.sizes.xs,
          },
          textStyle,
        ]}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  iconContainer: {
    marginRight: 4,
  },
  label: {
    fontWeight: typography.weights.semiBold,
  },
});
