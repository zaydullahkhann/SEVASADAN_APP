import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';

export const DoctorQueueScreen: React.FC = () => {
  const {
    appointments,
    doctors,
    activeDoctorId,
    selectedBranchId,
    callNextPatient,
    openPrescriptionModal,
    openVideoCall,
    completeConsultation,
  } = useApp();

  const doctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  // Current active patient in consultation
  const activePatient = appointments.find(
    (a) =>
      a.status === 'IN_PROGRESS' &&
      (a.doctorId === doctor.id || !a.doctorId)
  );

  // Waiting patients
  const waitingPatients = appointments.filter(
    (a) =>
      a.status === 'CONFIRMED' &&
      (a.doctorId === doctor.id || !a.doctorId) &&
      (selectedBranchId === 'all' || a.clinicId === selectedBranchId)
  );

  // Completed today
  const completedPatients = appointments.filter(
    (a) =>
      a.status === 'COMPLETED' &&
      (a.doctorId === doctor.id || !a.doctorId)
  );

  const handleCallNext = () => {
    const called = callNextPatient(selectedBranchId, doctor.id);
    if (called) {
      Alert.alert(
        'Patient Called In',
        `Now calling Token #${called.tokenNumber}: ${called.patientName} into Doctor's chamber.`
      );
    } else {
      Alert.alert('Queue Empty', 'No more patients waiting in the queue.');
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Doctor Header Summary Card */}
      <CompactCard style={styles.doctorHeaderCard} borderAccent={colors.secondary}>
        <View style={styles.docHeaderRow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarEmoji}>👨‍⚕️</Text>
          </View>
          <View style={styles.docHeaderInfo}>
            <View style={styles.nameRow}>
              <Text style={styles.docName}>{doctor.name}</Text>
              <Badge
                label={doctor.dutyStatus === 'AVAILABLE' ? 'On Duty (OPD)' : 'In Surgery'}
                variant={doctor.dutyStatus === 'AVAILABLE' ? 'success' : 'danger'}
                size="sm"
              />
            </View>
            <Text style={styles.docQual}>{doctor.qualification}</Text>
            <Text style={styles.docSpec}>{doctor.specialization}</Text>
          </View>
        </View>

        {/* Stats Strip */}
        <View style={styles.statsStrip}>
          <View style={styles.statCol}>
            <Text style={styles.statVal}>{waitingPatients.length}</Text>
            <Text style={styles.statLbl}>Waiting In OPD</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.secondaryDark }]}>
              {completedPatients.length}
            </Text>
            <Text style={styles.statLbl}>Seen Today</Text>
          </View>
          <View style={styles.statDiv} />
          <View style={styles.statCol}>
            <Text style={[styles.statVal, { color: colors.primary }]}>
              ₹{doctor.consultationFeeClinic}
            </Text>
            <Text style={styles.statLbl}>OPD Fee</Text>
          </View>
        </View>
      </CompactCard>

      {/* 1. Current Active Consultation (If any) */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <View style={styles.activeDot} />
          <Text style={styles.sectionTitle}>Currently In Consultation</Text>
        </View>
      </View>

      {activePatient ? (
        <CompactCard style={styles.activePatientCard} borderAccent={colors.primary}>
          <View style={styles.activeTopRow}>
            <View>
              <Text style={styles.tokenHighlight}>{activePatient.tokenNumber}</Text>
              <Text style={styles.activePatientName}>{activePatient.patientName}</Text>
              <Text style={styles.activePatientMeta}>
                {activePatient.patientAge} Yrs • {activePatient.patientGender} • +91 {activePatient.patientPhone}
              </Text>
            </View>
            <Badge
              label={activePatient.consultationMode === 'ONLINE_VIDEO' ? 'Tele-OPD' : 'In-Clinic'}
              variant={activePatient.consultationMode === 'ONLINE_VIDEO' ? 'accent' : 'primary'}
              size="sm"
            />
          </View>

          <View style={styles.reasonBox}>
            <Text style={styles.reasonLbl}>Chief Complaint / Symptoms:</Text>
            <Text style={styles.reasonVal}>
              {activePatient.reasonForVisit || activePatient.symptoms.join(', ')}
            </Text>
          </View>

          {/* Consultation Actions */}
          <View style={styles.activeActionsRow}>
            {activePatient.consultationMode === 'ONLINE_VIDEO' && (
              <Button
                title="Start Video Call"
                onPress={() => openVideoCall(activePatient)}
                variant="secondary"
                size="sm"
                icon="video"
                style={styles.halfBtn}
              />
            )}
            <Button
              title="Write & Sign Rx"
              onPress={() => openPrescriptionModal(activePatient)}
              variant="primary"
              size="sm"
              icon="prescription"
              style={styles.halfBtn}
            />
            <Button
              title="Done"
              onPress={() => completeConsultation(activePatient.id)}
              variant="outline"
              size="sm"
              icon="check"
            />
          </View>
        </CompactCard>
      ) : (
        <CompactCard style={styles.noActiveCard}>
          <Text style={styles.noActiveTitle}>No Patient Currently In Chamber</Text>
          <Text style={styles.noActiveSub}>
            Tap "Call Next Patient" below to invite the next token into your room.
          </Text>
        </CompactCard>
      )}

      {/* Call Next Button */}
      <Button
        title={`Call Next Patient (${waitingPatients.length} Waiting)`}
        onPress={handleCallNext}
        variant="secondary"
        size="md"
        icon="token"
        fullWidth
        style={styles.callNextBtn}
      />

      {/* 2. Waiting Patients List */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>
          Waiting OPD Queue ({waitingPatients.length})
        </Text>
        <Text style={styles.sectionSub}>Patients waiting at the clinic counter or for Tele-OPD</Text>
      </View>

      {waitingPatients.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>All waiting patients have been attended to!</Text>
        </View>
      ) : (
        waitingPatients.map((apt, idx) => {
          const isVideo = apt.consultationMode === 'ONLINE_VIDEO';
          return (
            <CompactCard key={apt.id} style={styles.waitingCard}>
              <View style={styles.waitingRow}>
                <View style={styles.queueIndexBox}>
                  <Text style={styles.queueIndexText}>#{idx + 1}</Text>
                  <Text style={styles.queueTokenBadge}>{apt.tokenNumber}</Text>
                </View>

                <View style={styles.waitingInfo}>
                  <View style={styles.waitingNameRow}>
                    <Text style={styles.waitingName}>{apt.patientName}</Text>
                    <Badge
                      label={isVideo ? 'Video OPD' : apt.clinicName.split(' ')[0]}
                      variant={isVideo ? 'accent' : 'neutral'}
                      size="sm"
                    />
                  </View>
                  <Text style={styles.waitingMeta}>
                    {apt.patientAge}y • {apt.patientGender} • Slot: {apt.timeSlot}
                  </Text>
                  <Text style={styles.waitingReason} numberOfLines={1}>
                    {apt.reasonForVisit}
                  </Text>
                </View>

                <View style={styles.waitingActionCol}>
                  {isVideo ? (
                    <Button
                      title="Video"
                      onPress={() => openVideoCall(apt)}
                      variant="secondary"
                      size="sm"
                      icon="video"
                      style={styles.miniBtn}
                    />
                  ) : (
                    <Button
                      title="Call"
                      onPress={() => {
                        callNextPatient(apt.clinicId, doctor.id);
                      }}
                      variant="primary"
                      size="sm"
                      icon="token"
                      style={styles.miniBtn}
                    />
                  )}
                </View>
              </View>
            </CompactCard>
          );
        })
      )}

      {/* 3. Completed Today List */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>
          Completed Today ({completedPatients.length})
        </Text>
      </View>

      {completedPatients.map((apt) => (
        <CompactCard key={apt.id} style={styles.completedCard}>
          <View style={styles.completedRow}>
            <View>
              <Text style={styles.completedName}>{apt.patientName}</Text>
              <Text style={styles.completedSub}>
                Token #{apt.tokenNumber} • {apt.clinicName} • {apt.timeSlot}
              </Text>
            </View>
            <Badge label="Visited" variant="success" size="sm" />
          </View>
        </CompactCard>
      ))}
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
  doctorHeaderCard: {
    marginBottom: 8,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 22,
  },
  docHeaderInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docQual: {
    fontSize: typography.sizes.xxs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  docSpec: {
    fontSize: 9,
    color: colors.textMuted,
  },
  statsStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 5,
    marginTop: 8,
  },
  statCol: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLbl: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  statDiv: {
    width: 1,
    height: 18,
    backgroundColor: colors.borderDark,
  },
  sectionHeader: {
    marginTop: 6,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  activePatientCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    marginBottom: 8,
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  tokenHighlight: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  activePatientName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  activePatientMeta: {
    fontSize: 9,
    color: colors.textSecondary,
    marginTop: 1,
  },
  reasonBox: {
    backgroundColor: colors.white,
    padding: 6,
    borderRadius: 4,
    marginVertical: 6,
  },
  reasonLbl: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  reasonVal: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.text,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  halfBtn: {
    flex: 1,
  },
  noActiveCard: {
    backgroundColor: colors.white,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  noActiveTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  noActiveSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  callNextBtn: {
    marginVertical: 4,
  },
  waitingCard: {
    marginBottom: 6,
  },
  waitingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  queueIndexBox: {
    alignItems: 'center',
    marginRight: 8,
    minWidth: 45,
  },
  queueIndexText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
  },
  queueTokenBadge: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  waitingInfo: {
    flex: 1,
  },
  waitingNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  waitingName: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  waitingMeta: {
    fontSize: 9,
    color: colors.textMuted,
  },
  waitingReason: {
    fontSize: 9.5,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  waitingActionCol: {
    marginLeft: 6,
  },
  miniBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  emptyBox: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textMuted,
  },
  completedCard: {
    marginBottom: 4,
    backgroundColor: '#F8FAFC',
  },
  completedRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  completedName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  completedSub: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
});
