import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { CLINICS } from '../../data/clinics';
import { DOCTORS } from '../../data/doctors';
import { REGISTERED_PATIENTS } from '../../data/mockData';
import { Icon } from '../common/Icon';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const WalkInModal: React.FC = () => {
  const { isWalkInModalOpen, closeWalkInModal, createAppointment, queueStatuses } = useApp();

  const [clinicId, setClinicId] = useState<string>('sarangpur');
  const [doctorId, setDoctorId] = useState<string>('doc-ankur');
  const [phone, setPhone] = useState<string>('');
  const [name, setName] = useState<string>('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [reason, setReason] = useState<string>('Walk-in General Checkup');
  const [cashCollected, setCashCollected] = useState<boolean>(true);

  const selectedClinic = CLINICS.find((c) => c.id === clinicId) || CLINICS[0];
  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
  const currentQueue = queueStatuses[clinicId];

  const handlePhoneLookup = (text: string) => {
    setPhone(text);
    const clean = text.replace(/[^0-9]/g, '');
    const found = REGISTERED_PATIENTS.find((p) => p.phone === clean);
    if (found) {
      setName(found.name);
      setAge(found.age);
      setGender(found.gender);
    }
  };

  const handleIssueToken = () => {
    if (!name.trim()) {
      Alert.alert('Missing Field', 'Please enter patient name.');
      return;
    }
    if (!phone.trim() || phone.length < 10) {
      Alert.alert('Missing Field', 'Please enter 10-digit mobile number.');
      return;
    }

    const apt = createAppointment({
      consultationMode: 'IN_CLINIC',
      patientType: 'NEW',
      clinicId: selectedClinic.id,
      clinicName: selectedClinic.name,
      doctorId: selectedDoctor.id,
      doctorName: selectedDoctor.name,
      date: 'Today',
      timeSlot: 'Walk-in Immediate',
      patientName: name,
      patientPhone: phone.replace(/[^0-9]/g, ''),
      patientAge: age || '25',
      patientGender: gender,
      reasonForVisit: reason,
      symptoms: ['Walk-in OPD Entry'],
      status: 'CONFIRMED',
      paymentMethod: 'CASH_COUNTER',
      paymentStatus: cashCollected ? 'PAID' : 'PENDING',
      feePaid: selectedDoctor.consultationFeeClinic,
      telemedicineConsentAccepted: true,
      isWalkIn: true,
    });

    Alert.alert(
      'Walk-In Token Allotted!',
      `Token #${apt.tokenNumber} printed for ${apt.patientName}.\nBranch: ${selectedClinic.shortName}\nPosition in Queue: #${apt.tokenIndex}`,
      [{ text: 'OK', onPress: closeWalkInModal }]
    );
  };

  return (
    <Modal
      visible={isWalkInModalOpen}
      animationType="fade"
      transparent={true}
      onRequestClose={closeWalkInModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.deskIconBox}>
                <Icon name="token" size={16} color={colors.white} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Walk-In Token Desk</Text>
                <Text style={styles.headerSubtitle}>
                  Reception & OPD Counter Quick Entry
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeWalkInModal} style={styles.closeBtn}>
              <Icon name="close" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Live Queue Banner */}
            <View style={styles.queueBanner}>
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>Current Serving</Text>
                <Text style={styles.queueVal}>
                  {currentQueue?.currentServingToken || 'SAR-001'}
                </Text>
              </View>
              <View style={styles.queueDivider} />
              <View style={styles.queueItem}>
                <Text style={styles.queueLabel}>Next Available</Text>
                <Text style={styles.queueValNext}>
                  {selectedClinic.tokenPrefix}-
                  {String((currentQueue?.totalIssuedToday || 1) + 1).padStart(3, '0')}
                </Text>
              </View>
            </View>

            {/* Branch Selector */}
            <Text style={styles.fieldLabel}>Select Clinic Counter</Text>
            <View style={styles.chipsRow}>
              {CLINICS.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  onPress={() => setClinicId(c.id)}
                  style={[
                    styles.chip,
                    clinicId === c.id && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      clinicId === c.id && styles.chipTextActive,
                    ]}
                  >
                    {c.shortName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Doctor Selector */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>Assigning Doctor</Text>
            <View style={styles.chipsRow}>
              {DOCTORS.map((d) => (
                <TouchableOpacity
                  key={d.id}
                  onPress={() => setDoctorId(d.id)}
                  style={[
                    styles.chip,
                    doctorId === d.id && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      doctorId === d.id && styles.chipTextActive,
                    ]}
                  >
                    {d.name.split(' ')[1]} (₹{d.consultationFeeClinic})
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Patient Lookup by Phone */}
            <Text style={[styles.fieldLabel, { marginTop: 10 }]}>
              Patient Mobile (Auto-Lookup) *
            </Text>
            <TextInput
              value={phone}
              onChangeText={handlePhoneLookup}
              placeholder="Enter 10-digit mobile"
              keyboardType="phone-pad"
              maxLength={10}
              style={styles.input}
              placeholderTextColor={colors.textLight}
            />

            {/* Patient Name */}
            <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Patient Name *</Text>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="e.g. Ramesh Kumar"
              style={styles.input}
              placeholderTextColor={colors.textLight}
            />

            {/* Age & Gender */}
            <View style={styles.splitRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Age</Text>
                <TextInput
                  value={age}
                  onChangeText={setAge}
                  placeholder="Age"
                  keyboardType="numeric"
                  style={styles.input}
                  placeholderTextColor={colors.textLight}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.genderRow}>
                  {(['Male', 'Female'] as const).map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => setGender(g)}
                      style={[
                        styles.genderBtn,
                        gender === g && styles.genderBtnActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.genderBtnText,
                          gender === g && styles.genderBtnTextActive,
                        ]}
                      >
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Visit Reason */}
            <Text style={[styles.fieldLabel, { marginTop: 8 }]}>Reason for Visit</Text>
            <TextInput
              value={reason}
              onChangeText={setReason}
              placeholder="e.g. Fever, wound dressing, child health check"
              style={styles.input}
              placeholderTextColor={colors.textLight}
            />

            {/* Cash Collection Check */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setCashCollected(!cashCollected)}
              style={styles.cashToggleRow}
            >
              <View style={[styles.checkbox, cashCollected && styles.checkboxActive]}>
                {cashCollected && <Icon name="check" size={11} color={colors.white} />}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cashTitle}>
                  Cash ₹{selectedDoctor.consultationFeeClinic} Collected at Counter
                </Text>
                <Text style={styles.cashSub}>
                  Record transaction & issue printed slip
                </Text>
              </View>
              <Badge
                label={cashCollected ? 'PAID' : 'DUE'}
                variant={cashCollected ? 'success' : 'danger'}
                size="sm"
              />
            </TouchableOpacity>
          </ScrollView>

          {/* Footer Actions */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={closeWalkInModal}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <Button
              title="Generate Token Now"
              onPress={handleIssueToken}
              variant="secondary"
              size="sm"
              icon="token"
              style={{ flex: 1.5 }}
            />
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
    maxHeight: '85%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: colors.primaryDark,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deskIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: typography.sizes.xxs,
    color: colors.primaryLight,
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
  },
  queueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: spacing.borderRadiusSm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  queueItem: {
    flex: 1,
    alignItems: 'center',
  },
  queueLabel: {
    fontSize: 8.5,
    color: colors.textMuted,
    fontWeight: typography.weights.bold,
    textTransform: 'uppercase',
  },
  queueVal: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  queueValNext: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  queueDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  fieldLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 3,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  chip: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: spacing.borderRadiusSm,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.xxs + 0.5,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  chipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 6,
    paddingHorizontal: 8,
    fontSize: typography.sizes.xs + 0.5,
    color: colors.text,
  },
  splitRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genderBtn: {
    flex: 1,
    paddingVertical: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: spacing.borderRadiusSm,
    alignItems: 'center',
  },
  genderBtnActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  genderBtnText: {
    fontSize: typography.sizes.xxs + 1,
    color: colors.textSecondary,
  },
  genderBtnTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  cashToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: spacing.borderRadiusSm,
    padding: 8,
    marginTop: 10,
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.secondaryDark,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: colors.secondary,
  },
  cashTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  cashSub: {
    fontSize: 9,
    color: colors.textMuted,
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.white,
  },
});
