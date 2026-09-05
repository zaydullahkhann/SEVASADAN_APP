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
  const { queueStatuses, openBookingModal } = useApp();

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
          <Text style={styles.headerTitle}>SEVASADAN 4 Clinic Branches</Text>
          <Text style={styles.headerSub}>
            OPD centers across Rajgarh District, Madhya Pradesh
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
          <CompactCard
            key={clinic.id}
            style={styles.clinicCard}
            borderAccent={colors.primary}
          >
            {/* Header: Name, City & Rating */}
            <View style={styles.cardHeader}>
              <View style={styles.headerTextCol}>
                <Text style={styles.clinicFullName}>{clinic.fullName}</Text>
                <Text style={styles.branchName}>{clinic.name}</Text>
              </View>
              <View style={styles.ratingBadge}>
                <Icon name="star" size={10} color={colors.warning} />
                <Text style={styles.ratingText}>{clinic.rating}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Address & Hours */}
            <View style={styles.metaSection}>
              <View style={styles.metaRow}>
                <Icon name="location" size={12} color={colors.primary} />
                <Text style={styles.addressText}>{clinic.address}</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="clock" size={12} color={colors.secondaryDark} />
                <Text style={styles.metaText}>{clinic.operatingHours}</Text>
              </View>

              <View style={styles.metaRow}>
                <Icon name="phone" size={12} color={colors.textSecondary} />
                <Text style={styles.metaText}>
                  Landline: {clinic.phone} • Emergency: {clinic.emergencyHelpline}
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
                      {doc.isHeadSurgeon ? '⭐ ' : ''}
                      {doc.name.split(' ')[1]} ({doc.specialization.split(' ')[0]})
                    </Text>
                  </View>
                ))}
              </View>
            </View>

            {/* Branch Actions */}
            <View style={styles.actionsRow}>
              <Button
                title="Call Branch"
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
    paddingTop: 8,
    paddingBottom: 24,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  headerSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  clinicCard: {
    marginBottom: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTextCol: {
    flex: 1,
    paddingRight: 6,
  },
  clinicFullName: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    textTransform: 'uppercase',
  },
  branchName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 1,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  ratingText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  divider: {
    height: 1,
    backgroundColor: colors.surfaceSecondary,
    marginVertical: 6,
  },
  metaSection: {
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  addressText: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.textSecondary,
    flex: 1,
    lineHeight: 13,
  },
  metaText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    flex: 1,
  },
  queueBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    marginVertical: 6,
  },
  queueItem: {
    flex: 1,
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 8,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
  },
  queueValue: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginTop: 1,
  },
  queueValueSub: {
    fontSize: typography.sizes.xxs + 0.5,
    fontWeight: typography.weights.semiBold,
    color: colors.text,
    marginTop: 1,
  },
  queueSep: {
    width: 1,
    height: 20,
    backgroundColor: colors.borderDark,
  },
  docsSection: {
    marginTop: 4,
  },
  docsHeading: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 3,
  },
  docTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  docTag: {
    backgroundColor: colors.primaryLight,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  docTagText: {
    fontSize: 8.5,
    color: colors.primaryDeep,
    fontWeight: typography.weights.semiBold,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
  },
});
