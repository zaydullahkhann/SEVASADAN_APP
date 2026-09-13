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

export const HomeScreen: React.FC = () => {
  const {
    selectedBranchId,
    openBookingModal,
    queueStatuses,
    setActiveTab,
  } = useApp();

  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [profileModalDoctor, setProfileModalDoctor] = useState<(typeof DOCTORS)[0] | null>(null);

  // Filter clinics
  const activeClinic =
    selectedBranchId !== 'all'
      ? CLINICS.find((c) => c.id === selectedBranchId)
      : null;

  const currentQueue = activeClinic
    ? queueStatuses[activeClinic.id]
    : queueStatuses.sarangpur;

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

  const leadDoctor = DOCTORS.find((d) => d.id === 'doc-ankur') || DOCTORS[0];

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
      {/* 1. Hospital Accreditation & Trust Bar */}
      <View style={styles.trustBanner}>
        <View style={styles.trustItem}>
          <Icon name="shield-check" size={13} color={colors.primary} />
          <Text style={styles.trustText}>NABH Standard OPD</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Icon name="check-circle" size={13} color={colors.secondary} />
          <Text style={styles.trustText}>MCI Certified Specialists</Text>
        </View>
        <View style={styles.trustDivider} />
        <View style={styles.trustItem}>
          <Icon name="clock" size={13} color={colors.primary} />
          <Text style={styles.trustText}>24x7 Trauma Care</Text>
        </View>
      </View>

      {/* 2. Primary Consultation Mode Action Cards */}
      <View style={styles.heroActionGrid}>
        {/* Card 1: Hospital Visit */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => openBookingModal({ consultationMode: 'IN_CLINIC' })}
          style={[styles.bigActionCard, styles.inClinicCard]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.actionIconCircle, { backgroundColor: colors.primary }]}>
              <Icon name="hospital" size={20} color={colors.white} />
            </View>
            <View style={styles.modeBadge}>
              <Text style={styles.modeBadgeText}>OPD Token</Text>
            </View>
          </View>
          <View style={styles.cardBodyWrap}>
            <Text style={styles.actionCardTitle}>Visit Hospital</Text>
            <Text style={styles.actionCardDesc}>
              Instant token for doctor chamber checkup & diagnostics
            </Text>
          </View>
          <View style={styles.actionPill}>
            <Text style={styles.actionPillText}>Book Token</Text>
            <Icon name="chevron-right" size={12} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Card 2: Video Call */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => openBookingModal({ consultationMode: 'ONLINE_VIDEO' })}
          style={[styles.bigActionCard, styles.teleCard]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.actionIconCircle, { backgroundColor: '#0D9488' }]}>
              <Icon name="video" size={20} color={colors.white} />
            </View>
            <View style={[styles.modeBadge, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.modeBadgeText, { color: '#065F46' }]}>Live Call</Text>
            </View>
          </View>
          <View style={styles.cardBodyWrap}>
            <Text style={styles.actionCardTitle}>Doctor Video Call</Text>
            <Text style={styles.actionCardDesc}>
              HD Tele-consultation & Digital Rx with specialists
            </Text>
          </View>
          <View style={[styles.actionPill, { backgroundColor: '#DCFCE7' }]}>
            <Text style={[styles.actionPillText, { color: '#065F46' }]}>Start Call</Text>
            <Icon name="chevron-right" size={12} color="#065F46" />
          </View>
        </TouchableOpacity>
      </View>

      {/* 3. Live OPD Chamber & Queue Status Banner */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={() => setActiveTab('appointments')}
        style={styles.queueBanner}
      >
        <View style={styles.queueBannerLeft}>
          <View style={styles.pulseContainer}>
            <View style={styles.pulseDot} />
          </View>
          <View>
            <View style={styles.queueHeaderRow}>
              <Text style={styles.queueBranchName}>
                {activeClinic ? activeClinic.shortName : 'Sarangpur'} OPD Chamber
              </Text>
              <View style={styles.liveTag}>
                <Text style={styles.liveTagText}>LIVE</Text>
              </View>
            </View>
            <Text style={styles.queueBannerNumber}>
              Now Serving Token: <Text style={styles.tokenHighlight}>#{currentQueue?.currentServingToken || 'SAR-015'}</Text>
            </Text>
          </View>
        </View>
        <View style={styles.queueTrackBtn}>
          <Text style={styles.queueTrackText}>Track Queue</Text>
          <Icon name="chevron-right" size={13} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* 4. Chief Specialist Doctor Highlight (Dr. Ankur Deshwali) */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Icon name="stethoscope" size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>Chief Surgeon & Specialist</Text>
        </View>
        <View style={styles.verifiedTag}>
          <Icon name="shield-check" size={11} color={colors.secondary} />
          <Text style={styles.verifiedTagText}>Class-I Gazetted</Text>
        </View>
      </View>

      <CompactCard style={styles.doctorHighlightCard}>
        <View style={styles.docHighlightTop}>
          <DoctorAvatar gender="male" size={62} isHeadSurgeon={true} />
          <View style={styles.docHighlightInfo}>
            <View style={styles.docNameBadgeRow}>
              <Text style={styles.docHighlightName}>Dr. Ankur Deshwali</Text>
            </View>
            <Text style={styles.docHighlightQual}>
              MBBS • MS (Surgery) • MCh (Pediatric Surgery)
            </Text>
            <Text style={styles.docHighlightSpec}>
              Chief Neonatal & Pediatric Laparoscopic Surgeon
            </Text>
            <View style={styles.docMetaRow}>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={11} color="#D97706" />
                <Text style={styles.ratingText}>4.98 (680+)</Text>
              </View>
              <Text style={styles.dotDivider}>•</Text>
              <Text style={styles.docExpText}>14+ Yrs Exp</Text>
              <Text style={styles.dotDivider}>•</Text>
              <Text style={styles.docRegText}>MP-52140</Text>
            </View>
          </View>
        </View>

        <View style={styles.docSchedulePill}>
          <Icon name="clock" size={12} color={colors.primary} />
          <Text style={styles.scheduleText}>
            Daily OPD: 09:00 AM - 02:00 PM (Chamber 101)
          </Text>
        </View>

        <View style={styles.docActionRow}>
          <Button
            title="Book Visit (₹400)"
            onPress={() =>
              openBookingModal({
                consultationMode: 'IN_CLINIC',
                doctorId: 'doc-ankur',
              })
            }
            variant="primary"
            size="sm"
            icon="token"
            style={{ flex: 1 }}
          />
          <Button
            title="Video Call (₹500)"
            onPress={() =>
              openBookingModal({
                consultationMode: 'ONLINE_VIDEO',
                doctorId: 'doc-ankur',
              })
            }
            variant="secondary"
            size="sm"
            icon="video"
            style={{ flex: 1 }}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setProfileModalDoctor(leadDoctor)}
            style={styles.infoIconBtn}
          >
            <Icon name="info" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </CompactCard>

      {/* 5. Specialist Doctors List */}
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleRow}>
          <Icon name="user" size={16} color={colors.primary} />
          <Text style={styles.sectionTitle}>Consult Specialist Doctors</Text>
        </View>
        <Text style={styles.sectionSub}>All 4 Hospital Centers</Text>
      </View>

      {/* Specialty Filter Chips with Vector Icons */}
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
                size={13}
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

      {filteredDoctors.map((doc) => {
        const isFemale = doc.id === 'doc-anjali';
        return (
          <CompactCard key={doc.id} style={styles.docCard}>
            <View style={styles.docCardRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setProfileModalDoctor(doc)}
              >
                <DoctorAvatar
                  gender={isFemale ? 'female' : 'male'}
                  size={50}
                  isHeadSurgeon={!!doc.isHeadSurgeon}
                />
              </TouchableOpacity>
              <View style={styles.docCardInfo}>
                <Text style={styles.docCardName}>{doc.name}</Text>
                <Text style={styles.docCardQual}>{doc.qualification}</Text>
                <Text style={styles.docCardSpec}>{doc.specialization}</Text>
                <View style={styles.docCardBottomRow}>
                  <Text style={styles.docCardFee}>
                    OPD: ₹{doc.consultationFeeClinic}
                  </Text>
                  <Text style={styles.dotDivider}>•</Text>
                  <View style={styles.ratingBadgeSmall}>
                    <Icon name="star" size={10} color="#D97706" />
                    <Text style={styles.ratingTextSmall}>{doc.rating}</Text>
                  </View>
                  <Text style={styles.dotDivider}>•</Text>
                  <Text style={styles.docCardReg}>Reg: {doc.regNumber.split('/')[0]}</Text>
                </View>
              </View>
              <Button
                title="Book"
                onPress={() =>
                  openBookingModal({
                    doctorId: doc.id,
                    consultationMode: 'IN_CLINIC',
                  })
                }
                variant="primary"
                size="sm"
                icon="token"
                style={styles.bookBtnSmall}
              />
            </View>
          </CompactCard>
        );
      })}

      {/* 6. Hospital Centers Summary Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('clinics')}
        style={styles.branchSummaryCard}
      >
        <View style={styles.branchSummaryLeft}>
          <View style={styles.branchIconBadge}>
            <Icon name="hospital" size={18} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.branchSummaryTitle}>SEVASADAN 4 Hospital Centers</Text>
            <Text style={styles.branchSummarySub}>
              Sarangpur • Shujalpur • Rajgarh • Biaora
            </Text>
          </View>
        </View>
        <View style={styles.branchSummaryAction}>
          <Text style={styles.branchSummaryLink}>View Centers</Text>
          <Icon name="chevron-right" size={13} color={colors.primary} />
        </View>
      </TouchableOpacity>

      {/* 7. Emergency 24x7 Help Banner */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleEmergencyCall}
        style={styles.emergencyCard}
      >
        <View style={styles.emergencyIconCircle}>
          <Icon name="phone" size={16} color={colors.white} />
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyTitle}>24x7 Emergency Trauma & Ambulance</Text>
          <Text style={styles.emergencySub}>Toll Free: 1800-7382-723 (Tap to Call)</Text>
        </View>
        <Icon name="chevron-right" size={14} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      {/* Doctor Profile Modal for Detailed Credentials */}
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
                  <Text style={styles.modalTitle}>Doctor Credentials</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setProfileModalDoctor(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDocTop}>
                  <DoctorAvatar
                    gender={profileModalDoctor.id === 'doc-anjali' ? 'female' : 'male'}
                    size={64}
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
                      MCI / State Reg: {profileModalDoctor.regNumber}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>Clinical Profile</Text>
                  <Text style={styles.modalSectionBody}>{profileModalDoctor.bio}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>OPD Schedule & Chambers</Text>
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
                      <Text style={styles.feeItemLabel}>In-Clinic OPD Token</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeClinic}
                      </Text>
                    </View>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeItemLabel}>Tele-Video Consultation</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeOnline}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Book Hospital Visit"
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
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F9FC',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 8,
    paddingBottom: 28,
  },
  trustBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 10,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  trustDivider: {
    width: 1,
    height: 12,
    backgroundColor: '#E2E8F0',
  },
  heroActionGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  bigActionCard: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    shadowColor: '#0F4C81',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  inClinicCard: {
    borderColor: '#BAE6FD',
    backgroundColor: '#F0F9FF',
  },
  teleCard: {
    borderColor: '#A7F3D0',
    backgroundColor: '#F0FDF4',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  actionIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeBadge: {
    backgroundColor: '#E0F2FE',
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 6,
  },
  modeBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  cardBodyWrap: {
    marginVertical: 4,
  },
  actionCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionCardDesc: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 15,
  },
  actionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#E0F2FE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  actionPillText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  queueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  queueBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8,
  },
  pulseContainer: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.secondary,
  },
  queueHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  queueBranchName: {
    fontSize: 11,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  liveTag: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
  },
  liveTagText: {
    fontSize: 8,
    fontWeight: typography.weights.bold,
    color: '#065F46',
  },
  queueBannerNumber: {
    fontSize: typography.sizes.sm,
    color: colors.text,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  tokenHighlight: {
    color: colors.primary,
    fontWeight: typography.weights.extraBold,
  },
  queueTrackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#F1F5F9',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  queueTrackText: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    marginTop: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: 11,
    color: colors.textMuted,
  },
  verifiedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  verifiedTagText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: '#065F46',
  },
  doctorHighlightCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    padding: 12,
    marginBottom: 12,
  },
  docHighlightTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  docHighlightInfo: {
    flex: 1,
  },
  docNameBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docHighlightName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docHighlightQual: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  docHighlightSpec: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 4,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  dotDivider: {
    fontSize: 10,
    color: colors.textLight,
  },
  docExpText: {
    fontSize: 10,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  docRegText: {
    fontSize: 10,
    color: colors.textMuted,
  },
  docSchedulePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginTop: 10,
    marginBottom: 10,
  },
  scheduleText: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  docActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  specialtiesScroll: {
    gap: 8,
    marginBottom: 10,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.white,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  specialtyChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  specialtyName: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  specialtyNameSelected: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  docCard: {
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginBottom: 8,
  },
  docCardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  docCardInfo: {
    flex: 1,
  },
  docCardName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docCardQual: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  docCardSpec: {
    fontSize: 10.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  docCardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  docCardFee: {
    fontSize: 10.5,
    fontWeight: typography.weights.bold,
    color: '#065F46',
  },
  ratingBadgeSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  ratingTextSmall: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  docCardReg: {
    fontSize: 9.5,
    color: colors.textLight,
  },
  bookBtnSmall: {
    minWidth: 70,
  },
  branchSummaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  branchSummaryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  branchIconBadge: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  branchSummaryTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  branchSummarySub: {
    fontSize: 10.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  branchSummaryAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  branchSummaryLink: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B91C1C',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  emergencyIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  emergencySub: {
    fontSize: 10.5,
    color: '#FEE2E2',
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
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
    borderBottomColor: '#E2E8F0',
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
    backgroundColor: '#F8FAFC',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  modalDocName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalDocSpecialty: {
    fontSize: 11.5,
    color: colors.textSecondary,
    marginTop: 1,
  },
  modalDocQual: {
    fontSize: 11,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginTop: 2,
  },
  modalDocReg: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalSection: {
    marginBottom: 14,
  },
  modalSectionHeading: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalSectionBody: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scheduleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 6,
  },
  scheduleDetailText: {
    fontSize: 11.5,
    color: colors.primary,
    fontWeight: typography.weights.medium,
  },
  feeGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  feeItem: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  feeItemLabel: {
    fontSize: 10.5,
    color: colors.textMuted,
  },
  feeItemValue: {
    fontSize: 14,
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
});
