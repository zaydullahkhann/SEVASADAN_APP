import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Linking,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { CLINICS } from '../data/clinics';
import { DOCTORS } from '../data/doctors';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const ClinicsScreen: React.FC = () => {
  const { activeRole, queueStatuses, openBookingModal } = useApp();

  const handleCall = (phone: string, branchName: string) => {
    Alert.alert(`Call ${branchName}`, `Dial ${phone}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Call Now',
        onPress: () =>
          Linking.openURL(`tel:${phone.replace(/\s+/g, '')}`).catch(() => {}),
      },
    ]);
  };

  const handleDirections = (clinic: (typeof CLINICS)[0]) => {
    const query = `${clinic.name}, ${clinic.city}, Madhya Pradesh`;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
      query
    )}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Directions', clinic.address);
    });
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerBar}>
        <View>
          <Text style={styles.headerTitle}>Hospital Clinic Network</Text>
          <Text style={styles.headerSub}>
            4 equipped OPD centers in Rajgarh District, MP
          </Text>
        </View>
        <Badge label="4 Centers" variant="primary" size="sm" />
      </View>

      {CLINICS.map((clinic) => {
        const queue = queueStatuses[clinic.id];
        const coveringDoctors = DOCTORS.filter((d) =>
          d.clinicsCovered.includes(clinic.id)
        );

        return (
          <CompactCard key={clinic.id} style={styles.clinicCard}>
            {/* Header: Name, City & Rating */}
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <Text style={styles.branchName}>{clinic.fullName}</Text>
                <Text style={styles.cityName}>{clinic.city}, Madhya Pradesh</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={12} color={colors.warning} />
                <Text style={styles.ratingText}>{clinic.rating}</Text>
              </View>
            </View>

            {/* Address & Hours */}
            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Icon name="location" size={13} color={colors.primary} />
                <Text style={styles.addressText}>{clinic.address}</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="clock" size={13} color={colors.secondaryDark} />
                <Text style={styles.metaText}>{clinic.operatingHours}</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="phone" size={13} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  Phone: {clinic.phone} • Helpline: {clinic.emergencyHelpline}
                </Text>
              </View>
            </View>

            {/* Live Queue Box */}
            <View style={styles.queueBox}>
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>NOW SERVING</Text>
                <Text style={styles.queueValue}>
                  {queue?.currentServingToken || `${clinic.tokenPrefix}-001`}
                </Text>
              </View>
              <View style={styles.queueSep} />
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>ISSUED TODAY</Text>
                <Text style={styles.queueValueSub}>
                  {queue?.totalIssuedToday || 12} Tokens
                </Text>
              </View>
              <View style={styles.queueSep} />
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>AVG WAIT</Text>
                <Text style={styles.queueValueSub}>
                  ~{queue?.estimatedWaitMinutesPerPatient || 8} min
                </Text>
              </View>
            </View>

            {/* Doctors on Panel */}
            <View style={styles.docsSection}>
              <Text style={styles.docsHeading}>Specialists on Duty:</Text>
              <View style={styles.docTagsRow}>
                {coveringDoctors.map((doc) => (
                  <View key={doc.id} style={styles.docTag}>
                    <Text style={styles.docTagText}>
                      {doc.name.split(' ')[1]} ({doc.specialization.split(' ')[0]})
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Branch Actions */}
            <View style={styles.actionsRow}>
              <Button
                title="Call"
                onPress={() => handleCall(clinic.phone, clinic.name)}
                variant="outline"
                size="sm"
                icon="phone"
                style={{ flex: 1 }}
              />
              <Button
                title="Directions"
                onPress={() => handleDirections(clinic)}
                variant="outline"
                size="sm"
                icon="location"
                style={{ flex: 1 }}
              />
              {activeRole === 'PATIENT' && (
                <Button
                  title="Book Token"
                  onPress={() =>
                    openBookingModal({
                      clinicId: clinic.id,
                      consultationMode: 'IN_CLINIC',
                    })
                  }
                  variant="primary"
                  size="sm"
                  icon="token"
                  style={{ flex: 1.2 }}
                />
              )}
            </View>
          </CompactCard>
        );
      })}
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  clinicCard: {
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 8,
  },
  branchName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  cityName: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceSecondary,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  ratingText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  metaSection: {
    gap: 6,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  addressText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 16,
  },
  metaText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    flex: 1,
  },
  queueBox: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginVertical: 8,
  },
  queueItem: {
    flex: 1,
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
  },
  queueValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginTop: 2,
  },
  queueValueSub: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text,
    marginTop: 2,
  },
  queueSep: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  docsSection: {
    marginTop: 4,
    marginBottom: 8,
  },
  docsHeading: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 4,
  },
  docTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  docTag: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  docTagText: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryDeep,
    fontWeight: typography.weights.semiBold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 6,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
});
