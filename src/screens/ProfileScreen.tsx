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
import { DoctorAvatar } from '../components/common/DoctorAvatar';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';

export const ProfileScreen: React.FC = () => {
  const {
    activeRole,
    activeDoctorId,
    doctors,
    setDoctorDuty,
    activeDeskBranchId,
    queueStatuses,
    deskRegisters,
    currentUserPhone,
    setCurrentUserPhone,
    appointments,
    prescriptions,
    openWalkInModal,
    logout,
  } = useApp();

  const currentDoctor =
    doctors.find((d) => d.id === activeDoctorId) || doctors[0];
  const currentPatient =
    REGISTERED_PATIENTS.find((p) => p.phone === currentUserPhone) ||
    REGISTERED_PATIENTS[0];

  const userAppointments = appointments.filter(
    (a) => a.patientPhone === currentUserPhone
  );
  const userPrescriptions = prescriptions.filter(
    (p) => p.patientPhone === currentUserPhone
  );

  const docAppointments = appointments.filter(
    (a) =>
      a.doctorId === activeDoctorId ||
      a.doctorName.toLowerCase().includes('ankur')
  );
  const docPrescriptions = prescriptions.filter(
    (p) =>
      p.doctorId === activeDoctorId ||
      p.doctorName.toLowerCase().includes('ankur')
  );

  const deskRegister = deskRegisters[activeDeskBranchId || 'sarangpur'];
  const deskQueue = queueStatuses[activeDeskBranchId || 'sarangpur'];

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: logout },
    ]);
  };

  // 1. DOCTOR PROFILE VIEW
  if (activeRole === 'DOCTOR') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <CompactCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <DoctorAvatar gender="male" size={60} isHeadSurgeon={true} />
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{currentDoctor.name}</Text>
                <Badge label="Chief Surgeon" variant="success" size="sm" />
              </View>
              <Text style={styles.docSpecialtyText}>
                {currentDoctor.specialization}
              </Text>
              <Text style={styles.docMetaText}>
                Reg #MP-19482 • 15+ Yrs Surgical Specialist
              </Text>
            </View>
          </View>

          {/* Stats */}
          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{docAppointments.length}</Text>
              <Text style={styles.statLabel}>OPD Visits</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{docPrescriptions.length}</Text>
              <Text style={styles.statLabel}>Signed Prescriptions</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <View style={styles.ratingRow}>
                <Icon name="star" size={12} color="#D97706" />
                <Text style={[styles.statNumber, { color: '#92400E', marginLeft: 3 }]}>
                  4.98
                </Text>
              </View>
              <Text style={styles.statLabel}>Patient Rating</Text>
            </View>
          </View>
        </CompactCard>

        {/* Doctor Duty Status Card */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Duty & OPD Availability</Text>
          <Text style={styles.sectionSub}>Manage your active OPD and OT status</Text>
        </View>

        <CompactCard style={styles.deskCard}>
          <View style={styles.dutyRow}>
            <View style={{ flex: 1, paddingRight: 10 }}>
              <Text style={styles.deskTitle}>Consultation Status</Text>
              <Text style={styles.dutyStatusSub}>
                {currentDoctor.dutyStatus === 'AVAILABLE'
                  ? 'Available in OPD (Accepting Patients & Calls)'
                  : 'In Operation Theatre (OT / Surgery Session)'}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() =>
                setDoctorDuty(
                  currentDoctor.id,
                  currentDoctor.dutyStatus === 'AVAILABLE'
                    ? 'IN_SURGERY'
                    : 'AVAILABLE'
                )
              }
              style={[
                styles.dutyToggleBtn,
                currentDoctor.dutyStatus === 'AVAILABLE'
                  ? styles.dutyBtnActive
                  : styles.dutyBtnInactive,
              ]}
            >
              <Text style={styles.dutyToggleText}>
                {currentDoctor.dutyStatus === 'AVAILABLE'
                  ? 'Set to OT'
                  : 'Set Available'}
              </Text>
            </TouchableOpacity>
          </View>
        </CompactCard>

        {/* Assigned Hospital Branches */}
        <View style={[styles.sectionHeader, { marginTop: 10 }]}>
          <Text style={styles.sectionTitle}>Assigned Centers & Timings</Text>
        </View>

        <CompactCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>Sarangpur & Rajgarh District OPD</Text>
          <Text style={styles.infoDesc}>
            Primary Base: Sarangpur Super Specialty Clinic (Mon - Sat: 09:00 AM - 02:00 PM)
            {'\n'}Surgical OT Hours: Daily 02:30 PM - 05:00 PM
            {'\n'}Telemedicine Video OPD: 06:00 PM - 08:30 PM
          </Text>
          <View style={styles.accreditRow}>
            <Badge label="NMC Certified" variant="success" size="sm" />
            <Badge label="Class-I Gazetted" variant="accent" size="sm" />
            <Badge label="3× MPPSC Selected" variant="primary" size="sm" />
          </View>
        </CompactCard>

        {/* Logout */}
        <Button
          title="Sign Out Doctor Account"
          onPress={handleSignOut}
          variant="outline"
          size="md"
          icon="log-out"
          fullWidth
          style={{ marginTop: 14, borderColor: colors.danger }}
          textStyle={{ color: colors.danger }}
        />

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>
            SEVASADAN Doctor Portal • Dr. Ankur Deshwali
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 2. FRONT DESK PROFILE VIEW
  if (activeRole === 'FRONT_DESK') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <CompactCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={styles.deskAvatarCircle}>
              <Icon name="desk" size={24} color={colors.primary} />
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>Pooja Verma</Text>
                <Badge label="Front Desk" variant="accent" size="sm" />
              </View>
              <Text style={styles.docSpecialtyText}>
                OPD Reception & Token Counter
              </Text>
              <Text style={styles.docMetaText}>
                Staff ID: FD-7041 • Sarangpur Main Desk
              </Text>
            </View>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>
                {deskQueue?.totalIssuedToday || 28}
              </Text>
              <Text style={styles.statLabel}>Tokens Issued</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: colors.secondaryDark }]}>
                ₹{deskRegister?.cashCollected || 6400}
              </Text>
              <Text style={styles.statLabel}>Cash Collected</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>Active</Text>
              <Text style={styles.statLabel}>Counter 1</Text>
            </View>
          </View>
        </CompactCard>

        {/* Walk-In Quick Launcher */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Walk-In Patient Registration</Text>
          <Text style={styles.sectionSub}>Allot physical tokens and register arrivals</Text>
        </View>

        <CompactCard style={styles.deskCard}>
          <View style={styles.deskRow}>
            <View style={styles.deskIconCircle}>
              <Icon name="token" size={18} color={colors.primary} />
            </View>
            <View style={styles.deskInfo}>
              <Text style={styles.deskTitle}>Allot Walk-In OPD Token</Text>
              <Text style={styles.deskDesc}>
                Register patient details, issue token pass slip, and collect counter fee.
              </Text>
            </View>
          </View>
          <Button
            title="Issue Walk-In Token"
            onPress={openWalkInModal}
            variant="primary"
            size="sm"
            icon="token"
            fullWidth
            style={{ marginTop: 10 }}
          />
        </CompactCard>

        {/* Logout */}
        <Button
          title="Sign Out Front Desk"
          onPress={handleSignOut}
          variant="outline"
          size="md"
          icon="log-out"
          fullWidth
          style={{ marginTop: 14, borderColor: colors.danger }}
          textStyle={{ color: colors.danger }}
        />

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>
            SEVASADAN Front Desk Portal • Sarangpur
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 3. ADMIN PROFILE VIEW
  if (activeRole === 'ADMIN') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <CompactCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <View style={[styles.deskAvatarCircle, { backgroundColor: '#EDE9FE' }]}>
              <Icon name="shield-check" size={24} color="#5B21B6" />
            </View>
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>Hospital Administration</Text>
                <Badge label="Super Admin" variant="primary" size="sm" />
              </View>
              <Text style={styles.docSpecialtyText}>
                Executive Medical Network Controller
              </Text>
              <Text style={styles.docMetaText}>
                SEVASADAN Health Network • All 4 Branches Active
              </Text>
            </View>
          </View>

          <View style={styles.statsBar}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>4</Text>
              <Text style={styles.statLabel}>Centers</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{doctors.length}</Text>
              <Text style={styles.statLabel}>Doctors</Text>
            </View>
            <View style={styles.statSep} />
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{appointments.length}</Text>
              <Text style={styles.statLabel}>Total OPDs</Text>
            </View>
          </View>
        </CompactCard>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hospital Compliance & Systems</Text>
          <Text style={styles.sectionSub}>Network architecture and tele-OPD infrastructure</Text>
        </View>

        <CompactCard style={styles.infoCard}>
          <Text style={styles.infoTitle}>SEVASADAN Super Specialty Network</Text>
          <Text style={styles.infoDesc}>
            Centralized hospital administration for Sarangpur, Shujalpur, Rajgarh, and Biaora OPD branches. Telemedicine integration secured via LiveKit WebRTC Cloud.
          </Text>
          <View style={styles.accreditRow}>
            <Badge label="NMC Certified" variant="success" size="sm" />
            <Badge label="ISO 9001:2015" variant="accent" size="sm" />
            <Badge label="LiveKit Cloud Tele-OPD" variant="primary" size="sm" />
          </View>
        </CompactCard>

        {/* Logout */}
        <Button
          title="Sign Out Admin Account"
          onPress={handleSignOut}
          variant="outline"
          size="md"
          icon="log-out"
          fullWidth
          style={{ marginTop: 14, borderColor: colors.danger }}
          textStyle={{ color: colors.danger }}
        />

        <View style={styles.versionFooter}>
          <Text style={styles.versionText}>
            SEVASADAN Executive Administration Panel
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 4. PATIENT PROFILE VIEW (Default)
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* Patient Profile Card */}
      <CompactCard style={styles.profileCard}>
        <View style={styles.profileRow}>
          <View style={styles.patientAvatarBox}>
            <Icon name="user" size={24} color={colors.primary} />
          </View>
          <View style={styles.profileDetails}>
            <View style={styles.nameRow}>
              <Text style={styles.patientName}>{currentPatient.name}</Text>
              <Badge label="UHID Active" variant="success" size="sm" />
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
            <Text style={styles.statLabel}>Prescriptions</Text>
          </View>
          <View style={styles.statSep} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>Active</Text>
            <Text style={styles.statLabel}>UHID Profile</Text>
          </View>
        </View>
      </CompactCard>

      {/* Switch Patient Profile (Testing Simulation) */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>
          Switch Patient Profile
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

      {/* App & Medical Accreditation Info */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>About SEVASADAN Health Network</Text>
      </View>

      <CompactCard style={styles.infoCard}>
        <Text style={styles.infoTitle}>Dr. Ankur Deshwali & Specialist Network</Text>
        <Text style={styles.infoDesc}>
          SEVASADAN Super Specialty OPD & Telemedicine Network is led by Dr. Ankur Deshwali (MBBS, MS, MCh Pediatric Surgery), a 3× MPPSC selected Class-I Gazetted Surgical Specialist. Providing high-quality in-clinic surgical care, pediatric interventions, and telemedicine across Madhya Pradesh.
        </Text>
        <View style={styles.accreditRow}>
          <Badge label="NMC Compliant" variant="success" size="sm" />
          <Badge label="MP Health Verified" variant="accent" size="sm" />
          <Badge label="ISO Medical Standard" variant="neutral" size="sm" />
        </View>
      </CompactCard>

      {/* Logout Action Button */}
      <Button
        title="Sign Out of Account"
        onPress={handleSignOut}
        variant="outline"
        size="md"
        icon="log-out"
        fullWidth
        style={{ marginTop: 14, borderColor: colors.danger }}
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
    backgroundColor: '#F6F9FC',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 10,
    paddingBottom: 28,
  },
  profileCard: {
    marginBottom: 10,
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  patientAvatarBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  deskAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FEF3C7',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  profileDetails: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  patientName: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docSpecialtyText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.bold,
    marginTop: 1,
  },
  docMetaText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  patientPhone: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  patientMeta: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statItem: {
    alignItems: 'center',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statNumber: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 2,
  },
  statSep: {
    width: 1,
    height: 20,
    backgroundColor: colors.border,
  },
  sectionHeader: {
    marginTop: 10,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  dutyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  dutyStatusSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 3,
  },
  dutyToggleBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  dutyBtnActive: {
    backgroundColor: '#D1FAE5',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  dutyBtnInactive: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  dutyToggleText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  deskCard: {
    marginBottom: 10,
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  deskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deskIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deskInfo: {
    flex: 1,
  },
  deskTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  deskDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  patientSwitcherGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  switchCard: {
    width: '48.5%',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  switchCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#F0F9FF',
  },
  switchTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  switchName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  switchNameActive: {
    color: colors.primary,
  },
  switchSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  infoCard: {
    marginBottom: 10,
    backgroundColor: colors.white,
    borderColor: '#E2E8F0',
    borderWidth: 1,
  },
  infoTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 4,
  },
  infoDesc: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 8,
  },
  accreditRow: {
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  versionFooter: {
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 20,
  },
  versionText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  copyText: {
    fontSize: typography.sizes.xxs,
    color: colors.textLight,
    marginTop: 2,
  },
});
