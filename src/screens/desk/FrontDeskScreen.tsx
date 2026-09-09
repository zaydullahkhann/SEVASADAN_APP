import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { CLINICS } from '../../data/clinics';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';

export const FrontDeskScreen: React.FC = () => {
  const {
    activeDeskBranchId,
    queueStatuses,
    advanceQueue,
    appointments,
    checkInPatient,
    deskRegisters,
    openWalkInModal,
  } = useApp();

  const [filterType, setFilterType] = useState<'ALL' | 'ARRIVED' | 'PENDING'>('ALL');

  const currentClinic = CLINICS.find((c) => c.id === activeDeskBranchId) || CLINICS[0];
  const queue = queueStatuses[activeDeskBranchId] || {
    clinicId: 'sarangpur',
    clinicName: 'Sarangpur Branch',
    currentServingToken: 'SAR-015',
    currentServingIndex: 15,
    totalIssuedToday: 28,
    estimatedWaitMinutesPerPatient: 8,
  };

  const register = deskRegisters[activeDeskBranchId] || {
    cashCollected: 6400,
    upiCollected: 4800,
    totalTokensIssued: 28,
    walkInCount: 16,
    onlineCheckInCount: 12,
  };

  const branchAppointments = appointments.filter(
    (a) => a.clinicId === activeDeskBranchId
  );

  const filteredAppointments = branchAppointments.filter((a) => {
    if (filterType === 'ARRIVED') return a.arrivedAtClinic;
    if (filterType === 'PENDING') return !a.arrivedAtClinic;
    return true;
  });

  const handleCallNextToken = () => {
    advanceQueue(activeDeskBranchId);
    Alert.alert(
      'Token Called on TV Screen',
      `Announcement chime sounded for Token ${queue.clinicName}.\nNow Serving: ${currentClinic.tokenPrefix}-${String(queue.currentServingIndex + 1).padStart(3, '0')}`
    );
  };

  const handleCheckIn = (aptId: string, patientName: string, token: string) => {
    checkInPatient(aptId);
    Alert.alert(
      'Patient Checked In',
      `${patientName} (Token #${token}) marked as arrived at ${currentClinic.shortName} reception.`
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Big Counter Display Board */}
      <CompactCard style={styles.counterBoardCard} borderAccent={colors.primary}>
        <View style={styles.counterTopRow}>
          <View>
            <Text style={styles.counterTitle}>OPD RECEPTION DESK COUNTER</Text>
            <Text style={styles.counterBranchName}>{currentClinic.name}</Text>
          </View>
          <Badge label="TV Synced" variant="success" size="sm" />
        </View>

        {/* Counter Tokens Big Box */}
        <View style={styles.counterDisplayBox}>
          <View style={styles.counterCol}>
            <Text style={styles.counterColLbl}>NOW CALLING</Text>
            <Text style={styles.nowCallingNumber}>{queue.currentServingToken}</Text>
            <Text style={styles.counterRoomText}>Consultation Room 1</Text>
          </View>

          <View style={styles.counterDivider} />

          <View style={styles.counterCol}>
            <Text style={styles.counterColLbl}>TOTAL ISSUED</Text>
            <Text style={styles.totalIssuedNumber}>{queue.totalIssuedToday}</Text>
            <Text style={styles.counterRoomText}>Tokens Today</Text>
          </View>
        </View>

        {/* Action Row */}
        <View style={styles.counterActionRow}>
          <Button
            title="Call Next Token (Chime)"
            onPress={handleCallNextToken}
            variant="secondary"
            size="md"
            icon="token"
            style={{ flex: 1.5 }}
          />
          <Button
            title="Walk-In Desk"
            onPress={openWalkInModal}
            variant="primary"
            size="md"
            icon="plus"
            style={{ flex: 1.2 }}
          />
        </View>
      </CompactCard>

      {/* 2. Daily Cash & Collection Register */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Today's Cash Register & Collections</Text>
        <Text style={styles.sectionSub}>OPD Counter reconciliation for {currentClinic.shortName}</Text>
      </View>

      <CompactCard style={styles.registerCard}>
        <View style={styles.registerGrid}>
          <View style={styles.regCol}>
            <Text style={styles.regVal}>₹{register.cashCollected}</Text>
            <Text style={styles.regLbl}>Cash Collected</Text>
          </View>
          <View style={styles.regSep} />
          <View style={styles.regCol}>
            <Text style={styles.regVal}>₹{register.upiCollected}</Text>
            <Text style={styles.regLbl}>Desk UPI / QR</Text>
          </View>
          <View style={styles.regSep} />
          <View style={styles.regCol}>
            <Text style={[styles.regVal, { color: colors.secondaryDark }]}>
              ₹{register.cashCollected + register.upiCollected}
            </Text>
            <Text style={styles.regLbl}>Total Revenue</Text>
          </View>
        </View>

        <View style={styles.registerFooter}>
          <Text style={styles.regFootText}>
            Walk-ins: {register.walkInCount} • Online Check-ins: {register.onlineCheckInCount}
          </Text>
          <Badge label="Balanced" variant="success" size="sm" />
        </View>
      </CompactCard>

      {/* 3. Patient Arrival Check-In Desk */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.sectionTitle}>
            Patient Check-In Desk ({branchAppointments.length})
          </Text>
          {/* Filter Pills */}
          <View style={styles.filterPills}>
            {(['ALL', 'PENDING', 'ARRIVED'] as const).map((t) => (
              <TouchableOpacity
                key={t}
                onPress={() => setFilterType(t)}
                style={[styles.filterPill, filterType === t && styles.filterPillActive]}
              >
                <Text
                  style={[
                    styles.filterPillText,
                    filterType === t && styles.filterPillTextActive,
                  ]}
                >
                  {t}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
        <Text style={styles.sectionSub}>Verify arriving patients & hand over physical token slips</Text>
      </View>

      {filteredAppointments.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>No appointments matching this filter.</Text>
        </View>
      ) : (
        filteredAppointments.map((apt) => (
          <CompactCard key={apt.id} style={styles.checkInCard}>
            <View style={styles.checkInRow}>
              <View style={styles.checkInLeft}>
                <View style={styles.tokenBox}>
                  <Text style={styles.tokenBoxNum}>{apt.tokenNumber}</Text>
                  <Badge
                    label={apt.arrivedAtClinic ? 'At Clinic' : 'Expected'}
                    variant={apt.arrivedAtClinic ? 'success' : 'neutral'}
                    size="sm"
                  />
                </View>

                <View style={styles.patientInfo}>
                  <Text style={styles.patientName}>{apt.patientName}</Text>
                  <Text style={styles.patientSub}>
                    {apt.patientAge}y • {apt.patientGender} • +91 {apt.patientPhone}
                  </Text>
                  <Text style={styles.docNameText}>
                    Doctor: <Text style={styles.boldDoc}>{apt.doctorName}</Text> ({apt.timeSlot})
                  </Text>
                </View>
              </View>

              <View style={styles.checkInAction}>
                <Text style={styles.paymentMethodText}>
                  {apt.paymentMethod === 'ONLINE_UPI' ? 'Paid Online' : 'Pay at Counter'}
                </Text>
                {!apt.arrivedAtClinic ? (
                  <Button
                    title="Check-In"
                    onPress={() => handleCheckIn(apt.id, apt.patientName, apt.tokenNumber)}
                    variant="primary"
                    size="sm"
                    icon="check"
                    style={{ marginTop: 4 }}
                  />
                ) : (
                  <Badge label="Checked In" variant="success" size="sm" style={{ marginTop: 6 }} />
                )}
              </View>
            </View>
          </CompactCard>
        ))
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
  counterBoardCard: {
    backgroundColor: '#FAFCFF',
    borderColor: '#93C5FD',
    marginBottom: 8,
  },
  counterTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  counterTitle: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  counterBranchName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  counterDisplayBox: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  counterCol: {
    flex: 1,
    alignItems: 'center',
  },
  counterColLbl: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  nowCallingNumber: {
    fontSize: typography.sizes.huge + 2,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginVertical: 2,
  },
  totalIssuedNumber: {
    fontSize: typography.sizes.huge + 2,
    fontWeight: typography.weights.extraBold,
    color: colors.secondaryDark,
    marginVertical: 2,
  },
  counterRoomText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  counterDivider: {
    width: 1,
    height: 48,
    backgroundColor: colors.borderDark,
  },
  counterActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  filterPills: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    padding: 2,
  },
  filterPill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  filterPillActive: {
    backgroundColor: colors.primary,
  },
  filterPillText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.medium,
    color: colors.textMuted,
  },
  filterPillTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  registerCard: {
    marginBottom: 10,
  },
  registerGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 8,
  },
  regCol: {
    alignItems: 'center',
  },
  regVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  regLbl: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  regSep: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  registerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    paddingTop: 8,
    marginTop: 6,
  },
  regFootText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  checkInCard: {
    marginBottom: 6,
  },
  checkInRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkInLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  tokenBox: {
    alignItems: 'center',
    minWidth: 54,
  },
  tokenBoxNum: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginBottom: 2,
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  patientSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  docNameText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  boldDoc: {
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  checkInAction: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  paymentMethodText: {
    fontSize: typography.sizes.xxs,
    color: colors.secondaryDark,
    fontWeight: typography.weights.bold,
  },
  emptyBox: {
    paddingVertical: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
});
