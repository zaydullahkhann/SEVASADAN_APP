import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ConsultationMode } from '../../types';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface Step1Props {
  selectedMode: ConsultationMode;
  onSelectMode: (mode: ConsultationMode) => void;
}

export const Step1ConsultationMode: React.FC<Step1Props> = ({
  selectedMode,
  onSelectMode,
}) => {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Select Consultation Mode</Text>
      <Text style={styles.subheading}>
        Choose how you would like to consult our surgical & medical specialists:
      </Text>

      {/* Option 1: In-Clinic Physical Visit */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMode('IN_CLINIC')}
        style={[
          styles.optionCard,
          selectedMode === 'IN_CLINIC' && styles.optionCardSelected,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.iconCircle}>
            <Icon name="hospital" size={20} color={colors.primary} />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.optionTitle}>In-Clinic Physical OPD</Text>
              <Badge label="Live Token System" variant="success" size="sm" />
            </View>
            <Text style={styles.optionTagline}>
              Visit one of our 4 clinic centers in MP
            </Text>
          </View>
          <View
            style={[
              styles.radio,
              selectedMode === 'IN_CLINIC' && styles.radioSelected,
            ]}
          >
            {selectedMode === 'IN_CLINIC' && <View style={styles.radioInner} />}
          </View>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              Sarangpur • Shujalpur • Rajgarh • Biaora
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              Instant Physical Token with live queue tracking
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              Option to pay online or at OPD counter cash desk
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Option 2: Virtual Video Consultation */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => onSelectMode('ONLINE_VIDEO')}
        style={[
          styles.optionCard,
          selectedMode === 'ONLINE_VIDEO' && styles.optionCardSelected,
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={[styles.iconCircle, { backgroundColor: colors.accentLight }]}>
            <Icon name="video" size={20} color={colors.primaryDeep} />
          </View>
          <View style={styles.headerInfo}>
            <View style={styles.titleRow}>
              <Text style={styles.optionTitle}>Virtual Video Consultation</Text>
              <Badge label="Telemedicine" variant="accent" size="sm" />
            </View>
            <Text style={styles.optionTagline}>
              1-on-1 private video consultation from home
            </Text>
          </View>
          <View
            style={[
              styles.radio,
              selectedMode === 'ONLINE_VIDEO' && styles.radioSelected,
            ]}
          >
            {selectedMode === 'ONLINE_VIDEO' && <View style={styles.radioInner} />}
          </View>
        </View>

        <View style={styles.featureList}>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              Direct video consultation with Dr. Ankur Deshwali
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              Instant digital prescription & dosage instructions
            </Text>
          </View>
          <View style={styles.featureItem}>
            <Icon name="check" size={12} color={colors.secondary} />
            <Text style={styles.featureText}>
              30-min SMS/WhatsApp reminders & interactive room
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  heading: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  subheading: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: spacing.md,
  },
  optionCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: spacing.cardPadding,
    marginBottom: spacing.md,
  },
  optionCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F7FAFC',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  headerInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  optionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  optionTagline: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textMuted,
    marginTop: 2,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 6,
  },
  radioSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.primary,
  },
  featureList: {
    marginTop: spacing.sm,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    gap: 4,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureText: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textSecondary,
  },
});
