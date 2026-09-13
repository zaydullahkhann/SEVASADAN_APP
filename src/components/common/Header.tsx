import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Icon, IconName } from './Icon';
import { HospitalLogo } from './HospitalLogo';
import { useApp } from '../../context/AppContext';
import { CLINICS } from '../../data/clinics';

export const Header: React.FC = () => {
  const {
    activeRole,
    selectedBranchId,
    setSelectedBranchId,
    activeDeskBranchId,
    setActiveDeskBranchId,
    doctors,
    activeDoctorId,
    setDoctorDuty,
    logout,
  } = useApp();

  const currentDoctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  const handleEmergencyCall = () => {
    const helpline = '18007382723';
    Alert.alert(
      '24x7 Emergency Medical Helpline',
      'Dial SEVASADAN 24-hour trauma, neonatal & emergency helpline (Toll Free: 1800-7382-723)?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          style: 'destructive',
          onPress: () => {
            Linking.openURL(`tel:${helpline}`).catch(() => {
              Alert.alert('Helpline Number', 'Dial 1800-7382-723 or +91 98260 11223');
            });
          },
        },
      ]
    );
  };

  const getRoleLabel = (): { label: string; icon: IconName; bg: string; text: string } | null => {
    switch (activeRole) {
      case 'DOCTOR':
        return { label: 'Dr. Ankur (Doctor)', icon: 'stethoscope', bg: '#D1FAE5', text: '#065F46' };
      case 'FRONT_DESK':
        return { label: 'Front Desk', icon: 'desk', bg: '#FEF3C7', text: '#92400E' };
      case 'ADMIN':
        return { label: 'Hospital Admin', icon: 'shield-check', bg: '#EDE9FE', text: '#5B21B6' };
      case 'PATIENT':
      default:
        return null;
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <View style={styles.container}>
      {/* Top Main Bar */}
      <View style={styles.topRow}>
        <View style={styles.brandContainer}>
          <HospitalLogo size={32} badgeBg="#FFFFFF" color={colors.primary} style={styles.logoBadge} />
          <View>
            <View style={styles.titleRow}>
              <Text style={styles.brandTitle}>SEVASADAN</Text>
              <View style={styles.tagBadge}>
                <Text style={styles.tagText}>NABH LEVEL</Text>
              </View>
            </View>
            <Text style={styles.brandSubtitle}>
              {activeRole === 'DOCTOR'
                ? 'Doctor Consultation Portal'
                : activeRole === 'FRONT_DESK'
                ? 'Reception & Registration Desk'
                : activeRole === 'ADMIN'
                ? 'Administration & Analytics'
                : 'Superspeciality Hospital & OPD'}
            </Text>
          </View>
        </View>

        {/* Actions Row */}
        <View style={styles.actionsRow}>
          {roleInfo && (
            <View style={[styles.roleBadge, { backgroundColor: roleInfo.bg }]}>
              <Icon name={roleInfo.icon} size={11} color={roleInfo.text} />
              <Text style={[styles.roleLabelText, { color: roleInfo.text }]}>
                {roleInfo.label}
              </Text>
            </View>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => {
              Alert.alert('Sign Out', 'Sign out of this session and return to the Login screen?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Sign Out', style: 'destructive', onPress: logout },
              ]);
            }}
            style={styles.logoutBtn}
          >
            <Icon name="log-out" size={11} color={colors.white} />
            <Text style={styles.logoutBtnText}>Exit</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleEmergencyCall}
            style={styles.emergencyBtn}
          >
            <Icon name="phone" size={11} color={colors.white} />
            <Text style={styles.emergencyText}>24x7</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Sub-bar tailored to role */}
      {activeRole === 'PATIENT' && (
        <View style={styles.subBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <TouchableOpacity
              onPress={() => setSelectedBranchId('all')}
              style={[
                styles.chip,
                selectedBranchId === 'all' && styles.chipActive,
              ]}
            >
              <Icon
                name="hospital"
                size={11}
                color={selectedBranchId === 'all' ? colors.primaryDark : colors.white}
              />
              <Text
                style={[
                  styles.chipText,
                  selectedBranchId === 'all' && styles.chipTextActive,
                ]}
              >
                All 4 Branches
              </Text>
            </TouchableOpacity>

            {CLINICS.map((clinic) => {
              const isActive = selectedBranchId === clinic.id;
              return (
                <TouchableOpacity
                  key={clinic.id}
                  onPress={() => setSelectedBranchId(clinic.id)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <View
                    style={[
                      styles.statusDot,
                      { backgroundColor: isActive ? colors.primaryDark : colors.secondary },
                    ]}
                  />
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {clinic.shortName}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeRole === 'DOCTOR' && (
        <View style={styles.doctorSubBar}>
          <View style={styles.dutyInfo}>
            <Text style={styles.dutyLabel}>Duty Status:</Text>
            <TouchableOpacity
              onPress={() =>
                setDoctorDuty(
                  currentDoctor.id,
                  currentDoctor.dutyStatus === 'AVAILABLE' ? 'IN_SURGERY' : 'AVAILABLE'
                )
              }
              style={[
                styles.dutyToggleBtn,
                currentDoctor.dutyStatus === 'AVAILABLE'
                  ? styles.dutyAvailable
                  : styles.dutySurgery,
              ]}
            >
              <View style={styles.dutyDot} />
              <Text style={styles.dutyBtnText}>
                {currentDoctor.dutyStatus === 'AVAILABLE'
                  ? 'Active in OPD (Ready)'
                  : 'In OT / Surgery'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.docBranchSchedule}>
            Assigned: Sarangpur & Rajgarh
          </Text>
        </View>
      )}

      {activeRole === 'FRONT_DESK' && (
        <View style={styles.subBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <Text style={styles.deskCounterLabel}>Active Counter Desk:</Text>
            {CLINICS.map((clinic) => {
              const isActive = activeDeskBranchId === clinic.id;
              return (
                <TouchableOpacity
                  key={clinic.id}
                  onPress={() => setActiveDeskBranchId(clinic.id)}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      isActive && styles.chipTextActive,
                    ]}
                  >
                    {clinic.shortName} Counter
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {activeRole === 'ADMIN' && (
        <View style={styles.adminSubBar}>
          <Text style={styles.adminStatusText}>
            Real-time Multi-Branch Hospital Network Management & Telemedicine Hub
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.primary,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryDark,
    paddingTop: 4,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 6,
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    marginRight: 8,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  brandTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.white,
    letterSpacing: 0.6,
  },
  tagBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  tagText: {
    color: colors.accent,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  brandSubtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 6,
    gap: 4,
  },
  roleLabelText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    gap: 3,
  },
  logoutBtnText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 3,
  },
  emergencyText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  subBar: {
    paddingVertical: 5,
    backgroundColor: colors.primaryDark,
  },
  scrollContent: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    gap: 5,
  },
  chipActive: {
    backgroundColor: colors.accent,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  chipText: {
    color: colors.white,
    fontSize: typography.sizes.xs - 0.5,
    fontWeight: typography.weights.medium,
  },
  chipTextActive: {
    color: colors.primaryDark,
    fontWeight: typography.weights.bold,
  },
  doctorSubBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 4,
    backgroundColor: colors.primaryDark,
  },
  dutyInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dutyLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
  },
  dutyToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    gap: 4,
  },
  dutyAvailable: {
    backgroundColor: '#065F46',
  },
  dutySurgery: {
    backgroundColor: '#991B1B',
  },
  dutyDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.white,
  },
  dutyBtnText: {
    color: colors.white,
    fontSize: 9,
    fontWeight: typography.weights.bold,
  },
  docBranchSchedule: {
    fontSize: 9,
    color: colors.accentLight,
  },
  deskCounterLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
    marginRight: 2,
  },
  adminSubBar: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 4,
    backgroundColor: colors.primaryDark,
  },
  adminStatusText: {
    fontSize: 10,
    color: colors.accent,
    fontWeight: typography.weights.medium,
  },
});
