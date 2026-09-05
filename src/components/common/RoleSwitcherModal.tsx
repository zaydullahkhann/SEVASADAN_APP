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
import { Icon } from './Icon';
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
    icon: string;
    color: string;
    bg: string;
  }[] = [
    {
      key: 'PATIENT',
      title: 'Patient Portal',
      tagline: 'Book OPD tokens, video consults, track live queue & Rx',
      badge: 'Public App',
      icon: '👤',
      color: colors.primary,
      bg: colors.primaryLight,
    },
    {
      key: 'DOCTOR',
      title: 'Doctor Portal (Dr. Ankur Deshwali)',
      tagline: 'Live OPD queue, call next patient, write digital Rx & video OPD',
      badge: 'Chief Surgeon',
      icon: '🩺',
      color: colors.secondaryDark,
      bg: colors.secondaryLight,
    },
    {
      key: 'FRONT_DESK',
      title: 'Front Desk / Reception Desk',
      tagline: 'Issue walk-in tokens, advance queue counter, check-in & cash desk',
      badge: 'Counter Staff',
      icon: '🖥️',
      color: '#B45309',
      bg: '#FEF3C7',
    },
    {
      key: 'ADMIN',
      title: 'Hospital Director & Admin',
      tagline: 'Manage doctors, edit consultation fees, 4-branch revenue metrics',
      badge: 'Executive',
      icon: '🛡️',
      color: '#6D28D9',
      bg: '#F5F3FF',
    },
  ];

  const handleSelectRole = (role: UserRole) => {
    setActiveRole(role);
    closeRoleSwitcher();
    // Default to home tab when switching roles
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
                    <Text style={styles.roleEmoji}>{r.icon}</Text>
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryDark,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSub: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    marginTop: 1,
  },
  closeBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  body: {
    padding: 10,
    gap: 8,
  },
  roleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm + 2,
    borderWidth: 1.5,
    borderColor: colors.border,
    padding: 8,
    gap: 10,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  roleEmoji: {
    fontSize: 20,
  },
  roleInfo: {
    flex: 1,
  },
  roleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 4,
  },
  roleTitle: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  roleTagline: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 12,
  },
});
