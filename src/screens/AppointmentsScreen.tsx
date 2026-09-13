import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { CLINICS } from '../data/clinics';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const AppointmentsScreen: React.FC = () => {
  const {
    activeRole,
    activeDoctorId,
    activeDeskBranchId,
    appointments,
    cancelAppointment,
    queueStatuses,
    advanceQueue,
    openVideoCall,
    openBookingModal,
    openPrescriptionModal,
    openWalkInModal,
  } = useApp();

  const [segment, setSegment] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [activeQueueClinicId, setActiveQueueClinicId] = useState<string>(
    activeDeskBranchId || 'sarangpur'
  );
  const [selectedAptDetails, setSelectedAptDetails] = useState<(typeof appointments)[0] | null>(null);

  const roleFilteredAppointments = appointments.filter((apt) => {
    if (activeRole === 'DOCTOR') {
      return (
        apt.doctorId === activeDoctorId ||
        apt.doctorName.toLowerCase().includes('ankur')
      );
    }
    if (activeRole === 'FRONT_DESK') {
      return activeDeskBranchId ? apt.clinicId === activeDeskBranchId : true;
    }
    return true;
  });

  const upcomingCount = roleFilteredAppointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  ).length;
  const pastCount = roleFilteredAppointments.filter(
    (a) => a.status === 'COMPLETED'
  ).length;
  const cancelledCount = roleFilteredAppointments.filter(
    (a) => a.status === 'CANCELLED'
  ).length;

  const filtered = roleFilteredAppointments.filter((apt) => {
    if (segment === 'UPCOMING') {
      return apt.status === 'CONFIRMED' || apt.status === 'IN_PROGRESS';
    }
    if (segment === 'PAST') {
      return apt.status === 'COMPLETED';
    }
    return apt.status === 'CANCELLED';
  });

  const queueStatus = queueStatuses[activeQueueClinicId] || {
    clinicId: 'sarangpur',
    clinicName: 'Sarangpur Branch',
    currentServingToken: 'SAR-015',
    currentServingIndex: 15,
    totalIssuedToday: 28,
    estimatedWaitMinutesPerPatient: 8,
  };

  // Active token for current user
  const userApt = appointments.find(
    (a) =>
      a.clinicId === activeQueueClinicId &&
      (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
  );

  const patientsAhead = userApt
    ? Math.max(0, userApt.tokenIndex - queueStatus.currentServingIndex)
    : 0;

  const handleCancel = (id: string, token: string) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel token #${token}?`,
      [
        { text: 'Keep Slot', style: 'cancel' },
        {
          text: 'Cancel Token',
          style: 'destructive',
          onPress: () => cancelAppointment(id),
        },
      ]
    );
  };

  const handleViewPass = (token: string, patient: string, doc: string, clinic: string) => {
    Alert.alert(
      `OPD Token Pass: ${token}`,
      `Patient: ${patient}\nConsultant: ${doc}\nClinic: ${clinic}\nStatus: Confirmed\n\nPlease arrive 15 minutes before your estimated time.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Live OPD Queue Tracker Card */}
      <CompactCard style={styles.trackerCard}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerTitleRow}>
            <View style={styles.livePulse} />
            <Text style={styles.trackerTitle}>Live OPD Queue Status</Text>
          </View>

          {/* Branch Selector Chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.queueChips}>
            {CLINICS.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveQueueClinicId(c.id)}
                style={[
                  styles.queueChip,
                  activeQueueClinicId === c.id && styles.queueChipActive,
                ]}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.queueChipText,
                    activeQueueClinicId === c.id && styles.queueChipTextActive,
                  ]}
                >
                  {c.shortName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Display Numbers */}
        <View style={styles.queueDisplayRow}>
          <View style={styles.queueCol}>
            <Text style={styles.queueColLabel}>NOW SERVING</Text>
            <Text style={styles.servingBigNumber}>
              {queueStatus.currentServingToken}
            </Text>
            <Text style={styles.queueColSub}>Room 1 (Consultation)</Text>
          </View>

          <View style={styles.queueDivider} />

          <View style={styles.queueCol}>
            {activeRole === 'PATIENT' ? (
              <>
                <Text style={styles.queueColLabel}>YOUR TOKEN</Text>
                <Text
                  style={[
                    styles.userTokenNumber,
                    !userApt && { color: colors.textMuted },
                  ]}
                >
                  {userApt ? userApt.tokenNumber : 'None'}
                </Text>
                <Text style={styles.queueColSub}>
                  {userApt
                    ? patientsAhead === 0
                      ? 'Your turn now!'
                      : `${patientsAhead} ahead of you`
                    : 'No active token'}
                </Text>
              </>
            ) : activeRole === 'DOCTOR' ? (
              <>
                <Text style={styles.queueColLabel}>WAITING PATIENTS</Text>
                <Text style={styles.userTokenNumber}>
                  {
                    appointments.filter(
                      (a) =>
                        (a.doctorId === activeDoctorId ||
                          a.doctorName.toLowerCase().includes('ankur')) &&
                        a.status === 'CONFIRMED'
                    ).length
                  }
                </Text>
                <Text style={styles.queueColSub}>In your queue</Text>
              </>
            ) : (
              <>
                <Text style={styles.queueColLabel}>TODAY'S TOKENS</Text>
                <Text style={styles.userTokenNumber}>
                  {queueStatus.totalIssuedToday}
                </Text>
                <Text style={styles.queueColSub}>Total issued</Text>
              </>
            )}
          </View>
        </View>

        {/* Status Callout Bar */}
        {activeRole === 'PATIENT' && userApt && (
          <View
            style={[
              styles.queueCalloutBanner,
              patientsAhead === 0 && styles.queueCalloutBannerAlert,
            ]}
          >
            <Icon
              name={patientsAhead === 0 ? 'bell' : 'clock'}
              size={14}
              color={patientsAhead === 0 ? colors.danger : colors.primary}
            />
            <Text
              style={[
                styles.queueCalloutText,
                patientsAhead === 0 && styles.queueCalloutTextAlert,
              ]}
            >
              {patientsAhead === 0
                ? 'Your token is currently being called! Proceed to Room 1.'
                : `~${patientsAhead * queueStatus.estimatedWaitMinutesPerPatient} mins estimated wait (${patientsAhead} patient${patientsAhead > 1 ? 's' : ''} ahead)`}
            </Text>
          </View>
        )}

        {/* Footer Meta & Demo Advance */}
        <View style={styles.queueMetaBar}>
          <View style={styles.metaItem}>
            <Icon name="clock" size={12} color={colors.textMuted} />
            <Text style={styles.metaItemText}>
              ~{queueStatus.estimatedWaitMinutesPerPatient}m avg per consultation
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => advanceQueue(activeQueueClinicId)}
            style={styles.advanceSimBtn}
            activeOpacity={0.7}
          >
            <Icon name="refresh" size={11} color={colors.primary} />
            <Text style={styles.advanceSimText}>Next Token (Demo)</Text>
          </TouchableOpacity>
        </View>
      </CompactCard>

      {/* 2. Clean Segmented Tabs */}
      <View style={styles.segmentContainer}>
        {[
          { key: 'UPCOMING' as const, label: `Upcoming (${upcomingCount})` },
          { key: 'PAST' as const, label: `Past (${pastCount})` },
          { key: 'CANCELLED' as const, label: `Cancelled (${cancelledCount})` },
        ].map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSegment(s.key)}
            style={[styles.segmentBtn, segment === s.key && styles.segmentBtnActive]}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                segment === s.key && styles.segmentTextActive,
              ]}
            >
              {s.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 3. Appointment List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar" size={36} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No {segment.toLowerCase()} appointments</Text>
          <Text style={styles.emptySub}>
            {activeRole === 'DOCTOR'
              ? segment === 'UPCOMING' && pastCount > 0
                ? `All ${pastCount} consultations for today have been completed!`
                : 'Patients assigned to your consultation schedule will appear here.'
              : activeRole === 'FRONT_DESK'
              ? 'Issue walk-in tokens from the counter desk to add patients.'
              : 'Book a hospital visit or doctor video consultation in just a few taps.'}
          </Text>
          {activeRole === 'PATIENT' && (
            <Button
              title="Book In-Clinic or Video OPD"
              onPress={() => openBookingModal()}
              variant="primary"
              size="sm"
              icon="token"
              style={{ marginTop: 12 }}
            />
          )}
          {activeRole === 'FRONT_DESK' && (
            <Button
              title="Issue Walk-In Token"
              onPress={() => openWalkInModal()}
              variant="secondary"
              size="sm"
              icon="token"
              style={{ marginTop: 12 }}
            />
          )}
        </View>
      ) : (
        filtered.map((apt) => {
          const isOnline = apt.consultationMode === 'ONLINE_VIDEO';

          return (
            <CompactCard
              key={apt.id}
              style={styles.aptCard}
              onPress={() => setSelectedAptDetails(apt)}
            >
              {/* Top Row: Token, Mode & Status */}
              <View style={styles.aptTopRow}>
                <View style={styles.tokenBadgeWrap}>
                  <Text style={styles.aptTokenText}>{apt.tokenNumber}</Text>
                  <Badge
                    label={isOnline ? 'Video OPD' : 'In-Clinic'}
                    variant={isOnline ? 'accent' : 'primary'}
                    size="sm"
                  />
                </View>
                <Badge
                  label={apt.status}
                  variant={
                    apt.status === 'CONFIRMED'
                      ? 'success'
                      : apt.status === 'COMPLETED'
                      ? 'neutral'
                      : 'danger'
                  }
                  size="sm"
                />
              </View>

              {/* Body: Doctor & Patient Info */}
              <View style={styles.aptBody}>
                <Text style={styles.aptDoctorName}>{apt.doctorName}</Text>
                <Text style={styles.aptClinicSub}>{apt.clinicName}</Text>

                <View style={styles.aptSlotRow}>
                  <View style={styles.slotLeft}>
                    <Icon name="calendar" size={12} color={colors.primary} />
                    <Text style={styles.slotDateText}>
                      {apt.date} • {apt.timeSlot}
                    </Text>
                  </View>
                  <Text style={styles.patientNameLabel}>
                    Patient: <Text style={{ fontWeight: '600', color: colors.text }}>{apt.patientName}</Text>
                  </Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.aptActions}>
                {apt.status === 'CONFIRMED' && (
                  <>
                    {activeRole === 'DOCTOR' ? (
                      <>
                        {isOnline && (
                          <Button
                            title="Join Video"
                            onPress={() => openVideoCall(apt)}
                            variant="secondary"
                            size="sm"
                            icon="video"
                            style={{ flex: 1.2 }}
                          />
                        )}
                        <Button
                          title="Write Prescription"
                          onPress={() => openPrescriptionModal(apt)}
                          variant="primary"
                          size="sm"
                          icon="prescription"
                          style={{ flex: 1 }}
                        />
                      </>
                    ) : activeRole === 'FRONT_DESK' ? (
                      <Button
                        title="Print Token Pass"
                        onPress={() =>
                          handleViewPass(
                            apt.tokenNumber,
                            apt.patientName,
                            apt.doctorName,
                            apt.clinicName
                          )
                        }
                        variant="outline"
                        size="sm"
                        icon="receipt"
                        style={{ flex: 1 }}
                      />
                    ) : isOnline ? (
                      <Button
                        title="Join Video Call"
                        onPress={() => openVideoCall(apt)}
                        variant="secondary"
                        size="sm"
                        icon="video"
                        style={{ flex: 1.5 }}
                      />
                    ) : (
                      <Button
                        title="View Token Pass"
                        onPress={() =>
                          handleViewPass(
                            apt.tokenNumber,
                            apt.patientName,
                            apt.doctorName,
                            apt.clinicName
                          )
                        }
                        variant="outline"
                        size="sm"
                        icon="receipt"
                        style={{ flex: 1 }}
                      />
                    )}

                    <Button
                      title="Cancel"
                      onPress={() => handleCancel(apt.id, apt.tokenNumber)}
                      variant="ghost"
                      size="sm"
                      textStyle={{ color: colors.danger }}
                    />
                  </>
                )}

                {apt.status === 'COMPLETED' && (
                  <Button
                    title="View Summary"
                    onPress={() => setSelectedAptDetails(apt)}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </CompactCard>
          );
        })
      )}

      {/* Appointment Detail Modal */}
      {selectedAptDetails && (
        <Modal
          visible={!!selectedAptDetails}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedAptDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Appointment Details</Text>
                  <Text style={styles.modalSub}>Token #{selectedAptDetails.tokenNumber}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedAptDetails(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Doctor:</Text>
                  <Text style={styles.modalValue}>{selectedAptDetails.doctorName}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Hospital Branch:</Text>
                  <Text style={styles.modalValue}>{selectedAptDetails.clinicName}</Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Patient:</Text>
                  <Text style={styles.modalValue}>
                    {selectedAptDetails.patientName} ({selectedAptDetails.patientAge}y, {selectedAptDetails.patientGender})
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Date & Time:</Text>
                  <Text style={styles.modalValue}>
                    {selectedAptDetails.date} at {selectedAptDetails.timeSlot}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Consultation Mode:</Text>
                  <Text style={styles.modalValue}>
                    {selectedAptDetails.consultationMode === 'ONLINE_VIDEO'
                      ? 'Doctor Video Call (Tele-OPD)'
                      : 'Hospital In-Clinic Visit'}
                  </Text>
                </View>
                <View style={styles.modalDetailRow}>
                  <Text style={styles.modalLabel}>Payment:</Text>
                  <Text style={styles.modalValue}>
                    ₹{selectedAptDetails.feePaid} ({selectedAptDetails.paymentMethod === 'ONLINE_UPI' ? 'Paid via UPI' : 'Pay at Counter'})
                  </Text>
                </View>
                {selectedAptDetails.reasonForVisit && (
                  <View style={styles.modalDetailRow}>
                    <Text style={styles.modalLabel}>Reason / Symptoms:</Text>
                    <Text style={styles.modalValue}>{selectedAptDetails.reasonForVisit}</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Close"
                  onPress={() => setSelectedAptDetails(null)}
                  variant="outline"
                  size="md"
                  fullWidth
                />
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
  trackerCard: {
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  trackerHeader: {
    marginBottom: 8,
  },
  trackerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  trackerTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  queueChips: {
    flexDirection: 'row',
  },
  queueChip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 6,
  },
  queueChipActive: {
    backgroundColor: colors.primary,
  },
  queueChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  queueChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  queueDisplayRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  queueCol: {
    flex: 1,
    alignItems: 'center',
  },
  queueColLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  servingBigNumber: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginTop: 2,
  },
  userTokenNumber: {
    fontSize: typography.sizes.huge,
    fontWeight: typography.weights.extraBold,
    color: colors.secondaryDark,
    marginTop: 2,
  },
  queueColSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  queueDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.border,
  },
  queueCalloutBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginTop: 8,
  },
  queueCalloutBannerAlert: {
    backgroundColor: '#FEE2E2',
  },
  queueCalloutText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  queueCalloutTextAlert: {
    color: colors.danger,
    fontWeight: typography.weights.bold,
  },
  queueMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metaItemText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  advanceSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
  },
  advanceSimText: {
    fontSize: typography.sizes.xxs,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 3,
    marginBottom: 10,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 6,
  },
  segmentBtnActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  segmentTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
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
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  aptCard: {
    marginBottom: 10,
  },
  aptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  tokenBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  aptTokenText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  aptBody: {
    paddingVertical: 4,
  },
  aptDoctorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  aptClinicSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  aptSlotRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 8,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slotDateText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  patientNameLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  aptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
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
    maxHeight: '80%',
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
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalLabel: {
    fontSize: typography.sizes.sm,
    color: colors.textMuted,
  },
  modalValue: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  modalFooter: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
});
