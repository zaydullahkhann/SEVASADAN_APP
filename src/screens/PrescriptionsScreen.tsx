import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Share,
  TouchableOpacity,
  Modal,
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
  const { activeRole, activeDoctorId, prescriptions, openBookingModal } = useApp();
  const [selectedRx, setSelectedRx] = useState<(typeof prescriptions)[0] | null>(null);

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

  const rolePrescriptions = prescriptions.filter((rx) => {
    if (activeRole === 'DOCTOR') {
      return (
        rx.doctorId === activeDoctorId ||
        rx.doctorName.toLowerCase().includes('ankur')
      );
    }
    return true;
  });

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>
            {activeRole === 'DOCTOR'
              ? 'Issued Prescriptions'
              : activeRole === 'FRONT_DESK'
              ? 'Pharmacy & Prescriptions'
              : activeRole === 'ADMIN'
              ? 'Hospital Prescription Archive'
              : 'Digital Prescriptions'}
          </Text>
          <Text style={styles.headerSub}>
            {activeRole === 'DOCTOR'
              ? 'Signed digital prescriptions from your OPD sessions'
              : 'Signed medical prescriptions & medication plans'}
          </Text>
        </View>
        <Badge label={`${rolePrescriptions.length} Records`} variant="primary" size="sm" />
      </View>

      {rolePrescriptions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="prescription" size={36} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No Prescriptions Yet</Text>
          <Text style={styles.emptySub}>
            {activeRole === 'DOCTOR'
              ? 'Prescriptions written during your OPD sessions will appear here.'
              : 'Prescriptions issued during in-clinic or video consultations will appear here automatically.'}
          </Text>
        </View>
      ) : (
        rolePrescriptions.map((rx) => {
          return (
            <CompactCard
              key={rx.id}
              style={styles.rxCard}
              onPress={() => setSelectedRx(rx)}
            >
              {/* Top Row: Doctor/Clinic & Date */}
              <View style={styles.rxTopRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.rxDocName}>{rx.doctorName}</Text>
                  <Text style={styles.rxClinicName}>{rx.clinicName}</Text>
                </View>
                <Badge label={rx.date} variant="neutral" size="sm" />
              </View>

              {/* Patient & Diagnosis Preview */}
              <View style={styles.rxBody}>
                <View style={styles.diagnosisRow}>
                  <Text style={styles.diagLabel}>Diagnosis:</Text>
                  <Text style={styles.diagValue}>{rx.diagnosis}</Text>
                </View>
                <Text style={styles.patientSubText}>
                  Patient: <Text style={{ color: colors.text, fontWeight: '600' }}>{rx.patientName}</Text>
                </Text>
              </View>

              {/* Summary Badges: Medicines Count & Follow Up */}
              <View style={styles.summaryBadgeRow}>
                <View style={styles.medCountBadge}>
                  <Icon name="pill" size={11} color={colors.primary} />
                  <Text style={styles.medCountText}>
                    {rx.medications.length} Medicines Prescribed
                  </Text>
                </View>
                {rx.followUpAdvised && (
                  <Badge
                    label={`Follow-up in ${rx.followUpDays}d`}
                    variant="success"
                    size="sm"
                  />
                )}
              </View>

              {/* Action Buttons Footer */}
              <View style={styles.actionsRow}>
                <Button
                  title="View Prescription"
                  onPress={() => setSelectedRx(rx)}
                  variant="outline"
                  size="sm"
                  icon="receipt"
                  style={{ flex: 1 }}
                />
                {activeRole === 'PATIENT' && rx.followUpAdvised && (
                  <Button
                    title="Book Follow-up"
                    onPress={() => handleBookFollowUp(rx)}
                    variant="secondary"
                    size="sm"
                    icon="calendar"
                    style={{ flex: 1.2 }}
                  />
                )}
              </View>
            </CompactCard>
          );
        })
      )}

      {/* Full Prescription Details Modal */}
      {selectedRx && (
        <Modal
          visible={!!selectedRx}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedRx(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Digital Prescription</Text>
                  <Text style={styles.modalRxId}>Prescription #{selectedRx.id.slice(-8)}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedRx(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Clinic & Doctor Header */}
                <View style={styles.modalDoctorCard}>
                  <Text style={styles.modalClinicName}>{selectedRx.clinicName}</Text>
                  <Text style={styles.modalDocNameText}>{selectedRx.doctorName}</Text>
                  <Text style={styles.modalSpecialtyText}>
                    {selectedRx.doctorSpecialization}
                  </Text>
                  <Text style={styles.modalDateText}>Date Issued: {selectedRx.date}</Text>
                </View>

                {/* Patient & Diagnosis */}
                <View style={styles.modalInfoSection}>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Patient Name:</Text>
                    <Text style={styles.infoValue}>{selectedRx.patientName}</Text>
                  </View>
                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Diagnosis:</Text>
                    <Text style={[styles.infoValue, { color: colors.primary, fontWeight: '700' }]}>
                      {selectedRx.diagnosis}
                    </Text>
                  </View>
                </View>

                {/* Prescribed Medications */}
                <View style={styles.medsSection}>
                  <Text style={styles.sectionHeading}>Prescribed Medicines</Text>
                  {selectedRx.medications.map((med, idx) => (
                    <View key={idx} style={styles.medCard}>
                      <View style={styles.medCardHeader}>
                        <Text style={styles.medCardName}>{idx + 1}. {med.name}</Text>
                        <Text style={styles.medCardDuration}>{med.duration}</Text>
                      </View>
                      <View style={styles.medCardSchedule}>
                        <Badge label={med.dosage} variant="neutral" size="sm" />
                        <Text style={styles.medCardFreq}>{med.frequency}</Text>
                        <Text style={styles.medCardInst}>• {med.instructions}</Text>
                      </View>
                    </View>
                  ))}
                </View>

                {/* Doctor's Advice */}
                {selectedRx.advice && (
                  <View style={styles.adviceCard}>
                    <Text style={styles.adviceHeading}>Doctor's Advice / Diet Instructions</Text>
                    <Text style={styles.adviceBody}>{selectedRx.advice}</Text>
                  </View>
                )}

                {/* Follow-up Note */}
                {selectedRx.followUpAdvised && (
                  <View style={styles.followUpBox}>
                    <Icon name="calendar" size={14} color={colors.secondaryDark} />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.followUpTitle}>
                        Follow-up Advised: {selectedRx.followUpDate}
                      </Text>
                      <Text style={styles.followUpText}>
                        Within {selectedRx.followUpDays} days of consultation
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Modal Footer */}
              <View style={styles.modalFooter}>
                <Button
                  title="Share Prescription"
                  onPress={() =>
                    handleShareRx(
                      selectedRx.id,
                      selectedRx.doctorName,
                      selectedRx.diagnosis
                    )
                  }
                  variant="outline"
                  size="md"
                  icon="receipt"
                  style={{ flex: 1 }}
                />
                {activeRole === 'PATIENT' && selectedRx.followUpAdvised && (
                  <Button
                    title="Book Follow-up"
                    onPress={() => {
                      const rx = selectedRx;
                      setSelectedRx(null);
                      handleBookFollowUp(rx);
                    }}
                    variant="primary"
                    size="md"
                    icon="calendar"
                    style={{ flex: 1.2 }}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
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
    paddingTop: 10,
    paddingBottom: 28,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 10,
  },
  emptySub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 24,
  },
  rxCard: {
    marginBottom: 10,
  },
  rxTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  rxDocName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  rxClinicName: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  rxBody: {
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  diagnosisRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  diagLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  diagValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  patientSubText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  summaryBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 8,
  },
  medCountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  medCountText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalRxId: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalDoctorCard: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 12,
    marginBottom: 12,
  },
  modalClinicName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  modalDocNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 2,
  },
  modalSpecialtyText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    marginTop: 1,
  },
  modalDateText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 4,
  },
  modalInfoSection: {
    marginBottom: 14,
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  medsSection: {
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 8,
  },
  medCard: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    padding: 10,
    marginBottom: 8,
  },
  medCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  medCardName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  medCardDuration: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  medCardSchedule: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medCardFreq: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  medCardInst: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  adviceCard: {
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.borderRadiusSm,
    padding: 10,
    marginBottom: 12,
  },
  adviceHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primaryDeep,
    marginBottom: 4,
  },
  adviceBody: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    lineHeight: 18,
  },
  followUpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: spacing.borderRadiusSm,
    padding: 10,
    marginBottom: 14,
  },
  followUpTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  followUpText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
