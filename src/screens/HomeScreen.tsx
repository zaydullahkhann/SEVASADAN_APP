import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Linking,
  Alert,
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Live Queue Banner Alert */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => setActiveTab('appointments')}
        style={styles.liveQueueBar}
      >
        <View style={styles.queueLeft}>
          <View style={styles.pulseDot} />
          <Text style={styles.queueClinicText}>
            {activeClinic ? activeClinic.shortName : 'Sarangpur'} OPD Live Queue:
          </Text>
          <Text style={styles.queueServingToken}>
            Serving {currentQueue?.currentServingToken || 'SAR-015'}
          </Text>
        </View>
        <View style={styles.queueRight}>
          <Text style={styles.queueTrackBtn}>Track Queue ›</Text>
        </View>
      </TouchableOpacity>

      {/* Hero Doctor Card: Dr. Ankur Deshwali */}
      <CompactCard
        style={styles.heroCard}
        borderAccent={colors.primary}
      >
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
              <Badge label="3× MPPSC Selected" variant="success" size="sm" />
            </View>
            <Text style={styles.heroName}>Dr. Ankur Deshwali</Text>
            <Text style={styles.heroSpecialty}>
              MBBS, MS (General Surgery), MCh (Pediatric Surgery)
            </Text>
            <Text style={styles.heroSub}>
              Class-I Specialist • Newborn, Laparoscopic & Pediatric Care
            </Text>
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>14+ Yrs</Text>
            <Text style={styles.statLabel}>Experience</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>4.98 ★</Text>
            <Text style={styles.statLabel}>680+ Reviews</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.heroStat}>
            <Text style={styles.statVal}>4 Branches</Text>
            <Text style={styles.statLabel}>MP Network</Text>
          </View>
        </View>

        <View style={styles.heroActionRow}>
          <Button
            title="Book Token Pass (₹400)"
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
            title="Video OPD (₹500)"
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

      {/* Two Big Action Cards (Journey 1 vs Journey 2) */}
      <View style={styles.actionCardsGrid}>
        {/* Card 1: In-Clinic Physical OPD */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openBookingModal({ consultationMode: 'IN_CLINIC' })}
          style={[styles.bigActionCard, { borderColor: '#BAE6FD', backgroundColor: '#F0F9FF' }]}
        >
          <View style={styles.bigActionTop}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.primary }]}>
              <Icon name="hospital" size={18} color={colors.white} />
            </View>
            <Badge label="Token Pass" variant="primary" size="sm" />
          </View>
          <Text style={styles.actionTitle}>In-Clinic Visit</Text>
          <Text style={styles.actionDesc}>
            Walk-in / Advance physical token at 4 branches
          </Text>
          <View style={styles.actionBottomRow}>
            <Text style={styles.actionLinkText}>Book OPD Slot ›</Text>
            <Text style={styles.actionFeeText}>From ₹350</Text>
          </View>
        </TouchableOpacity>

        {/* Card 2: Virtual Video Consultation */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => openBookingModal({ consultationMode: 'ONLINE_VIDEO' })}
          style={[styles.bigActionCard, { borderColor: '#BBF7D0', backgroundColor: '#F0FDF4' }]}
        >
          <View style={styles.bigActionTop}>
            <View style={[styles.actionIconBox, { backgroundColor: colors.secondary }]}>
              <Icon name="video" size={18} color={colors.white} />
            </View>
            <Badge label="Instant Tele-OPD" variant="success" size="sm" />
          </View>
          <Text style={styles.actionTitle}>Video Tele-OPD</Text>
          <Text style={styles.actionDesc}>
            Private HD video consultation from home
          </Text>
          <View style={styles.actionBottomRow}>
            <Text style={[styles.actionLinkText, { color: colors.secondaryDark }]}>
              Start Video ›
            </Text>
            <Text style={styles.actionFeeText}>From ₹450</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Department / Specialty Filter */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Medical Specializations</Text>
        <Text style={styles.sectionSub}>Tap to filter consulting doctors</Text>
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

      {/* Available Specialists List */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Specialist Panel ({filteredDoctors.length})
        </Text>
        <Text style={styles.sectionSub}>Verified Medical Specialists</Text>
      </View>

      {filteredDoctors.map((doc) => {
        return (
          <CompactCard key={doc.id} style={styles.docListCard}>
            <View style={styles.docRow}>
              <View style={styles.docAvatar}>
                <Icon
                  name={doc.isHeadSurgeon ? 'baby' : 'stethoscope'}
                  size={18}
                  color={colors.primary}
                />
              </View>
              <View style={styles.docDetails}>
                <View style={styles.docTitleRow}>
                  <Text style={styles.docNameText}>{doc.name}</Text>
                  {doc.isHeadSurgeon && (
                    <Badge label="HOD" variant="primary" size="sm" />
                  )}
                </View>
                <Text style={styles.docSubSpecialty}>{doc.specialization}</Text>
                <Text style={styles.docSubQual}>{doc.qualification}</Text>
                <View style={styles.docMeta}>
                  <Text style={styles.docMetaText}>
                    ⭐ {doc.rating} • {doc.experienceYears}y exp • OPD: Daily
                  </Text>
                </View>
              </View>
              <View style={styles.docActionRight}>
                <Text style={styles.docFee}>₹{doc.consultationFeeClinic}</Text>
                <Text style={styles.docFeeLabel}>OPD Fee</Text>
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

      {/* 4 Clinic Branches Section */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>SEVASADAN 4 Clinic Network</Text>
          <TouchableOpacity onPress={() => setActiveTab('clinics')}>
            <Text style={styles.viewAllText}>View All 4 Branches ›</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.sectionSub}>
          Equipped OPDs & Tele-Medicine Centers in Rajgarh District, MP
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
                <Badge label={`Prefix ${clinic.tokenPrefix}`} variant="primary" size="sm" />
              </View>

              <Text style={styles.clinicAddressText} numberOfLines={2}>
                {clinic.address}
              </Text>

              <View style={styles.clinicQueueSnippet}>
                <Text style={styles.servingSnippetText}>
                  Serving Token: <Text style={styles.servingSnippetBold}>{queue?.currentServingToken}</Text>
                </Text>
                <TouchableOpacity
                  onPress={() => advanceQueue(clinic.id)}
                  style={styles.advanceQueueLink}
                >
                  <Text style={styles.advanceQueueText}>Next Token ›</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.clinicCardActions}>
                <Button
                  title="Call Clinic"
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
                  style={{ flex: 1.2 }}
                />
              </View>
            </CompactCard>
          );
        })}
      </View>

      {/* Bottom Emergency Help Banner */}
      <View style={styles.emergencyBanner}>
        <View style={styles.emergencyIconBox}>
          <Icon name="phone" size={16} color={colors.white} />
        </View>
        <View style={styles.emergencyTextWrap}>
          <Text style={styles.emergencyHeading}>
            Emergency Trauma & Neonatal Helpline
          </Text>
          <Text style={styles.emergencyPhoneText}>
            Toll Free: 1800-7382-723 | 24x7 Ambulance & Surgery
          </Text>
        </View>
      </View>
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
  liveQueueBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  queueLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.warning,
  },
  queueClinicText: {
    fontSize: typography.sizes.xxs + 0.5,
    color: '#92400E',
    fontWeight: typography.weights.bold,
  },
  queueServingToken: {
    fontSize: typography.sizes.xxs + 0.5,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  queueRight: {
    alignItems: 'flex-end',
  },
  queueTrackBtn: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  heroCard: {
    backgroundColor: colors.white,
    borderColor: '#BFDBFE',
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  heroAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  heroAvatarEmoji: {
    fontSize: 26,
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 16,
    height: 16,
    borderRadius: 8,
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
    gap: 4,
    marginBottom: 2,
  },
  heroName: {
    fontSize: typography.sizes.sm + 1.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  heroSpecialty: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  heroSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  heroStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 5,
    marginVertical: 8,
  },
  heroStat: {
    alignItems: 'center',
  },
  statVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  statLabel: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  statDivider: {
    width: 1,
    height: 18,
    backgroundColor: colors.borderDark,
  },
  heroActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionCardsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  bigActionCard: {
    flex: 1,
    borderRadius: spacing.borderRadiusMd,
    borderWidth: 1.5,
    padding: 10,
    justifyContent: 'space-between',
  },
  bigActionTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  actionDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 12,
  },
  actionBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  actionLinkText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  actionFeeText: {
    fontSize: 9,
    fontWeight: typography.weights.semiBold,
    color: colors.textSecondary,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.sizes.xxs,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  sectionSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  specialtiesScroll: {
    gap: 6,
    paddingVertical: 4,
  },
  specialtyChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingVertical: 4,
    paddingHorizontal: 10,
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
    marginBottom: 6,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  docAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  docDetails: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  docNameText: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docSubSpecialty: {
    fontSize: typography.sizes.xxs,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
  docSubQual: {
    fontSize: 9,
    color: colors.textMuted,
  },
  docMeta: {
    marginTop: 2,
  },
  docMetaText: {
    fontSize: 9,
    color: colors.textSecondary,
  },
  docActionRight: {
    alignItems: 'flex-end',
    marginLeft: 6,
  },
  docFee: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  docFeeLabel: {
    fontSize: 8,
    color: colors.textMuted,
  },
  miniBookBtn: {
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  clinicsGrid: {
    gap: 8,
  },
  clinicSummaryCard: {
    marginBottom: 4,
  },
  clinicHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  clinicCardTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  clinicCardCity: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  clinicAddressText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginVertical: 4,
    lineHeight: 13,
  },
  clinicQueueSnippet: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    marginBottom: 6,
  },
  servingSnippetText: {
    fontSize: 9,
    color: colors.textMuted,
  },
  servingSnippetBold: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  advanceQueueLink: {
    padding: 2,
  },
  advanceQueueText: {
    fontSize: 8.5,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  clinicCardActions: {
    flexDirection: 'row',
    gap: 6,
  },
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryDark,
    borderRadius: spacing.borderRadiusMd,
    padding: 10,
    marginTop: 12,
    gap: 10,
  },
  emergencyIconBox: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.danger,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextWrap: {
    flex: 1,
  },
  emergencyHeading: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  emergencyPhoneText: {
    fontSize: typography.sizes.xxs,
    color: colors.accent,
    marginTop: 1,
  },
});
