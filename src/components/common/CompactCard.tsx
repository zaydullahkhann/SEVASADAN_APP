import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

interface CompactCardProps {
  children?: React.ReactNode;
  title?: string;
  subtitle?: string;
  rightAction?: React.ReactNode;
  onPress?: () => void;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  borderAccent?: string; // Optional left accent border color (e.g. primary or secondary)
}

export const CompactCard: React.FC<CompactCardProps> = ({
  children,
  title,
  subtitle,
  rightAction,
  onPress,
  style,
  contentStyle,
  titleStyle,
  subtitleStyle,
  borderAccent,
}) => {
  const CardContainer = onPress ? TouchableOpacity : View;

  return (
    <CardContainer
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        styles.card,
        borderAccent ? { borderLeftWidth: 4, borderLeftColor: borderAccent } : null,
        style,
      ]}
    >
      {(title || subtitle || rightAction) && (
        <View style={styles.header}>
          <View style={styles.titleContainer}>
            {title && (
              <Text style={[styles.title, titleStyle]} numberOfLines={1}>
                {title}
              </Text>
            )}
            {subtitle && (
              <Text style={[styles.subtitle, subtitleStyle]} numberOfLines={1}>
                {subtitle}
              </Text>
            )}
          </View>
          {rightAction && <View style={styles.rightAction}>{rightAction}</View>}
        </View>
      )}
      <View style={[styles.content, contentStyle]}>{children}</View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.cardPadding, // 10px
    marginBottom: spacing.cardMarginVertical + 3, // ~8px
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 6,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  titleContainer: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  rightAction: {
    alignItems: 'flex-end',
  },
  content: {
    // Zero wasted margins
  },
});
