import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { UserRole } from '../../types';
import { useApp } from '../../context/AppContext';
import { Icon, IconName } from './Icon';
import { Badge } from './Badge';

export const RoleSwitcherModal: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    isRoleSwitcherOpen,
    closeRoleSwitcher,
    setActiveTab,
    setActiveAdminTab,
  } = useApp();

  const roles: {
    key: UserRole;
    title: string;
    tagline: string;
    badge: string;
    icon: IconName;
    color: string;
    bg: string;
  }[] = [
    {
      key: 'ADMIN',
      title: 'Hospital Admin Console',
      tagline: 'Manage doctors roster, branches & OPD, desk staff, lab catalog, revenue audit & EMR logs',
      badge: 'Super Admin',
      icon: 'shield',
      color: '#6D28D9',
      bg: '#EDE9FE',
    },
    {
      key: 'FRONT_DESK',
      title: 'Reception & Desk Staff (Ayan)',
      tagline: 'OPD token chime calling, patient arrival verification, walk-in ticketing & cash register',
      badge: 'Receptionist',
      icon: 'token',
      color: '#B45309',
      bg: '#FEF3C7',
    },
    {
      key: 'DOCTOR',
      title: 'Doctor Portal (Dr. Ankur Deshwali)',
      tagline: 'Live OPD queue caller, digital prescription pad & telemedicine video chamber',
      badge: 'Chief Surgeon',
      icon: 'stethoscope',
      color: colors.secondaryDark,
      bg: '#D1FAE5',
    },
    {
      key: 'PATIENT',
      title: 'Patient Portal (Aarav Sharma)',
      tagline: 'Book OPD chamber passes, video consults, lab test booking & view digital prescriptions',
      badge: 'Public App',
      icon: 'user',
      color: colors.primary,
      bg: '#E0F2FE',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    closeRoleSwitcher();
    if (role === 'ADMIN') {
      setActiveAdminTab('admin_overview');
      setActiveTab('admin_overview');
    } else {
      setActiveTab('home');
    }
  };

  return (
    <Modal
      visible={isRoleSwitcherOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={closeRoleSwitcher}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.headerTitle}>Select Active Portal Mode</Text>
              <Text style={styles.headerSub}>
                Instant access to Admin, Front Desk, Doctor & Patient portals
              </Text>
            </View>
            <TouchableOpacity onPress={closeRoleSwitcher} style={styles.closeBtn}>
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Role Cards List */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.body}
            showsVerticalScrollIndicator={false}
          >
            {roles.map((r) => {
              const isActive = activeRole === r.key;
              return (
                <TouchableOpacity
                  key={r.key}
                  activeOpacity={0.75}
                  onPress={() => handleSelectRole(r.key)}
                  style={[
                    styles.roleCard,
                    isActive && { borderColor: r.color, backgroundColor: r.bg },
                  ]}
                >
                  <View style={[styles.iconBox, { backgroundColor: r.bg }]}>
                    <Icon name={r.icon} size={20} color={r.color} />
                  </View>

                  <View style={styles.roleInfo}>
                    <View style={styles.roleTopRow}>
                      <Text
                        style={[styles.roleTitle, isActive && { color: r.color }]}
                        numberOfLines={1}
                      >
                        {r.title}
                      </Text>
                      <Badge
                        label={isActive ? 'ACTIVE' : r.badge}
                        variant={isActive ? 'success' : 'neutral'}
                        size="sm"
                      />
                    </View>
                    <Text style={styles.roleTagline}>{r.tagline}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    padding: spacing.screenPaddingHorizontal,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    overflow: 'hidden',
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    backgroundColor: '#072A4A',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSub: {
    fontSize: 10.5,
    color: '#93C5FD',
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
  },
  scrollBody: {
    maxHeight: 460,
  },
  body: {
    padding: 12,
    gap: 8,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: spacing.borderRadiusSm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleInfo: {
    flex: 1,
  },
  roleTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  roleTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
    marginRight: 6,
  },
  roleTagline: {
    fontSize: 10,
    color: colors.textMuted,
    lineHeight: 14,
  },
});
