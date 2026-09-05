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
    doctors,
  } = useApp();

  const activeAppointmentsCount = appointments.filter(
    (a) => a.status === 'CONFIRMED' || a.status === 'IN_PROGRESS'
  ).length;

  const waitingCount = appointments.filter((a) => a.status === 'CONFIRMED').length;

  type TabConfig = {
    key: 'home' | 'appointments' | 'prescriptions' | 'clinics' | 'profile';
    label: string;
    icon: IconName;
    badge?: number;
  };

  const getTabsForRole = (): TabConfig[] => {
    switch (activeRole) {
      case 'DOCTOR':
        return [
          { key: 'home', label: 'Doctor OPD', icon: 'stethoscope', badge: waitingCount },
          { key: 'prescriptions', label: 'Digital Rx', icon: 'prescription', badge: prescriptions.length },
          { key: 'appointments', label: 'Visits Log', icon: 'calendar' },
          { key: 'clinics', label: 'Branches', icon: 'hospital' },
          { key: 'profile', label: 'Account', icon: 'user' },
        ];
      case 'FRONT_DESK':
        return [
          { key: 'home', label: 'Counter Desk', icon: 'token' },
          { key: 'appointments', label: 'Check-In', icon: 'check', badge: waitingCount },
          { key: 'prescriptions', label: 'Rx Archive', icon: 'prescription' },
          { key: 'clinics', label: 'Counters', icon: 'hospital' },
          { key: 'profile', label: 'Desk User', icon: 'user' },
        ];
      case 'ADMIN':
        return [
          { key: 'home', label: 'Overview', icon: 'home' },
          { key: 'clinics', label: '4 Branches', icon: 'hospital' },
          { key: 'prescriptions', label: 'Doctors', icon: 'user', badge: doctors.length },
          { key: 'appointments', label: 'All Visits', icon: 'calendar', badge: activeAppointmentsCount },
          { key: 'profile', label: 'Admin', icon: 'shield' },
        ];
      case 'PATIENT':
      default:
        return [
          { key: 'home', label: 'Home', icon: 'home' },
          {
            key: 'appointments',
            label: 'Visits & Queue',
            icon: 'token',
            badge: activeAppointmentsCount,
          },
          {
            key: 'prescriptions',
            label: 'Digital Rx',
            icon: 'prescription',
            badge: prescriptions.length,
          },
          { key: 'clinics', label: 'Branches', icon: 'hospital' },
          { key: 'profile', label: 'Profile', icon: 'user' },
        ];
    }
  };

  const tabs = getTabsForRole();

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
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
    paddingTop: 4,
    paddingBottom: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 6,
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
    paddingVertical: 3,
    position: 'relative',
  },
  iconWrapper: {
    position: 'relative',
    padding: 2,
  },
  badge: {
    position: 'absolute',
    top: -3,
    right: -9,
    backgroundColor: colors.danger,
    borderRadius: 9,
    minWidth: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: colors.white,
    fontSize: 8,
    fontWeight: typography.weights.bold,
  },
  tabLabel: {
    fontSize: typography.sizes.xxs,
    marginTop: 2,
  },
  activeIndicator: {
    position: 'absolute',
    top: -4,
    width: 20,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.primary,
  },
});
