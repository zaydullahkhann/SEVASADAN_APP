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
    activeDeskBranchId,
    setActiveDeskBranchId,
    doctors,
    activeDoctorId,
    setDoctorDuty,
    logout,
    openDrawer,
    activeAdminTab,
  } = useApp();

  const currentDoctor = doctors.find((d) => d.id === activeDoctorId) || doctors[0];

  const handleEmergencyCall = () => {
    const helpline = '18007382723';
    Alert.alert(
      '24x7 Emergency Medical Helpline',
      'Dial JANSEVA AROGYAM 24-hour trauma, neonatal & emergency helpline (Toll Free: 1800-7382-723)?',
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
      case 'ADMIN':
        return { label: 'Super Admin', icon: 'shield', bg: '#EDE9FE', text: '#6D28D9' };
      case 'FRONT_DESK':
        return { label: 'Front Desk', icon: 'token', bg: '#FEF3C7', text: '#92400E' };
      case 'DOCTOR':
        return { label: 'Dr. Ankur', icon: 'stethoscope', bg: '#D1FAE5', text: '#065F46' };
      case 'PATIENT':
      default:
        return null;
    }
  };

  const getAdminTabName = (): string => {
    switch (activeAdminTab) {
      case 'admin_overview':
        return 'Overview';
      case 'admin_branches':
        return 'Branches & OPD';
      case 'admin_doctors':
        return 'Doctors Roster';
      case 'admin_staff':
        return 'Desk Staff';
      case 'admin_services':
        return 'Lab & Care Services';
      case 'admin_revenue':
        return 'Revenue Audit';
      case 'admin_emr':
        return 'EMR Logs';
      default:
        return 'Admin Console';
    }
  };

  const roleInfo = getRoleLabel();

  return (
    <View style={styles.container}>
      {/* Top Main Bar */}
      <View style={styles.topRow}>
        {/* Left: Drawer Hamburger Menu Toggle (ONLY for ADMIN role) */}
        {activeRole === 'ADMIN' && (
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={openDrawer}
            style={styles.drawerToggleBtn}
            accessibilityLabel="Open Admin Navigation Sidebar Drawer"
            accessibilityRole="button"
          >
            <Icon name="menu" size={20} color={colors.white} />
          </TouchableOpacity>
        )}

        {/* Brand Information */}
        <View style={styles.brandContainer}>
          <HospitalLogo size={28} badgeBg="#FFFFFF" color={colors.primary} style={styles.logoBadge} />
          <View style={{ flex: 1 }}>
            <Text style={styles.brandTitle} numberOfLines={1}>
              {activeRole === 'ADMIN' ? 'JANSEVA ADMIN' : 'JANSEVA AROGYAM'}
            </Text>
            <Text style={styles.brandSubtitle} numberOfLines={1}>
              {activeRole === 'ADMIN'
                ? `Console • ${getAdminTabName()}`
                : activeRole === 'FRONT_DESK'
                ? 'Reception & OPD Token Desk'
                : activeRole === 'DOCTOR'
                ? 'Doctor Consultation Chamber'
                : 'Specialist OPD & Telemedicine'}
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

          {activeRole !== 'ADMIN' && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleEmergencyCall}
              style={styles.emergencyBtn}
            >
              <Icon name="phone" size={12} color={colors.white} />
              <Text style={styles.emergencyText}>Emergency</Text>
            </TouchableOpacity>
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
            <Icon name="log-out" size={13} color="rgba(255,255,255,0.85)" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Doctor Sub-bar */}
      {activeRole === 'DOCTOR' && (
        <View style={styles.doctorSubBar}>
          <View style={styles.dutyInfo}>
            <Text style={styles.dutyLabel}>Status:</Text>
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
                  ? 'Active in OPD'
                  : 'In Surgery / OT'}
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.docBranchSchedule}>
            Chamber 101 • Sarangpur & Rajgarh
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
    paddingTop: 6,
    paddingBottom: 4,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 6,
  },
  drawerToggleBtn: {
    padding: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    marginRight: 8,
  },
  brandTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.white,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: typography.sizes.xxs,
    color: 'rgba(255, 255, 255, 0.75)',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 3.5,
    paddingHorizontal: 7,
    borderRadius: 6,
    gap: 4,
  },
  roleLabelText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  logoutBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  emergencyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.danger,
    paddingVertical: 4.5,
    paddingHorizontal: 8,
    borderRadius: 6,
    gap: 4,
  },
  emergencyText: {
    color: colors.white,
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
  },
  subBar: {
    paddingVertical: 6,
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
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  chipActive: {
    backgroundColor: colors.white,
  },
  chipText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
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
    paddingVertical: 5,
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
    paddingVertical: 3,
    paddingHorizontal: 7,
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
    fontSize: 10,
    fontWeight: typography.weights.bold,
  },
  docBranchSchedule: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  deskCounterLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    fontWeight: typography.weights.bold,
    marginRight: 2,
  },
});
