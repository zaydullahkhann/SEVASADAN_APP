import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const PrescriptionsScreen: React.FC = () => {
  const { prescriptions, openBookingModal } = useApp();

  const handleShareRx = (rxId: string, doc: string, diag: string) => {
    Share.share({
      message: `SEVASADAN Digital Prescription (${rxId})\nConsultant: ${doc}\nDiagnosis: ${diag}\nIssued via Sevasadan Tele-OPD Network.`,
    }).catch(() => {});
  };

  const handleBookFollowUp = (rx: (typeof prescriptions)[0]) => {
    openBookingModal({
      doctorId: 'doc-ankur',
      patientName: rx.patientName,
      patientPhone: rx.patientPhone,
      patientType: 'FOLLOW_UP',
      reasonForVisit: `Advised Follow-up for: ${rx.diagnosis}`,
      linkedPrescriptionId: rx.id,
      date: 'Tomorrow',
      timeSlot: '11:00 AM',
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Digital Prescriptions & Rx</Text>
          <Text style={styles.headerSub}>
            Signed e-prescriptions by Dr. Ankur Deshwali & specialists
          </Text>
        </View>
        <Badge label={`${prescriptions.length} Records`} variant="primary" size="sm" />
      </View>

      {prescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="prescription" size={36} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
          <Text style={styles.emptySub}>
            Prescriptions issued during in-clinic or video consultations will appear here automatically.
          </Text>
        </View>
      ) : (
        prescriptions.map((rx) => {
          return (
            <CompactCard
              key={rx.id}
              style={styles.rxCard}
              borderAccent={colors.secondary}
            >
              {/* Rx Header */}
              <View style={styles.rxTopRow}>
                <View>
                  <Text style={styles.rxClinicName}>{rx.clinicName}</Text>
                  <Text style={styles.rxDocName}>
                    {rx.doctorName} • <Text style={styles.rxSpecialty}>{rx.doctorSpecialization}</Text>
                  </Text>
                </View>
                <Badge label={rx.date} variant="outline" size="sm" />
              </View>

              <View style={styles.divider} />

              {/* Patient & Diagnosis */}
              <View style={styles.patientDiagBox}>
                <View style={styles.patientRow}>
                  <Text style={styles.patientNameText}>
                    Patient: <Text style={styles.boldText}>{rx.patientName}</Text>
                  </Text>
                  <Text style={styles.rxIdText}>Rx #{rx.id.slice(-7)}</Text>
                </View>

                <View style={styles.diagnosisBox}>
                  <Text style={styles.diagLabel}>DIAGNOSIS:</Text>
                  <Text style={styles.diagValue}>{rx.diagnosis}</Text>
                </View>
              </View>

              {/* Medicines Table */}
              <View style={styles.medsContainer}>
                <Text style={styles.medsHeader}>PRESCRIBED MEDICINES</Text>
                {rx.medications.map((med, idx) => (
                  <View key={idx} style={styles.medItem}>
                    <View style={styles.medIconBox}>
                      <Icon name="pill" size={12} color={colors.primary} />
                    </View>
                    <View style={styles.medDetails}>
                      <View style={styles.medNameRow}>
                        <Text style={styles.medName}>{med.name}</Text>
                        <Text style={styles.medDuration}>{med.duration}</Text>
                      </View>
                      <View style={styles.medScheduleRow}>
                        <Badge label={med.dosage} variant="neutral" size="sm" />
                        <Text style={styles.medFreq}>{med.frequency}</Text>
                        <Text style={styles.medInst}>• {med.instructions}</Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>

              {/* Doctor's Advice */}
              {rx.advice && (
                <View style={styles.adviceBox}>
                  <Icon name="info" size={10} color={colors.primaryDeep} />
                  <Text style={styles.adviceText}>{rx.advice}</Text>
                </View>
              )}

              {/* Follow-up Advised Banner (Journey 4) */}
              {rx.followUpAdvised && (
                <View style={styles.followUpBanner}>
                  <View style={styles.followUpLeft}>
                    <Icon name="calendar" size={12} color={colors.secondaryDark} />
                    <View>
                      <Text style={styles.followUpHeading}>
                        Follow-up Advised: {rx.followUpDate}
                      </Text>
                      <Text style={styles.followUpSub}>
                        Within {rx.followUpDays} days of initial consultation
                      </Text>
                    </View>
                  </View>
                  <Badge label="Due Soon" variant="success" size="sm" />
                </View>
              )}

              {/* Rx Action Buttons */}
              <View style={styles.actionsRow}>
                {rx.followUpAdvised && (
                  <Button
                    title="Book Advised Follow-up"
                    onPress={() => handleBookFollowUp(rx)}
                    variant="secondary"
                    size="sm"
                    icon="calendar"
                    style={{ flex: 1.5 }}
                  />
                )}
                <Button
                  title="Share Rx"
                  onPress={() => handleShareRx(rx.id, rx.doctorName, rx.diagnosis)}
                  variant="outline"
                  size="sm"
                  icon="receipt"
                  style={{ flex: 1 }}
                />
              </View>
            </CompactCard>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 8,
  },
  emptySub: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 2,
    paddingHorizontal: 20,
  },
  rxCard: {
    marginBottom: 8,
  },
  rxTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  rxClinicName: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  rxDocName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 1,
  },
  rxSpecialty: {
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSecondary,
    marginVertical: 6,
  },
  patientDiagBox: {
    marginBottom: 6,
  },
  patientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientNameText: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textSecondary,
  },
  boldText: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  rxIdText: {
    fontSize: 9,
    color: colors.textMuted,
    fontFamily: 'monospace',
  },
  diagnosisBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 4,
    padding: 6,
    marginTop: 4,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  diagLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  diagValue: {
    fontSize: typography.sizes.xxs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    marginTop: 1,
  },
  medsContainer: {
    marginVertical: 4,
  },
  medsHeader: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5,
  },
  medItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0F9FF',
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    marginBottom: 4,
    gap: 6,
  },
  medIconBox: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  medDetails: {
    flex: 1,
  },
  medNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medName: {
    fontSize: typography.sizes.xxs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  medDuration: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  medScheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
    flexWrap: 'wrap',
  },
  medFreq: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  medInst: {
    fontSize: 9,
    color: colors.textMuted,
  },
  adviceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF4FF',
    borderWidth: 1,
    borderColor: '#F5D0FE',
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    gap: 6,
    marginVertical: 4,
  },
  adviceText: {
    fontSize: 9.5,
    color: '#86198F',
    flex: 1,
    lineHeight: 13,
  },
  followUpBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    marginVertical: 4,
  },
  followUpLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  followUpHeading: {
    fontSize: typography.sizes.xxs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  followUpSub: {
    fontSize: 8.5,
    color: colors.textSecondary,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
});
