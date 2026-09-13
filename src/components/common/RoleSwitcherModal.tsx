import React from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
      key: 'PATIENT',
      title: 'Patient Portal',
      tagline: 'Book OPD tokens, video consults, track live queue & prescriptions',
      badge: 'Public App',
      icon: 'user',
      color: colors.primary,
      bg: '#E0F2FE',
    },
    {
      key: 'DOCTOR',
      title: 'Doctor Portal (Dr. Ankur Deshwali)',
      tagline: 'Live OPD queue, call next patient, write digital prescriptions & video OPD',
      badge: 'Chief Surgeon',
      icon: 'stethoscope',
      color: colors.secondaryDark,
      bg: '#D1FAE5',
    },
    {
      key: 'FRONT_DESK',
      title: 'Front Desk / Reception Desk',
      tagline: 'Issue walk-in tokens, advance queue counter, check-in & cash desk',
      badge: 'Counter Staff',
      icon: 'desk',
      color: '#B45309',
      bg: '#FEF3C7',
    },
    {
      key: 'ADMIN',
      title: 'Hospital Director & Admin',
      tagline: 'Manage doctors, edit consultation fees, 4-branch revenue metrics',
      badge: 'Executive',
      icon: 'shield-check',
      color: '#6D28D9',
      bg: '#EDE9FE',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    closeRoleSwitcher();
    setActiveTab('home');
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
              <Text style={styles.headerTitle}>Select Active User Role</Text>
              <Text style={styles.headerSub}>
                Test and experience all 4 roles in SEVASADAN Network
              </Text>
            </View>
            <TouchableOpacity onPress={closeRoleSwitcher} style={styles.closeBtn}>
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Role Cards */}
          <View style={styles.body}>
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
                      <Text style={[styles.roleTitle, isActive && { color: r.color }]}>
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
          </View>
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  header: {
    backgroundColor: colors.primary,
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
    color: colors.primaryLight,
    marginTop: 1,
  },
  closeBtn: {
    padding: 4,
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
