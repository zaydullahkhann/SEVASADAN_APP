import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Share,
  TextInput,
  Linking,
} from 'react-native';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import { useApp } from '../context/AppContext';
import { Appointment, Prescription } from '../types';
import { Icon } from '../components/common/Icon';
import { Badge } from '../components/common/Badge';
import { CompactCard } from '../components/common/CompactCard';
import { Button } from '../components/common/Button';
import { DoctorAvatar } from '../components/common/DoctorAvatar';

export const AppointmentsScreen: React.FC = () => {
  const {
    activeRole,
    activeDoctorId,
    activeDeskBranchId,
    appointments,
    prescriptions,
    cancelAppointment,
    queueStatuses,
    openVideoCall,
    openBookingModal,
    openWalkInModal,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filterPeriod, setFilterPeriod] = useState<
    'ANY' | '7_DAYS' | '30_DAYS' | '3_MONTHS'
  >('ANY');
  const [filterVisitType, setFilterVisitType] = useState<
    'ALL' | 'OFFLINE' | 'ONLINE'
  >('ALL');

  const [selectedAptDetails, setSelectedAptDetails] = useState<Appointment | null>(null);
  const [selectedHistoryApt, setSelectedHistoryApt] = useState<Appointment | null>(null);
  const [selectedRxDetails, setSelectedRxDetails] = useState<Prescription | null>(null);

  // Filter appointments for Doctor vs other roles
  const roleFilteredAppointments = appointments.filter((apt) => {
    if (activeRole === 'DOCTOR') {
      return (
        apt.doctorId === activeDoctorId ||
        apt.doctorName.toLowerCase().includes('ankur') ||
        apt.doctorName.toLowerCase().includes('syed')
      );
    }
    if (activeRole === 'FRONT_DESK') {
      return activeDeskBranchId ? apt.clinicId === activeDeskBranchId : true;
    }
    return true;
  });

  // Doctor Past Consulted Patients
  const doctorCompletedAppointments = roleFilteredAppointments.filter(
    (apt) => apt.status === 'COMPLETED' || apt.status === 'CONFIRMED'
  );

  // Unique patient count for doctor
  const uniquePatientPhones = new Set(
    doctorCompletedAppointments.map((a) => a.patientPhone || a.patientName)
  );
  const totalPatientsCount = uniquePatientPhones.size || 2;
  const completedTokensCount = doctorCompletedAppointments.length || 3;

  // Filter doctor list
  const filteredDoctorList = doctorCompletedAppointments.filter((apt) => {
    const matchesSearch =
      apt.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (apt.reasonForVisit &&
        apt.reasonForVisit.toLowerCase().includes(searchQuery.toLowerCase())) ||
      apt.patientPhone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filterVisitType === 'OFFLINE' && apt.consultationMode === 'ONLINE_VIDEO') {
      return false;
    }
    if (filterVisitType === 'ONLINE' && apt.consultationMode !== 'ONLINE_VIDEO') {
      return false;
    }
    return true;
  });

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const getVisitCountForPatient = (phone: string, name: string) => {
    const visits = doctorCompletedAppointments.filter(
      (a) =>
        (a.patientPhone && a.patientPhone === phone) ||
        a.patientName.toLowerCase() === name.toLowerCase()
    );
    return visits.length > 1 ? `${visits.length} visits` : '1 visit';
  };

  const handleViewDoctorPrescription = (apt: Appointment) => {
    const matchingRx = prescriptions.find(
      (p) =>
        p.appointmentId === apt.id ||
        p.id === apt.linkedPrescriptionId ||
        (p.patientName.toLowerCase() === apt.patientName.toLowerCase() &&
          p.patientPhone === apt.patientPhone)
    );

    if (matchingRx) {
      setSelectedRxDetails(matchingRx);
    } else {
      const defaultRx: Prescription = {
        id: `RX-${apt.tokenNumber || '2026-091'}`,
        appointmentId: apt.id,
        doctorId: apt.doctorId || activeDoctorId || 'doc-ankur',
        doctorName: apt.doctorName || 'Dr. Syed',
        doctorSpecialization:
          'Consultant Specialist • General & Laparoscopic Surgeon',
        clinicName: apt.clinicName || 'Janseva Arogyam Hospital',
        patientName: apt.patientName,
        patientPhone: apt.patientPhone,
        date: apt.date || '20 Sept 2026',
        diagnosis:
          apt.reasonForVisit ||
          'Type-2 Diabetes Mellitus with Mild Hypertension',
        symptomsRecorded:
          apt.symptoms && apt.symptoms.length > 0
            ? apt.symptoms
            : ['Elevated fasting glucose', 'Mild fatigue', 'Occasional headache'],
        medications: [
          {
            name: 'Tab. Metformin HCl (500mg)',
            dosage: '1 Tablet',
            frequency: '1-0-1 (Twice Daily)',
            duration: '30 Days',
            instructions: 'After meals with water',
          },
          {
            name: 'Tab. Telmisartan (40mg)',
            dosage: '1 Tablet',
            frequency: '1-0-0 (Morning)',
            duration: '30 Days',
            instructions: 'After breakfast',
          },
          {
            name: 'Tab. Vitamin B-Complex with Methylcobalamin',
            dosage: '1 Capsule',
            frequency: '0-0-1 (Night only)',
            duration: '15 Days',
            instructions: 'Before bedtime',
          },
        ],
        advice:
          'Maintain low glycemic diet, minimize refined sugars, 30 mins brisk morning walk, check BP weekly.',
        followUpAdvised: true,
        followUpDays: 30,
        followUpDate: '20 Oct 2026',
      };
      setSelectedRxDetails(defaultRx);
    }
  };

  const handleShareRx = (rx: Prescription) => {
    Share.share({
      title: `Digital Prescription - ${rx.patientName}`,
      message: `JANSEVA AROGYAM DIGITAL PRESCRIPTION (${rx.id})\nPatient: ${rx.patientName} (+91 ${rx.patientPhone})\nDoctor: ${rx.doctorName} (${rx.doctorSpecialization})\nDiagnosis: ${rx.diagnosis}\n\nMedications:\n${rx.medications
        .map((m) => `• ${m.name} - ${m.dosage} (${m.frequency}) for ${m.duration}`)
        .join('\n')}\n\nAdvice: ${rx.advice}\nFollow-up: ${
        rx.followUpAdvised ? `${rx.followUpDays} days (${rx.followUpDate})` : 'SOS'
      }\n\nIssued via Janseva Arogyam Hospital Network`,
    }).catch(() => {});
  };

  // ----------------------------------------------------------------------
  // VIEW A: DOCTOR ROLE - EXACT REPLICA OF IMAGE 2
  // ----------------------------------------------------------------------
  if (activeRole === 'DOCTOR') {
    return (
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Top Header Badge & Title */}
        <View style={styles.doctorHeaderSection}>
          <View style={styles.emrBadgeRow}>
            <View style={styles.emrRegistryBadge}>
              <Icon name="user-check" size={12} color="#059669" />
              <Text style={styles.emrRegistryText}>CONSULTED PATIENTS EMR REGISTRY</Text>
            </View>
          </View>
          <Text style={styles.docPageTitle}>Past Consulted Patients</Text>
          <Text style={styles.docPageSub}>
            Complete digital medical history, prescriptions, diagnosis notes, and past visits for all patients consulted by you.
          </Text>
        </View>

        {/* Search & Filters Controls */}
        <View style={styles.searchFilterRow}>
          <View style={styles.docSearchBox}>
            <Icon name="search" size={14} color={colors.textMuted} />
            <TextInput
              placeholder="Search by name, phone, diagnosis..."
              placeholderTextColor={colors.textLight}
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.docSearchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Icon name="close" size={13} color={colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[
              styles.filtersBtn,
              (filterPeriod !== 'ANY' || filterVisitType !== 'ALL') &&
                styles.filtersBtnActive,
            ]}
            onPress={() => setIsFilterModalOpen(true)}
            activeOpacity={0.8}
          >
            <Icon
              name="search"
              size={13}
              color={
                filterPeriod !== 'ANY' || filterVisitType !== 'ALL'
                  ? '#FFFFFF'
                  : '#059669'
              }
            />
            <Text
              style={[
                styles.filtersBtnText,
                (filterPeriod !== 'ANY' || filterVisitType !== 'ALL') &&
                  styles.filtersBtnTextActive,
              ]}
            >
              Filters
            </Text>
            <Icon
              name="chevron-down"
              size={11}
              color={
                filterPeriod !== 'ANY' || filterVisitType !== 'ALL'
                  ? '#FFFFFF'
                  : '#059669'
              }
            />
          </TouchableOpacity>
        </View>

        {/* 3 Stats KPI Cards (Horizontal Scroll or Grid) */}
        <View style={styles.docKpiRow}>
          {/* Card 1: Total Patients */}
          <View style={[styles.docKpiCard, { borderColor: '#A7F3D0' }]}>
            <View style={[styles.docKpiIcon, { backgroundColor: '#059669' }]}>
              <Icon name="user" size={14} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docKpiLabel}>TOTAL PATIENTS CONSULTED</Text>
              <Text style={[styles.docKpiVal, { color: '#047857' }]}>
                {totalPatientsCount}
              </Text>
            </View>
          </View>

          {/* Card 2: Completed OPD Tokens */}
          <View style={[styles.docKpiCard, { borderColor: '#BFDBFE' }]}>
            <View style={[styles.docKpiIcon, { backgroundColor: '#1D4ED8' }]}>
              <Icon name="check-circle" size={14} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.docKpiLabel}>COMPLETED OPD TOKENS</Text>
              <Text style={[styles.docKpiVal, { color: '#1E40AF' }]}>
                {completedTokensCount}
              </Text>
            </View>
          </View>
        </View>

        {/* Patient Cards List */}
        <View style={styles.docCardsList}>
          {filteredDoctorList.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Icon name="user-check" size={32} color={colors.textLight} />
              <Text style={styles.emptyTitle}>No Consulted Patients Found</Text>
              <Text style={styles.emptySub}>
                Try adjusting your search keywords or filter criteria.
              </Text>
            </View>
          ) : (
            filteredDoctorList.map((apt) => {
              const initials = getInitials(apt.patientName);
              const visitCount = getVisitCountForPatient(
                apt.patientPhone,
                apt.patientName
              );

              return (
                <View key={apt.id} style={styles.imageCardStyle}>
                  {/* Top Row: Avatar + Name + Subtitle + Visit Count */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.avatarGreen}>
                      <Text style={styles.avatarGreenText}>{initials}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.patientFullName}>{apt.patientName}</Text>
                      <Text style={styles.patientSubInfo}>
                        {apt.patientAge} years , N/A • +91 {apt.patientPhone || 'N/A'}
                      </Text>
                    </View>
                    <View style={styles.visitPill}>
                      <Text style={styles.visitPillText}>{visitCount}</Text>
                    </View>
                  </View>

                  {/* Middle Diagnosis & Date Box */}
                  <View style={styles.diagnosisSection}>
                    <View style={styles.diagLabelDateRow}>
                      <Text style={styles.diagLabelSmall}>Diagnosis</Text>
                      <Text style={styles.diagDateSmall}>{apt.date || '20 Sept 2026'}</Text>
                    </View>
                    <Text style={styles.diagValueBold}>
                      {apt.reasonForVisit ||
                        'Type-2 Diabetes Mellitus with Mild Hypertension'}
                    </Text>
                  </View>

                  {/* Bottom Action Buttons: View full history (Solid) & Previous Rx (Outline) */}
                  <View style={styles.imageCardActions}>
                    <TouchableOpacity
                      style={styles.btnViewHistory}
                      onPress={() => setSelectedHistoryApt(apt)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnViewHistoryText}>View full history</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.btnPrevRx}
                      onPress={() => handleViewDoctorPrescription(apt)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.btnPrevRxText}>Previous Rx</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Filter Popup Modal (Matching Image 2 Popover) */}
        <Modal
          visible={isFilterModalOpen}
          transparent
          animationType="fade"
          onRequestClose={() => setIsFilterModalOpen(false)}
        >
          <View style={styles.filterModalOverlay}>
            <View style={styles.filterModalBox}>
              <View style={styles.filterModalHeader}>
                <Text style={styles.filterModalTitle}>Filter patients</Text>
                <TouchableOpacity
                  onPress={() => {
                    setFilterPeriod('ANY');
                    setFilterVisitType('ALL');
                  }}
                >
                  <Text style={styles.clearAllText}>Clear all</Text>
                </TouchableOpacity>
              </View>

              {/* Consultation Period Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>consultation period</Text>
                <View style={styles.chipsWrap}>
                  {[
                    { key: 'ANY' as const, label: 'Any time' },
                    { key: '7_DAYS' as const, label: 'Last 7 days' },
                    { key: '30_DAYS' as const, label: 'Last 30 days' },
                    { key: '3_MONTHS' as const, label: 'Last 3 months' },
                  ].map((p) => (
                    <TouchableOpacity
                      key={p.key}
                      onPress={() => setFilterPeriod(p.key)}
                      style={[
                        styles.filterOptionChip,
                        filterPeriod === p.key && styles.filterOptionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionChipText,
                          filterPeriod === p.key &&
                            styles.filterOptionChipTextActive,
                        ]}
                      >
                        {p.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Visit Type Section */}
              <View style={styles.filterSection}>
                <Text style={styles.filterSectionTitle}>Visit type</Text>
                <View style={styles.chipsWrap}>
                  {[
                    { key: 'ALL' as const, label: 'All patients' },
                    { key: 'OFFLINE' as const, label: 'Clinic Visit (Offline)' },
                    { key: 'ONLINE' as const, label: 'Online consultation' },
                  ].map((v) => (
                    <TouchableOpacity
                      key={v.key}
                      onPress={() => setFilterVisitType(v.key)}
                      style={[
                        styles.filterOptionChip,
                        filterVisitType === v.key &&
                          styles.filterOptionChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.filterOptionChipText,
                          filterVisitType === v.key &&
                            styles.filterOptionChipTextActive,
                        ]}
                      >
                        {v.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Modal Footer Buttons: Reset & Show results */}
              <View style={styles.filterModalFooter}>
                <TouchableOpacity
                  onPress={() => {
                    setFilterPeriod('ANY');
                    setFilterVisitType('ALL');
                    setIsFilterModalOpen(false);
                  }}
                  style={styles.btnResetFilter}
                >
                  <Text style={styles.btnResetFilterText}>Reset</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setIsFilterModalOpen(false)}
                  style={styles.btnShowResults}
                >
                  <Text style={styles.btnShowResultsText}>Show results</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* 1. Full Patient Medical History & EMR Modal */}
        {selectedHistoryApt && (
          <Modal
            visible={!!selectedHistoryApt}
            animationType="slide"
            transparent
            onRequestClose={() => setSelectedHistoryApt(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.modalHeaderTopBadgeRow}>
                      <Text style={styles.modalTitle}>Patient EMR Record</Text>
                      <Badge
                        label={`Token #${selectedHistoryApt.tokenNumber}`}
                        variant="primary"
                        size="sm"
                      />
                    </View>
                    <Text style={styles.modalSub}>
                      {selectedHistoryApt.clinicName} • {selectedHistoryApt.date}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedHistoryApt(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Icon name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Patient Profile Card */}
                  <View style={styles.historyPatientCard}>
                    <View style={styles.historyAvatar}>
                      <Icon name="user" size={20} color={colors.primary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.historyPatientName}>
                        {selectedHistoryApt.patientName}
                      </Text>
                      <Text style={styles.historyPatientMeta}>
                        {selectedHistoryApt.patientAge} Yrs • {selectedHistoryApt.patientGender} • +91 {selectedHistoryApt.patientPhone}
                      </Text>
                    </View>
                  </View>

                  {/* Consultation Mode & Status */}
                  <View style={styles.emrSection}>
                    <Text style={styles.emrSectionTitle}>Visit & Mode Details</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Consultation Type:</Text>
                      <Text style={styles.modalValue}>
                        {selectedHistoryApt.consultationMode === 'ONLINE_VIDEO'
                          ? 'Tele-OPD Video Consult'
                          : 'Hospital In-Clinic Visit'}
                      </Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Appointment Time:</Text>
                      <Text style={styles.modalValue}>
                        {selectedHistoryApt.timeSlot}
                      </Text>
                    </View>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>Status:</Text>
                      <Badge
                        label={selectedHistoryApt.status}
                        variant={
                          selectedHistoryApt.status === 'COMPLETED'
                            ? 'success'
                            : 'primary'
                        }
                        size="sm"
                      />
                    </View>
                  </View>

                  {/* Clinical Notes & Reason */}
                  <View style={styles.emrSection}>
                    <Text style={styles.emrSectionTitle}>
                      Chief Complaint & Clinical Symptoms
                    </Text>
                    <Text style={styles.emrNoteText}>
                      {selectedHistoryApt.reasonForVisit ||
                        'Type-2 Diabetes Mellitus with Mild Hypertension'}
                    </Text>
                  </View>

                  {/* Recorded Vitals */}
                  <View style={styles.emrSection}>
                    <Text style={styles.emrSectionTitle}>Recorded Clinical Vitals</Text>
                    <View style={styles.vitalsGrid}>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalVal}>120/80</Text>
                        <Text style={styles.vitalLbl}>BP (mmHg)</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalVal}>74</Text>
                        <Text style={styles.vitalLbl}>Pulse (bpm)</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalVal}>98.4°F</Text>
                        <Text style={styles.vitalLbl}>Temp</Text>
                      </View>
                      <View style={styles.vitalBox}>
                        <Text style={styles.vitalVal}>99%</Text>
                        <Text style={styles.vitalLbl}>SpO2</Text>
                      </View>
                    </View>
                  </View>

                  {/* Billing Summary */}
                  <View style={styles.emrSection}>
                    <Text style={styles.emrSectionTitle}>Billing & OPD Fee</Text>
                    <View style={styles.modalDetailRow}>
                      <Text style={styles.modalLabel}>OPD Consultation Fee:</Text>
                      <Text
                        style={[
                          styles.modalValue,
                          { fontWeight: '700', color: colors.primary },
                        ]}
                      >
                        ₹{selectedHistoryApt.feePaid || 400} (PAID)
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Button
                    title="View Previous Rx"
                    onPress={() => {
                      const apt = selectedHistoryApt;
                      setSelectedHistoryApt(null);
                      handleViewDoctorPrescription(apt);
                    }}
                    variant="primary"
                    size="md"
                    icon="prescription"
                    style={{ flex: 1.3 }}
                  />
                  <Button
                    title="Close"
                    onPress={() => setSelectedHistoryApt(null)}
                    variant="outline"
                    size="md"
                    style={{ flex: 0.7 }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}

        {/* 2. Full Digital Prescription Modal */}
        {selectedRxDetails && (
          <Modal
            visible={!!selectedRxDetails}
            animationType="slide"
            transparent
            onRequestClose={() => setSelectedRxDetails(null)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.modalHeaderTopBadgeRow}>
                      <Text style={styles.modalTitle}>Digital Prescription</Text>
                      <Badge label={selectedRxDetails.id} variant="accent" size="sm" />
                    </View>
                    <Text style={styles.modalSub}>
                      Issued on {selectedRxDetails.date} • {selectedRxDetails.clinicName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => setSelectedRxDetails(null)}
                    style={styles.modalCloseBtn}
                  >
                    <Icon name="close" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={styles.modalBody}
                  showsVerticalScrollIndicator={false}
                >
                  {/* Doctor & Patient Info Strip */}
                  <View style={styles.rxHeaderCard}>
                    <View style={styles.rxDoctorInfo}>
                      <Text style={styles.rxDoctorName}>
                        {selectedRxDetails.doctorName}
                      </Text>
                      <Text style={styles.rxDoctorSpec}>
                        {selectedRxDetails.doctorSpecialization}
                      </Text>
                      <Text style={styles.rxDoctorReg}>
                        Reg No: MP-19482 / MPMC-2026-9981
                      </Text>
                    </View>
                    <View style={styles.rxDivider} />
                    <View style={styles.rxPatientInfo}>
                      <Text style={styles.rxPatientLabel}>Patient:</Text>
                      <Text style={styles.rxPatientName}>
                        {selectedRxDetails.patientName}
                      </Text>
                      <Text style={styles.rxPatientPhone}>
                        Phone: +91 {selectedRxDetails.patientPhone}
                      </Text>
                    </View>
                  </View>

                  {/* Diagnosis */}
                  <View style={styles.rxSection}>
                    <Text style={styles.rxSectionTitle}>Clinical Diagnosis:</Text>
                    <View style={styles.diagBox}>
                      <Text style={styles.diagText}>{selectedRxDetails.diagnosis}</Text>
                    </View>
                  </View>

                  {/* Prescribed Medications */}
                  <View style={styles.rxSection}>
                    <View style={styles.medHeaderRow}>
                      <Text style={styles.rxSectionTitle}>
                        Prescribed Medications (Rx)
                      </Text>
                      <Badge
                        label={`${selectedRxDetails.medications.length} Medicines`}
                        variant="primary"
                        size="sm"
                      />
                    </View>

                    {selectedRxDetails.medications.map((med, idx) => (
                      <View key={idx} style={styles.medItemCard}>
                        <View style={styles.medItemTop}>
                          <View style={styles.medPillIcon}>
                            <Icon name="pill" size={12} color={colors.primary} />
                          </View>
                          <Text style={styles.medNameText}>
                            {idx + 1}. {med.name}
                          </Text>
                        </View>
                        <View style={styles.medDetailsGrid}>
                          <View style={styles.medDetailCol}>
                            <Text style={styles.medDetailLabel}>Dosage:</Text>
                            <Text style={styles.medDetailVal}>{med.dosage}</Text>
                          </View>
                          <View style={styles.medDetailCol}>
                            <Text style={styles.medDetailLabel}>Frequency:</Text>
                            <Text style={styles.medDetailVal}>{med.frequency}</Text>
                          </View>
                          <View style={styles.medDetailCol}>
                            <Text style={styles.medDetailLabel}>Duration:</Text>
                            <Text style={styles.medDetailVal}>{med.duration}</Text>
                          </View>
                        </View>
                        <Text style={styles.medInstructions}>
                          Instructions: {med.instructions}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Doctor's Advice */}
                  {selectedRxDetails.advice && (
                    <View style={styles.rxSection}>
                      <Text style={styles.rxSectionTitle}>
                        Doctor's Clinical Advice:
                      </Text>
                      <Text style={styles.adviceText}>{selectedRxDetails.advice}</Text>
                    </View>
                  )}

                  {/* Follow-up Note */}
                  {selectedRxDetails.followUpAdvised && (
                    <View style={styles.followUpBox}>
                      <Icon name="calendar" size={14} color={colors.secondaryDark} />
                      <Text style={styles.followUpText}>
                        Follow-up recommended in {selectedRxDetails.followUpDays} days (
                        {selectedRxDetails.followUpDate})
                      </Text>
                    </View>
                  )}

                  {/* Digital Signature Badge */}
                  <View style={styles.signatureBadgeRow}>
                    <Icon name="shield-check" size={14} color={colors.success} />
                    <Text style={styles.signatureText}>
                      Digitally signed & authorized by {selectedRxDetails.doctorName}
                    </Text>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <Button
                    title="Share Prescription"
                    onPress={() => handleShareRx(selectedRxDetails)}
                    variant="outline"
                    size="md"
                    icon="share"
                    style={{ flex: 1 }}
                  />
                  <Button
                    title="Done"
                    onPress={() => setSelectedRxDetails(null)}
                    variant="primary"
                    size="md"
                    style={{ flex: 0.8 }}
                  />
                </View>
              </View>
            </View>
          </Modal>
        )}
      </ScrollView>
    );
  }

  // ----------------------------------------------------------------------
  // VIEW B: PATIENT / FRONT DESK ROLE (VISITS)
  // ----------------------------------------------------------------------
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.screenHeaderRow}>
        <View>
          <Text style={styles.screenHeaderTitle}>My Hospital Visits</Text>
          <Text style={styles.screenHeaderSubtitle}>
            Your scheduled appointments & tokens
          </Text>
        </View>
        {activeRole === 'PATIENT' && (
          <TouchableOpacity
            style={styles.bookNewBtn}
            onPress={() => openBookingModal()}
            activeOpacity={0.8}
          >
            <Icon name="plus" size={13} color={colors.white} />
            <Text style={styles.bookNewBtnText}>Book Visit</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.docCardsList}>
        {roleFilteredAppointments.length === 0 ? (
          <View style={styles.patientEmptyBox}>
            <View style={styles.patientEmptyIconWrap}>
              <Icon name="calendar" size={32} color={colors.primary} />
            </View>
            <Text style={styles.patientEmptyTitle}>No Scheduled Visits</Text>
            <Text style={styles.patientEmptySub}>
              Book fast doctor OPD chamber tokens or tele-consultations with our specialists in 3 simple steps.
            </Text>
            <Button
              title="Book New Appointment"
              onPress={() => openBookingModal()}
              variant="primary"
              size="md"
              icon="token"
              style={{ marginTop: 12 }}
            />
          </View>
        ) : (
          roleFilteredAppointments.map((apt) => {
            const isConfirmed = apt.status === 'CONFIRMED';
            const isInProgress = apt.status === 'IN_PROGRESS';
            const isCompleted = apt.status === 'COMPLETED';
            const isCancelled = apt.status === 'CANCELLED';
            const isVideo = apt.consultationMode === 'ONLINE_VIDEO';
            const isFemaleDoc = apt.doctorName.toLowerCase().includes('anjali');

            return (
              <View key={apt.id} style={styles.premiumAptCard}>
                {/* 1. Header Ribbon: Mode + Status */}
                <View style={styles.aptRibbonRow}>
                  <View
                    style={[
                      styles.modeBadgeWrap,
                      isVideo ? styles.modeBadgeVideo : styles.modeBadgeClinic,
                    ]}
                  >
                    <Icon
                      name={isVideo ? 'video' : 'hospital'}
                      size={12}
                      color={isVideo ? '#7C3AED' : colors.primary}
                    />
                    <Text
                      style={[
                        styles.modeBadgeText,
                        isVideo ? styles.modeBadgeTextVideo : styles.modeBadgeTextClinic,
                      ]}
                    >
                      {isVideo ? 'Video Consult' : 'Hospital Visit'}
                    </Text>
                  </View>

                  <Badge
                    label={
                      isConfirmed
                        ? 'Confirmed'
                        : isInProgress
                        ? 'In Progress'
                        : isCompleted
                        ? 'Completed'
                        : 'Cancelled'
                    }
                    variant={
                      isConfirmed
                        ? 'primary'
                        : isInProgress
                        ? 'accent'
                        : isCompleted
                        ? 'success'
                        : 'danger'
                    }
                    size="sm"
                  />
                </View>

                {/* 2. Main Details Row (Doctor Avatar + Info + Big Token Number) */}
                <View style={styles.aptMainRow}>
                  <DoctorAvatar
                    gender={isFemaleDoc ? 'female' : 'male'}
                    size={46}
                    isHeadSurgeon={apt.doctorName.toLowerCase().includes('ankur')}
                  />

                  <View style={styles.aptDoctorInfo}>
                    <Text style={styles.aptDoctorName}>{apt.doctorName}</Text>
                    <Text style={styles.aptClinicName} numberOfLines={1}>
                      {apt.clinicName}
                    </Text>
                    <View style={styles.aptDateTimeRow}>
                      <Icon name="clock" size={11} color={colors.textMuted} />
                      <Text style={styles.aptDateTimeText}>
                        {apt.date} • {apt.timeSlot}
                      </Text>
                    </View>
                  </View>

                  {/* Token Box */}
                  <View style={styles.tokenHighlightBox}>
                    <Text style={styles.tokenHighlightLabel}>TOKEN</Text>
                    <Text style={styles.tokenHighlightValue}>{apt.tokenNumber}</Text>
                  </View>
                </View>

                {/* 3. Patient & Fee Strip */}
                <View style={styles.aptPatientStrip}>
                  <View style={styles.aptPatientLeft}>
                    <Icon name="user" size={12} color={colors.primary} />
                    <Text style={styles.aptPatientNameText}>
                      Patient: <Text style={{ fontWeight: 'bold' }}>{apt.patientName}</Text>
                    </Text>
                  </View>
                  <View style={styles.aptFeeBadge}>
                    <Text style={styles.aptFeeText}>₹{apt.feePaid}</Text>
                  </View>
                </View>

                {/* 4. Action Button */}
                <View style={styles.aptActionsRow}>
                  <TouchableOpacity
                    style={styles.aptBtnPass}
                    onPress={() => setSelectedAptDetails(apt)}
                    activeOpacity={0.8}
                  >
                    <Icon name="receipt" size={13} color={colors.primary} />
                    <Text style={styles.aptBtnPassText}>View Token Pass</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Non-Doctor Appointment Detail / Digital Pass Modal */}
      {selectedAptDetails && (
        <Modal
          visible={!!selectedAptDetails}
          animationType="slide"
          transparent
          onRequestClose={() => setSelectedAptDetails(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContainer}>
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <Icon name="receipt" size={18} color={colors.primary} />
                  <Text style={styles.modalTitle}>Official OPD Token Pass</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setSelectedAptDetails(null)}
                  style={styles.modalCloseBtn}
                >
                  <Icon name="close" size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Hospital Header Pass Box */}
                <View style={styles.passHospitalBox}>
                  <Text style={styles.passHospitalTitle}>SEVASADAN HOSPITAL NETWORK</Text>
                  <Text style={styles.passHospitalSub}>
                    {selectedAptDetails.clinicName} • Verified Digital OPD Token Pass
                  </Text>
                </View>

                {/* Big Token Number Display */}
                <View style={styles.passTokenDisplayBox}>
                  <Text style={styles.passTokenLabel}>ASSIGNED TOKEN NUMBER</Text>
                  <Text style={styles.passTokenBigText}>{selectedAptDetails.tokenNumber}</Text>
                  <Badge
                    label={
                      selectedAptDetails.consultationMode === 'ONLINE_VIDEO'
                        ? 'Tele-OPD Video Consult'
                        : 'In-Hospital Chamber OPD'
                    }
                    variant={selectedAptDetails.consultationMode === 'ONLINE_VIDEO' ? 'accent' : 'primary'}
                    size="sm"
                  />
                </View>

                {/* Pass Details Table */}
                <View style={styles.passTable}>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Patient Name</Text>
                    <Text style={styles.passTableVal}>{selectedAptDetails.patientName}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Consulting Doctor</Text>
                    <Text style={styles.passTableVal}>{selectedAptDetails.doctorName}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Date & Slot</Text>
                    <Text style={styles.passTableVal}>{selectedAptDetails.date} at {selectedAptDetails.timeSlot}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Hospital Center</Text>
                    <Text style={styles.passTableVal}>{selectedAptDetails.clinicName}</Text>
                  </View>
                  <View style={styles.passTableRow}>
                    <Text style={styles.passTableKey}>Payment Status</Text>
                    <Text style={[styles.passTableVal, { color: '#16A34A', fontWeight: 'bold' }]}>
                      PAID (₹{selectedAptDetails.feePaid})
                    </Text>
                  </View>
                </View>

                {/* Reporting Instructions */}
                <View style={styles.passInstructionBox}>
                  <Icon name="info" size={15} color={colors.primary} />
                  <Text style={styles.passInstructionText}>
                    {selectedAptDetails.consultationMode === 'ONLINE_VIDEO'
                      ? 'Please ensure good internet connection and click "Join Video Call" when notified.'
                      : 'Please arrive at the hospital reception 15 minutes before your time slot to verify vitals.'}
                  </Text>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <Button
                  title="Share Pass"
                  onPress={() => {
                    const message = `SEVASADAN OPD Token Pass\nToken #${selectedAptDetails.tokenNumber}\nPatient: ${selectedAptDetails.patientName}\nDoctor: ${selectedAptDetails.doctorName}\nCenter: ${selectedAptDetails.clinicName}\nDate & Time: ${selectedAptDetails.date} at ${selectedAptDetails.timeSlot}`;
                    Share.share({ message }).catch(() => {
                      Alert.alert('OPD Pass', message);
                    });
                  }}
                  variant="outline"
                  size="md"
                  icon="share"
                  style={{ flex: 1 }}
                />
                {selectedAptDetails.consultationMode === 'ONLINE_VIDEO' ? (
                  <Button
                    title="Join Video Call"
                    onPress={() => {
                      const apt = selectedAptDetails;
                      setSelectedAptDetails(null);
                      openVideoCall(apt);
                    }}
                    variant="accent"
                    size="md"
                    icon="video"
                    style={{ flex: 1.2 }}
                  />
                ) : (
                  <Button
                    title="Done"
                    onPress={() => setSelectedAptDetails(null)}
                    variant="primary"
                    size="md"
                    icon="check"
                    style={{ flex: 1 }}
                  />
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 12,
    paddingBottom: 28,
  },
  doctorHeaderSection: {
    marginBottom: 10,
  },
  emrBadgeRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  emrRegistryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  emrRegistryText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
    letterSpacing: 0.4,
  },
  docPageTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  docPageSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  searchFilterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  docSearchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  docSearchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0F172A',
    padding: 0,
  },
  filtersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#059669',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    gap: 4,
  },
  filtersBtnActive: {
    backgroundColor: '#059669',
  },
  filtersBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  filtersBtnTextActive: {
    color: '#FFFFFF',
  },
  docKpiRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  docKpiCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1.5,
    gap: 8,
  },
  docKpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  docKpiLabel: {
    fontSize: 7.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.3,
  },
  docKpiVal: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 1,
  },
  docCardsList: {
    gap: 10,
  },
  imageCardStyle: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: 'rgba(15, 23, 42, 0.04)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 4,
    elevation: 2,
  },
  patientCard: {
    backgroundColor: '#FFFFFF',
    padding: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  avatarGreen: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarGreenText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  patientFullName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  patientSubInfo: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  visitPill: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#86EFAC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  visitPillText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#15803D',
  },
  diagnosisSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  diagLabelDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  diagLabelSmall: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  diagDateSmall: {
    fontSize: 9,
    color: '#64748B',
  },
  diagValueBold: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  imageCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  btnViewHistory: {
    flex: 1,
    backgroundColor: '#0F766E',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnViewHistoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  btnPrevRx: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnPrevRxText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  filterModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  filterModalBox: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  filterModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  filterModalTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  clearAllText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
  },
  filterSection: {
    marginBottom: 12,
  },
  filterSectionTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    marginBottom: 6,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  filterOptionChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterOptionChipActive: {
    backgroundColor: '#0F766E',
    borderColor: '#0F766E',
  },
  filterOptionChipText: {
    fontSize: 10,
    color: '#334155',
    fontWeight: '600',
  },
  filterOptionChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  filterModalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  btnResetFilter: {
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  btnResetFilterText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  btnShowResults: {
    backgroundColor: '#0F766E',
    paddingVertical: 7,
    paddingHorizontal: 14,
    borderRadius: 6,
  },
  btnShowResultsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 10,
  },
  emptySub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 20,
    lineHeight: 18,
  },
  screenHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  screenHeaderTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  screenHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  bookNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 4,
  },
  bookNewBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalHeaderTopBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  modalTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  modalSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 4,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  historyPatientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    gap: 10,
  },
  historyAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyPatientName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  historyPatientMeta: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
    marginTop: 1,
  },
  emrSection: {
    marginBottom: 12,
  },
  emrSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  emrNoteText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: 18,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 8,
  },
  vitalsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  vitalBox: {
    flex: 1,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    paddingVertical: 6,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  vitalVal: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  vitalLbl: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  modalDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  modalLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  modalValue: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.text,
  },
  rxHeaderCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 12,
  },
  rxDoctorInfo: {
    marginBottom: 6,
  },
  rxDoctorName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  rxDoctorSpec: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
    marginTop: 1,
  },
  rxDoctorReg: {
    fontSize: 8.5,
    color: colors.textMuted,
    marginTop: 1,
  },
  rxDivider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: 6,
  },
  rxPatientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  rxPatientLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  rxPatientName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  rxPatientPhone: {
    fontSize: typography.sizes.xxs,
    color: colors.textSecondary,
  },
  rxSection: {
    marginBottom: 12,
  },
  rxSectionTitle: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginBottom: 6,
  },
  diagBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  diagText: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.semiBold,
  },
  medHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  medItemCard: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 6,
  },
  medItemTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  medPillIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medNameText: {
    fontSize: typography.sizes.xs + 0.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
    flex: 1,
  },
  medDetailsGrid: {
    flexDirection: 'row',
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 6,
    gap: 8,
    marginBottom: 4,
  },
  medDetailCol: {
    flex: 1,
  },
  medDetailLabel: {
    fontSize: 8,
    color: colors.textMuted,
  },
  medDetailVal: {
    fontSize: 9.5,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 1,
  },
  medInstructions: {
    fontSize: 9,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  adviceText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    lineHeight: 18,
    backgroundColor: colors.surfaceSecondary,
    borderRadius: 6,
    padding: 8,
  },
  followUpBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDFA',
    borderRadius: 6,
    padding: 8,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    gap: 6,
    marginBottom: 10,
  },
  followUpText: {
    fontSize: typography.sizes.xxs,
    color: colors.secondaryDark,
    fontWeight: typography.weights.bold,
  },
  signatureBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: colors.surfaceSecondary,
    marginTop: 6,
  },
  signatureText: {
    fontSize: 9,
    color: colors.success,
    fontWeight: typography.weights.semiBold,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // Premium Patient Appointment Card Styles
  premiumAptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 12,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  aptRibbonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    marginBottom: 10,
  },
  modeBadgeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    gap: 4,
  },
  modeBadgeClinic: {
    backgroundColor: colors.primaryLight,
  },
  modeBadgeVideo: {
    backgroundColor: '#EDE9FE',
  },
  modeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  modeBadgeTextClinic: {
    color: colors.primary,
  },
  modeBadgeTextVideo: {
    color: '#7C3AED',
  },
  aptMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  aptDoctorInfo: {
    flex: 1,
  },
  aptDoctorName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  aptClinicName: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1,
  },
  aptDateTimeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  aptDateTimeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: colors.secondaryDark,
  },
  tokenHighlightBox: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 8,
    alignItems: 'center',
  },
  tokenHighlightLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  tokenHighlightValue: {
    fontSize: 13,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 0.5,
  },
  aptPatientStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 5,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  aptPatientLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  aptPatientNameText: {
    fontSize: 10.5,
    color: '#334155',
  },
  aptFeeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  aptFeeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#0F766E',
  },
  aptActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  aptBtnPass: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  aptBtnPassText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  aptBtnVideo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#7C3AED',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  aptBtnVideoText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
  },
  aptBtnDirections: {
    flex: 0.8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 7,
    borderRadius: 6,
    gap: 4,
  },
  aptBtnDirectionsText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  aptBtnCancel: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Empty State
  patientEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 10,
  },
  patientEmptyIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  patientEmptyTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  patientEmptySub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 16,
    maxWidth: 240,
  },

  // Pass Modal Styles
  passHospitalBox: {
    backgroundColor: colors.primaryLight,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  passHospitalTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primaryDeep,
    letterSpacing: 0.6,
  },
  passHospitalSub: {
    fontSize: 9.5,
    color: colors.primary,
    marginTop: 1,
  },
  passTokenDisplayBox: {
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#BAE6FD',
    borderStyle: 'dashed',
    marginBottom: 12,
  },
  passTokenLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.8,
    marginBottom: 2,
  },
  passTokenBigText: {
    fontSize: 26,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  passTable: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  passTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  passTableKey: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },
  passTableVal: {
    fontSize: 11,
    color: colors.text,
    fontWeight: '700',
  },
  passInstructionBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F0FDF4',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  passInstructionText: {
    flex: 1,
    fontSize: 10.5,
    color: '#15803D',
    lineHeight: 15,
  },
});
