import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
  Modal,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { DOCTORS } from '../data/doctors';
import { CLINICS } from '../data/clinics';
import { SPECIALTIES } from '../data/specialties';
import { Icon, IconName } from '../components/common/Icon';
import { DoctorAvatar } from '../components/common/DoctorAvatar';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';

export const HomeScreen: React.FC = () => {
  const {
    selectedBranchId,
    openBookingModal,
    queueStatuses,
    setActiveTab,
    appointments,
    openVideoCall,
  } = useApp();

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [profileModalDoctor, setProfileModalDoctor] = useState<(typeof DOCTORS)[0] | null>(null);
  const [viewPassApt, setViewPassApt] = useState<(typeof appointments)[0] | null>(null);

  // Active appointment for user if exists
  const activeUserAppointment = appointments.find(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  );

  // Filter clinics
  const activeClinic =
    selectedBranchId !== 'all'
      ? CLINICS.find((c) => c.id === selectedBranchId)
      : null;

  const currentQueue = activeClinic
    ? queueStatuses[activeClinic.id]
    : queueStatuses.sarangpur;

  const patientsAhead = activeUserAppointment
    ? Math.max(0, activeUserAppointment.tokenIndex - (currentQueue?.currentServingIndex || 15))
    : 0;

  // Filter doctors
  const filteredDoctors = DOCTORS.filter((doc) => {
    const matchesBranch =
      selectedBranchId === 'all' || doc.clinicsCovered.includes(selectedBranchId);
    let matchesSpecialty = true;
    if (selectedSpecialty === 'pediatric') {
      matchesSpecialty = doc.id === 'doc-ankur';
    } else if (selectedSpecialty === 'general_medicine') {
      matchesSpecialty = doc.id === 'doc-rajesh';
    } else if (selectedSpecialty === 'gynaecology') {
      matchesSpecialty = doc.id === 'doc-anjali';
    } else if (selectedSpecialty === 'orthopedics') {
      matchesSpecialty = doc.id === 'doc-vikram';
    }
    return matchesBranch && matchesSpecialty;
  });

  const handleEmergencyCall = () => {
    Linking.openURL('tel:18007382723').catch(() => {
      Alert.alert('Emergency Helpline', 'Call toll free: 1800-7382-723');
    });
  };

  const getSpecialtyIcon = (specId: string): IconName => {
    switch (specId) {
      case 'pediatric':
        return 'baby';
      case 'general_medicine':
        return 'stethoscope';
      case 'gynaecology':
        return 'heart';
      case 'orthopedics':
        return 'bone';
      default:
        return 'activity';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Welcoming Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.heroTextWrap}>
          <View style={styles.heroTitleRow}>
            <Text style={styles.heroGreeting}>Welcome to SEVASADAN</Text>
            <View style={styles.onlineBadge}>
              <Icon name="zap" size={10} color="#16A34A" />
              <Text style={styles.onlineBadgeText}>OPD Active</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Fast OPD tokens & superspecialist consultations across 4 hospital branches
          </Text>
        </View>
      </View>

      {/* 2. Prominent Active Token Tracker (If customer has an active booking) */}
      {activeUserAppointment && (
        <View style={styles.activeTokenCard}>
          <View style={styles.activeTokenHeader}>
            <View style={styles.activeTokenHeaderLeft}>
              <View style={styles.pulsingDot}>
                <View style={styles.pulsingDotInner} />
              </View>
              <Text style={styles.activeTokenHeaderTitle}>Your Live OPD Token</Text>
            </View>
            <Badge
              label={
                activeUserAppointment.consultationMode === 'ONLINE_VIDEO'
                  ? 'Video Call'
                  : 'Hospital OPD'
              }
              variant={activeUserAppointment.consultationMode === 'ONLINE_VIDEO' ? 'accent' : 'primary'}
              size="sm"
            />
          </View>

          <View style={styles.activeTokenBody}>
            <View style={styles.tokenNumberBox}>
              <Text style={styles.tokenNumberLabel}>TOKEN</Text>
              <Text style={styles.tokenNumberValue}>{activeUserAppointment.tokenNumber}</Text>
            </View>

            <View style={styles.activeTokenDetails}>
              <Text style={styles.activeTokenDoctor}>{activeUserAppointment.doctorName}</Text>
              <Text style={styles.activeTokenClinic}>
                {activeUserAppointment.clinicName} • {activeUserAppointment.date} ({activeUserAppointment.timeSlot})
              </Text>
              <View style={styles.queueStatusRow}>
                <Icon name="clock" size={12} color={colors.primary} />
                <Text style={styles.queueStatusText}>
                  Now Serving: <Text style={{ fontWeight: 'bold' }}>#{currentQueue?.currentServingToken || 'SAR-015'}</Text>
                  {patientsAhead > 0 ? ` • ${patientsAhead} ahead (~${patientsAhead * 8} min)` : ' • Your Turn Next!'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.activeTokenActions}>
            <TouchableOpacity
              style={styles.passActionBtn}
              onPress={() => setViewPassApt(activeUserAppointment)}
              activeOpacity={0.8}
            >
              <Icon name="receipt" size={14} color={colors.primary} />
              <Text style={styles.passActionBtnText}>View Token Pass</Text>
            </TouchableOpacity>

            {activeUserAppointment.consultationMode === 'ONLINE_VIDEO' ? (
              <TouchableOpacity
                style={[styles.passActionBtn, styles.passActionBtnPrimary]}
                onPress={() => openVideoCall(activeUserAppointment)}
                activeOpacity={0.8}
              >
                <Icon name="video" size={14} color={colors.white} />
                <Text style={[styles.passActionBtnText, { color: colors.white }]}>Join Video Call</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.passActionBtn, styles.passActionBtnSecondary]}
                onPress={() => setActiveTab('appointments')}
                activeOpacity={0.8}
              >
                <Icon name="token" size={14} color={colors.secondaryDark} />
                <Text style={[styles.passActionBtnText, { color: colors.secondaryDark }]}>Live Queue Tracker</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* 3. Primary Consultation Action Cards (Simplified 2-Card Layout) */}
      <View style={styles.actionGrid}>
        {/* In-Clinic Visit */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openBookingModal({ consultationMode: 'IN_CLINIC' })}
          style={[styles.actionCard, styles.inClinicCard]}
        >
          <View style={[styles.actionIconBadge, { backgroundColor: colors.primary }]}>
            <Icon name="hospital" size={22} color={colors.white} />
          </View>
          <View style={styles.actionCardContent}>
            <Text style={styles.actionTitle}>Book Hospital Visit</Text>
            <Text style={styles.actionDesc}>Get OPD Token for Doctor Chamber</Text>
          </View>
          <View style={styles.actionButtonPill}>
            <Text style={styles.actionButtonText}>Get Token</Text>
            <Icon name="arrow-right" size={12} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Video Consult */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openBookingModal({ consultationMode: 'ONLINE_VIDEO' })}
          style={[styles.actionCard, styles.videoCard]}
        >
          <View style={[styles.actionIconBadge, { backgroundColor: colors.secondary }]}>
            <Icon name="video" size={22} color={colors.white} />
          </View>
          <View style={styles.actionCardContent}>
            <Text style={styles.actionTitle}>Video Consultation</Text>
            <Text style={styles.actionDesc}>Consult Specialists Online from Home</Text>
          </View>
          <View style={[styles.actionButtonPill, { backgroundColor: colors.secondaryLight }]}>
            <Text style={[styles.actionButtonText, { color: colors.secondaryDark }]}>Consult Online</Text>
            <Icon name="arrow-right" size={12} color={colors.secondaryDark} />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Live OPD Queue Status */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('appointments')}
        style={styles.liveQueueCard}
      >
        <View style={styles.liveQueueLeft}>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
          </View>
          <View>
            <Text style={styles.liveQueueTitle}>
              {activeClinic ? activeClinic.shortName : 'Sarangpur'} OPD Chamber
            </Text>
            <Text style={styles.liveQueueSub}>
              Now Serving Token: <Text style={styles.liveQueueHighlight}>#{currentQueue?.currentServingToken || 'SAR-015'}</Text>
            </Text>
          </View>
        </View>
        <View style={styles.liveQueueAction}>
          <Text style={styles.liveQueueLink}>Live Queue</Text>
          <Icon name="chevron-right" size={14} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* 4. Specialties Filter */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Specialist Doctors</Text>
        <Text style={styles.sectionSubtitle}>
          {filteredDoctors.length} specialist{filteredDoctors.length > 1 ? 's' : ''} available
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtiesScroll}
      >
        {SPECIALTIES.map((spec) => {
          const isSelected = selectedSpecialty === spec.id;
          const iconName = getSpecialtyIcon(spec.id);
          return (
            <TouchableOpacity
              key={spec.id}
              activeOpacity={0.7}
              onPress={() => setSelectedSpecialty(spec.id)}
              style={[
                styles.specialtyChip,
                isSelected && styles.specialtyChipSelected,
              ]}
            >
              <Icon
                name={iconName}
                size={14}
                color={isSelected ? colors.white : colors.textSecondary}
              />
              <Text
                style={[
                  styles.specialtyName,
                  isSelected && styles.specialtyNameSelected,
                ]}
              >
                {spec.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5. Doctor List Cards */}
      {filteredDoctors.map((doc) => {
        const isFemale = doc.id === 'doc-anjali';
        return (
          <CompactCard key={doc.id} style={styles.doctorCard}>
            <View style={styles.doctorCardRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setProfileModalDoctor(doc)}
              >
                <DoctorAvatar
                  gender={isFemale ? 'female' : 'male'}
                  size={54}
                  isHeadSurgeon={!!doc.isHeadSurgeon}
                />
              </TouchableOpacity>
              <View style={styles.doctorCardInfo}>
                <View style={styles.doctorNameRow}>
                  <Text style={styles.doctorName}>{doc.name}</Text>
                  {doc.isHeadSurgeon && (
                    <View style={styles.chiefBadge}>
                      <Text style={styles.chiefBadgeText}>Chief</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.doctorSpecialty}>{doc.specialization}</Text>
                <Text style={styles.doctorQual}>{doc.qualification}</Text>
                <View style={styles.doctorMetaRow}>
                  <View style={styles.ratingBadge}>
                    <Icon name="star" size={11} color="#D97706" />
                    <Text style={styles.ratingText}>{doc.rating}</Text>
                  </View>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.doctorExp}>{doc.experienceYears}+ Yrs Exp</Text>
                  <Text style={styles.metaDot}>•</Text>
                  <Text style={styles.doctorFee}>₹{doc.consultationFeeClinic} OPD</Text>
                </View>
              </View>
            </View>

            <View style={styles.doctorActionRow}>
              <Button
                title="Book Visit"
                onPress={() =>
                  openBookingModal({
                    doctorId: doc.id,
                    consultationMode: 'IN_CLINIC',
                  })
                }
                variant="primary"
                size="sm"
                icon="token"
                style={{ flex: 1 }}
              />
              <Button
                title="Video Call"
                onPress={() =>
                  openBookingModal({
                    doctorId: doc.id,
                    consultationMode: 'ONLINE_VIDEO',
                  })
                }
                variant="secondary"
                size="sm"
                icon="video"
                style={{ flex: 1 }}
              />
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setProfileModalDoctor(doc)}
                style={styles.doctorInfoBtn}
              >
                <Icon name="info" size={16} color={colors.primary} />
              </TouchableOpacity>
            </View>
          </CompactCard>
        );
      })}

      {/* 6. Hospital Branches Shortcut */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('clinics')}
        style={styles.branchesSummaryCard}
      >
        <View style={styles.branchesSummaryLeft}>
          <View style={styles.branchIconWrap}>
            <Icon name="hospital" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.branchesTitle}>4 Hospital Centers</Text>
            <Text style={styles.branchesSubtitle}>
              Sarangpur • Shujalpur • Rajgarh • Biaora
            </Text>
          </View>
        </View>
        <Icon name="chevron-right" size={15} color={colors.textMuted} />
      </TouchableOpacity>

      {/* 7. Emergency Helpline Banner */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleEmergencyCall}
        style={styles.emergencyCard}
      >
        <View style={styles.emergencyIconWrap}>
          <Icon name="phone" size={18} color={colors.white} />
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyTitle}>24x7 Emergency & Trauma Care</Text>
          <Text style={styles.emergencySub}>Toll Free: 1800-7382-723 (Tap to Call)</Text>
        </View>
      </TouchableOpacity>

      {/* Doctor Credentials Details Modal */}
      {profileModalDoctor && (
        <Modal
          visible={!!profileModalDoctor}
          animationType="slide"
          transparent
          onRequestClose={() => setProfileModalDoctor(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon name="stethoscope" size={18} color={colors.primary} />
                  <Text style={styles.modalTitle}>Doctor Details</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setProfileModalDoctor(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDocTop}>
                  <DoctorAvatar
                    gender={profileModalDoctor.id === 'doc-anjali' ? 'female' : 'male'}
                    size={60}
                    isHeadSurgeon={!!profileModalDoctor.isHeadSurgeon}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.modalDocName}>{profileModalDoctor.name}</Text>
                    <Text style={styles.modalDocSpecialty}>
                      {profileModalDoctor.specialization}
                    </Text>
                    <Text style={styles.modalDocQual}>
                      {profileModalDoctor.qualification}
                    </Text>
                    <Text style={styles.modalDocReg}>
                      Registration: {profileModalDoctor.regNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>About Doctor</Text>
                  <Text style={styles.modalSectionBody}>{profileModalDoctor.bio}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>OPD Chamber Schedule</Text>
                  <View style={styles.scheduleRow}>
                    <Icon name="clock" size={14} color={colors.primary} />
                    <Text style={styles.scheduleDetailText}>
                      {profileModalDoctor.opdSchedule}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>Consultation Fees</Text>
                  <View style={styles.feeGrid}>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeItemLabel}>In-Clinic OPD Visit</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeClinic}
                      </Text>
                    </View>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeItemLabel}>Video Consultation</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeOnline}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Book Visit"
                  onPress={() => {
                    const docId = profileModalDoctor.id;
                    setProfileModalDoctor(null);
                    openBookingModal({
                      doctorId: docId,
                      consultationMode: 'IN_CLINIC',
                    });
                  }}
                  variant="primary"
                  size="md"
                  icon="token"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Video Call"
                  onPress={() => {
                    const docId = profileModalDoctor.id;
                    setProfileModalDoctor(null);
                    openBookingModal({
                      doctorId: docId,
                      consultationMode: 'ONLINE_VIDEO',
                    });
                  }}
                  variant="secondary"
                  size="md"
                  icon="video"
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          </View>
        </Modal>
      )}

      {/* 8. Digital OPD Token Pass Modal */}
      {viewPassApt && (
        <Modal
          visible={!!viewPassApt}
          animationType="slide"
          transparent
          onRequestClose={() => setViewPassApt(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon name="receipt" size={18} color={colors.primary} />
                  <Text style={styles.modalTitle}>OPD Token Pass</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setViewPassApt(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                {/* Hospital Header in Pass */}
                <View style={styles.passHospitalBox}>
                  <Text style={styles.passHospitalTitle}>SEVASADAN HOSPITAL NETWORK</Text>
                  <Text style={styles.passHospitalSub}>
                    {viewPassApt.clinicName} • Official OPD Pass
                  </Text>
                </View>

                {/* Big Token Number Display */}
                <View style={styles.passTokenDisplayBox}>
                  <Text style={styles.passTokenLabel}>ASSIGNED TOKEN NUMBER</Text>
                  <Text style={styles.passTokenBigText}>{viewPassApt.tokenNumber}</Text>
                  <Badge
                    label={viewPassApt.consultationMode === 'ONLINE_VIDEO' ? 'Online Video Call' : 'In-Clinic OPD Token'}
                    variant={viewPassApt.consultationMode === 'ONLINE_VIDEO' ? 'accent' : 'primary'}
                    size="sm"
                  />
                </View>

                {/* Pass Details Table */}
                <View style={styles.passTable}>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Patient Name</Text>
                    <Text style={styles.passTableVal}>{viewPassApt.patientName}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Consulting Doctor</Text>
                    <Text style={styles.passTableVal}>{viewPassApt.doctorName}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Date & Slot</Text>
                    <Text style={styles.passTableVal}>{viewPassApt.date} at {viewPassApt.timeSlot}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Payment Status</Text>
                    <Text style={[styles.passTableVal, { color: '#16A34A', fontWeight: 'bold' }]}>
                      PAID (₹{viewPassApt.feePaid})
                    </Text>
                  </View>
                </View>

                {/* Reporting Instructions */}
                <View style={styles.passInstructionBox}>
                  <Icon name="info" size={15} color={colors.primary} />
                  <Text style={styles.passInstructionText}>
                    {viewPassApt.consultationMode === 'ONLINE_VIDEO'
                      ? 'Please ensure good internet connection and click "Join Video Call" when notified.'
                      : 'Please arrive at the hospital reception 15 minutes before your estimated time.'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Share Pass"
                  onPress={() => {
                    Alert.alert('Pass Shared', 'OPD Token Pass details shared to SMS/WhatsApp.');
                  }}
                  variant="outline"
                  size="md"
                  icon="share"
                  style={{ flex: 1 }}
                />
                {viewPassApt.consultationMode === 'ONLINE_VIDEO' ? (
                  <Button
                    title="Join Video Call"
                    onPress={() => {
                      const apt = viewPassApt;
                      setViewPassApt(null);
                      openVideoCall(apt);
                    }}
                    variant="accent"
                    size="md"
                    icon="video"
                    style={{ flex: 1.2 }}
                  />
                ) : (
                  <Button
                    title="Done"
                    onPress={() => setViewPassApt(null)}
                    variant="primary"
                    size="md"
                    icon="check"
                    style={{ flex: 1 }}
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
    paddingTop: 12,
    paddingBottom: 28,
  },
  heroBanner: {
    backgroundColor: colors.primaryLight,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  heroTextWrap: {
    gap: 2,
  },
  heroTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
  },
  onlineBadgeText: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: '#15803D',
  },
  heroGreeting: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  heroSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 16,
    marginTop: 2,
  },
  activeTokenCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    borderColor: colors.primary,
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  activeTokenHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  activeTokenHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulsingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulsingDotInner: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#16A34A',
  },
  activeTokenHeaderTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  activeTokenBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },
  tokenNumberBox: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  tokenNumberLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tokenNumberValue: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginTop: 1,
  },
  activeTokenDetails: {
    flex: 1,
  },
  activeTokenDoctor: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  activeTokenClinic: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  queueStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  queueStatusText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  activeTokenActions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  passActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 7,
    borderRadius: 6,
  },
  passActionBtnPrimary: {
    backgroundColor: colors.accent,
  },
  passActionBtnSecondary: {
    backgroundColor: colors.secondaryLight,
  },
  passActionBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'space-between',
    minHeight: 125,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  inClinicCard: {
    borderColor: '#BFDBFE',
  },
  videoCard: {
    borderColor: '#99F6E4',
  },
  actionIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionCardContent: {
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: typography.sizes.sm + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionButtonPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  actionButtonText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  liveQueueCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 14,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 3,
    elevation: 1,
  },
  liveQueueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  liveIndicator: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  liveQueueTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  liveQueueSub: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    marginTop: 1,
  },
  liveQueueHighlight: {
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  liveQueueAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  liveQueueLink: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  specialtiesScroll: {
    gap: 8,
    marginBottom: 12,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  specialtyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialtyName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  specialtyNameSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  doctorCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  doctorCardRow: {
    flexDirection: 'row',
    gap: 12,
  },
  doctorCardInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  doctorName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  chiefBadge: {
    backgroundColor: colors.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  chiefBadgeText: {
    fontSize: typography.sizes.xxs - 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  doctorSpecialty: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  doctorQual: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  doctorMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.warningLight,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  metaDot: {
    fontSize: 10,
    color: colors.textLight,
  },
  doctorExp: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  doctorFee: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  doctorActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  doctorInfoBtn: {
    width: 34,
    height: 34,
    borderRadius: 6,
    backgroundColor: colors.surfaceSecondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchesSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 4,
    marginBottom: 10,
  },
  branchesSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  branchIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchesTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  branchesSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    gap: 12,
  },
  emergencyIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  emergencySub: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
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
    maxHeight: '85%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalDocTop: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    padding: 12,
    borderRadius: spacing.borderRadiusMd,
    marginBottom: 14,
  },
  modalDocName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalDocSpecialty: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  modalDocQual: {
    fontSize: typography.sizes.xxs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 2,
  },
  modalDocReg: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSectionBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 8,
  },
  scheduleDetailText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  feeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  feeItem: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: 8,
  },
  feeItemLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  feeItemValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 2,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  passHospitalBox: {
    backgroundColor: colors.primaryLight,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  passHospitalTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  passHospitalSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  passTokenDisplayBox: {
    backgroundColor: colors.surfaceSecondary,
    padding: 14,
    borderRadius: spacing.borderRadiusMd,
    alignItems: 'center',
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  passTokenLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  passTokenBigText: {
    fontSize: 32,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginVertical: 4,
  },
  passTable: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    marginBottom: 14,
  },
  passTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  passTableKey: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  passTableVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  passInstructionBox: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  passInstructionText: {
    flex: 1,
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    lineHeight: 15,
  },
});

