import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
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
    appointments,
    cancelAppointment,
    queueStatuses,
    advanceQueue,
    openVideoCall,
    openBookingModal,
  } = useApp();

  const [segment, setSegment] = useState<'UPCOMING' | 'PAST' | 'CANCELLED'>('UPCOMING');
  const [activeQueueClinicId, setActiveQueueClinicId] = useState<string>('sarangpur');

  const filtered = appointments.filter((apt) => {
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

  // Find if current user has an active token in this clinic
  const userApt = appointments.find(
    (a) =>
      a.clinicId === activeQueueClinicId &&
      (a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS')
  );

  const handleCancel = (id: string, token: string) => {
    Alert.alert(
      'Cancel Appointment',
      `Are you sure you want to cancel token #${token}? Refund or slot relinquishment will be processed.`,
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
      `Patient: ${patient}\nConsultant: ${doc}\nClinic: ${clinic}\nStatus: Confirmed & Active in Queue\n\nPlease arrive 15 minutes before your estimated time.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Live OPD Queue Tracker Widget */}
      <CompactCard style={styles.trackerCard} borderAccent={colors.warning}>
        <View style={styles.trackerHeader}>
          <View style={styles.trackerTitleRow}>
            <View style={styles.livePulse} />
            <Text style={styles.trackerTitle}>Live OPD Queue Tracker</Text>
          </View>

          {/* Branch Selector for Queue */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.queueChips}>
            {CLINICS.map((c) => (
              <TouchableOpacity
                key={c.id}
                onPress={() => setActiveQueueClinicId(c.id)}
                style={[
                  styles.queueChip,
                  activeQueueClinicId === c.id && styles.queueChipActive,
                ]}
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

        {/* Tokens Display */}
        <View style={styles.queueDisplayRow}>
          <View style={styles.queueCol}>
            <Text style={styles.queueColLabel}>NOW SERVING</Text>
            <Text style={styles.servingBigNumber}>
              {queueStatus.currentServingToken}
            </Text>
            <Text style={styles.queueColSub}>Room 1 (OPD Desk)</Text>
          </View>

          <View style={styles.queueDivider} />

          <View style={styles.queueCol}>
            <Text style={styles.queueColLabel}>YOUR TOKEN</Text>
            <Text
              style={[
                styles.userTokenNumber,
                !userApt && { color: colors.textMuted },
              ]}
            >
              {userApt ? userApt.tokenNumber : 'No Active'}
            </Text>
            <Text style={styles.queueColSub}>
              {userApt
                ? `${Math.max(0, userApt.tokenIndex - queueStatus.currentServingIndex)} ahead`
                : 'Book to get pass'}
            </Text>
          </View>
        </View>

        {/* Queue Meta Bar */}
        <View style={styles.queueMetaBar}>
          <View style={styles.metaItem}>
            <Icon name="clock" size={10} color={colors.textSecondary} />
            <Text style={styles.metaItemText}>
              Avg wait ~{queueStatus.estimatedWaitMinutesPerPatient}m / patient
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => advanceQueue(activeQueueClinicId)}
            style={styles.advanceSimBtn}
          >
            <Icon name="refresh" size={9} color={colors.primary} />
            <Text style={styles.advanceSimText}>Next Token (Demo)</Text>
          </TouchableOpacity>
        </View>
      </CompactCard>

      {/* 2. Segmented Filter */}
      <View style={styles.segmentContainer}>
        {(
          [
            { key: 'UPCOMING', label: 'Upcoming Visits' },
            { key: 'PAST', label: 'Past Visits' },
            { key: 'CANCELLED', label: 'Cancelled' },
          ] as const
        ).map((s) => (
          <TouchableOpacity
            key={s.key}
            onPress={() => setSegment(s.key)}
            style={[styles.segmentBtn, segment === s.key && styles.segmentBtnActive]}
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

      {/* 3. Appointment Cards List */}
      {filtered.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="calendar" size={36} color={colors.textLight} />
          <Text style={styles.emptyTitle}>No {segment.toLowerCase()} visits</Text>
          <Text style={styles.emptySub}>
            Book a physical clinic visit or online video consultation in seconds.
          </Text>
          <Button
            title="Book In-Clinic or Video OPD"
            onPress={() => openBookingModal()}
            variant="primary"
            size="sm"
            icon="token"
            style={{ marginTop: 8 }}
          />
        </View>
      ) : (
        filtered.map((apt) => {
          const isOnline = apt.consultationMode === 'ONLINE_VIDEO';

          return (
            <CompactCard
              key={apt.id}
              style={styles.aptCard}
              borderAccent={isOnline ? colors.accent : colors.primary}
            >
              {/* Card Top Row */}
              <View style={styles.aptTopRow}>
                <View style={styles.tokenBadgeWrap}>
                  <Text style={styles.aptTokenText}>{apt.tokenNumber}</Text>
                  <Badge
                    label={isOnline ? 'Virtual Video OPD' : 'In-Clinic Physical'}
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

              {/* Doctor & Patient Info */}
              <View style={styles.aptBody}>
                <View style={styles.infoRow}>
                  <View style={styles.infoCol}>
                    <Text style={styles.labelMuted}>DOCTOR & CLINIC</Text>
                    <Text style={styles.boldText}>{apt.doctorName}</Text>
                    <Text style={styles.subText}>{apt.clinicName}</Text>
                  </View>

                  <View style={[styles.infoCol, { alignItems: 'flex-end' }]}>
                    <Text style={styles.labelMuted}>PATIENT</Text>
                    <Text style={styles.boldText}>{apt.patientName}</Text>
                    <Text style={styles.subText}>
                      {apt.patientAge}y • {apt.patientGender}
                    </Text>
                  </View>
                </View>

                {/* Date & Slot Banner */}
                <View style={styles.slotBanner}>
                  <View style={styles.slotLeft}>
                    <Icon name="calendar" size={11} color={colors.primary} />
                    <Text style={styles.slotDateText}>
                      {apt.date} at {apt.timeSlot}
                    </Text>
                  </View>
                  <Text style={styles.feePaidText}>
                    {apt.paymentMethod === 'ONLINE_UPI' ? '₹' + apt.feePaid + ' Paid Online' : 'Pay at Counter'}
                  </Text>
                </View>

                {apt.reasonForVisit ? (
                  <Text style={styles.reasonText} numberOfLines={1}>
                    Reason: {apt.reasonForVisit}
                  </Text>
                ) : null}
              </View>

              {/* Actions Footer */}
              <View style={styles.aptActions}>
                {apt.status === 'CONFIRMED' && (
                  <>
                    {isOnline ? (
                      <Button
                        title="Join Video OPD Room"
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
                        style={{ flex: 1.2 }}
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
  trackerCard: {
    backgroundColor: colors.white,
    borderColor: '#FDE68A',
    marginBottom: 8,
  },
  trackerHeader: {
    marginBottom: 8,
  },
  trackerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  livePulse: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.danger,
  },
  trackerTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  queueChips: {
    flexDirection: 'row',
  },
  queueChip: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
    marginRight: 4,
  },
  queueChipActive: {
    backgroundColor: colors.primary,
  },
  queueChipText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  queueChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  queueDisplayRow: {
    flexDirection: 'row',
    backgroundColor: '#FAFAF9',
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  queueCol: {
    flex: 1,
    alignItems: 'center',
  },
  queueColLabel: {
    fontSize: 8.5,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
    letterSpacing: 0.5,
  },
  servingBigNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginVertical: 1,
  },
  userTokenNumber: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.secondaryDark,
    marginVertical: 1,
  },
  queueColSub: {
    fontSize: 9,
    color: colors.textMuted,
  },
  queueDivider: {
    width: 1,
    height: 36,
    backgroundColor: colors.borderDark,
  },
  queueMetaBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaItemText: {
    fontSize: 9.5,
    color: colors.textSecondary,
  },
  advanceSimBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  advanceSimText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 2,
    marginVertical: 8,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    alignItems: 'center',
    borderRadius: 4,
  },
  segmentBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  segmentText: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  segmentTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
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
  },
  aptCard: {
    marginBottom: 8,
  },
  aptTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  tokenBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aptTokenText: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  aptBody: {
    gap: 6,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoCol: {
    flex: 1,
  },
  labelMuted: {
    fontSize: 8.5,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
  },
  boldText: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 1,
  },
  subText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  slotBanner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  slotLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  slotDateText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semiBold,
    color: colors.primaryDeep,
  },
  feePaidText: {
    fontSize: 9,
    color: colors.secondaryDark,
    fontWeight: typography.weights.bold,
  },
  reasonText: {
    fontSize: 9.5,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  aptActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
});
