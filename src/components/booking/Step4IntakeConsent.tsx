import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ConsultationMode } from '../../types';
import { COMMON_SYMPTOMS } from '../../data/specialties';
import { Icon } from '../common/Icon';

interface Step4Props {
  consultationMode: ConsultationMode;
  symptoms: string[];
  reasonForVisit: string;
  telemedicineConsentAccepted: boolean;
  onUpdate: (field: string, value: any) => void;
}

export const Step4IntakeConsent: React.FC<Step4Props> = ({
  consultationMode,
  symptoms,
  reasonForVisit,
  telemedicineConsentAccepted,
  onUpdate,
}) => {
  const isOnline = consultationMode === 'ONLINE_VIDEO';

  const toggleSymptom = (sym: string) => {
    if (symptoms.includes(sym)) {
      onUpdate(
        'symptoms',
        symptoms.filter((s) => s !== sym)
      );
    } else {
      onUpdate('symptoms', [...symptoms, sym]);
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Common Symptoms Chips */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>1. Select Symptoms / Concern</Text>
        <Text style={styles.sectionSubtitle}>
          Tap any that apply to help doctor prepare beforehand:
        </Text>
        <View style={styles.symptomsGrid}>
          {COMMON_SYMPTOMS.map((sym) => {
            const isSelected = symptoms.includes(sym);
            return (
              <TouchableOpacity
                key={sym}
                activeOpacity={0.7}
                onPress={() => toggleSymptom(sym)}
                style={[
                  styles.symptomChip,
                  isSelected && styles.symptomChipSelected,
                ]}
              >
                {isSelected && (
                  <Icon name="check" size={10} color={colors.white} />
                )}
                <Text
                  style={[
                    styles.symptomText,
                    isSelected && styles.symptomTextSelected,
                  ]}
                >
                  {sym}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Reason for Visit */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>2. Describe Health Issue (Optional)</Text>
        <TextInput
          value={reasonForVisit}
          onChangeText={(text) => onUpdate('reasonForVisit', text)}
          placeholder="e.g. Swelling since 3 days, child has difficulty walking, recurring fever..."
          placeholderTextColor={colors.textLight}
          multiline
          numberOfLines={3}
          style={styles.textArea}
          textAlignVertical="top"
        />
      </View>

      {/* 3. Clinical & Telemedicine Consent Agreement */}
      <View style={styles.consentCard}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            onUpdate('telemedicineConsentAccepted', !telemedicineConsentAccepted)
          }
          style={styles.consentRow}
        >
          <View
            style={[
              styles.checkbox,
              telemedicineConsentAccepted && styles.checkboxActive,
            ]}
          >
            {telemedicineConsentAccepted && (
              <Icon name="check" size={11} color={colors.white} />
            )}
          </View>
          <View style={styles.consentTextContainer}>
            <Text style={styles.consentHeading}>
              {isOnline
                ? 'Telemedicine Medical Consent *'
                : 'In-Clinic OPD Registration Consent *'}
            </Text>
            <Text style={styles.consentBody}>
              {isOnline
                ? 'I consent to consultation via video with Dr. Ankur Deshwali & specialists per National Medical Commission (NMC) Telemedicine Practice Guidelines. I understand digital prescriptions will be issued.'
                : 'I consent to in-person medical evaluation, diagnosis, and token queue allotment at SEVASADAN clinic center.'}
            </Text>
          </View>
        </TouchableOpacity>
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
  sectionSubtitle: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textMuted,
    marginTop: 1,
    marginBottom: 6,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 9,
    gap: 4,
  },
  symptomChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primary,
  },
  symptomText: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  symptomTextSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm + 2,
    padding: 8,
    fontSize: typography.sizes.xs + 0.5,
    color: colors.text,
    minHeight: 65,
  },
  consentCard: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderRadius: spacing.borderRadiusSm + 2,
    padding: 8,
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.primary,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
  },
  consentTextContainer: {
    flex: 1,
  },
  consentHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDeep,
  },
  consentBody: {
    fontSize: 9.5,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 13,
  },
});
