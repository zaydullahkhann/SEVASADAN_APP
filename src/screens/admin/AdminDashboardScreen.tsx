import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { useApp } from '../../context/AppContext';
import { CLINICS } from '../../data/clinics';
import { Icon } from '../../components/common/Icon';
import { Badge } from '../../components/common/Badge';
import { CompactCard } from '../../components/common/CompactCard';
import { Button } from '../../components/common/Button';

export const AdminDashboardScreen: React.FC = () => {
  const {
    doctors,
    updateDoctorFee,
    updateDoctorBranches,
    toggleDoctorActive,
    queueStatuses,
    deskRegisters,
  } = useApp();

  const [editingDoctorId, setEditingDoctorId] = useState<string | null>(null);
  const [clinicFeeInput, setClinicFeeInput] = useState<string>('');
  const [onlineFeeInput, setOnlineFeeInput] = useState<string>('');

  // Aggregated Hospital Metrics across 4 branches
  const totalTokensToday = Object.values(queueStatuses).reduce(
    (acc, q) => acc + q.totalIssuedToday,
    0
  );

  const totalRevenue = Object.values(deskRegisters).reduce(
    (acc, r) => acc + (r.cashCollected + r.upiCollected),
    0
  );

  const handleStartEdit = (docId: string, currentClinicFee: number, currentOnlineFee: number) => {
    setEditingDoctorId(docId);
    setClinicFeeInput(String(currentClinicFee));
    setOnlineFeeInput(String(currentOnlineFee));
  };

  const handleSaveDoctor = (docId: string) => {
    const cFee = parseInt(clinicFeeInput, 10);
    const oFee = parseInt(onlineFeeInput, 10);

    if (isNaN(cFee) || isNaN(oFee) || cFee <= 0 || oFee <= 0) {
      Alert.alert('Invalid Fee', 'Please enter valid numerical consultation fees.');
      return;
    }

    updateDoctorFee(docId, cFee, oFee);
    setEditingDoctorId(null);
    Alert.alert('Doctor Updated', 'Consultation fee updated across the network.');
  };

  const handleToggleBranch = (docId: string, currentBranches: string[], branchId: string) => {
    let newBranches: string[];
    if (currentBranches.includes(branchId)) {
      if (currentBranches.length === 1) {
        Alert.alert('Branch Required', 'A doctor must cover at least 1 clinic branch.');
        return;
      }
      newBranches = currentBranches.filter((b) => b !== branchId);
    } else {
      newBranches = [...currentBranches, branchId];
    }
    updateDoctorBranches(docId, newBranches);
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Hospital Executive Overview */}
      <CompactCard style={styles.execCard} borderAccent="#7C3AED">
        <View style={styles.execHeader}>
          <View>
            <Text style={styles.execTitle}>HOSPITAL EXECUTIVE DASHBOARD</Text>
            <Text style={styles.execSubtitle}>4 Branches Network Overview</Text>
          </View>
          <Badge label="Super Admin" variant="purple" size="sm" />
        </View>

        <View style={styles.metricsGrid}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{totalTokensToday}</Text>
            <Text style={styles.metricLbl}>Patients Today</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: colors.secondaryDark }]}>
              ₹{totalRevenue.toLocaleString()}
            </Text>
            <Text style={styles.metricLbl}>Total OPD Revenue</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={[styles.metricVal, { color: colors.primary }]}>
              {doctors.filter((d) => d.isActive !== false).length}/{doctors.length}
            </Text>
            <Text style={styles.metricLbl}>Doctors On Duty</Text>
          </View>
        </View>
      </CompactCard>

      {/* 2. Branch Footfall & Revenue Breakdown */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Branch Performance Breakdown</Text>
        <Text style={styles.sectionSub}>Real-time token and collection statistics</Text>
      </View>

      <View style={styles.branchesGrid}>
        {CLINICS.map((clinic) => {
          const q = queueStatuses[clinic.id];
          const reg = deskRegisters[clinic.id];
          const branchTotal = reg ? reg.cashCollected + reg.upiCollected : 0;

          return (
            <CompactCard key={clinic.id} style={styles.branchMetricCard}>
              <View style={styles.branchTopRow}>
                <Text style={styles.branchShortName}>{clinic.shortName}</Text>
                <Badge label={`Prefix ${clinic.tokenPrefix}`} variant="neutral" size="sm" />
              </View>
              <View style={styles.branchStatsRow}>
                <View>
                  <Text style={styles.branchStatVal}>{q?.totalIssuedToday || 0}</Text>
                  <Text style={styles.branchStatLbl}>Tokens</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.branchStatVal}>₹{branchTotal}</Text>
                  <Text style={styles.branchStatLbl}>Collected</Text>
                </View>
              </View>
            </CompactCard>
          );
        })}
      </View>

      {/* 3. Manage All Doctors (Core User Request) */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionTitle}>Doctor Management Console</Text>
          <Badge label={`${doctors.length} Doctors`} variant="primary" size="sm" />
        </View>
        <Text style={styles.sectionSub}>
          Edit consultation fees, clinic branch coverage, and duty status
        </Text>
      </View>

      {doctors.map((doc) => {
        const isEditing = editingDoctorId === doc.id;
        return (
          <CompactCard
            key={doc.id}
            style={styles.docAdminCard}
            borderAccent={doc.isHeadSurgeon ? colors.primary : colors.secondary}
          >
            {/* Doctor Info Header */}
            <View style={styles.docAdminTop}>
              <View style={styles.docAvatarCircle}>
                <Icon
                  name={doc.isHeadSurgeon ? 'baby' : 'stethoscope'}
                  size={16}
                  color={colors.primary}
                />
              </View>

              <View style={styles.docAdminInfo}>
                <View style={styles.docAdminNameRow}>
                  <Text style={styles.docAdminName}>{doc.name}</Text>
                  {doc.isHeadSurgeon && (
                    <Badge label="Lead Surgeon" variant="primary" size="sm" />
                  )}
                </View>
                <Text style={styles.docAdminSpecialty}>{doc.specialization}</Text>
                <Text style={styles.docAdminQual}>{doc.qualification}</Text>
              </View>

              <TouchableOpacity
                onPress={() => toggleDoctorActive(doc.id, !doc.isActive)}
                style={styles.activeToggle}
              >
                <Badge
                  label={doc.isActive !== false ? 'ACTIVE' : 'ON LEAVE'}
                  variant={doc.isActive !== false ? 'success' : 'danger'}
                  size="sm"
                />
              </TouchableOpacity>
            </View>

            {/* Fee Management Form */}
            {isEditing ? (
              <View style={styles.editFeeBox}>
                <Text style={styles.editFeeTitle}>Edit Consultation Fees</Text>
                <View style={styles.editInputsRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLbl}>Clinic OPD Fee (₹)</Text>
                    <TextInput
                      value={clinicFeeInput}
                      onChangeText={setClinicFeeInput}
                      keyboardType="numeric"
                      style={styles.feeInput}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.fieldLbl}>Video Tele-OPD (₹)</Text>
                    <TextInput
                      value={onlineFeeInput}
                      onChangeText={setOnlineFeeInput}
                      keyboardType="numeric"
                      style={styles.feeInput}
                    />
                  </View>
                </View>
                <View style={styles.editActionsRow}>
                  <Button
                    title="Cancel"
                    onPress={() => setEditingDoctorId(null)}
                    variant="outline"
                    size="sm"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Save Fees"
                    onPress={() => handleSaveDoctor(doc.id)}
                    variant="secondary"
                    size="sm"
                    icon="check"
                    style={{ flex: 1.5 }}
                  />
                </View>
              </View>
            ) : (
              <View style={styles.feeDisplayRow}>
                <View style={styles.feeDisplayItem}>
                  <Text style={styles.feeDisplayLbl}>In-Clinic OPD Fee</Text>
                  <Text style={styles.feeDisplayVal}>₹{doc.consultationFeeClinic}</Text>
                </View>
                <View style={styles.feeDisplayItem}>
                  <Text style={styles.feeDisplayLbl}>Video Tele-OPD Fee</Text>
                  <Text style={styles.feeDisplayVal}>₹{doc.consultationFeeOnline}</Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    handleStartEdit(
                      doc.id,
                      doc.consultationFeeClinic,
                      doc.consultationFeeOnline
                    )
                  }
                  style={styles.editBtn}
                >
                  <Text style={styles.editBtnText}>Edit Fees</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Clinic Coverage Assignment */}
            <View style={styles.branchesAssignmentBox}>
              <Text style={styles.coverageLabel}>Assigned Clinic Branches:</Text>
              <View style={styles.branchesChipsRow}>
                {CLINICS.map((clinic) => {
                  const isAssigned = doc.clinicsCovered.includes(clinic.id);
                  return (
                    <TouchableOpacity
                      key={clinic.id}
                      onPress={() =>
                        handleToggleBranch(doc.id, doc.clinicsCovered, clinic.id)
                      }
                      style={[
                        styles.branchToggleChip,
                        isAssigned && styles.branchToggleChipActive,
                      ]}
                    >
                      {isAssigned && (
                        <Icon name="check" size={9} color={colors.white} />
                      )}
                      <Text
                        style={[
                          styles.branchToggleText,
                          isAssigned && styles.branchToggleTextActive,
                        ]}
                      >
                        {clinic.shortName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </CompactCard>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 8,
    paddingBottom: 24,
  },
  execCard: {
    backgroundColor: '#FAF5FF',
    borderColor: '#DDD6FE',
    marginBottom: 8,
  },
  execHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  execTitle: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: '#6D28D9',
    letterSpacing: 0.5,
  },
  execSubtitle: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  metricsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: colors.white,
    borderRadius: spacing.borderRadiusSm,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#EDE9FE',
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: typography.sizes.base + 1,
    fontWeight: typography.weights.extraBold,
    color: colors.text,
  },
  metricLbl: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#E2E8F0',
  },
  sectionHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  sectionSub: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  branchesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  branchMetricCard: {
    width: '48.5%',
    marginBottom: 4,
  },
  branchTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  branchShortName: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  branchStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  branchStatVal: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  branchStatLbl: {
    fontSize: 8,
    color: colors.textMuted,
  },
  docAdminCard: {
    marginBottom: 8,
  },
  docAdminTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  docAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docAdminInfo: {
    flex: 1,
  },
  docAdminNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docAdminName: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  docAdminSpecialty: {
    fontSize: typography.sizes.xxs,
    color: colors.secondaryDark,
    fontWeight: typography.weights.medium,
  },
  docAdminQual: {
    fontSize: 8.5,
    color: colors.textMuted,
  },
  activeToggle: {
    alignSelf: 'flex-start',
  },
  feeDisplayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginVertical: 6,
  },
  feeDisplayItem: {
    alignItems: 'flex-start',
  },
  feeDisplayLbl: {
    fontSize: 8,
    color: colors.textMuted,
  },
  feeDisplayVal: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  editBtn: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  editBtnText: {
    fontSize: 9,
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  editFeeBox: {
    backgroundColor: '#F0F9FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: spacing.borderRadiusSm,
    padding: 8,
    marginVertical: 6,
  },
  editFeeTitle: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    marginBottom: 4,
  },
  editInputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  fieldLbl: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginBottom: 2,
  },
  feeInput: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 4,
    paddingVertical: 3,
    paddingHorizontal: 6,
    fontSize: typography.sizes.xs,
    color: colors.text,
  },
  editActionsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  branchesAssignmentBox: {
    marginTop: 4,
  },
  coverageLabel: {
    fontSize: 8.5,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 3,
  },
  branchesChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  branchToggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    borderRadius: 4,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  branchToggleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  branchToggleText: {
    fontSize: 8.5,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  branchToggleTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
});
