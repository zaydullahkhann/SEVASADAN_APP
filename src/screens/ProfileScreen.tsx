import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Linking,
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
    openBookingModal,
    logout,
  } = useApp();

  const currentDoctor =
    doctors.find((d) => d.id === activeDoctorId) || doctors[0];
  const currentPatient =
    REGISTERED_PATIENTS.find((p) => p.phone === currentUserPhone) ||
    REGISTERED_PATIENTS[0];

  const referralCode = `SEVA-${currentPatient.phone ? currentPatient.phone.slice(-4) : '7842'}`;

  const handleCopyReferralCode = () => {
    Alert.alert(
      'Referral Code Copied! 📋',
      `Your code: ${referralCode}\n\nShare this code with friends & family to give them ₹100 discount on their 1st appointment or lab test.`
    );
  };

  const handleShareWhatsApp = () => {
    const message = `Namaste! Book doctor OPD tokens & pathology lab tests at Janseva Arogyam Hospital. Use my referral code *${referralCode}* to get ₹100 OFF on your first booking: https://jansevaarogyam.com/invite/${referralCode}`;
    const url = `whatsapp://send?text=${encodeURIComponent(message)}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Share Referral', message);
    });
  };

  const handleShareSMS = () => {
    const message = `Book hospital doctor appointments and lab tests easily with SEVASADAN! Use code ${referralCode} for ₹100 OFF.`;
    Linking.openURL(`sms:?body=${encodeURIComponent(message)}`).catch(() => {
      Alert.alert('Share via SMS', message);
    });
  };

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

  // 1. DOCTOR PROFILE VIEW (SIMPLIFIED)
  if (activeRole === 'DOCTOR') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Doctor Main Profile Card */}
        <CompactCard style={styles.profileCard}>
          <View style={styles.profileRow}>
            <DoctorAvatar gender="male" size={60} isHeadSurgeon={true} />
            <View style={styles.profileDetails}>
              <View style={styles.nameRow}>
                <Text style={styles.patientName}>{currentDoctor.name || 'Dr. Syed'}</Text>
                <Badge label="Consultant" variant="primary" size="sm" />
              </View>
              <Text style={styles.docSpecialtyText}>
                {currentDoctor.specialization || 'Consultant Specialist'}
              </Text>
              <Text style={styles.docMetaText}>
                {currentDoctor.qualification || 'MBBS, MD'} • Reg #MPMC-2026-9981
              </Text>
              <Text style={[styles.docMetaText, { color: colors.primary, marginTop: 2 }]}>
                alisamad9571@gmail.com
              </Text>
            </View>
          </View>
        </CompactCard>

        {/* OPD Schedule & Centers */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>OPD Schedule & Consultation Details</Text>
        </View>

        <CompactCard style={styles.infoCard}>
          <View style={styles.detailList}>
            <View style={styles.detailItemRow}>
              <View style={styles.detailIconBox}>
                <Icon name="clock" size={14} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>In-Clinic OPD Hours</Text>
                <Text style={styles.detailValue}>Mon – Sat: 09:00 AM – 02:00 PM</Text>
              </View>
            </View>

            <View style={styles.detailItemRow}>
              <View style={styles.detailIconBox}>
                <Icon name="video" size={14} color="#0F766E" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Telemedicine Video OPD</Text>
                <Text style={styles.detailValue}>Daily: 06:00 PM – 08:30 PM</Text>
              </View>
            </View>

            <View style={styles.detailItemRow}>
              <View style={styles.detailIconBox}>
                <Icon name="hospital" size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Hospital Network Branches</Text>
                <Text style={styles.detailValue}>Sarangpur, Shujalpur & Rajgarh</Text>
              </View>
            </View>

            <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailIconBox}>
                <Icon name="receipt" size={14} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Consultation Fee</Text>
                <Text style={styles.detailValue}>₹400 (In-Clinic) • ₹500 (Video OPD)</Text>
              </View>
            </View>
          </View>
        </CompactCard>

        {/* Sign Out Button */}
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
            JANSEVA AROGYAM Doctor Portal • {currentDoctor.name || 'Dr. Syed'}
          </Text>
        </View>
      </ScrollView>
    );
  }

  // 2. FRONT DESK PROFILE VIEW (SIMPLIFIED)
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

        {/* Shift & Counter Details */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shift & Counter Details</Text>
        </View>

        <CompactCard style={styles.infoCard}>
          <View style={styles.detailList}>
            <View style={styles.detailItemRow}>
              <View style={styles.detailIconBox}>
                <Icon name="clock" size={14} color={colors.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Reception Shift Hours</Text>
                <Text style={styles.detailValue}>Morning Shift: 08:30 AM – 03:00 PM</Text>
              </View>
            </View>

            <View style={styles.detailItemRow}>
              <View style={styles.detailIconBox}>
                <Icon name="hospital" size={14} color="#059669" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Assigned Branch Counter</Text>
                <Text style={styles.detailValue}>Sarangpur Main Branch • Counter 01</Text>
              </View>
            </View>

            <View style={[styles.detailItemRow, { borderBottomWidth: 0 }]}>
              <View style={styles.detailIconBox}>
                <Icon name="user-check" size={14} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.detailLabel}>Portal Access Role</Text>
                <Text style={styles.detailValue}>Front Desk Cashier & Token Manager</Text>
              </View>
            </View>
          </View>
        </CompactCard>

        {/* Logout */}
        <Button
          title="Sign Out Front Desk Account"
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
            SEVASADAN Front Desk Portal • Staff Reception
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

      {/* Refer & Earn Feature Card */}
      <View style={styles.sectionHeader}>
        <View style={styles.referralHeaderRow}>
          <Text style={styles.sectionTitle}>Refer & Earn Rewards</Text>
          <Badge label="₹150 Per Referral" variant="accent" size="sm" />
        </View>
        <Text style={styles.sectionSub}>
          Invite friends & family. They get ₹100 OFF and you earn ₹150 in health credits!
        </Text>
      </View>

      <CompactCard style={styles.referralCard}>
        {/* Top Referral Banner */}
        <View style={styles.referralTopBox}>
          <View style={styles.referralIconBox}>
            <Icon name="sparkles" size={18} color="#D97706" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.referralCardTitle}>Share Sevasadan Health Benefits</Text>
            <Text style={styles.referralCardSub}>
              Earn credits for OPD tokens, medicines & laboratory checkups
            </Text>
          </View>
        </View>

        {/* Unique Referral Code Box */}
        <View style={styles.codeContainer}>
          <View style={styles.codeTextCol}>
            <Text style={styles.codeLabel}>YOUR REFERRAL CODE</Text>
            <Text style={styles.codeValue}>{referralCode}</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={handleCopyReferralCode}
            style={styles.copyCodeBtn}
          >
            <Icon name="receipt" size={13} color={colors.primary} />
            <Text style={styles.copyCodeText}>COPY CODE</Text>
          </TouchableOpacity>
        </View>

        {/* Share Action Buttons */}
        <View style={styles.shareActionsRow}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShareWhatsApp}
            style={styles.whatsappShareBtn}
          >
            <Icon name="message-circle" size={14} color={colors.white} />
            <Text style={styles.whatsappShareText}>Share on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleShareSMS}
            style={styles.smsShareBtn}
          >
            <Icon name="share" size={13} color={colors.primary} />
            <Text style={styles.smsShareText}>Share SMS</Text>
          </TouchableOpacity>
        </View>

        {/* Referral Earnings Stats */}
        <View style={styles.referralStatsRow}>
          <View style={styles.referralStatItem}>
            <Text style={styles.referralStatNum}>3</Text>
            <Text style={styles.referralStatLabel}>Friends Invited</Text>
          </View>
          <View style={styles.referralStatSep} />
          <View style={styles.referralStatItem}>
            <Text style={[styles.referralStatNum, { color: '#059669' }]}>₹450</Text>
            <Text style={styles.referralStatLabel}>Total Earned</Text>
          </View>
          <View style={styles.referralStatSep} />
          <View style={styles.referralStatItem}>
            <Text style={[styles.referralStatNum, { color: colors.primary }]}>₹300</Text>
            <Text style={styles.referralStatLabel}>Wallet Balance</Text>
          </View>
        </View>

        {/* How It Works Steps */}
        <View style={styles.howItWorksBox}>
          <Text style={styles.howItWorksTitle}>How Refer & Earn Works:</Text>
          <View style={styles.howStepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Share code <Text style={{ fontWeight: 'bold' }}>{referralCode}</Text> with your friends.
            </Text>
          </View>
          <View style={styles.howStepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Friend books their 1st doctor OPD visit or lab test.
            </Text>
          </View>
          <View style={styles.howStepRow}>
            <View style={styles.stepBadge}>
              <Text style={styles.stepBadgeText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              They get ₹100 OFF & you get ₹150 instant health wallet cash!
            </Text>
          </View>
        </View>

        {/* Redeem Credits Button */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => openBookingModal()}
          style={styles.redeemBtn}
        >
          <Icon name="token" size={14} color={colors.white} />
          <Text style={styles.redeemBtnText}>Redeem ₹300 Credit on Next Booking</Text>
        </TouchableOpacity>
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
  detailList: {
    paddingVertical: 2,
  },
  detailItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 9.5,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 11.5,
    color: '#0F172A',
    fontWeight: '700',
    marginTop: 1,
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

  // Refer & Earn Styles
  referralHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  referralCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 12,
  },
  referralTopBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFBEB',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    marginBottom: 10,
  },
  referralIconBox: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#FDE68A',
    justifyContent: 'center',
    alignItems: 'center',
  },
  referralCardTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: '#92400E',
  },
  referralCardSub: {
    fontSize: typography.sizes.xxs,
    color: '#B45309',
    marginTop: 1,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderStyle: 'dashed',
    marginBottom: 10,
  },
  codeTextCol: {
    flex: 1,
  },
  codeLabel: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  codeValue: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    letterSpacing: 1,
    marginTop: 1,
  },
  copyCodeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    gap: 4,
  },
  copyCodeText: {
    fontSize: 10.5,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
  },
  shareActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  whatsappShareBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16A34A',
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  whatsappShareText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  smsShareBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primary,
    paddingVertical: 8,
    borderRadius: 6,
    gap: 6,
  },
  smsShareText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  referralStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    paddingVertical: 8,
    marginBottom: 10,
  },
  referralStatItem: {
    alignItems: 'center',
  },
  referralStatNum: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.extraBold,
    color: colors.text,
  },
  referralStatLabel: {
    fontSize: 9,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  referralStatSep: {
    width: 1,
    height: 18,
    backgroundColor: '#CBD5E1',
  },
  howItWorksBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  howItWorksTitle: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  howStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  stepBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepBadgeText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  stepText: {
    fontSize: 10,
    color: colors.textSecondary,
    flex: 1,
  },
  redeemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    borderRadius: 6,
    paddingVertical: 8,
    gap: 6,
  },
  redeemBtnText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
});
