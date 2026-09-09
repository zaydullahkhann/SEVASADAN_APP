import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
  View,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'left' | 'right';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
}) => {
  const getButtonStyles = (): { bg: string; text: string; border?: string } => {
    if (disabled) {
      return { bg: '#CBD5E1', text: '#94A3B8' };
    }
    switch (variant) {
      case 'secondary':
        return { bg: colors.secondary, text: colors.white };
      case 'outline':
        return { bg: 'transparent', text: colors.primary, border: colors.primary };
      case 'ghost':
        return { bg: 'transparent', text: colors.primary };
      case 'danger':
        return { bg: colors.danger, text: colors.white };
      case 'primary':
      default:
        return { bg: colors.primary, text: colors.white };
    }
  };

  const getPadding = () => {
    switch (size) {
      case 'sm':
        return { py: 7, px: 12, fontSize: typography.sizes.sm, iconSize: 13 };
      case 'lg':
        return { py: 13, px: 20, fontSize: typography.sizes.lg, iconSize: 16 };
      case 'md':
      default:
        return { py: 10, px: 16, fontSize: typography.sizes.base, iconSize: 15 };
    }
  };

  const conf = getButtonStyles();
  const pad = getPadding();

  return (
    <TouchableOpacity
      activeOpacity={0.75}
      onPress={onPress}
      disabled={disabled || loading}
      style={[
        styles.button,
        {
          backgroundColor: conf.bg,
          borderColor: conf.border || 'transparent',
          borderWidth: conf.border ? 1 : 0,
          paddingVertical: pad.py,
          paddingHorizontal: pad.px,
          width: fullWidth ? '100%' : 'auto',
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator size="small" color={conf.text} />
      ) : (
        <View style={styles.contentRow}>
          {icon && iconPosition === 'left' && (
            <View style={styles.iconLeft}>
              <Icon name={icon} size={pad.iconSize} color={conf.text} />
            </View>
          )}
          <Text
            style={[
              styles.text,
              {
                color: conf.text,
                fontSize: pad.fontSize,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <View style={styles.iconRight}>
              <Icon name={icon} size={pad.iconSize} color={conf.text} />
            </View>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    borderRadius: spacing.borderRadiusSm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  contentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontWeight: typography.weights.semiBold,
    textAlign: 'center',
    letterSpacing: -0.1,
  },
  iconLeft: {
    marginRight: 6,
  },
  iconRight: {
    marginLeft: 6,
  },
});
