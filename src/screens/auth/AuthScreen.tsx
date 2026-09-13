import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { UserRole, DEMO_CREDENTIALS } from '../../types';
import { Icon, IconName } from '../../components/common/Icon';
import { HospitalLogo } from '../../components/common/HospitalLogo';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const AuthScreen: React.FC = () => {
  const { login, signup } = useApp();

  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [selectedRole, setSelectedRole] = useState<UserRole>('PATIENT');

  // Login inputs
  const [loginId, setLoginId] = useState<string>('9826000000');
  const [loginPass, setLoginPass] = useState<string>('patient123');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Register inputs (Patient)
  const [regName, setRegName] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regAge, setRegAge] = useState<string>('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regCity, setRegCity] = useState<string>('Sarangpur');
  const [regPass, setRegPass] = useState<string>('pass123');

  const currentDemo = DEMO_CREDENTIALS[selectedRole];

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    const demo = DEMO_CREDENTIALS[role];
    setLoginId(demo.id);
    setLoginPass(demo.pass);
  };

  const handleManualLogin = () => {
    if (!loginId.trim()) {
      Alert.alert('Missing Field', 'Please enter your ID, email, or mobile number.');
      return;
    }
    if (!loginPass.trim()) {
      Alert.alert('Missing Field', 'Please enter your password.');
      return;
    }

    const success = login(loginId, loginPass, selectedRole);
    if (!success) {
      Alert.alert(
        'Login Failed',
        'Invalid credentials. Please use the Demo Credentials or enter valid credentials.'
      );
    }
  };

  const handleAutoFillAndLogin = () => {
    setLoginId(currentDemo.id);
    setLoginPass(currentDemo.pass);
    login(currentDemo.id, currentDemo.pass, selectedRole);
  };

  const handleRegisterPatient = () => {
    if (!regName.trim()) {
      Alert.alert('Missing Field', 'Please enter full patient name.');
      return;
    }
    if (!regPhone.trim() || regPhone.replace(/[^0-9]/g, '').length < 10) {
      Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    if (!regAge.trim()) {
      Alert.alert('Missing Field', 'Please enter age.');
      return;
    }

    signup({
      name: regName.trim(),
      phone: regPhone.trim(),
      age: regAge.trim(),
      gender: regGender,
      city: regCity.trim(),
      pass: regPass,
    });
  };

  const handleCallHelpline = () => {
    const helpline = '18007382723';
    Linking.openURL(`tel:${helpline}`).catch(() => {
      Alert.alert(
        '24x7 Emergency Helpline',
        'Unable to open phone dialer automatically. Please call Toll-Free: 1800-7382-723 or +91 98260 11223'
      );
    });
  };

  const rolesConfig: { role: UserRole; label: string; icon: IconName }[] = [
    { role: 'PATIENT', label: 'Patient', icon: 'user' },
    { role: 'DOCTOR', label: 'Doctor', icon: 'stethoscope' },
    { role: 'FRONT_DESK', label: 'Front Desk', icon: 'desk' },
    { role: 'ADMIN', label: 'Admin', icon: 'shield-check' },
  ];

  return (
    <KeyboardAvoidingView
      style={styles.keyboardRoot}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Banner */}
        <View style={styles.brandHero}>
          <HospitalLogo size={46} badgeBg="#FFFFFF" color={colors.primary} style={styles.logoBadge} />
          <Text style={styles.brandName}>SEVASADAN</Text>
          <Text style={styles.brandTag}>
            SUPER SPECIALTY OPD & TELEMEDICINE NETWORK
          </Text>
          <Text style={styles.doctorHonors}>
            Dr. Ankur Deshwali (MBBS, MS, MCh) • 3× MPPSC Gazetted Specialist
          </Text>
          <Text style={styles.branchesSubtitle}>
            Sarangpur • Shujalpur • Rajgarh • Biaora (MP)
          </Text>
        </View>

        {/* Main Auth Card */}
        <View style={styles.authCard}>
          {/* Sign In vs Register Toggle */}
          <View style={styles.authToggleRow}>
            <TouchableOpacity
              onPress={() => setAuthMode('LOGIN')}
              style={[
                styles.authToggleBtn,
                authMode === 'LOGIN' && styles.authToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.authToggleText,
                  authMode === 'LOGIN' && styles.authToggleTextActive,
                ]}
              >
                Sign In
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setAuthMode('REGISTER')}
              style={[
                styles.authToggleBtn,
                authMode === 'REGISTER' && styles.authToggleBtnActive,
              ]}
            >
              <Text
                style={[
                  styles.authToggleText,
                  authMode === 'REGISTER' && styles.authToggleTextActive,
                ]}
              >
                Register Patient
              </Text>
            </TouchableOpacity>
          </View>

          {authMode === 'LOGIN' ? (
            /* 1. SIGN IN MODE */
            <View style={styles.formContainer}>
              {/* Role Selector Tabs */}
              <Text style={styles.formLabel}>Select Account Role:</Text>
              <View style={styles.roleChipsRow}>
                {rolesConfig.map((item) => {
                  const isSelected = selectedRole === item.role;
                  return (
                    <TouchableOpacity
                      key={item.role}
                      onPress={() => handleRoleChange(item.role)}
                      style={[
                        styles.roleChip,
                        isSelected && styles.roleChipActive,
                      ]}
                    >
                      <Icon
                        name={item.icon}
                        size={13}
                        color={isSelected ? colors.primary : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.roleChipText,
                          isSelected && styles.roleChipTextActive,
                        ]}
                      >
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Demo Credentials Box */}
              <View style={styles.demoCard}>
                <View style={styles.demoTopRow}>
                  <View style={styles.demoTitleWrap}>
                    <Text style={styles.demoTitle}>
                      Demo Credentials ({currentDemo.name})
                    </Text>
                    <Text style={styles.demoSubtitle}>{currentDemo.subtitle}</Text>
                  </View>
                  <Badge label="1-TAP READY" variant="success" size="sm" />
                </View>

                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>ID / Phone:</Text>
                  <Text style={styles.credValue}>{currentDemo.id}</Text>
                </View>

                <View style={styles.credRow}>
                  <Text style={styles.credLabel}>Password:</Text>
                  <Text style={styles.credValue}>{currentDemo.pass}</Text>
                </View>

                <Button
                  title={`Auto-Fill & Sign In as ${selectedRole}`}
                  onPress={handleAutoFillAndLogin}
                  variant="secondary"
                  size="sm"
                  icon="check"
                  fullWidth
                  style={styles.autoFillBtn}
                />
              </View>

              {/* Manual Input Fields */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>
                  {selectedRole === 'PATIENT'
                    ? 'Registered Mobile Number *'
                    : selectedRole === 'DOCTOR'
                    ? 'Doctor ID / Email *'
                    : selectedRole === 'FRONT_DESK'
                    ? 'Desk Operator ID *'
                    : 'Admin Email / Username *'}
                </Text>
                <TextInput
                  value={loginId}
                  onChangeText={setLoginId}
                  placeholder={
                    selectedRole === 'PATIENT'
                      ? '10-digit mobile number'
                      : 'Enter username or ID'
                  }
                  keyboardType={
                    selectedRole === 'PATIENT' ? 'phone-pad' : 'email-address'
                  }
                  autoCapitalize="none"
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passHeader}>
                  <Text style={styles.inputLabel}>Password / PIN *</Text>
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Text style={styles.showPassText}>
                      {showPassword ? 'Hide' : 'Show'}
                    </Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  value={loginPass}
                  onChangeText={setLoginPass}
                  placeholder="Enter account password"
                  secureTextEntry={!showPassword}
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <Button
                title="Sign In to Dashboard"
                onPress={handleManualLogin}
                variant="primary"
                size="md"
                icon="token"
                fullWidth
                style={styles.signInBtn}
              />
            </View>
          ) : (
            /* 2. REGISTER NEW PATIENT MODE */
            <View style={styles.formContainer}>
              <Text style={styles.regTitle}>Create Sevasadan Patient Profile</Text>
              <Text style={styles.regSubtitle}>
                Get your digital UHID for In-Clinic OPD passes & Video Telemedicine
              </Text>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Patient Full Name *</Text>
                <TextInput
                  value={regName}
                  onChangeText={setRegName}
                  placeholder="e.g. Ramesh Chandra"
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Mobile Phone Number *</Text>
                <TextInput
                  value={regPhone}
                  onChangeText={setRegPhone}
                  placeholder="10-digit phone number"
                  keyboardType="phone-pad"
                  maxLength={10}
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.splitRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.inputLabel}>Age *</Text>
                  <TextInput
                    value={regAge}
                    onChangeText={setRegAge}
                    placeholder="e.g. 28"
                    keyboardType="numeric"
                    style={styles.textInput}
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={{ flex: 1.5 }}>
                  <Text style={styles.inputLabel}>Gender *</Text>
                  <View style={styles.genderRow}>
                    {(['Male', 'Female', 'Other'] as const).map((g) => (
                      <TouchableOpacity
                        key={g}
                        onPress={() => setRegGender(g)}
                        style={[
                          styles.genderChip,
                          regGender === g && styles.genderChipActive,
                        ]}
                      >
                        <Text
                          style={[
                            styles.genderText,
                            regGender === g && styles.genderTextActive,
                          ]}
                        >
                          {g}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Home Town / District *</Text>
                <TextInput
                  value={regCity}
                  onChangeText={setRegCity}
                  placeholder="e.g. Sarangpur, Rajgarh, Shujalpur"
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Create Password *</Text>
                <TextInput
                  value={regPass}
                  onChangeText={setRegPass}
                  placeholder="Create a password"
                  secureTextEntry
                  style={styles.textInput}
                  placeholderTextColor={colors.textLight}
                />
              </View>

              <Button
                title="Complete Registration & Enter"
                onPress={handleRegisterPatient}
                variant="secondary"
                size="md"
                icon="check"
                fullWidth
                style={styles.signInBtn}
              />
            </View>
          )}
        </View>

        {/* 24x7 Emergency Help Bar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleCallHelpline}
          accessibilityRole="button"
          accessibilityLabel="Call 24x7 Medical Emergency Helpline 1800-7382-723"
          style={styles.footerHelpline}
        >
          <View style={styles.helplineIconWrap}>
            <Icon name="phone" size={13} color={colors.white} />
          </View>
          <View style={styles.helplineTextCol}>
            <Text style={styles.helplineTitle}>24x7 Medical Emergency Helpline</Text>
            <Text style={styles.helplineSub}>
              Toll-Free: <Text style={styles.helplineNumHighlight}>1800-7382-723</Text> • Tap to Call
            </Text>
          </View>
          <Icon name="chevron-right" size={14} color={colors.accent} />
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  container: {
    flex: 1,
    backgroundColor: colors.primary,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 16,
    paddingBottom: 32,
  },
  brandHero: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    marginBottom: 8,
  },
  brandName: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.extraBold,
    color: colors.white,
    letterSpacing: 1,
  },
  brandTag: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.accent,
    letterSpacing: 0.5,
    marginTop: 2,
  },
  doctorHonors: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
    marginTop: 4,
    textAlign: 'center',
  },
  branchesSubtitle: {
    fontSize: 9,
    color: colors.accentLight,
    marginTop: 2,
  },
  authCard: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  authToggleRow: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 3,
    marginBottom: 12,
  },
  authToggleBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 5,
  },
  authToggleBtnActive: {
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  authToggleText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  authToggleTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  formContainer: {
    gap: 8,
  },
  formLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 4,
  },
  roleChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: spacing.borderRadiusSm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1.5,
    borderColor: colors.border,
    gap: 4,
  },
  roleChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  roleChipText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  roleChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  demoCard: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    borderRadius: spacing.borderRadiusSm + 2,
    padding: 8,
    marginVertical: 4,
  },
  demoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  demoTitleWrap: {
    flex: 1,
  },
  demoTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  demoSubtitle: {
    fontSize: 9,
    color: colors.textMuted,
  },
  credRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 1,
  },
  credLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  credValue: {
    fontSize: typography.sizes.xxs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.primaryDark,
    fontFamily: 'monospace',
  },
  autoFillBtn: {
    marginTop: 6,
  },
  inputGroup: {
    gap: 3,
  },
  inputLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    textTransform: 'uppercase',
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 7,
    paddingHorizontal: 10,
    fontSize: typography.sizes.xs + 1,
    color: colors.text,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  showPassText: {
    fontSize: typography.sizes.xxs,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  signInBtn: {
    marginTop: 6,
  },
  regTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  regSubtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginBottom: 4,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 3,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 7,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    alignItems: 'center',
  },
  genderChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderText: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  genderTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  footerHelpline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryDark,
    borderRadius: spacing.borderRadiusMd,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.35)',
  },
  helplineIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  helplineTextCol: {
    flex: 1,
  },
  helplineTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  helplineSub: {
    fontSize: typography.sizes.xxs,
    color: colors.accentLight,
    marginTop: 1,
  },
  helplineNumHighlight: {
    fontWeight: typography.weights.bold,
    color: colors.accent,
  },
});
