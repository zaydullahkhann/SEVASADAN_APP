import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { CLINICS } from '../../data/clinics';
import { DOCTORS } from '../../data/doctors';
import { Appointment } from '../../types';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';

export const FrontDeskScreen: React.FC = () => {
  const {
    activeDeskBranchId,
    appointments,
    checkInPatient,
    advanceQueue,
    openWalkInModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'WAITING' | 'IN_PROGRESS' | 'COMPLETED'>('ALL');
  const [selectedAptDetails, setSelectedAptDetails] = useState<Appointment | null>(null);

  const currentClinic = CLINICS.find((c) => c.id === activeDeskBranchId) || CLINICS[0];

  const branchAppointments = appointments.filter(
    (a) => a.clinicId === activeDeskBranchId || !a.clinicId
  );

  const waitingList = branchAppointments.filter((a) => a.status === 'CONFIRMED');
  const inConsultList = branchAppointments.filter((a) => a.status === 'IN_PROGRESS');
  const completedList = branchAppointments.filter((a) => a.status === 'COMPLETED');
  const activeDoctorsCount = DOCTORS.filter((d) => d.dutyStatus === 'AVAILABLE').length || 1;

  const filteredList = branchAppointments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.doctorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.patientPhone && a.patientPhone.includes(searchQuery));

    if (!matchesSearch) return false;

    if (filterStatus === 'WAITING') return a.status === 'CONFIRMED';
    if (filterStatus === 'IN_PROGRESS') return a.status === 'IN_PROGRESS';
    if (filterStatus === 'COMPLETED') return a.status === 'COMPLETED';
    return true;
  });

  const handleCallTokenChime = (token: string, patient: string) => {
    advanceQueue(activeDeskBranchId);
    Alert.alert(
      'Token Announcement Chime',
      `Calling Token #${token} (${patient}) on Counter TV Screen & Chamber Audio Chime.`
    );
  };

  const handlePrintPass = (apt: Appointment) => {
    setSelectedAptDetails(apt);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Purple Header Banner Matching Image 1 */}
      <View style={styles.topPurpleBanner}>
        <View style={styles.receptionBadgeRow}>
          <View style={styles.receptionBadge}>
            <Icon name="desk" size={11} color="#FFFFFF" />
            <Text style={styles.receptionBadgeText}>FRONT DESK RECEPTION PORTAL</Text>
          </View>
        </View>

        <View style={styles.bannerContentRow}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.bannerTitle}>OPD Desk & Walk-in Token Management</Text>
            <Text style={styles.bannerSubtitle}>
              Register walk-in patients on-ground, collect cash payments, assign tokens & manage live lobby queue across branches seamlessly.
            </Text>
          </View>

          <TouchableOpacity
            style={styles.btnBookWalkIn}
            onPress={openWalkInModal}
            activeOpacity={0.85}
          >
            <Text style={styles.btnBookWalkInText}>Book Walk-In Patient (Cash)</Text>
            <Icon name="plus" size={13} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four KPI Stat Boxes in 2x2 Grid */}
      <View style={styles.kpiGrid}>
        {/* Box 1: WAITING QUEUE */}
        <View style={[styles.kpiBox, styles.kpiBoxWaiting]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#1E40AF' }]}>WAITING QUEUE</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="clock" size={15} color="#2563EB" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#1E3A8A' }]}>
            {waitingList.length}
          </Text>
          <Text style={styles.kpiSubText}>Patients waiting in lobby</Text>
        </View>

        {/* Box 2: INSIDE CONSULTATION */}
        <View style={[styles.kpiBox, styles.kpiBoxConsult]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#047857' }]}>INSIDE CONSULTATION</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="stethoscope" size={15} color="#059669" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#065F46' }]}>
            {inConsultList.length}
          </Text>
          <Text style={styles.kpiSubText}>Currently with doctor</Text>
        </View>

        {/* Box 3: COMPLETED TODAY */}
        <View style={[styles.kpiBox, styles.kpiBoxCompleted]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#7C3AED' }]}>COMPLETED TODAY</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="check-circle" size={15} color="#7C3AED" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#5B21B6' }]}>
            {completedList.length}
          </Text>
          <Text style={styles.kpiSubText}>Finished OPD visits</Text>
        </View>

        {/* Box 4: ACTIVE DOCTORS */}
        <View style={[styles.kpiBox, styles.kpiBoxDoctors]}>
          <View style={styles.kpiTopRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={[styles.kpiLabel, { color: '#D97706' }]}>ACTIVE DOCTORS</Text>
              <View style={styles.orangeDot} />
            </View>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="user-check" size={15} color="#D97706" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#B45309' }]}>
            {activeDoctorsCount}
          </Text>
          <Text style={styles.kpiSubText}>In this branch chamber</Text>
        </View>
      </View>

      {/* 3. Section: Today's In-Clinic OPD Token Queue */}
      <View style={styles.queueCardContainer}>
        <View style={styles.sectionHeaderRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.queueSectionTitle}>Today's In-Clinic OPD Token Queue</Text>
            <Text style={styles.queueSectionSub}>Real-time status updates and walk-in token details</Text>
          </View>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBar}>
          <Icon name="search" size={14} color={colors.textMuted} />
          <TextInput
            placeholder="Search token #, patient name or phone..."
            placeholderTextColor={colors.textLight}
            value={searchQuery}
            onChangeText={setSearchQuery}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Icon name="close" size={13} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Pills */}
        <View style={styles.filterPillsRow}>
          {[
            { key: 'ALL' as const, label: `All (${branchAppointments.length})` },
            { key: 'WAITING' as const, label: `Waiting (${waitingList.length})` },
            { key: 'IN_PROGRESS' as const, label: `In Consult (${inConsultList.length})` },
            { key: 'COMPLETED' as const, label: `Completed (${completedList.length})` },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setFilterStatus(tab.key)}
              style={[
                styles.filterPill,
                filterStatus === tab.key && styles.filterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.filterPillText,
                  filterStatus === tab.key && styles.filterPillTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Table / Queue Rows */}
        {filteredList.length === 0 ? (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyIconCircle}>
              <Icon name="user" size={28} color="#94A3B8" />
            </View>
            <Text style={styles.emptyStateTitle}>No Patient Available in queue currently</Text>
            <Text style={styles.emptyStateSub}>
              Click "Book Walk-In Patient" to register ground walk-ins.
            </Text>
            <Button
              title="Book Walk-In Patient"
              onPress={openWalkInModal}
              variant="primary"
              size="sm"
              icon="plus"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          <View style={styles.queueRowsList}>
            {filteredList.map((apt) => (
              <CompactCard key={apt.id} style={styles.tokenQueueCard}>
                <View style={styles.tokenQueueCardTop}>
                  <View style={styles.tokenNumberPill}>
                    <Text style={styles.tokenNumberPillText}>#{apt.tokenNumber}</Text>
                  </View>

                  <View style={{ flex: 1 }}>
                    <Text style={styles.patientNameHeading}>{apt.patientName}</Text>
                    <Text style={styles.patientSubMeta}>
                      {apt.patientAge}y • {apt.patientGender} • +91 {apt.patientPhone}
                    </Text>
                  </View>

                  <Badge
                    label={apt.status}
                    variant={
                      apt.status === 'COMPLETED'
                        ? 'neutral'
                        : apt.status === 'IN_PROGRESS'
                        ? 'primary'
                        : 'success'
                    }
                    size="sm"
                  />
                </View>

                <View style={styles.tokenQueueCardMiddle}>
                  <View style={styles.middleMetaCol}>
                    <Text style={styles.metaColLabel}>Doctor:</Text>
                    <Text style={styles.metaColVal}>{apt.doctorName}</Text>
                  </View>
                  <View style={styles.middleMetaCol}>
                    <Text style={styles.metaColLabel}>Slot / Time:</Text>
                    <Text style={styles.metaColVal}>{apt.timeSlot}</Text>
                  </View>
                  <View style={styles.middleMetaCol}>
                    <Text style={styles.metaColLabel}>Payment:</Text>
                    <Text style={[styles.metaColVal, { color: colors.primary }]}>
                      ₹{apt.feePaid} ({apt.paymentMethod === 'CASH_COUNTER' ? 'Cash' : 'UPI'})
                    </Text>
                  </View>
                </View>

                {/* Desk Card Action Buttons */}
                <View style={styles.cardActionsRow}>
                  {apt.status === 'CONFIRMED' && (
                    <Button
                      title="Call Chime"
                      onPress={() => handleCallTokenChime(apt.tokenNumber, apt.patientName)}
                      variant="secondary"
                      size="sm"
                      icon="token"
                      style={{ flex: 1 }}
                    />
                  )}
                  {!apt.arrivedAtClinic && (
                    <Button
                      title="Check In"
                      onPress={() => checkInPatient(apt.id)}
                      variant="primary"
                      size="sm"
                      icon="check"
                      style={{ flex: 1 }}
                    />
                  )}
                  <Button
                    title="Print Slip"
                    onPress={() => handlePrintPass(apt)}
                    variant="outline"
                    size="sm"
                    icon="receipt"
                    style={{ flex: 0.8 }}
                  />
                </View>
              </CompactCard>
            ))}
          </View>
        )}
      </View>

      {/* Print Slip / Token Modal */}
      {selectedAptDetails && (
        <Modal
          visible={!!selectedAptDetails}
          transparent
          animationType="slide"
          onRequestClose={() => setSelectedAptDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>OPD Token Pass Slip</Text>
                  <Text style={styles.modalSub}>Token #{selectedAptDetails.tokenNumber}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedAptDetails(null)}>
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 14 }} showsVerticalScrollIndicator={false}>
                <View style={styles.slipBox}>
                  <Text style={styles.slipHospitalName}>JANSEVA AROGYAM HOSPITAL</Text>
                  <Text style={styles.slipBranchName}>{selectedAptDetails.clinicName}</Text>
                  <View style={styles.slipDivider} />
                  <Text style={styles.slipBigToken}>TOKEN #{selectedAptDetails.tokenNumber}</Text>
                  <Text style={styles.slipPatientName}>{selectedAptDetails.patientName}</Text>
                  <Text style={styles.slipMeta}>
                    Consultant: {selectedAptDetails.doctorName}
                    {'\n'}Date: {selectedAptDetails.date} • {selectedAptDetails.timeSlot}
                    {'\n'}Payment: ₹{selectedAptDetails.feePaid} ({selectedAptDetails.paymentMethod === 'CASH_COUNTER' ? 'Cash at Counter' : 'Online UPI'})
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Print Token Slip"
                  onPress={() => {
                    Alert.alert('Printing Slip', `Token Slip #${selectedAptDetails.tokenNumber} sent to counter thermal printer.`);
                    setSelectedAptDetails(null);
                  }}
                  variant="primary"
                  size="md"
                  icon="printer"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Close"
                  onPress={() => setSelectedAptDetails(null)}
                  variant="outline"
                  size="md"
                  style={{ flex: 0.6 }}
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
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: 28,
  },
  topPurpleBanner: {
    backgroundColor: '#4C4378',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: 'rgba(76, 67, 120, 0.2)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  receptionBadgeRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  receptionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
  },
  receptionBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  bannerContentRow: {
    flexDirection: 'column',
    gap: 10,
  },
  bannerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  bannerSubtitle: {
    fontSize: 10.5,
    color: 'rgba(255, 255, 255, 0.82)',
    marginTop: 2,
    lineHeight: 15,
  },
  btnBookWalkIn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2E2657',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    alignSelf: 'flex-start',
  },
  btnBookWalkInText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  kpiBox: {
    width: '48.6%',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
  },
  kpiBoxWaiting: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  kpiBoxConsult: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  kpiBoxCompleted: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  kpiBoxDoctors: {
    borderColor: '#FDE68A',
    backgroundColor: '#FFFBEB',
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  kpiLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  orangeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F59E0B',
  },
  kpiIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  kpiValue: {
    fontSize: 22,
    fontWeight: '800',
    marginVertical: 1,
  },
  kpiSubText: {
    fontSize: 9,
    color: '#64748B',
  },
  queueCardContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  sectionHeaderRow: {
    marginBottom: 8,
  },
  queueSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  queueSectionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 11.5,
    color: '#0F172A',
    padding: 0,
  },
  filterPillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
  },
  filterPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
  },
  filterPillActive: {
    backgroundColor: '#0F4C81',
  },
  filterPillText: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  emptyStateContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    gap: 4,
  },
  emptyIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  emptyStateTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptyStateSub: {
    fontSize: 10,
    color: '#64748B',
    textAlign: 'center',
  },
  queueRowsList: {
    gap: 8,
  },
  tokenQueueCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 4,
  },
  tokenQueueCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  tokenNumberPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tokenNumberPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  patientNameHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  patientSubMeta: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  tokenQueueCardMiddle: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 6,
    gap: 6,
    marginBottom: 8,
  },
  middleMetaCol: {
    flex: 1,
  },
  metaColLabel: {
    fontSize: 8,
    color: '#64748B',
  },
  metaColVal: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  slipBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1.5,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },
  slipHospitalName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.5,
  },
  slipBranchName: {
    fontSize: 10,
    color: '#78350F',
    marginTop: 1,
  },
  slipDivider: {
    width: '100%',
    height: 1,
    backgroundColor: '#FCD34D',
    marginVertical: 10,
  },
  slipBigToken: {
    fontSize: 22,
    fontWeight: '800',
    color: '#B45309',
    marginBottom: 4,
  },
  slipPatientName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 6,
  },
  slipMeta: {
    fontSize: 10.5,
    color: '#451A03',
    lineHeight: 18,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
