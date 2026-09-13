import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { ConsultationMode } from '../../types';
import { CLINICS } from '../../data/clinics';
import { DOCTORS } from '../../data/doctors';
import { Icon } from '../common/Icon';
import { DoctorAvatar } from '../common/DoctorAvatar';
import { Badge } from '../common/Badge';

interface Step2Props {
  consultationMode: ConsultationMode;
  selectedClinicId: string;
  selectedDoctorId: string;
  onSelectClinic: (clinicId: string) => void;
  onSelectDoctor: (doctorId: string) => void;
}

export const Step2BranchDoctor: React.FC<Step2Props> = ({
  consultationMode,
  selectedClinicId,
  selectedDoctorId,
  onSelectClinic,
  onSelectDoctor,
}) => {
  const isOnline = consultationMode === 'ONLINE_VIDEO';

  // Filter doctors that cover the selected clinic
  const filteredDoctors = DOCTORS.filter((doc) => {
    if (!selectedClinicId || selectedClinicId === 'all') return true;
    return doc.clinicsCovered.includes(selectedClinicId);
  });

  return (
    <View style={styles.container}>
      {/* 1. Branch Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isOnline ? 'Preferred Base Clinic Branch' : '1. Select Clinic Branch'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {isOnline
              ? 'Nearest clinic for medical records & medicines'
              : 'Choose the center you will visit in-person'}
          </Text>
        </View>

        <View style={styles.clinicGrid}>
          {CLINICS.map((clinic) => {
            const isSelected = selectedClinicId === clinic.id;
            return (
              <TouchableOpacity
                key={clinic.id}
                activeOpacity={0.7}
                onPress={() => onSelectClinic(clinic.id)}
                style={[
                  styles.clinicCard,
                  isSelected && styles.clinicCardSelected,
                ]}
              >
                <View style={styles.clinicTop}>
                  <Text
                    style={[
                      styles.clinicName,
                      isSelected && styles.clinicNameSelected,
                    ]}
                    numberOfLines={1}
                  >
                    {clinic.shortName}
                  </Text>
                  <View
                    style={[
                      styles.miniDot,
                      { backgroundColor: isSelected ? colors.primary : colors.secondary },
                    ]}
                  />
                </View>
                <Text style={styles.clinicCity} numberOfLines={1}>
                  {clinic.city}
                </Text>
                <View style={styles.timingRow}>
                  <Icon name="clock" size={9} color={colors.textMuted} />
                  <Text style={styles.clinicTiming} numberOfLines={1}>
                    OPD: 8 AM - 8 PM
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* 2. Doctor Selection */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>2. Select Specialist Doctor</Text>
          <Text style={styles.sectionSubtitle}>
            Experienced specialists available for your consultation
          </Text>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          style={styles.doctorList}
          nestedScrollEnabled
        >
          {filteredDoctors.map((doc) => {
            const isSelected = selectedDoctorId === doc.id;
            const fee = isOnline ? doc.consultationFeeOnline : doc.consultationFeeClinic;
            const isFemale = doc.id === 'doc-anjali';

            return (
              <TouchableOpacity
                key={doc.id}
                activeOpacity={0.75}
                onPress={() => onSelectDoctor(doc.id)}
                style={[
                  styles.doctorCard,
                  isSelected && styles.doctorCardSelected,
                  doc.isHeadSurgeon && styles.headDoctorCard,
                ]}
              >
                <View style={styles.doctorRow}>
                  <DoctorAvatar
                    gender={isFemale ? 'female' : 'male'}
                    size={46}
                    isHeadSurgeon={!!doc.isHeadSurgeon}
                  />

                  <View style={styles.docInfo}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.docName,
                          isSelected && styles.docNameSelected,
                        ]}
                      >
                        {doc.name}
                      </Text>
                      {doc.isHeadSurgeon && (
                        <Badge label="Chief Surgeon" variant="primary" size="sm" />
                      )}
                    </View>

                    <Text style={styles.docSpecialty} numberOfLines={1}>
                      {doc.specialization}
                    </Text>

                    <Text style={styles.docQual} numberOfLines={1}>
                      {doc.qualification}
                    </Text>

                    <View style={styles.metaRow}>
                      <View style={styles.ratingBadge}>
                        <Icon name="star" size={10} color={colors.warning} />
                        <Text style={styles.ratingText}>{doc.rating}</Text>
                        <Text style={styles.reviewsText}>
                          ({doc.totalReviews}+)
                        </Text>
                      </View>
                      <Text style={styles.metaSeparator}>•</Text>
                      <Text style={styles.expText}>
                        {doc.experienceYears}+ yrs exp
                      </Text>
                    </View>
                  </View>

                  <View style={styles.feeContainer}>
                    <Text style={styles.feeLabel}>Fee</Text>
                    <Text style={styles.feeAmount}>₹{fee}</Text>
                    <View
                      style={[
                        styles.radioCircle,
                        isSelected && styles.radioCircleSelected,
                      ]}
                    >
                      {isSelected && <View style={styles.radioInner} />}
                    </View>
                  </View>
                </View>

                {doc.isHeadSurgeon && (
                  <View style={styles.headTagBanner}>
                    <Icon name="award" size={11} color={colors.primaryDeep} />
                    <Text style={styles.headTagText}>
                      3× MPPSC Class-I Specialist • Newborn & Laparoscopic Expert
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
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
  sectionHeader: {
    marginBottom: 6,
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
  },
  clinicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  clinicCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
  },
  clinicCardSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  clinicTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  clinicName: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  clinicNameSelected: {
    color: colors.primary,
  },
  miniDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginLeft: 4,
  },
  clinicCity: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  timingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginTop: 4,
  },
  clinicTiming: {
    fontSize: 9,
    color: colors.textMuted,
  },
  doctorList: {
    maxHeight: 280,
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    marginBottom: 6,
  },
  doctorCardSelected: {
    borderColor: colors.primary,
    backgroundColor: '#F8FAFC',
  },
  headDoctorCard: {
    borderColor: '#BAE6FD',
  },
  doctorRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docInfo: {
    flex: 1,
    marginLeft: 10,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  docName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docNameSelected: {
    color: colors.primary,
  },
  docSpecialty: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
  docQual: {
    fontSize: 9,
    color: colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  reviewsText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  metaSeparator: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  expText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  feeContainer: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  feeLabel: {
    fontSize: 8,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  feeAmount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  radioCircle: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  radioCircleSelected: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
  headTagBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
    paddingVertical: 3,
    paddingHorizontal: 6,
    backgroundColor: colors.accentLight,
    borderRadius: 4,
  },
  headTagText: {
    fontSize: 9,
    color: colors.primaryDeep,
    fontWeight: typography.weights.medium,
  },
});
