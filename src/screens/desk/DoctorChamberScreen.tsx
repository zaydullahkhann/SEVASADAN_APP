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
import { DOCTORS } from '../../data/doctors';
import { CLINICS } from '../../data/clinics';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';
import { Icon } from '../../components/common/Icon';
import { DoctorAvatar } from '../../components/common/DoctorAvatar';

export const DoctorChamberScreen: React.FC = () => {
  const {
    activeDeskBranchId,
    appointments,
    openWalkInModal,
  } = useApp();

  const currentClinic = CLINICS.find((c) => c.id === activeDeskBranchId) || CLINICS[0];

  const branchAppointments = appointments.filter(
    (a) => a.clinicId === activeDeskBranchId || !a.clinicId
  );

  const waitingList = branchAppointments.filter((a) => a.status === 'CONFIRMED');
  const inConsultList = branchAppointments.filter((a) => a.status === 'IN_PROGRESS');
  const completedList = branchAppointments.filter((a) => a.status === 'COMPLETED');
  const activeDoctors = DOCTORS.filter((d) => d.dutyStatus === 'AVAILABLE');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Doctor Chamber Availability Header Card */}
      <View style={styles.chamberHeaderCard}>
        <View style={styles.headerIconRow}>
          <View style={styles.chamberIconCircle}>
            <Icon name="stethoscope" size={16} color="#0F766E" />
          </View>
          <Text style={styles.chamberHeaderTitle}>
            Doctor Chamber Availability & Duty Schedule
          </Text>
        </View>
        <Text style={styles.chamberHeaderSub}>
          Live presence, active chamber status, and walk-in consultation load for {currentClinic.name}
        </Text>
      </View>

      {/* 3. Doctor Chamber Cards List (Matching Image 2) */}
      <View style={styles.doctorsList}>
        {DOCTORS.map((doc, idx) => {
          const docApts = branchAppointments.filter(
            (a) =>
              a.doctorId === doc.id ||
              (!a.doctorId && idx === 0) ||
              a.doctorName.toLowerCase().includes(doc.name.toLowerCase().split(' ')[1] || 'ankur')
          );
          const docWaiting = docApts.filter((a) => a.status === 'CONFIRMED').length;
          const docActive = docApts.filter((a) => a.status === 'IN_PROGRESS').length;
          const docDone = docApts.filter((a) => a.status === 'COMPLETED').length;

          return (
            <View key={doc.id} style={styles.chamberCard}>
              {/* Doctor Header Strip */}
              <View style={styles.docHeaderRow}>
                <View style={styles.avatarWrapper}>
                  <DoctorAvatar gender="male" size={48} isHeadSurgeon={idx === 0} />
                  <View style={styles.onlineDot} />
                </View>

                <View style={{ flex: 1 }}>
                  <Text style={styles.docName}>{doc.name}</Text>
                  <Text style={styles.docSpecialty}>{doc.specialization}</Text>

                  <View style={styles.badgeRow}>
                    <View style={styles.feeBadge}>
                      <Text style={styles.feeBadgeText}>OPD Fee: ₹{doc.consultationFeeClinic || 300}</Text>
                    </View>
                    <View style={styles.availableBadge}>
                      <View style={styles.greenMiniDot} />
                      <Text style={styles.availableBadgeText}>Chamber Available</Text>
                    </View>
                  </View>
                </View>
              </View>

              {/* 3 Stats Mini Grid: WAITING, ACTIVE, DONE */}
              <View style={styles.docStatsGrid}>
                <View style={styles.docStatCol}>
                  <Text style={styles.docStatLbl}>WAITING</Text>
                  <Text style={styles.docStatVal}>{docWaiting}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.docStatCol}>
                  <Text style={styles.docStatLbl}>ACTIVE</Text>
                  <Text style={[styles.docStatVal, { color: '#059669' }]}>{docActive}</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.docStatCol}>
                  <Text style={styles.docStatLbl}>DONE</Text>
                  <Text style={[styles.docStatVal, { color: '#7C3AED' }]}>{docDone}</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.btnAllotPatient}
                  onPress={openWalkInModal}
                  activeOpacity={0.8}
                >
                  <Icon name="plus" size={12} color="#FFFFFF" />
                  <Text style={styles.btnAllotText}>Allot Walk-In Patient</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })}
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
  chamberHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  chamberIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#F0FDFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chamberHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  chamberHeaderSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  doctorsList: {
    gap: 12,
  },
  chamberCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  docHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  avatarWrapper: {
    position: 'relative',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  docName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  docSpecialty: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  feeBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  feeBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#334155',
  },
  availableBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  greenMiniDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: '#16A34A',
  },
  availableBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#15803D',
  },
  docStatsGrid: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 10,
  },
  docStatCol: {
    flex: 1,
    alignItems: 'center',
  },
  docStatLbl: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  docStatVal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  cardActions: {
    flexDirection: 'row',
  },
  btnAllotPatient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F766E',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  btnAllotText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
