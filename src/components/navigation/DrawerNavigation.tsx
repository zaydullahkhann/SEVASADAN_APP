import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  Linking,
  Alert,
  Dimensions,
  Animated,
  Easing,
  PanResponder,
} from 'react-native';
import { colors } from '../../theme/colors';
import { Icon, IconName } from '../common/Icon';
import { HospitalLogo } from '../common/HospitalLogo';
import { useApp, AppTabType, AdminTabType } from '../../context/AppContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = Math.min(SCREEN_WIDTH * 0.84, 340);

export const DrawerNavigation: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    activeTab,
    setActiveTab,
    activeAdminTab,
    setActiveAdminTab,
    activeRole,
    authUser,
    logout,
    openBookingModal,
  } = useApp();

  const slideAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isDrawerOpen) {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -DRAWER_WIDTH,
          duration: 200,
          easing: Easing.in(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isDrawerOpen, slideAnim, opacityAnim]);

  // Swipe gesture handler to allow sliding closed
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return gestureState.dx < -15 && Math.abs(gestureState.dy) < 50;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -50 || gestureState.vx < -0.5) {
          closeDrawer();
        }
      },
    })
  ).current;

  const handleSelectTab = (tab: AppTabType) => {
    setActiveTab(tab);
    closeDrawer();
  };

  const handleSelectAdminTab = (tab: AdminTabType) => {
    setActiveAdminTab(tab);
    setActiveTab(tab);
    closeDrawer();
  };

  const handleEmergencyCall = () => {
    closeDrawer();
    Linking.openURL('tel:18007382723').catch(() => {
      Alert.alert('Emergency Helpline', 'Call toll-free: 1800-7382-723');
    });
  };

  // 7 Core Admin Navigation Items matching jansevaarogyam.com/admin
  const adminNavItems: {
    id: AdminTabType;
    label: string;
    sublabel: string;
    icon: IconName;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'admin_overview',
      label: 'Overview',
      sublabel: 'Financials, KPIs & branch metrics',
      icon: 'activity',
    },
    {
      id: 'admin_branches',
      label: 'Branches & OPD',
      sublabel: 'Hospital centers, timings & slot intervals',
      icon: 'hospital',
    },
    {
      id: 'admin_doctors',
      label: 'Doctors Roster',
      sublabel: 'Specialists credentials, OPD schedule & fees',
      icon: 'stethoscope',
    },
    {
      id: 'admin_staff',
      label: 'Desk Staff',
      sublabel: 'Receptionists & branch employee records',
      icon: 'token',
    },
    {
      id: 'admin_services',
      label: 'Lab & Care Services',
      sublabel: 'Diagnostics tests, packages & pharmacy kits',
      icon: 'prescription',
      badge: 'CATALOG',
      badgeColor: '#10B981',
    },
    {
      id: 'admin_revenue',
      label: 'Revenue Audit',
      sublabel: 'Online vs Cash reconciliation ledger',
      icon: 'receipt',
    },
    {
      id: 'admin_emr',
      label: 'EMR Logs',
      sublabel: 'Searchable electronic token records',
      icon: 'calendar',
    },
  ];

  // Patient Navigation Items
  const patientNavItems: {
    id: string;
    label: string;
    sublabel?: string;
    icon: IconName;
    tab?: AppTabType;
    action?: () => void;
    badge?: string;
    badgeColor?: string;
    highlight?: boolean;
  }[] = [
    {
      id: 'home',
      label: 'Home & Featured OPD',
      sublabel: 'Dr. Ankur Deshwali & Services',
      icon: 'home',
      tab: 'home',
    },
    {
      id: 'book',
      label: 'Book OPD Token / Video Consult',
      sublabel: 'Instant chamber token & telemedicine',
      icon: 'calendar',
      action: () => {
        closeDrawer();
        openBookingModal({ consultationMode: 'IN_CLINIC' });
      },
      highlight: true,
    },
    {
      id: 'doctors',
      label: 'Specialists & Doctors Roster',
      sublabel: 'Pediatric, General, Ortho & Gynae',
      icon: 'stethoscope',
      tab: 'doctors',
    },
    {
      id: 'clinics',
      label: 'Hospital Network Branches',
      sublabel: 'Rajgarh, Sarangpur & Shujalpur',
      icon: 'hospital',
      tab: 'clinics',
    },
    {
      id: 'lab',
      label: 'High-Tech Pathology Lab',
      sublabel: 'Blood tests & Doorstep WhatsApp reports',
      icon: 'activity',
      tab: 'lab',
      badge: 'NEW',
      badgeColor: '#10B981',
    },
    {
      id: 'pharmacy',
      label: 'Pharmacy & Medicine Store',
      sublabel: 'Genuine medicines & prescription refills',
      icon: 'prescription',
      tab: 'pharmacy',
    },
    {
      id: 'appointments',
      label: 'My Token Passes & Visits',
      sublabel: 'Live queue tracker & token receipts',
      icon: 'token',
      tab: 'appointments',
    },
    {
      id: 'prescriptions',
      label: 'Prescriptions & Medical History',
      sublabel: 'Digital Prescription & doctor advice records',
      icon: 'receipt',
      tab: 'prescriptions',
    },
  ];

  if (!isDrawerOpen || activeRole !== 'ADMIN') {
    return null;
  }

  return (
    <Modal
      visible={isDrawerOpen}
      transparent
      animationType="none"
      onRequestClose={closeDrawer}
    >
      <View style={styles.modalOverlay}>
        {/* Animated Dim Backdrop */}
        <Animated.View style={[styles.backdrop, { opacity: opacityAnim }]}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={closeDrawer}
          />
        </Animated.View>

        {/* Animated Sliding Drawer Panel */}
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.drawerContainer,
            {
              transform: [{ translateX: slideAnim }],
            },
          ]}
        >
          {/* Header Profile Section */}
          <View style={styles.drawerHeader}>
            <View style={styles.brandRow}>
              <HospitalLogo size={34} badgeBg="#FFFFFF" color={colors.primary} />
              <View style={styles.brandTextWrap}>
                <Text style={styles.brandTitle}>JANSEVA AROGYAM</Text>
                <Text style={styles.brandSubtitle}>
                  NABH Multi-Branch Hospital Network
                </Text>
              </View>
              <TouchableOpacity
                onPress={closeDrawer}
                style={styles.closeBtn}
                accessibilityLabel="Close Drawer Navigation"
              >
                <Icon name="close" size={16} color={colors.white} />
              </TouchableOpacity>
            </View>

            {/* Current Logged In Role Profile Card */}
            <View style={styles.userCard}>
              <View style={styles.userInfoLeft}>
                <View style={styles.userAvatarBadge}>
                  <Icon
                    name={
                      activeRole === 'ADMIN'
                        ? 'shield'
                        : activeRole === 'FRONT_DESK'
                        ? 'token'
                        : activeRole === 'DOCTOR'
                        ? 'stethoscope'
                        : 'user'
                    }
                    size={15}
                    color={
                      activeRole === 'ADMIN'
                        ? '#6D28D9'
                        : activeRole === 'FRONT_DESK'
                        ? '#B45309'
                        : activeRole === 'DOCTOR'
                        ? '#065F46'
                        : '#0F4C81'
                    }
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName} numberOfLines={1}>
                    {activeRole === 'ADMIN'
                      ? 'Hospital Super Admin'
                      : activeRole === 'FRONT_DESK'
                      ? 'Ayan (Reception Desk)'
                      : authUser?.name || (activeRole === 'DOCTOR' ? 'Dr. Ankur Deshwali' : 'Aarav Sharma')}
                  </Text>
                  <Text style={styles.userRoleTag} numberOfLines={1}>
                    {activeRole === 'ADMIN'
                      ? 'jansevaarogyam@gmail.com'
                      : activeRole === 'FRONT_DESK'
                      ? 'Rajgarh Reception Operator'
                      : activeRole === 'DOCTOR'
                      ? 'Doctor Consultation Portal'
                      : 'Verified Patient Profile'}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Drawer Menu Navigation */}
          <ScrollView
            style={styles.menuScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.menuScrollContent}
          >
            {/* 1. ADMIN ROLE SPECIFIC NAVIGATION */}
            {activeRole === 'ADMIN' ? (
              <>
                <Text style={styles.sectionHeading}>ADMIN CONTROL CONSOLE</Text>
                {adminNavItems.map((item) => {
                  const isSelected = activeAdminTab === item.id;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.navItem,
                        isSelected && styles.adminNavItemActive,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => handleSelectAdminTab(item.id)}
                    >
                      <View
                        style={[
                          styles.navIconBox,
                          isSelected && styles.adminNavIconBoxActive,
                        ]}
                      >
                        <Icon
                          name={item.icon}
                          size={16}
                          color={isSelected ? colors.white : '#6D28D9'}
                        />
                      </View>

                      <View style={styles.navTextCol}>
                        <View style={styles.navTitleRow}>
                          <Text
                            style={[
                              styles.navLabel,
                              isSelected && styles.adminNavLabelActive,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View
                              style={[
                                styles.navBadge,
                                { backgroundColor: item.badgeColor || '#7C3AED' },
                              ]}
                            >
                              <Text style={styles.navBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        <Text style={styles.navSublabel}>{item.sublabel}</Text>
                      </View>

                      <Icon
                        name="chevron-right"
                        size={13}
                        color={isSelected ? '#6D28D9' : colors.textLight}
                      />
                    </TouchableOpacity>
                  );
                })}
              </>
            ) : (
              /* 2. PATIENT / DOCTOR / FRONT DESK NAVIGATION */
              <>
                <Text style={styles.sectionHeading}>PATIENT CARE & SERVICES</Text>
                {patientNavItems.map((item) => {
                  const isSelected = item.tab ? activeTab === item.tab : false;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.navItem,
                        isSelected && styles.navItemActive,
                        item.highlight && styles.navItemHighlight,
                      ]}
                      activeOpacity={0.7}
                      onPress={() => {
                        if (item.action) {
                          item.action();
                        } else if (item.tab) {
                          handleSelectTab(item.tab);
                        }
                      }}
                    >
                      <View
                        style={[
                          styles.navIconBox,
                          isSelected && styles.navIconBoxActive,
                          item.highlight && styles.navIconBoxHighlight,
                        ]}
                      >
                        <Icon
                          name={item.icon}
                          size={17}
                          color={
                            isSelected
                              ? colors.white
                              : item.highlight
                              ? colors.white
                              : colors.primary
                          }
                        />
                      </View>

                      <View style={styles.navTextCol}>
                        <View style={styles.navTitleRow}>
                          <Text
                            style={[
                              styles.navLabel,
                              isSelected && styles.navLabelActive,
                              item.highlight && styles.navLabelHighlight,
                            ]}
                          >
                            {item.label}
                          </Text>
                          {item.badge && (
                            <View
                              style={[
                                styles.navBadge,
                                { backgroundColor: item.badgeColor || colors.primary },
                              ]}
                            >
                              <Text style={styles.navBadgeText}>{item.badge}</Text>
                            </View>
                          )}
                        </View>
                        {item.sublabel && (
                          <Text style={styles.navSublabel}>{item.sublabel}</Text>
                        )}
                      </View>

                      <Icon
                        name="chevron-right"
                        size={13}
                        color={isSelected ? colors.primary : colors.textLight}
                      />
                    </TouchableOpacity>
                  );
                })}
              </>
            )}

            {/* 3. Emergency Support Banner */}
            <TouchableOpacity
              style={styles.emergencyBanner}
              activeOpacity={0.85}
              onPress={handleEmergencyCall}
            >
              <View style={styles.emergencyIcon}>
                <Icon name="phone" size={15} color={colors.white} />
              </View>
              <View style={styles.emergencyTextCol}>
                <Text style={styles.emergencyTitle}>24x7 Emergency & Trauma</Text>
                <Text style={styles.emergencySub}>1800-7382-723 (Toll Free)</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            <TouchableOpacity
              style={styles.logoutBtn}
              activeOpacity={0.8}
              onPress={() => {
                closeDrawer();
                Alert.alert(
                  'Sign Out',
                  'Sign out of Janseva Arogyam session?',
                  [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Sign Out', style: 'destructive', onPress: logout },
                  ]
                );
              }}
            >
              <Icon name="log-out" size={14} color="#DC2626" />
              <Text style={styles.logoutText}>Sign Out</Text>
            </TouchableOpacity>

            <Text style={styles.versionText}>Janseva Arogyam v2.6</Text>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(7, 36, 62, 0.68)',
  },
  drawerContainer: {
    width: DRAWER_WIDTH,
    backgroundColor: '#FFFFFF',
    height: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 12,
  },

  // Header
  drawerHeader: {
    backgroundColor: '#072A4A',
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 14,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  brandTextWrap: {
    flex: 1,
    marginLeft: 10,
  },
  brandTitle: {
    fontSize: 14.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.6,
  },
  brandSubtitle: {
    fontSize: 9.5,
    color: '#93C5FD',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  userInfoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 10,
  },
  userAvatarBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userName: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userRoleTag: {
    fontSize: 9.5,
    color: '#93C5FD',
    marginTop: 1,
  },

  // Menu Scroll
  menuScroll: {
    flex: 1,
  },
  menuScrollContent: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 5,
  },
  sectionHeading: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.6,
    marginTop: 6,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    gap: 10,
  },
  navItemActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#BFDBFE',
  },
  adminNavItemActive: {
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
  },
  navItemHighlight: {
    backgroundColor: '#0F4C81',
    borderColor: '#0F4C81',
  },
  navIconBox: {
    width: 32,
    height: 32,
    borderRadius: 7,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  navIconBoxActive: {
    backgroundColor: '#0F4C81',
  },
  adminNavIconBoxActive: {
    backgroundColor: '#7C3AED',
  },
  navIconBoxHighlight: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navTextCol: {
    flex: 1,
  },
  navTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  navLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  navLabelActive: {
    color: '#0F4C81',
    fontWeight: '800',
  },
  adminNavLabelActive: {
    color: '#6D28D9',
    fontWeight: '800',
  },
  navLabelHighlight: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  navSublabel: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 1,
  },
  navBadge: {
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  navBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Emergency Banner
  emergencyBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    borderRadius: 10,
    padding: 9,
    marginTop: 10,
    gap: 8,
  },
  emergencyIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyTextCol: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  emergencySub: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 1,
  },

  // Footer
  drawerFooter: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 3,
    paddingHorizontal: 4,
  },
  logoutText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  versionText: {
    fontSize: 9,
    color: '#94A3B8',
  },
});
