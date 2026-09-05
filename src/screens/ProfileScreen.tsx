import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { REGISTERED_PATIENTS } from '../data/mockData';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const ProfileScreen: React.FC = () => {
  const {
    currentUserPhone,
    setCurrentUserPhone,
    appointments,
    prescriptions,
    openWalkInModal,
    logout,
  } = useApp();

  const currentPatient =
    REGISTERED_PATIENTS.find((p) => p.phone === currentUserPhone) ||
    REGISTERED_PATIENTS[0];

  const userAppointments = appointments.filter(
    (a) => a.patientPhone === currentUserPhone
  );
  const userPrescriptions = prescriptions.filter(
    (p) => p.patientPhone === currentUserPhone
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Patient Profile Card */}
      <CompactCard style={styles.profileCard} borderAccent={colors.primary}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarEmoji}>
              {currentPatient.gender === 'Female' ? '👩' : '👨'}
            </Text>
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Badge label="Registered" variant="success" size="sm" />
            </View>
            <Text style={styles.patientPhone}>+91 {currentPatient.phone}</Text>
            <Text style={styles.patientMeta}>
              {currentPatient.age} Yrs • {currentPatient.gender} • {currentPatient.city}, MP
            </Text>
          </View>
        </View>

        <View style={styles.statsBar}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userAppointments.length}</Text>
            <Text style={styles.statLabel}>Visits</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{userPrescriptions.length}</Text>
            <Text style={styles.statLabel}>Digital Rx</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Active</Text>
            <Text style={styles.statLabel}>UHID Profile</Text>
          </View>
        </View>
      </CompactCard>

      {/* Journey 3: Existing Patient Switcher Simulation */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Switch Patient Profile (Journey 3 Test)
        </Text>
        <Text style={styles.sectionSub}>
          Simulate returning registered patients with existing records
        </Text>
      </View>

      <View style={styles.patientSwitcherGrid}>
        {REGISTERED_PATIENTS.map((p) => {
          const isActive = currentUserPhone === p.phone;
          return (
            <TouchableOpacity
              key={p.phone}
              activeOpacity={0.7}
              onPress={() => setCurrentUserPhone(p.phone)}
              style={[
                styles.switchCard,
                isActive && styles.switchCardActive,
              ]}
            >
              <View style={styles.switchTop}>
                <Text
                  style={[
                    styles.switchName,
                    isActive && styles.switchNameActive,
                  ]}
                >
                  {p.name}
                </Text>
                {isActive && (
                  <Badge label="Active" variant="primary" size="sm" />
                )}
              </View>
              <Text style={styles.switchSub}>
                +91 {p.phone} • {p.city}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Staff Reception Desk Quick Mode */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>Clinic Reception & OPD Staff Desk</Text>
        <Text style={styles.sectionSub}>Staff desk token generator (Journey 5)</Text>
      </View>

      <CompactCard style={styles.deskCard}>
        <View style={styles.deskRow}>
          <View style={styles.deskIconCircle}>
            <Icon name="token" size={20} color={colors.primary} />
          </View>
          <View style={styles.deskInfo}>
            <Text style={styles.deskTitle}>Walk-In Token Desk Mode</Text>
            <Text style={styles.deskDesc}>
              Enter walk-in patients on arrival, allot instant physical tokens & record cash payment.
            </Text>
          </View>
        </View>
        <Button
          title="Open Walk-In Token Desk"
          onPress={openWalkInModal}
          variant="outline"
          size="sm"
          icon="token"
          fullWidth
          style={{ marginTop: 8 }}
        />
      </CompactCard>

      {/* App & Medical Accreditation Info */}
      <View style={[styles.sectionHeader, { marginTop: 10 }]}>
        <Text style={styles.sectionTitle}>About SEVASADAN Health Network</Text>
      </View>

      <CompactCard style={styles.infoCard}>
        <Text style={styles.infoTitle}>Dr. Ankur Deshwali & Specialist Network</Text>
        <Text style={styles.infoDesc}>
          SEVASADAN Super Specialty OPD & Telemedicine Network is led by Dr. Ankur Deshwali (MBBS, MS, MCh Pediatric Surgery), a 3× MPPSC selected Class-I Gazetted Surgical Specialist. We provide high-quality in-clinic surgical care, pediatric interventions, general medicine, and telemedicine consultations across Madhya Pradesh.
        </Text>
        <View style={styles.accreditRow}>
          <Badge label="NMC Compliant" variant="success" size="sm" />
          <Badge label="MP Health Verified" variant="accent" size="sm" />
          <Badge label="ISO Medical Standard" variant="neutral" size="sm" />
        </View>
      </CompactCard>

      {/* Logout Action Button */}
      <Button
        title="Log Out of Account"
        onPress={() => {
          Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Sign Out', style: 'destructive', onPress: logout },
          ]);
        }}
        variant="outline"
        size="md"
        icon="close"
        fullWidth
        style={{ marginTop: 12, borderColor: colors.danger }}
        textStyle={{ color: colors.danger }}
      />

      <View style={styles.versionFooter}>
        <Text style={styles.versionText}>SEVASADAN Mobile App v2.0.0 (Build 42)</Text>
        <Text style={styles.copyText}>© 2026 Sevasadan Super Specialty OPD</Text>
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
  profileCard: {
    marginBottom: 8,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarBox: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarEmoji: {
    fontSize: 24,
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  patientName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  patientPhone: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
    marginTop: 1,
  },
  patientMeta: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 6,
    marginTop: 8,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  statSep: {
    width: 1,
    height: 18,
    backgroundColor: colors.borderDark,
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 6,
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
  patientSwitcherGrid: {
    gap: 6,
  },
  switchCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
  },
  switchCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  switchTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  switchName: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  switchNameActive: {
    color: colors.primary,
  },
  switchSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  deskCard: {
    backgroundColor: '#F8FAFC',
    borderColor: '#CBD5E1',
  },
  deskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deskInfo: {
    flex: 1,
  },
  deskTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  deskDesc: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
    lineHeight: 12,
  },
  infoCard: {
    backgroundColor: colors.white,
  },
  infoTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  infoDesc: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 14,
  },
  accreditRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  versionText: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  copyText: {
    fontSize: 8.5,
    color: colors.textLight,
    marginTop: 2,
  },
});
