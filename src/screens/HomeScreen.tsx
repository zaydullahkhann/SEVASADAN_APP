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
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const HomeScreen: React.FC = () => {
  const {
    selectedBranchId,
    openBookingModal,
    queueStatuses,
    setActiveTab,
    advanceQueue,
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

  const handleCallClinic = (phone: string, name: string) => {
    Alert.alert(`Call ${name}`, `Dial ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        onPress: () => Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {}),
      },
    ]);
  };

  const leadDoctor = DOCTORS.find((d) => d.id === 'doc-ankur') || DOCTORS[0];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Live Queue Status Strip */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('appointments')}
        style={styles.liveQueueBar}
      >
        <View style={styles.queueLeft}>
          <View style={styles.pulseDot} />
          <Text style={styles.queueClinicText}>
            {activeClinic ? activeClinic.shortName : 'Sarangpur'} OPD Live:
          </Text>
          <Text style={styles.queueServingToken}>
            Now Serving {currentQueue?.currentServingToken || 'SAR-015'}
          </Text>
        </View>
        <View style={styles.queueRight}>
          <Text style={styles.queueTrackBtn}>Track Queue ›</Text>
        </View>
      </TouchableOpacity>

      {/* 2. Simplified Hero Doctor Card (Dr. Ankur Deshwali) */}
      <CompactCard style={styles.heroCard}>
        <View style={styles.heroTop}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarEmoji}>👨‍⚕️</Text>
            <View style={styles.verifiedCheck}>
              <Icon name="check" size={9} color={colors.white} />
            </View>
          </View>
          <View style={styles.heroInfo}>
            <View style={styles.heroBadgeRow}>
              <Badge label="Lead Surgeon" variant="primary" size="sm" />
              <Badge label="14+ Yrs Exp" variant="neutral" size="sm" />
            </View>
            <Text style={styles.heroName}>Dr. Ankur Deshwali</Text>
            <Text style={styles.heroSpecialty}>
              Pediatric, Newborn & General Laparoscopic Surgeon
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setProfileModalDoctor(leadDoctor)}
              style={styles.viewBioLink}
            >
              <Text style={styles.viewBioText}>View Credentials & Bio ›</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Highlights Bar */}
        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>⭐ 4.98</Text>
            <Text style={styles.statLabel}>680+ Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>₹400</Text>
            <Text style={styles.statLabel}>In-Clinic OPD</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>₹500</Text>
            <Text style={styles.statLabel}>Video Tele-OPD</Text>
          </View>
        </View>

        {/* Primary Action Buttons */}
        <View style={styles.heroActionRow}>
          <Button
            title="Book OPD Token"
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
            title="Book Video Call"
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
        </View>
      </CompactCard>

      {/* 3. Clean Quick Action Cards */}
      <View style={styles.actionCardsGrid}>
        {/* Card 1: In-Clinic Physical OPD */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openBookingModal({ consultationMode: 'IN_CLINIC' })}
          style={[styles.bigActionCard, { borderColor: '#E2E8F0' }]}
        >
          <View style={styles.bigActionTop}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.primaryLight }]}>
              <Icon name="hospital" size={18} color={colors.primary} />
            </View>
            <Badge label="Walk-In / Slot" variant="primary" size="sm" />
          </View>
          <Text style={styles.actionTitle}>In-Clinic Visit</Text>
          <Text style={styles.actionDesc}>
            Physical token for 4 hospital branches
          </Text>
          <View style={styles.actionBottomRow}>
            <Text style={styles.actionLinkText}>Book Slot ›</Text>
            <Text style={styles.actionFeeText}>From ₹350</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2: Virtual Video Consultation */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openBookingModal({ consultationMode: 'ONLINE_VIDEO' })}
          style={[styles.bigActionCard, { borderColor: '#E2E8F0' }]}
        >
          <View style={styles.bigActionTop}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.secondaryLight }]}>
              <Icon name="video" size={18} color={colors.secondaryDark} />
            </View>
            <Badge label="Online HD" variant="success" size="sm" />
          </View>
          <Text style={styles.actionTitle}>Video Tele-OPD</Text>
          <Text style={styles.actionDesc}>
            Consult specialist doctors from home
          </Text>
          <View style={styles.actionBottomRow}>
            <Text style={[styles.actionLinkText, { color: colors.secondaryDark }]}>
              Start Video ›
            </Text>
            <Text style={styles.actionFeeText}>From ₹450</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* 4. Specialization Filter */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical Specializations</Text>
        <Text style={styles.sectionSub}>Filter consulting doctors by department</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.specialtiesScroll}
      >
        {SPECIALTIES.map((spec) => {
          const isSelected = selectedSpecialty === spec.id;
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
              <Text
                style={[
                  styles.specialtyName,
                  isSelected && styles.specialtyNameSelected,
                ]}
              >
                {spec.name}
              </Text>
              <Badge
                label={String(spec.doctorCount)}
                variant={isSelected ? 'outline' : 'neutral'}
                size="sm"
                style={styles.specBadge}
              />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* 5. Simplified Doctor Cards */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Specialist Panel ({filteredDoctors.length})
        </Text>
        <Text style={styles.sectionSub}>Verified doctors available for consultation</Text>
      </View>

      {filteredDoctors.map((doc) => {
        return (
          <CompactCard key={doc.id} style={styles.docListCard}>
            <View style={styles.docRow}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setProfileModalDoctor(doc)}
                style={styles.docAvatar}
              >
                <Icon
                  name={doc.isHeadSurgeon ? 'baby' : 'stethoscope'}
                  size={18}
                  color={colors.primary}
                />
              </TouchableOpacity>
              <View style={styles.docDetails}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docNameText}>{doc.name}</Text>
                  {doc.isHeadSurgeon && (
                    <Badge label="Lead" variant="primary" size="sm" />
                  )}
                </View>
                <Text style={styles.docSubSpecialty}>{doc.specialization}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaText}>
                    ⭐ {doc.rating} • {doc.experienceYears}y exp • OPD: Daily
                  </Text>
                </View>
              </View>
              <View style={styles.docActionRight}>
                <Text style={styles.docFee}>₹{doc.consultationFeeClinic}</Text>
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
                  style={styles.miniBookBtn}
                />
              </View>
            </View>
          </CompactCard>
        );
      })}

      {/* 6. Clinic Branches Section */}
      <View style={[styles.sectionHeader, { marginTop: 14 }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>SEVASADAN 4 Clinic Network</Text>
          <TouchableOpacity onPress={() => setActiveTab('clinics')}>
            <Text style={styles.viewAllText}>View Details ›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>
          OPD centers in Sarangpur, Shujalpur, Rajgarh & Biaora
        </Text>
      </View>

      <View style={styles.clinicsGrid}>
        {CLINICS.map((clinic) => {
          const queue = queueStatuses[clinic.id];
          return (
            <CompactCard key={clinic.id} style={styles.clinicSummaryCard}>
              <View style={styles.clinicHeaderRow}>
                <View>
                  <Text style={styles.clinicCardTitle}>{clinic.shortName} Branch</Text>
                  <Text style={styles.clinicCardCity}>{clinic.city}, MP</Text>
                </View>
                <View style={styles.servingPill}>
                  <Text style={styles.servingPillLabel}>OPD Serving: </Text>
                  <Text style={styles.servingPillVal}>{queue?.currentServingToken}</Text>
                </View>
              </View>

              <Text style={styles.clinicAddressText} numberOfLines={1}>
                {clinic.address}
              </Text>

              <View style={styles.clinicCardActions}>
                <Button
                  title="Call"
                  onPress={() => handleCallClinic(clinic.phone, clinic.name)}
                  variant="outline"
                  size="sm"
                  icon="phone"
                  style={{ flex: 1 }}
                />
                <Button
                  title="Book Token"
                  onPress={() =>
                    openBookingModal({
                      clinicId: clinic.id,
                      consultationMode: 'IN_CLINIC',
                    })
                  }
                  variant="secondary"
                  size="sm"
                  icon="token"
                  style={{ flex: 1.3 }}
                />
              </View>
            </CompactCard>
          );
        })}
      </View>

      {/* 7. Clean Emergency Help Banner */}
      <View style={styles.emergencyBanner}>
        <View style={styles.emergencyIconBox}>
          <Icon name="phone" size={16} color={colors.white} />
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyHeading}>
            Emergency & Neonatal Helpline
          </Text>
          <Text style={styles.emergencyPhoneText}>
            Toll Free: 1800-7382-723 (24x7 Ambulance & OT)
          </Text>
        </View>
      </View>

      {/* Doctor Profile Modal for In-depth Details */}
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
                <Text style={styles.modalTitle}>Doctor Profile</Text>
                <TouchableOpacity
                  onPress={() => setProfileModalDoctor(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                <View style={styles.modalDocTop}>
                  <View style={styles.modalAvatar}>
                    <Text style={{ fontSize: 32 }}>👨‍⚕️</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalDocName}>{profileModalDoctor.name}</Text>
                    <Text style={styles.modalDocSpecialty}>
                      {profileModalDoctor.specialization}
                    </Text>
                    <Text style={styles.modalDocQual}>
                      {profileModalDoctor.qualification}
                    </Text>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>Experience & Rating</Text>
                  <Text style={styles.modalSectionBody}>
                    {profileModalDoctor.experienceYears} Years of Clinical & Surgical Experience. Rated {profileModalDoctor.rating} ★ across 600+ patient consultations.
                  </Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>About & Expertise</Text>
                  <Text style={styles.modalSectionBody}>{profileModalDoctor.bio}</Text>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>Consultation Fees</Text>
                  <View style={styles.feeGrid}>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeItemLabel}>In-Clinic OPD</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeClinic}
                      </Text>
                    </View>
                    <View style={styles.feeItem}>
                      <Text style={styles.feeItemLabel}>Video Tele-OPD</Text>
                      <Text style={styles.feeItemValue}>
                        ₹{profileModalDoctor.consultationFeeOnline}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionHeading}>Available Centers</Text>
                  <Text style={styles.modalSectionBody}>
                    Sarangpur Super Specialty Clinic, Shujalpur OPD, Rajgarh, Biaora
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Book In-Clinic Token"
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
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 28,
  },
  liveQueueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.success,
  },
  queueClinicText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  queueServingToken: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  queueRight: {
    alignItems: 'flex-end',
  },
  queueTrackBtn: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.primary,
  },
  heroCard: {
    backgroundColor: colors.white,
    marginBottom: 10,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroAvatarEmoji: {
    fontSize: 28,
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 17,
    height: 17,
    borderRadius: 9,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.white,
  },
  heroInfo: {
    flex: 1,
  },
  heroBadgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 4,
  },
  heroName: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  heroSpecialty: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
    lineHeight: 16,
  },
  viewBioLink: {
    marginTop: 4,
  },
  viewBioText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    marginVertical: 10,
  },
  heroStat: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  statDivider: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  actionCardsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  bigActionCard: {
    flex: 1,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1,
    backgroundColor: colors.white,
    padding: 12,
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  bigActionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  actionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  actionLinkText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  actionFeeText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    letterSpacing: -0.2,
  },
  viewAllText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  sectionSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  specialtiesScroll: {
    gap: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 6,
  },
  specialtyChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  specialtyName: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  specialtyNameSelected: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  specBadge: {
    marginLeft: 2,
  },
  docListCard: {
    marginBottom: 8,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  docDetails: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docNameText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docSubSpecialty: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  docMeta: {
    marginTop: 2,
  },
  docMetaText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  docActionRight: {
    alignItems: 'flex-end',
    marginLeft: 8,
  },
  docFee: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  miniBookBtn: {
    marginTop: 4,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  clinicsGrid: {
    gap: 8,
  },
  clinicSummaryCard: {
    marginBottom: 6,
  },
  clinicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicCardTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  clinicCardCity: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  servingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  servingPillLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  servingPillVal: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  clinicAddressText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginVertical: 6,
  },
  clinicCardActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    marginTop: 14,
    gap: 12,
  },
  emergencyIconBox: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  emergencyPhoneText: {
    fontSize: typography.sizes.xs,
    color: colors.accentLight,
    marginTop: 2,
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
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  modalDocTop: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalDocName: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalDocSpecialty: {
    fontSize: typography.sizes.sm,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginTop: 2,
  },
  modalDocQual: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  modalSection: {
    marginTop: 14,
  },
  modalSectionHeading: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  modalSectionBody: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  feeGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  feeItem: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    padding: 10,
    borderRadius: spacing.borderRadiusSm,
  },
  feeItemLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  feeItemValue: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginTop: 2,
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
