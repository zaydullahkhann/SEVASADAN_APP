import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { Medication } from '../../types';
import { Icon } from '../../components/common/Icon';
import { Button } from '../../components/common/Button';

export const WritePrescriptionModal: React.FC = () => {
  const {
    isPrescriptionModalOpen,
    closePrescriptionModal,
    prescriptionModalApt,
    completeConsultation,
  } = useApp();

  const [diagnosis, setDiagnosis] = useState<string>('');
  const [advice, setAdvice] = useState<string>('Keep wound dry. Complete antibiotic course. Stay hydrated.');
  const [followUpDays, setFollowUpDays] = useState<number>(7);
  const [followUpAdvised, setFollowUpAdvised] = useState<boolean>(true);

  const [medications, setMedications] = useState<Medication[]>([
    {
      name: 'Syrup Cefixime (50mg/5ml)',
      dosage: '5 ml',
      frequency: '1-0-1 (BD)',
      duration: '5 Days',
      instructions: 'After milk or food',
    },
    {
      name: 'Syrup Paracetamol (120mg/5ml)',
      dosage: '4 ml',
      frequency: 'SOS for pain/fever',
      duration: '3 Days',
      instructions: 'With 6 hr gap',
    },
  ]);

  // New med input
  const [newMedName, setNewMedName] = useState<string>('');
  const [newMedDosage, setNewMedDosage] = useState<string>('1 Tab');
  const [newMedFreq, setNewMedFreq] = useState<string>('1-0-1');
  const [newMedDuration, setNewMedDuration] = useState<string>('5 Days');

  useEffect(() => {
    if (prescriptionModalApt) {
      setDiagnosis(
        prescriptionModalApt.reasonForVisit.includes('healing')
          ? 'Post-Operative Inguinal Herniotomy Review (Normal Healing)'
          : `Clinical Evaluation: ${prescriptionModalApt.reasonForVisit}`
      );
    }
  }, [prescriptionModalApt]);

  if (!prescriptionModalApt) return null;

  const handleAddMed = () => {
    if (!newMedName.trim()) {
      Alert.alert('Medication Name', 'Please enter a medicine name.');
      return;
    }
    setMedications((prev) => [
      ...prev,
      {
        name: newMedName.trim(),
        dosage: newMedDosage,
        frequency: newMedFreq,
        duration: newMedDuration,
        instructions: 'After food',
      },
    ]);
    setNewMedName('');
  };

  const handleRemoveMed = (index: number) => {
    setMedications((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSignAndIssue = () => {
    if (!diagnosis.trim()) {
      Alert.alert('Missing Diagnosis', 'Please enter a diagnosis.');
      return;
    }

    const calculatedFollowUpDate = '15 Sep 2026';

    completeConsultation(prescriptionModalApt.id, {
      patientName: prescriptionModalApt.patientName,
      patientPhone: prescriptionModalApt.patientPhone,
      doctorName: prescriptionModalApt.doctorName,
      doctorSpecialization: 'MCh Pediatric & Laparoscopic Surgeon',
      clinicName: prescriptionModalApt.clinicName,
      diagnosis,
      symptomsRecorded: prescriptionModalApt.symptoms,
      medications,
      advice,
      followUpDays,
      followUpDate: calculatedFollowUpDate,
      followUpAdvised,
    });

    closePrescriptionModal();
    Alert.alert(
      'Prescription Signed & Issued',
      `Prescription generated for ${prescriptionModalApt.patientName}.\nToken #${prescriptionModalApt.tokenNumber} marked as completed.`
    );
  };

  const diagnosisPresets = [
    'Post-Op Herniotomy Review',
    'Acute Pediatric Pharyngitis',
    'Type-2 Diabetes Management',
    'Fracture Immobilization Healing',
    'Child Acute Colic / Gastritis',
  ];

  return (
    <Modal
      visible={isPrescriptionModalOpen}
      animationType="slide"
      transparent={true}
      onRequestClose={closePrescriptionModal}
    >
      <View style={styles.backdrop}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.rxIconBox}>
                <Icon name="prescription" size={16} color={colors.white} />
              </View>
              <View>
                <Text style={styles.headerTitle}>Write & Sign Prescription</Text>
                <Text style={styles.headerSub}>
                  {prescriptionModalApt.patientName} ({prescriptionModalApt.patientAge}y, {prescriptionModalApt.patientGender}) • Token #{prescriptionModalApt.tokenNumber}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={closePrescriptionModal} style={styles.closeBtn}>
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {/* Diagnosis Section */}
            <Text style={styles.sectionLabel}>1. Diagnosis & Clinical Findings *</Text>
            <TextInput
              value={diagnosis}
              onChangeText={setDiagnosis}
              placeholder="e.g. Post-Operative Inguinal Herniotomy Review"
              style={styles.input}
              placeholderTextColor={colors.textLight}
            />

            {/* Quick Presets */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
              {diagnosisPresets.map((preset) => (
                <TouchableOpacity
                  key={preset}
                  onPress={() => setDiagnosis(preset)}
                  style={styles.presetChip}
                >
                  <Text style={styles.presetText}>{preset}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Medications Table */}
            <Text style={[styles.sectionLabel, { marginTop: 10 }]}>
              2. Prescribed Medications ({medications.length})
            </Text>

            {medications.map((med, idx) => (
              <View key={idx} style={styles.medRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.medTitle}>{med.name}</Text>
                  <Text style={styles.medSub}>
                    {med.dosage} • {med.frequency} • {med.duration} • {med.instructions}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMed(idx)}
                  style={styles.removeMedBtn}
                >
                  <Icon name="close" size={11} color={colors.danger} />
                </TouchableOpacity>
              </View>
            ))}

            {/* Add Medication Box */}
            <View style={styles.addMedBox}>
              <Text style={styles.addMedLabel}>+ Add Medicine</Text>
              <TextInput
                value={newMedName}
                onChangeText={setNewMedName}
                placeholder="Medicine Name (e.g. Syrup Amox-Clav)"
                style={styles.miniInput}
                placeholderTextColor={colors.textLight}
              />
              <View style={styles.medMetaRow}>
                <TextInput
                  value={newMedDosage}
                  onChangeText={setNewMedDosage}
                  placeholder="Dosage"
                  style={[styles.miniInput, { flex: 1 }]}
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  value={newMedFreq}
                  onChangeText={setNewMedFreq}
                  placeholder="Freq (1-0-1)"
                  style={[styles.miniInput, { flex: 1 }]}
                  placeholderTextColor={colors.textLight}
                />
                <TextInput
                  value={newMedDuration}
                  onChangeText={setNewMedDuration}
                  placeholder="Duration"
                  style={[styles.miniInput, { flex: 1 }]}
                  placeholderTextColor={colors.textLight}
                />
                <Button
                  title="Add"
                  onPress={handleAddMed}
                  variant="primary"
                  size="sm"
                  style={{ paddingVertical: 4, paddingHorizontal: 10 }}
                />
              </View>
            </View>

            {/* Clinical Advice */}
            <Text style={[styles.sectionLabel, { marginTop: 10 }]}>3. Doctor's Advice & Diet</Text>
            <TextInput
              value={advice}
              onChangeText={setAdvice}
              placeholder="Advice to patient..."
              multiline
              numberOfLines={2}
              style={[styles.input, { minHeight: 45 }]}
              placeholderTextColor={colors.textLight}
            />

            {/* Follow-up Advised (Journey 4 Link) */}
            <View style={styles.followUpRow}>
              <TouchableOpacity
                onPress={() => setFollowUpAdvised(!followUpAdvised)}
                style={[styles.checkbox, followUpAdvised && styles.checkboxActive]}
              >
                {followUpAdvised && <Icon name="check" size={11} color={colors.white} />}
              </TouchableOpacity>
              <View style={{ flex: 1 }}>
                <Text style={styles.followUpTitle}>Advise Follow-up Appointment</Text>
                <Text style={styles.followUpSub}>
                  Patient will receive a 1-tap "Book Advised Follow-up" prompt in their app
                </Text>
              </View>
              <View style={styles.daysChips}>
                {[7, 14, 30].map((days) => (
                  <TouchableOpacity
                    key={days}
                    onPress={() => {
                      setFollowUpDays(days);
                      setFollowUpAdvised(true);
                    }}
                    style={[
                      styles.dayChip,
                      followUpDays === days && followUpAdvised && styles.dayChipActive,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayChipText,
                        followUpDays === days && followUpAdvised && styles.dayChipTextActive,
                      ]}
                    >
                      {days}d
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View style={styles.footer}>
            <Button
              title="Cancel"
              onPress={closePrescriptionModal}
              variant="outline"
              size="sm"
              style={{ flex: 1 }}
            />
            <Button
              title="Sign & Issue Prescription"
              onPress={handleSignAndIssue}
              variant="secondary"
              size="sm"
              icon="check"
              style={{ flex: 2 }}
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
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    padding: spacing.screenPaddingHorizontal,
  },
  container: {
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusMd,
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    padding: 10,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  rxIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.white,
  },
  headerSub: {
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
  sectionLabel: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 4,
    textTransform: 'uppercase',
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
  presetsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  presetChip: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 4,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginRight: 4,
  },
  presetText: {
    fontSize: 9,
    color: colors.primary,
  },
  medRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F9FF',
    borderRadius: 6,
    padding: 6,
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  medTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  medSub: {
    fontSize: 9,
    color: colors.textMuted,
    marginTop: 1,
  },
  removeMedBtn: {
    padding: 4,
  },
  addMedBox: {
    backgroundColor: colors.surfaceSecondary,
    borderRadius: spacing.borderRadiusSm,
    padding: 6,
    marginVertical: 6,
  },
  addMedLabel: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  miniInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: typography.sizes.xxs + 1,
    color: colors.text,
    marginBottom: 4,
  },
  medMetaRow: {
    flexDirection: 'row',
    gap: 4,
    alignItems: 'center',
  },
  followUpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: spacing.borderRadiusSm,
    padding: 8,
    marginTop: 8,
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
  followUpTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  followUpSub: {
    fontSize: 8.5,
    color: colors.textSecondary,
  },
  daysChips: {
    flexDirection: 'row',
    gap: 3,
  },
  dayChip: {
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dayChipActive: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  dayChipText: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
  },
  dayChipTextActive: {
    color: colors.white,
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
