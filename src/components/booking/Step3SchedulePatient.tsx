import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { PatientType } from '../../types';
import { TIME_SLOTS } from '../../data/specialties';
import { REGISTERED_PATIENTS } from '../../data/mockData';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';

interface Step3Props {
  selectedDate: string;
  selectedTimeSlot: string;
  patientType: PatientType;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  patientGender: 'Male' | 'Female' | 'Other';
  onUpdate: (field: string, value: any) => void;
}

export const Step3SchedulePatient: React.FC<Step3Props> = ({
  selectedDate,
  selectedTimeSlot,
  patientType,
  patientName,
  patientPhone,
  patientAge,
  patientGender,
  onUpdate,
}) => {
  const dates = [
    { label: 'Today', value: 'Today', sub: 'Instant Token' },
    { label: 'Tomorrow', value: 'Tomorrow', sub: 'Advance Booking' },
    { label: 'Upcoming', value: '08 Sep 2026', sub: 'Weekend Slot' },
  ];

  // Auto-fill existing patient helper
  const handlePhoneChange = (text: string) => {
    onUpdate('patientPhone', text);
    const clean = text.replace(/[^0-9]/g, '');
    const found = REGISTERED_PATIENTS.find((p) => p.phone === clean);
    if (found) {
      onUpdate('patientName', found.name);
      onUpdate('patientAge', found.age);
      onUpdate('patientGender', found.gender);
      onUpdate('patientType', 'EXISTING');
    }
  };

  const handleSelectQuickPatient = (p: (typeof REGISTERED_PATIENTS)[0]) => {
    onUpdate('patientPhone', p.phone);
    onUpdate('patientName', p.name);
    onUpdate('patientAge', p.age);
    onUpdate('patientGender', p.gender);
    onUpdate('patientType', 'EXISTING');
  };

  return (
    <View style={styles.container}>
      {/* 1. Date Selection */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Consultation Date</Text>
        <View style={styles.dateRow}>
          {dates.map((d) => {
            const isSelected = selectedDate === d.value;
            return (
              <TouchableOpacity
                key={d.value}
                activeOpacity={0.7}
                onPress={() => onUpdate('date', d.value)}
                style={[styles.dateCard, isSelected && styles.dateCardSelected]}
              >
                <Text
                  style={[
                    styles.dateLabel,
                    isSelected && styles.dateLabelSelected,
                  ]}
                >
                  {d.label}
                </Text>
                <Text
                  style={[styles.dateSub, isSelected && styles.dateSubSelected]}
                >
                  {d.sub}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Time Slot Selection */}
      <View style={styles.section}>
        <View style={styles.timeHeader}>
          <Text style={styles.sectionTitle}>2. Preferred OPD Time Slot</Text>
          <Text style={styles.slotHint}>
            Selected: <Text style={styles.slotBold}>{selectedTimeSlot}</Text>
          </Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.slotsScroll}
        >
          {TIME_SLOTS.slice(0, 10).map((slot) => {
            const isSelected = selectedTimeSlot === slot;
            return (
              <TouchableOpacity
                key={slot}
                activeOpacity={0.7}
                onPress={() => onUpdate('timeSlot', slot)}
                style={[styles.slotChip, isSelected && styles.slotChipSelected]}
              >
                <Text
                  style={[
                    styles.slotText,
                    isSelected && styles.slotTextSelected,
                  ]}
                >
                  {slot}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* 3. Patient Details & Auto-Fill (Journey 3) */}
      <View style={styles.section}>
        <View style={styles.patientTypeRow}>
          <Text style={styles.sectionTitle}>3. Patient Information</Text>
          <View style={styles.typeSwitcher}>
            <TouchableOpacity
              onPress={() => onUpdate('patientType', 'NEW')}
              style={[
                styles.typeBtn,
                patientType === 'NEW' && styles.typeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  patientType === 'NEW' && styles.typeBtnTextActive,
                ]}
              >
                New
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onUpdate('patientType', 'EXISTING')}
              style={[
                styles.typeBtn,
                patientType === 'EXISTING' && styles.typeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  patientType === 'EXISTING' && styles.typeBtnTextActive,
                ]}
              >
                Existing
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => onUpdate('patientType', 'FOLLOW_UP')}
              style={[
                styles.typeBtn,
                patientType === 'FOLLOW_UP' && styles.typeBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.typeBtnText,
                  patientType === 'FOLLOW_UP' && styles.typeBtnTextActive,
                ]}
              >
                Follow-up
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick auto-fill suggestions for Existing Patient (Journey 3 simulation) */}
        <View style={styles.quickFillBox}>
          <Text style={styles.quickFillLabel}>
            Quick Auto-Fill Existing Patient:
          </Text>
          <View style={styles.quickPatientChips}>
            {REGISTERED_PATIENTS.map((p) => (
              <TouchableOpacity
                key={p.phone}
                activeOpacity={0.7}
                onPress={() => handleSelectQuickPatient(p)}
                style={[
                  styles.quickPatientChip,
                  patientPhone === p.phone && styles.quickPatientChipActive,
                ]}
              >
                <Icon name="user" size={10} color={colors.primary} />
                <Text style={styles.quickPatientName}>{p.name}</Text>
                <Badge
                  label={p.phone.slice(-4)}
                  variant="outline"
                  size="sm"
                  style={styles.noBorderBadge}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Input Fields */}
        <View style={styles.inputGrid}>
          {/* Mobile Phone */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
            <View style={styles.inputWrapper}>
              <Text style={styles.phonePrefix}>+91</Text>
              <TextInput
                value={patientPhone}
                onChangeText={handlePhoneChange}
                placeholder="10-digit mobile"
                keyboardType="phone-pad"
                maxLength={10}
                style={styles.textInput}
                placeholderTextColor={colors.textLight}
              />
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.fieldContainer}>
            <Text style={styles.inputLabel}>Patient Full Name *</Text>
            <TextInput
              value={patientName}
              onChangeText={(text) => onUpdate('patientName', text)}
              placeholder="e.g. Aarav Sharma"
              style={styles.simpleInput}
              placeholderTextColor={colors.textLight}
            />
          </View>

          {/* Age and Gender */}
          <View style={styles.splitRow}>
            <View style={[styles.fieldContainer, { flex: 0.8 }]}>
              <Text style={styles.inputLabel}>Age *</Text>
              <TextInput
                value={patientAge}
                onChangeText={(text) => onUpdate('patientAge', text)}
                placeholder="Years / M"
                keyboardType="numeric"
                maxLength={3}
                style={styles.simpleInput}
                placeholderTextColor={colors.textLight}
              />
            </View>

            <View style={[styles.fieldContainer, { flex: 1.2 }]}>
              <Text style={styles.inputLabel}>Gender *</Text>
              <View style={styles.genderRow}>
                {(['Male', 'Female', 'Other'] as const).map((g) => {
                  const isSelected = patientGender === g;
                  return (
                    <TouchableOpacity
                      key={g}
                      onPress={() => onUpdate('patientGender', g)}
                      style={[
                        styles.genderChip,
                        isSelected && styles.genderChipSelected,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderText,
                          isSelected && styles.genderTextSelected,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
  },
  dateCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 8,
    paddingHorizontal: 6,
    alignItems: 'center',
  },
  dateCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  dateLabel: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  dateLabelSelected: {
    color: colors.primary,
  },
  dateSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 2,
  },
  dateSubSelected: {
    color: colors.primaryDeep,
    fontWeight: typography.weights.medium,
  },
  timeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  slotHint: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  slotBold: {
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  slotsScroll: {
    gap: 6,
    paddingVertical: 2,
  },
  slotChip: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  slotChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  slotText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  slotTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  patientTypeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  typeSwitcher: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 2,
  },
  typeBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  typeBtnActive: {
    backgroundColor: colors.primary,
  },
  typeBtnText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  typeBtnTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  quickFillBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    marginBottom: 8,
  },
  quickFillLabel: {
    fontSize: 9,
    color: colors.secondaryDark,
    fontWeight: typography.weights.bold,
    marginBottom: 4,
  },
  quickPatientChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  quickPatientChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: '#86EFAC',
    gap: 4,
  },
  quickPatientChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  quickPatientName: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  noBorderBadge: {
    backgroundColor: 'transparent',
    paddingVertical: 0,
    paddingHorizontal: 2,
  },
  inputGrid: {
    gap: 8,
  },
  fieldContainer: {
    gap: 3,
  },
  inputLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm + 2,
    paddingHorizontal: 10,
  },
  phonePrefix: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginRight: 6,
  },
  textInput: {
    flex: 1,
    paddingVertical: 8,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  simpleInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm + 2,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genderChip: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  genderChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  genderTextSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
});
