import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { Icon, IconName } from '../common/Icon';
import { useApp } from '../../context/AppContext';

export const BottomTabBar: React.FC = () => {
  const {
    activeRole,
    activeTab,
    setActiveTab,
    appointments,
    prescriptions,
    activeDoctorId,
    activeDeskBranchId,
  } = useApp();

  // In ADMIN role, there is NO footer tab bar; drawer sidebar navigation is used instead!
  if (activeRole === 'ADMIN') {
    return null;
  }

  const doctorAppointments = appointments.filter(
    (a) => a.doctorId === activeDoctorId || !a.doctorId
  );
  const doctorWaitingCount = doctorAppointments.filter(
    (a) => a.status === 'CONFIRMED'
  ).length;
  const doctorRxCount = prescriptions.filter(
    (p) => p.doctorId === activeDoctorId
  ).length;

  const activeAppointmentsCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  ).length;

  const doctorPastCount = doctorAppointments.filter(
    (a) => a.status === 'COMPLETED'
  ).length;

  type TabConfig = {
    key: 'home' | 'appointments' | 'prescriptions' | 'care_services' | 'clinics' | 'articles' | 'profile';
    label: string;
    icon: IconName;
    badge?: number;
  };

  const getTabsForRole = (): TabConfig[] => {
    switch (activeRole) {
      case 'DOCTOR':
        return [
          { key: 'home', label: 'OPD & Live Queue', icon: 'stethoscope', badge: doctorWaitingCount },
          { key: 'appointments', label: 'Past Consulted', icon: 'user-check', badge: doctorPastCount },
          { key: 'articles', label: 'Articles', icon: 'file-text', badge: 5 },
          { key: 'profile', label: 'Profile', icon: 'doctor' },
        ];
      case 'FRONT_DESK':
        return [
          { key: 'home', label: 'Live OPD Queue', icon: 'token', badge: activeAppointmentsCount },
          { key: 'clinics', label: 'Doctor Chambers', icon: 'stethoscope' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ];
      case 'PATIENT':
      default:
        return [
          { key: 'home', label: 'Home', icon: 'home' },
          {
            key: 'appointments',
            label: 'Appointments',
            icon: 'calendar',
            badge: activeAppointmentsCount,
          },
          {
            key: 'prescriptions',
            label: 'Prescription',
            icon: 'prescription',
            badge: prescriptions.length,
          },
          {
            key: 'care_services',
            label: 'Care Service',
            icon: 'activity',
          },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive =
            activeTab === tab.key ||
            (tab.key === 'care_services' && (activeTab === 'lab' || activeTab === 'pharmacy'));
          return (
            <TouchableOpacity
              key={tab.key}
              activeOpacity={0.7}
              onPress={() => setActiveTab(tab.key)}
              style={styles.tabItem}
            >
              <View style={styles.iconWrapper}>
                <Icon
                  name={tab.icon}
                  size={17}
                  color={isActive ? colors.primary : colors.textMuted}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{tab.badge}</Text>
                  </View>
                )}
              </View>
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: isActive ? colors.primary : colors.textMuted,
                    fontWeight: isActive
                      ? typography.weights.bold
                      : typography.weights.medium,
                  },
                ]}
              >
                {tab.label}
              </Text>
              {isActive && <View style={styles.activeIndicator} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 6,
    paddingBottom: 8,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 6,
    elevation: 8,
  },
  tabRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: 2,
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -8,
    backgroundColor: colors.danger,
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
  },
  tabLabel: {
    fontSize: typography.sizes.xxs,
    marginTop: 3,
    letterSpacing: -0.1,
  },
  activeIndicator: {
    position: 'absolute',
    top: -6,
    width: 24,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
