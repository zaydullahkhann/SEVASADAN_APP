import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { Appointment } from '../../types';

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
    setActiveTab,
  } = useApp();

  const doctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<
    'WAITING' | 'IN_CONSULT' | 'RESCHEDULED' | 'CANCELLED' | 'COMPLETED' | 'ALL'
  >('COMPLETED');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter appointments for this doctor or all mock doctor appointments
  const docAppointments = appointments.filter(
    (a) =>
      a.doctorId === doctor.id ||
      !a.doctorId ||
      a.doctorName.toLowerCase().includes('syed') ||
      a.doctorName.toLowerCase().includes('ankur')
  );

  const activePatient = docAppointments.find((a) => a.status === 'IN_PROGRESS');
  const waitingPatients = docAppointments.filter((a) => a.status === 'CONFIRMED');
  const completedPatients = docAppointments.filter((a) => a.status === 'COMPLETED');
  const cancelledPatients = docAppointments.filter((a) => a.status === 'CANCELLED');
  const rescheduledCount = 0;

  // Counts for the horizontal filter pills
  const counts = {
    WAITING: waitingPatients.length,
    IN_CONSULT: activePatient ? 1 : 0,
    RESCHEDULED: rescheduledCount,
    CANCELLED: cancelledPatients.length,
    COMPLETED: completedPatients.length,
    ALL: docAppointments.length,
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      Alert.alert('Queue Synced', 'Live queue synced with Janseva Arogyam server.');
    }, 400);
  };

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

  // Filtered patients for list
  const filteredPatients = docAppointments.filter((apt) => {
    const matchSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.tokenNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.clinicName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchSearch) return false;

    if (activeFilter === 'WAITING') return apt.status === 'CONFIRMED';
    if (activeFilter === 'IN_CONSULT') return apt.status === 'IN_PROGRESS';
    if (activeFilter === 'CANCELLED') return apt.status === 'CANCELLED';
    if (activeFilter === 'COMPLETED') return apt.status === 'COMPLETED';
    if (activeFilter === 'RESCHEDULED') return false;
    return true; // 'ALL'
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Bar: Live Patient Queue + REAL-TIME SYNC badge */}
      <View style={styles.topHeader}>
        <View style={{ flex: 1 }}>
          <View style={styles.titleBadgeRow}>
            <Text style={styles.mainTitle}>Live Patient Queue</Text>
            <View style={styles.realtimeBadge}>
              <View style={styles.greenDot} />
              <Text style={styles.realtimeText}>REAL-TIME SYNC</Text>
            </View>
          </View>
          <Text style={styles.subTitle}>Today's appointments and token status</Text>
        </View>

        <View style={styles.headerRightControls}>
          <View style={styles.datePill}>
            <Text style={styles.datePillText}>24 Sept 2026</Text>
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={handleRefresh}
            activeOpacity={0.7}
            accessibilityLabel="Refresh Live Queue"
          >
            <Icon name="refresh" size={15} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Four Boxes in 2x2 Grid */}
      <View style={styles.kpiGrid}>
        {/* Box 1: COMPLETED */}
        <View style={[styles.kpiBox, styles.kpiBoxCompleted]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#047857' }]}>COMPLETED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#D1FAE5' }]}>
              <Icon name="check-circle" size={16} color="#059669" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#065F46' }]}>
            {completedPatients.length}
          </Text>
        </View>

        {/* Box 2: RESCHEDULED */}
        <View style={[styles.kpiBox, styles.kpiBoxRescheduled]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#7C3AED' }]}>RESCHEDULED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="calendar" size={16} color="#7C3AED" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#5B21B6' }]}>
            {rescheduledCount}
          </Text>
        </View>

        {/* Box 3: CANCELLED */}
        <View style={[styles.kpiBox, styles.kpiBoxCancelled]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#DC2626' }]}>CANCELLED</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#FEE2E2' }]}>
              <Icon name="close" size={16} color="#DC2626" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#991B1B' }]}>
            {cancelledPatients.length}
          </Text>
        </View>

        {/* Box 4: ALL */}
        <View style={[styles.kpiBox, styles.kpiBoxAll]}>
          <View style={styles.kpiTopRow}>
            <Text style={[styles.kpiLabel, { color: '#2563EB' }]}>ALL</Text>
            <View style={[styles.kpiIconWrap, { backgroundColor: '#DBEAFE' }]}>
              <Icon name="user-check" size={16} color="#2563EB" />
            </View>
          </View>
          <Text style={[styles.kpiValue, { color: '#1E40AF' }]}>
            {docAppointments.length}
          </Text>
        </View>
      </View>

      {/* 3. Active Consultation Chamber Banner (If patient currently inside) */}
      {activePatient && (
        <CompactCard style={styles.activeChamberCard} borderAccent={colors.primary}>
          <View style={styles.activeTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.inConsultBadgeRow}>
                <Badge label="CURRENTLY IN CONSULTATION" variant="primary" size="sm" />
                <Text style={styles.activeTokenText}>#{activePatient.tokenNumber}</Text>
              </View>
              <Text style={styles.activePatientName}>{activePatient.patientName}</Text>
              <Text style={styles.activePatientSub}>
                {activePatient.patientAge} Yrs • {activePatient.patientGender} • {activePatient.clinicName}
              </Text>
            </View>
          </View>

          <View style={styles.activeActionsRow}>
            {activePatient.consultationMode === 'ONLINE_VIDEO' && (
              <Button
                title="Start Video"
                onPress={() => openVideoCall(activePatient)}
                variant="secondary"
                size="sm"
                icon="video"
                style={{ flex: 1 }}
              />
            )}
            <Button
              title="Write Prescription"
              onPress={() => openPrescriptionModal(activePatient)}
              variant="primary"
              size="sm"
              icon="prescription"
              style={{ flex: 1.2 }}
            />
            <Button
              title="Done"
              onPress={() => completeConsultation(activePatient.id)}
              variant="outline"
              size="sm"
              icon="check"
              style={{ flex: 0.8 }}
            />
          </View>
        </CompactCard>
      )}

      {/* Call Next Patient Quick Action */}
      {waitingPatients.length > 0 && !activePatient && (
        <Button
          title={`Call Next Patient (${waitingPatients.length} Waiting)`}
          onPress={handleCallNext}
          variant="secondary"
          size="md"
          icon="token"
          style={{ marginBottom: 10 }}
        />
      )}

      {/* 4. Search Bar */}
      <View style={styles.searchBox}>
        <Icon name="search" size={15} color={colors.textMuted} />
        <TextInput
          placeholder="Search patient, token or branch..."
          placeholderTextColor={colors.textLight}
          value={searchQuery}
          onChangeText={setSearchQuery}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Icon name="close" size={14} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* 5. Horizontal Filter Tabs with Counts */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterScrollContent}
      >
        {[
          { key: 'WAITING' as const, label: `Waiting  ${counts.WAITING}` },
          { key: 'IN_CONSULT' as const, label: `In Consult  ${counts.IN_CONSULT}` },
          { key: 'RESCHEDULED' as const, label: `Reschd.  ${counts.RESCHEDULED}` },
          { key: 'CANCELLED' as const, label: `Cancelled  ${counts.CANCELLED}` },
          { key: 'COMPLETED' as const, label: `Completed  ${counts.COMPLETED}` },
          { key: 'ALL' as const, label: `All  ${counts.ALL}` },
        ].map((tab) => {
          const isActive = activeFilter === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveFilter(tab.key)}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.filterChipText,
                  isActive && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 6. Patient Rows List */}
      <View style={styles.listSection}>
        {filteredPatients.length === 0 ? (
          <View style={styles.emptyState}>
            <Icon name="user-check" size={32} color={colors.textLight} />
            <Text style={styles.emptyTitle}>No Patients in This Filter</Text>
            <Text style={styles.emptySub}>
              Switch filters above or call in waiting tokens.
            </Text>
          </View>
        ) : (
          filteredPatients.map((apt, index) => {
            const isVideo = apt.consultationMode === 'ONLINE_VIDEO';
            const initials = getInitials(apt.patientName);

            return (
              <CompactCard key={apt.id} style={styles.patientRowCard}>
                <View style={styles.rowMain}>
                  {/* Left: Token Badge */}
                  <View style={styles.tokenPill}>
                    <Text style={styles.tokenPillText}># {index + 1}</Text>
                  </View>

                  {/* Avatar with Initials */}
                  <View style={styles.initialsAvatar}>
                    <Text style={styles.initialsText}>{initials}</Text>
                  </View>

                  {/* Center Info: Name, Age, Branch, Date */}
                  <View style={styles.patientCenterInfo}>
                    <View style={styles.nameRow}>
                      <Text style={styles.patientNameText}>{apt.patientName}</Text>
                    </View>
                    <Text style={styles.patientAgeText}>{apt.patientAge} Years</Text>

                    <View style={styles.branchRow}>
                      <Icon name="hospital" size={11} color="#059669" />
                      <Text style={styles.branchText} numberOfLines={1}>
                        {apt.clinicName}
                      </Text>
                    </View>

                    <Text style={styles.slotText}>
                      {apt.date} • {apt.timeSlot}
                    </Text>
                  </View>

                  {/* Right Info: Mode & Status */}
                  <View style={styles.patientRightCol}>
                    <View style={styles.modeBadge}>
                      <Icon
                        name={isVideo ? 'video' : 'hospital'}
                        size={10}
                        color="#0F766E"
                      />
                      <Text style={styles.modeText}>
                        {isVideo ? 'Video OPD' : 'In-Clinic'}
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.statusBadge,
                        apt.status === 'COMPLETED'
                          ? styles.statusCompleted
                          : apt.status === 'IN_PROGRESS'
                          ? styles.statusInProgress
                          : apt.status === 'CONFIRMED'
                          ? styles.statusWaiting
                          : styles.statusCancelled,
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusBadgeText,
                          apt.status === 'COMPLETED'
                            ? styles.statusTextCompleted
                            : apt.status === 'IN_PROGRESS'
                            ? styles.statusTextInProgress
                            : apt.status === 'CONFIRMED'
                            ? styles.statusTextWaiting
                            : styles.statusTextCancelled,
                        ]}
                      >
                        {apt.status}
                      </Text>
                    </View>
                  </View>
                </View>
              </CompactCard>
            );
          })
        )}
      </View>

      {/* 7. Bottom Table Summary */}
      <View style={styles.bottomSummary}>
        <Text style={styles.bottomSummaryText}>
          SHOWING {filteredPatients.length > 0 ? `1 - ${filteredPatients.length}` : '0'} OF {docAppointments.length} PATIENTS
        </Text>
      </View>
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
  topHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  titleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
    marginBottom: 2,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  realtimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 5,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  greenDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  realtimeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
    letterSpacing: 0.3,
  },
  subTitle: {
    fontSize: 11,
    color: '#64748B',
  },
  headerRightControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  datePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  datePillText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#334155',
  },
  refreshBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
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
  kpiBoxCompleted: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  kpiBoxRescheduled: {
    borderColor: '#DDD6FE',
    backgroundColor: '#F5F3FF',
  },
  kpiBoxCancelled: {
    borderColor: '#FECDD3',
    backgroundColor: '#FFF1F2',
  },
  kpiBoxAll: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  kpiTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
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
  },
  activeChamberCard: {
    backgroundColor: '#FFFFFF',
    marginBottom: 10,
    padding: 12,
  },
  activeTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  inConsultBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  activeTokenText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.primary,
  },
  activePatientName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  activePatientSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  activeActionsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
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
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  filterScroll: {
    maxHeight: 36,
    marginBottom: 10,
  },
  filterScrollContent: {
    gap: 6,
    paddingRight: 10,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#0F4C81',
    borderWidth: 1.5,
  },
  filterChipText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#64748B',
  },
  filterChipTextActive: {
    color: '#0F4C81',
    fontWeight: '800',
  },
  listSection: {
    gap: 8,
  },
  patientRowCard: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    marginBottom: 4,
  },
  rowMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  tokenPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 7,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tokenPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  initialsAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#0F4C81',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initialsText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  patientCenterInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  patientNameText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  patientAgeText: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  branchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  branchText: {
    fontSize: 9.5,
    color: '#059669',
    fontWeight: '600',
  },
  slotText: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  patientRightCol: {
    alignItems: 'flex-end',
    gap: 6,
  },
  modeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 3,
    borderWidth: 1,
    borderColor: '#CCFBF1',
  },
  modeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#0F766E',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusCompleted: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusInProgress: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  statusWaiting: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusCancelled: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECDD3',
  },
  statusBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTextCompleted: {
    color: '#16A34A',
  },
  statusTextInProgress: {
    color: '#2563EB',
  },
  statusTextWaiting: {
    color: '#D97706',
  },
  statusTextCancelled: {
    color: '#DC2626',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 30,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
  },
  bottomSummary: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  bottomSummaryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 0.8,
  },
});
