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
  KeyboardAvoidingView,
  Platform,
  Linking,
} from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import {
  ConsultationMode,
  PatientType,
  PaymentMethod,
  Appointment,
} from '../../types';
import { useApp } from '../../context/AppContext';
import { DOCTORS } from '../../data/doctors';
import { CLINICS } from '../../data/clinics';
import { Icon } from '../common/Icon';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { DoctorAvatar } from '../common/DoctorAvatar';

const AVAILABLE_SLOTS = [
  '09:00 AM',
  '10:00 AM',
  '11:30 AM',
  '02:00 PM',
  '04:30 PM',
  '06:00 PM',
  '07:30 PM',
];

const COMMON_SYMPTOMS = [
  'Fever / Chills',
  'Cold & Cough',
  'Diabetes Check',
  'Hypertension / BP',
  'Joint Pain / Stiffness',
  'Skin Rash / Allergy',
  'Pediatric Vaccination',
  'Chest Pain / ECG',
];

export const BookingModal: React.FC = () => {
  const {
    isBookingModalOpen,
    closeBookingModal,
    bookingPrefill,
    createAppointment,
    selectedBranchId,
    openVideoCall,
    setActiveTab,
  } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Mode
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('IN_CLINIC');
  const [clinicId, setClinicId] = useState<string>('sarangpur');

  // Step 2: Doctor
  const [doctorId, setDoctorId] = useState<string>('doc-ankur');

  // Step 3: Date & Slot + Patient Classification & Details
  const [date, setDate] = useState<string>('Today');
  const [timeSlot, setTimeSlot] = useState<string>('10:00 AM');
  const [patientType, setPatientType] = useState<PatientType>('NEW');
  const [patientName, setPatientName] = useState<string>('Aarav Sharma');
  const [patientAge, setPatientAge] = useState<string>('28');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [patientPhone, setPatientPhone] = useState<string>('9826000000');

  // Step 4: Medical Intake & Upload Documents
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [medicalIntake, setMedicalIntake] = useState<string>('');
  const [uploadedDocuments, setUploadedDocuments] = useState<string[]>([]);

  // Step 5: Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_UPI');

  // Step 6: Confirmation
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Prefill handling
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setCreatedAppointment(null);

      if (bookingPrefill) {
        if (bookingPrefill.consultationMode) setConsultationMode(bookingPrefill.consultationMode);
        if (bookingPrefill.clinicId) setClinicId(bookingPrefill.clinicId);
        if (bookingPrefill.doctorId) setDoctorId(bookingPrefill.doctorId);
        if (bookingPrefill.date) setDate(bookingPrefill.date);
        if (bookingPrefill.timeSlot) setTimeSlot(bookingPrefill.timeSlot);
        if (bookingPrefill.patientType) setPatientType(bookingPrefill.patientType);
        if (bookingPrefill.patientName) setPatientName(bookingPrefill.patientName);
        if (bookingPrefill.patientAge) setPatientAge(bookingPrefill.patientAge);
        if (bookingPrefill.patientGender) setPatientGender(bookingPrefill.patientGender);
        if (bookingPrefill.patientPhone) setPatientPhone(bookingPrefill.patientPhone);
        if (bookingPrefill.symptoms) setSelectedSymptoms(bookingPrefill.symptoms);
        if (bookingPrefill.reasonForVisit) setMedicalIntake(bookingPrefill.reasonForVisit);
      }
    }
  }, [isBookingModalOpen, bookingPrefill]);

  // When consultation mode is video, payment method must be online
  useEffect(() => {
    if (consultationMode === 'ONLINE_VIDEO') {
      setPaymentMethod('ONLINE_UPI');
    }
  }, [consultationMode]);

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
  const selectedClinic = CLINICS.find((c) => c.id === clinicId) || CLINICS[0];
  const consultationFee =
    consultationMode === 'ONLINE_VIDEO'
      ? selectedDoctor.consultationFeeOnline
      : selectedDoctor.consultationFeeClinic;

  const toggleSymptom = (sym: string) => {
    if (selectedSymptoms.includes(sym)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== sym));
    } else {
      setSelectedSymptoms([...selectedSymptoms, sym]);
    }
  };

  const handleSimulateUpload = () => {
    const docNames = [
      'Previous_Prescription.pdf',
      'Blood_Report_CBC.jpg',
      'ECG_Report_Hospital.pdf',
      'Discharge_Summary.pdf',
    ];
    const newDoc = docNames[uploadedDocuments.length % docNames.length];
    if (uploadedDocuments.includes(newDoc)) {
      Alert.alert('Upload Document', 'Document already attached.');
      return;
    }
    setUploadedDocuments([...uploadedDocuments, newDoc]);
    Alert.alert('Document Attached', `${newDoc} attached successfully.`);
  };

  const handleRemoveDoc = (docName: string) => {
    setUploadedDocuments(uploadedDocuments.filter((d) => d !== docName));
  };

  const handleNextStep = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!doctorId) {
        Alert.alert('Doctor Required', 'Please select a consulting doctor.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!patientName.trim()) {
        Alert.alert('Missing Field', 'Please enter patient full name.');
        return;
      }
      if (!patientAge.trim()) {
        Alert.alert('Missing Field', 'Please enter patient age.');
        return;
      }
      if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 10) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile number.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!medicalIntake.trim() && selectedSymptoms.length === 0) {
        Alert.alert('Medical Intake Required', 'Please select symptoms or write specific health concerns.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      // Create Appointment & Issue Token Pass
      const newApt = createAppointment({
        consultationMode,
        patientType,
        clinicId: selectedClinic.id,
        clinicName: selectedClinic.name,
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        date,
        timeSlot,
        patientName: patientName.trim(),
        patientPhone: patientPhone.replace(/[^0-9]/g, ''),
        patientAge: patientAge || '25',
        patientGender,
        reasonForVisit: medicalIntake.trim() || selectedSymptoms.join(', '),
        symptoms: selectedSymptoms,
        status: 'CONFIRMED',
        paymentMethod,
        paymentStatus: paymentMethod === 'ONLINE_UPI' ? 'PAID' : 'PENDING',
        feePaid: consultationFee,
        telemedicineConsentAccepted: true,
      });

      setCreatedAppointment(newApt);
      setStep(6);
    }
  };

  const handlePrevStep = () => {
    if (step > 1 && step < 6) {
      setStep(step - 1);
    } else {
      closeBookingModal();
    }
  };

  const handleFinish = () => {
    closeBookingModal();
    setActiveTab('appointments');
  };

  const handleDownloadTokenPass = () => {
    Alert.alert(
      'Token Pass Downloaded',
      `Official OPD Pass for Token #${createdAppointment?.tokenNumber || 'SAR-018'} saved to your device as PDF. WhatsApp copy sent to ${patientPhone}.`,
      [{ text: 'OK' }]
    );
  };

  const handleWhatsAppShare = () => {
    const message = encodeURIComponent(
      `Janseva Arogyam Token Pass: ${createdAppointment?.tokenNumber} | Doctor: ${createdAppointment?.doctorName} | Date: ${createdAppointment?.date} (${createdAppointment?.timeSlot}) | Patient: ${createdAppointment?.patientName}`
    );
    Linking.openURL(`https://wa.me/91${patientPhone}?text=${message}`).catch(() => {});
  };

  return (
    <Modal
      visible={isBookingModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={step === 6 ? handleFinish : closeBookingModal}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalRoot}>
          {/* Header Bar */}
          <View style={styles.header}>
            {step > 1 && step < 6 ? (
              <TouchableOpacity onPress={handlePrevStep} style={styles.backBtn} activeOpacity={0.7}>
                <Icon name="chevron-left" size={16} color={colors.white} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 40 }} />
            )}

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                {step === 6
                  ? 'Booking Confirmed'
                  : `Book Appointment (Step ${step} of 5)`}
              </Text>
              <Text style={styles.headerSubtitle}>
                {step === 1 && 'Select Consultation Mode'}
                {step === 2 && 'Choose Specialist Doctor'}
                {step === 3 && 'Date, Slot & Patient Details'}
                {step === 4 && 'Medical Intake & Upload Reports'}
                {step === 5 && 'Payment & Order Summary'}
                {step === 6 && 'Official Digital OPD Token Pass'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={step === 6 ? handleFinish : closeBookingModal}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Icon name="close" size={16} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stepper Progress Indicator (Steps 1 to 5) */}
          {step <= 5 && (
            <View style={styles.stepperWrap}>
              {[1, 2, 3, 4, 5].map((s) => {
                const isDone = step > s;
                const isCurrent = step === s;
                return (
                  <View key={s} style={styles.stepTrackItem}>
                    <View
                      style={[
                        styles.stepDot,
                        isDone && styles.stepDotDone,
                        isCurrent && styles.stepDotCurrent,
                      ]}
                    >
                      {isDone ? (
                        <Icon name="check" size={10} color={colors.white} />
                      ) : (
                        <Text
                          style={[
                            styles.stepDotNum,
                            isCurrent && styles.stepDotNumCurrent,
                          ]}
                        >
                          {s}
                        </Text>
                      )}
                    </View>
                    {s < 5 && (
                      <View
                        style={[
                          styles.stepLine,
                          step > s && styles.stepLineActive,
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          )}

          {/* Body Content by Step */}
          <ScrollView
            style={styles.scrollBody}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* ================= STEP 1: CONSULTATION MODE ================= */}
            {step === 1 && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Select Consultation Mode</Text>
                <Text style={styles.sectionDesc}>
                  Choose how you would like to consult with our specialized medical team:
                </Text>

                {/* Option A: In-Clinic */}
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    consultationMode === 'IN_CLINIC' && styles.modeCardActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setConsultationMode('IN_CLINIC')}
                >
                  <View style={styles.modeIconBox}>
                    <Icon name="hospital" size={22} color={colors.primary} />
                  </View>
                  <View style={styles.modeTextCol}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>In-Clinic Physical Visit</Text>
                      {consultationMode === 'IN_CLINIC' && (
                        <Icon name="check" size={16} color={colors.primary} />
                      )}
                    </View>
                    <Text style={styles.modeDesc}>
                      Physical doctor consultation at Rajgarh, Sarangpur, or Shujalpur branches with sequential OPD Token Generation & live queue tracking.
                    </Text>
                    <View style={styles.modeBadgeRow}>
                      <Badge label="Token System Enabled" variant="primary" size="sm" />
                      <Text style={styles.modeFeeText}>Fee: ₹350 - ₹400</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Option B: Virtual Video */}
                <TouchableOpacity
                  style={[
                    styles.modeCard,
                    consultationMode === 'ONLINE_VIDEO' && styles.modeCardActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setConsultationMode('ONLINE_VIDEO')}
                >
                  <View style={[styles.modeIconBox, { backgroundColor: '#F0FDFA' }]}>
                    <Icon name="video" size={22} color="#0D9488" />
                  </View>
                  <View style={styles.modeTextCol}>
                    <View style={styles.modeTitleRow}>
                      <Text style={styles.modeTitle}>Virtual Video Consultation</Text>
                      {consultationMode === 'ONLINE_VIDEO' && (
                        <Icon name="check" size={16} color="#0D9488" />
                      )}
                    </View>
                    <Text style={styles.modeDesc}>
                      Consult live with doctors from home over HD WebRTC video. Includes digital prescription PDF download & direct room join link.
                    </Text>
                    <View style={styles.modeBadgeRow}>
                      <Badge label="Direct Join Link" variant="accent" size="sm" />
                      <Text style={styles.modeFeeText}>Fee: ₹450 - ₹500</Text>
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}

            {/* ================= STEP 2: SELECT DOCTOR ================= */}
            {step === 2 && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Select Specialist Doctor</Text>
                <Text style={styles.sectionDesc}>
                  Select your consulting surgeon or physician from the verified roster:
                </Text>

                <View style={styles.docList}>
                  {DOCTORS.map((doc) => {
                    const isSelected = doctorId === doc.id;
                    const isFemale = doc.id === 'doc-anjali';
                    const fee =
                      consultationMode === 'ONLINE_VIDEO'
                        ? doc.consultationFeeOnline
                        : doc.consultationFeeClinic;

                    return (
                      <TouchableOpacity
                        key={doc.id}
                        style={[
                          styles.docCard,
                          isSelected && styles.docCardActive,
                        ]}
                        activeOpacity={0.8}
                        onPress={() => setDoctorId(doc.id)}
                      >
                        <DoctorAvatar
                          gender={isFemale ? 'female' : 'male'}
                          size={54}
                          isHeadSurgeon={!!doc.isHeadSurgeon}
                        />

                        <View style={styles.docInfoCol}>
                          <View style={styles.docTitleRow}>
                            <Text style={styles.docName}>{doc.name}</Text>
                            {isSelected && (
                              <View style={styles.docCheckCircle}>
                                <Icon name="check" size={12} color={colors.white} />
                              </View>
                            )}
                          </View>
                          <Text style={styles.docSpecialty}>{doc.specialization}</Text>
                          <Text style={styles.docQual}>{doc.qualification}</Text>

                          <View style={styles.docMetaRow}>
                            <Text style={styles.docRating}>★ {doc.rating}</Text>
                            <Text style={styles.docDot}>•</Text>
                            <Text style={styles.docExp}>{doc.experienceYears}+ Yrs Exp</Text>
                            <Text style={styles.docDot}>•</Text>
                            <Text style={styles.docFee}>₹{fee} Fee</Text>
                          </View>
                        </View>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ================= STEP 3: DATE & TIME SLOT + PATIENT DETAILS ================= */}
            {step === 3 && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Date, Time Slot & Patient Details</Text>

                {/* 1. Select Preferred Date */}
                <Text style={styles.inputHeading}>1. SELECT PREFERRED DATE *</Text>
                <View style={styles.dateChipsRow}>
                  {['Today', 'Tomorrow', 'Day After'].map((d) => (
                    <TouchableOpacity
                      key={d}
                      style={[styles.chipPill, date === d && styles.chipPillActive]}
                      onPress={() => setDate(d)}
                    >
                      <Icon
                        name="calendar"
                        size={12}
                        color={date === d ? colors.white : colors.textSecondary}
                      />
                      <Text
                        style={[
                          styles.chipPillText,
                          date === d && styles.chipPillTextActive,
                        ]}
                      >
                        {d}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* 2. Available Time Slots */}
                <Text style={styles.inputHeading}>2. AVAILABLE TIME SLOTS *</Text>
                <View style={styles.slotsGrid}>
                  {AVAILABLE_SLOTS.map((slot) => {
                    const isSelected = timeSlot === slot;
                    return (
                      <TouchableOpacity
                        key={slot}
                        style={[styles.slotChip, isSelected && styles.slotChipActive]}
                        onPress={() => setTimeSlot(slot)}
                      >
                        <Text
                          style={[
                            styles.slotChipText,
                            isSelected && styles.slotChipTextActive,
                          ]}
                        >
                          {slot}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 3. Patient Classification */}
                <Text style={styles.inputHeading}>3. PATIENT CLASSIFICATION *</Text>
                <View style={styles.classificationRow}>
                  <TouchableOpacity
                    style={[
                      styles.classCard,
                      patientType === 'NEW' && styles.classCardActive,
                    ]}
                    onPress={() => setPatientType('NEW')}
                  >
                    <Text
                      style={[
                        styles.classCardTitle,
                        patientType === 'NEW' && styles.classCardTitleActive,
                      ]}
                    >
                      New Patient
                    </Text>
                    <Text style={styles.classCardSub}>First time consultation</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.classCard,
                      patientType === 'FOLLOW_UP' && styles.classCardActive,
                    ]}
                    onPress={() => setPatientType('FOLLOW_UP')}
                  >
                    <Text
                      style={[
                        styles.classCardTitle,
                        patientType === 'FOLLOW_UP' && styles.classCardTitleActive,
                      ]}
                    >
                      Existing / Follow-Up
                    </Text>
                    <Text style={styles.classCardSub}>Previous prescription</Text>
                  </TouchableOpacity>
                </View>

                {/* 4. Patient Name */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputHeading}>4. PATIENT NAME *</Text>
                  <TextInput
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter full patient name"
                    style={styles.textInput}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* 5. Age & Gender */}
                <View style={styles.splitInputRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.inputHeading}>AGE *</Text>
                    <TextInput
                      value={patientAge}
                      onChangeText={setPatientAge}
                      placeholder="e.g. 28"
                      keyboardType="numeric"
                      style={styles.textInput}
                      placeholderTextColor="#94A3B8"
                    />
                  </View>

                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.inputHeading}>GENDER *</Text>
                    <View style={styles.genderRow}>
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[
                            styles.genderChip,
                            patientGender === g && styles.genderChipActive,
                          ]}
                          onPress={() => setPatientGender(g)}
                        >
                          <Text
                            style={[
                              styles.genderChipText,
                              patientGender === g && styles.genderChipTextActive,
                            ]}
                          >
                            {g}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                </View>

                {/* 6. Mobile Number */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputHeading}>WHATSAPP / MOBILE NUMBER *</Text>
                  <TextInput
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    placeholder="10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    style={styles.textInput}
                    placeholderTextColor="#94A3B8"
                  />
                </View>
              </View>
            )}

            {/* ================= STEP 4: MEDICAL INTAKE & UPLOAD DOCUMENTS ================= */}
            {step === 4 && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Medical Intake & Upload Documents</Text>

                {/* Common Symptoms */}
                <Text style={styles.inputHeading}>
                  COMMON SYMPTOMS (SELECT ALL THAT APPLY - OPTIONAL)
                </Text>
                <View style={styles.symptomsGrid}>
                  {COMMON_SYMPTOMS.map((sym) => {
                    const isSelected = selectedSymptoms.includes(sym);
                    return (
                      <TouchableOpacity
                        key={sym}
                        style={[
                          styles.symptomChip,
                          isSelected && styles.symptomChipActive,
                        ]}
                        onPress={() => toggleSymptom(sym)}
                      >
                        <Icon
                          name={isSelected ? 'check' : 'activity'}
                          size={12}
                          color={isSelected ? colors.white : colors.primary}
                        />
                        <Text
                          style={[
                            styles.symptomChipText,
                            isSelected && styles.symptomChipTextActive,
                          ]}
                        >
                          {sym}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Medical Intake & Specific Concerns */}
                <View style={styles.inputGroup}>
                  <Text style={styles.inputHeading}>
                    MEDICAL INTAKE & SPECIFIC CONCERNS *
                  </Text>
                  <TextInput
                    value={medicalIntake}
                    onChangeText={setMedicalIntake}
                    placeholder="Describe symptoms, duration, fever history, allergies, or previous medications..."
                    multiline
                    numberOfLines={4}
                    style={styles.textArea}
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Upload Medical Documents & Reports */}
                <View style={styles.uploadSection}>
                  <Text style={styles.inputHeading}>
                    UPLOAD MEDICAL DOCUMENTS & REPORTS (OPTIONAL)
                  </Text>
                  <TouchableOpacity
                    style={styles.uploadBox}
                    activeOpacity={0.8}
                    onPress={handleSimulateUpload}
                  >
                    <Icon name="receipt" size={20} color={colors.primary} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.uploadBoxTitle}>
                        Attach Prescription / Lab Report
                      </Text>
                      <Text style={styles.uploadBoxSub}>
                        PDF or Images (Max 15MB)
                      </Text>
                    </View>
                    <View style={styles.browsePill}>
                      <Text style={styles.browsePillText}>+ Upload</Text>
                    </View>
                  </TouchableOpacity>

                  {/* Attached Documents List */}
                  {uploadedDocuments.length > 0 && (
                    <View style={styles.docsAttachedList}>
                      {uploadedDocuments.map((doc) => (
                        <View key={doc} style={styles.docAttachedChip}>
                          <Icon name="check" size={12} color="#16A34A" />
                          <Text style={styles.docAttachedName}>{doc}</Text>
                          <TouchableOpacity onPress={() => handleRemoveDoc(doc)}>
                            <Icon name="close" size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
              </View>
            )}

            {/* ================= STEP 5: PAYMENT & SUMMARY ================= */}
            {step === 5 && (
              <View style={styles.stepSection}>
                <Text style={styles.sectionTitle}>Payment & Order Summary</Text>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <Text style={styles.summaryHospital}>JANSEVA AROGYAM NETWORK</Text>
                    <Badge
                      label={
                        consultationMode === 'ONLINE_VIDEO'
                          ? 'Virtual Video OPD'
                          : 'In-Clinic Physical Visit'
                      }
                      variant={consultationMode === 'ONLINE_VIDEO' ? 'accent' : 'primary'}
                      size="sm"
                    />
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Consulting Doctor</Text>
                    <Text style={styles.summaryVal}>{selectedDoctor.name}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Specialization</Text>
                    <Text style={styles.summaryVal}>{selectedDoctor.specialization}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Date & Time Slot</Text>
                    <Text style={styles.summaryVal}>{date} at {timeSlot}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Patient Name</Text>
                    <Text style={styles.summaryVal}>
                      {patientName} ({patientAge} Y, {patientGender})
                    </Text>
                  </View>

                  <View style={styles.summaryDivider} />

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Doctor Consultation Fee</Text>
                    <Text style={styles.summaryVal}>₹{consultationFee}</Text>
                  </View>

                  <View style={styles.summaryRow}>
                    <Text style={styles.summaryKey}>Hospital Token Generation</Text>
                    <Text style={[styles.summaryVal, { color: '#16A34A' }]}>FREE (₹0)</Text>
                  </View>

                  <View style={styles.summaryTotalRow}>
                    <Text style={styles.summaryTotalKey}>Total Amount Payable</Text>
                    <Text style={styles.summaryTotalVal}>₹{consultationFee}</Text>
                  </View>
                </View>

                {/* Payment Method Selector */}
                <Text style={styles.inputHeading}>SELECT PAYMENT METHOD *</Text>

                {/* Option 1: Online Razorpay */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === 'ONLINE_UPI' && styles.paymentOptionCardActive,
                  ]}
                  activeOpacity={0.8}
                  onPress={() => setPaymentMethod('ONLINE_UPI')}
                >
                  <View style={styles.paymentRadio}>
                    {paymentMethod === 'ONLINE_UPI' && (
                      <View style={styles.paymentRadioInner} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentOptionTitle}>
                      Online Payment (UPI, Card, NetBanking via Razorpay)
                    </Text>
                    <Text style={styles.paymentOptionSub}>
                      Instant token pass confirmation & WhatsApp digital copy
                    </Text>
                  </View>
                  <Badge label="FASTEST" variant="success" size="sm" />
                </TouchableOpacity>

                {/* Option 2: Pay Offline Cash (Disabled if video consultation) */}
                <TouchableOpacity
                  style={[
                    styles.paymentOptionCard,
                    paymentMethod === 'CASH_COUNTER' && styles.paymentOptionCardActive,
                    consultationMode === 'ONLINE_VIDEO' && styles.paymentOptionDisabled,
                  ]}
                  activeOpacity={consultationMode === 'ONLINE_VIDEO' ? 1 : 0.8}
                  onPress={() => {
                    if (consultationMode !== 'ONLINE_VIDEO') {
                      setPaymentMethod('CASH_COUNTER');
                    }
                  }}
                >
                  <View style={styles.paymentRadio}>
                    {paymentMethod === 'CASH_COUNTER' && (
                      <View style={styles.paymentRadioInner} />
                    )}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.paymentOptionTitle}>
                      Pay at Hospital Reception Counter (Cash / Desk UPI)
                    </Text>
                    <Text style={styles.paymentOptionSub}>
                      Pay when you arrive at hospital chamber reception
                    </Text>
                  </View>
                </TouchableOpacity>

                {/* Mandatory Razorpay Note */}
                <View style={styles.mandatoryNoteBox}>
                  <Icon name="info" size={14} color="#D97706" />
                  <Text style={styles.mandatoryNoteText}>
                    * Note: Online payment is mandatory for Virtual Video Consultations to issue room links.
                  </Text>
                </View>
              </View>
            )}

            {/* ================= STEP 6: CONFIRMATION & DOWNLOAD TOKEN PASS ================= */}
            {step === 6 && createdAppointment && (
              <View style={styles.confirmationWrap}>
                {/* Success Banner */}
                <View style={styles.successHeader}>
                  <View style={styles.successIconCircle}>
                    <Icon name="check" size={24} color={colors.white} />
                  </View>
                  <Text style={styles.successTitle}>Booking Confirmed Successfully!</Text>
                  <Text style={styles.successSub}>
                    Your OPD Token Pass has been issued and registered in the hospital live queue.
                  </Text>
                </View>

                {/* Token Pass Card */}
                <View style={styles.passCard}>
                  <View style={styles.passTopHospital}>
                    <Text style={styles.passHospitalName}>JANSEVA AROGYAM HOSPITAL</Text>
                    <Text style={styles.passBranchText}>
                      {createdAppointment.clinicName} • Official OPD Pass
                    </Text>
                  </View>

                  {/* Big Token Number */}
                  <View style={styles.passBigTokenBox}>
                    <Text style={styles.passBigTokenLabel}>ASSIGNED TOKEN NUMBER</Text>
                    <Text style={styles.passBigTokenNum}>
                      {createdAppointment.tokenNumber}
                    </Text>
                    <Badge
                      label={
                        createdAppointment.consultationMode === 'ONLINE_VIDEO'
                          ? 'Virtual Video Consultation'
                          : 'In-Clinic Hospital OPD'
                      }
                      variant={
                        createdAppointment.consultationMode === 'ONLINE_VIDEO'
                          ? 'accent'
                          : 'primary'
                      }
                      size="sm"
                    />
                  </View>

                  {/* Pass Table */}
                  <View style={styles.passDetailsTable}>
                    <View style={styles.passTableRow}>
                      <Text style={styles.passKey}>Patient Name:</Text>
                      <Text style={styles.passVal}>{createdAppointment.patientName}</Text>
                    </View>
                    <View style={styles.passTableRow}>
                      <Text style={styles.passKey}>Age & Gender:</Text>
                      <Text style={styles.passVal}>
                        {createdAppointment.patientAge} Years, {createdAppointment.patientGender}
                      </Text>
                    </View>
                    <View style={styles.passTableRow}>
                      <Text style={styles.passKey}>Consulting Doctor:</Text>
                      <Text style={styles.passVal}>{createdAppointment.doctorName}</Text>
                    </View>
                    <View style={styles.passTableRow}>
                      <Text style={styles.passKey}>Date & Time Slot:</Text>
                      <Text style={styles.passVal}>
                        {createdAppointment.date} at {createdAppointment.timeSlot}
                      </Text>
                    </View>
                    <View style={styles.passTableRow}>
                      <Text style={styles.passKey}>Payment Status:</Text>
                      <Text style={[styles.passVal, { color: '#16A34A', fontWeight: '800' }]}>
                        {createdAppointment.paymentStatus === 'PAID'
                          ? `PAID (₹${createdAppointment.feePaid})`
                          : `PAY AT COUNTER (₹${createdAppointment.feePaid})`}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.passActionButtons}>
                  <TouchableOpacity
                    style={styles.downloadPassBtn}
                    activeOpacity={0.8}
                    onPress={handleDownloadTokenPass}
                  >
                    <Icon name="receipt" size={15} color={colors.white} />
                    <Text style={styles.downloadPassBtnText}>Download Token Pass</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.whatsappPassBtn}
                    activeOpacity={0.8}
                    onPress={handleWhatsAppShare}
                  >
                    <Icon name="phone" size={14} color="#15803D" />
                    <Text style={styles.whatsappPassBtnText}>Send to WhatsApp</Text>
                  </TouchableOpacity>

                  {createdAppointment.consultationMode === 'ONLINE_VIDEO' && (
                    <TouchableOpacity
                      style={styles.videoJoinBtn}
                      activeOpacity={0.8}
                      onPress={() => {
                        closeBookingModal();
                        openVideoCall(createdAppointment);
                      }}
                    >
                      <Icon name="video" size={15} color={colors.white} />
                      <Text style={styles.videoJoinBtnText}>Join Video Consultation Room</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity
                    style={styles.doneBtn}
                    activeOpacity={0.8}
                    onPress={handleFinish}
                  >
                    <Text style={styles.doneBtnText}>Done & View My Tokens</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>

          {/* Footer CTA Button (Steps 1 to 5) */}
          {step <= 5 && (
            <View style={styles.footerCTA}>
              <Button
                title={
                  step === 5
                    ? `Pay & Issue Token (₹${consultationFee})`
                    : `Continue to Step ${step + 1}`
                }
                onPress={handleNextStep}
                variant="primary"
                size="lg"
                fullWidth
                icon={step === 5 ? 'check' : 'arrow-right'}
              />
            </View>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#072A4A',
  },
  modalRoot: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // Header
  header: {
    backgroundColor: '#072A4A',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#0A365C',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 6,
  },
  backBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  headerTitleWrap: {
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 10,
    color: '#93C5FD',
    marginTop: 1,
  },
  closeBtn: {
    padding: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  // Stepper
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0A365C',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  stepTrackItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepDotActive: {
    backgroundColor: '#0284C7',
  },
  stepDotCurrent: {
    backgroundColor: '#10B981',
  },
  stepDotDone: {
    backgroundColor: '#10B981',
  },
  stepDotNum: {
    fontSize: 10,
    fontWeight: '800',
    color: colors.white,
  },
  stepDotNumCurrent: {
    color: colors.white,
  },
  stepLine: {
    width: 36,
    height: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    marginHorizontal: 4,
  },
  stepLineActive: {
    backgroundColor: '#10B981',
  },

  // Body
  scrollBody: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 24,
  },
  stepSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
    marginBottom: 4,
  },

  // Mode Cards
  modeCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  modeCardActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#F0F9FF',
  },
  modeIconBox: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeTextCol: {
    flex: 1,
  },
  modeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  modeDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
    marginTop: 3,
  },
  modeBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  modeFeeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Doctor List
  docList: {
    gap: 10,
  },
  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 12,
  },
  docCardActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#EFF6FF',
  },
  docInfoCol: {
    flex: 1,
  },
  docTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  docName: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  docCheckCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  docSpecialty: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 1,
  },
  docQual: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  docMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  docRating: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#D97706',
  },
  docDot: {
    color: '#CBD5E1',
  },
  docExp: {
    fontSize: 10,
    color: '#64748B',
  },
  docFee: {
    fontSize: 11,
    fontWeight: '800',
    color: '#15803D',
  },

  // Step 3 Inputs
  inputHeading: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 6,
    marginBottom: 4,
  },
  dateChipsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  chipPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingVertical: 8,
    gap: 5,
  },
  chipPillActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#0F4C81',
  },
  chipPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
  },
  chipPillTextActive: {
    color: colors.white,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  slotChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  slotChipActive: {
    backgroundColor: '#0F4C81',
    borderColor: '#0F4C81',
  },
  slotChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  slotChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  classificationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  classCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  classCardActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#EFF6FF',
  },
  classCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  classCardTitleActive: {
    color: '#0F4C81',
  },
  classCardSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
  },
  inputGroup: {
    marginTop: 6,
  },
  textInput: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    fontSize: 12.5,
    color: '#0F172A',
  },
  splitInputRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 4,
  },
  genderChip: {
    flex: 1,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingVertical: 8,
    alignItems: 'center',
  },
  genderChipActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#0F4C81',
  },
  genderChipText: {
    fontSize: 10.5,
    color: '#475569',
    fontWeight: '600',
  },
  genderChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },

  // Step 4 Symptoms & Upload
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  symptomChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 999,
    paddingVertical: 6,
    paddingHorizontal: 10,
    gap: 5,
  },
  symptomChipActive: {
    backgroundColor: '#0F4C81',
    borderColor: '#0F4C81',
  },
  symptomChipText: {
    fontSize: 11,
    color: '#334155',
    fontWeight: '600',
  },
  symptomChipTextActive: {
    color: colors.white,
    fontWeight: '700',
  },
  textArea: {
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    fontSize: 12,
    color: '#0F172A',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  uploadSection: {
    marginTop: 6,
  },
  uploadBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#93C5FD',
    borderStyle: 'dashed',
    borderRadius: 10,
    padding: 12,
    gap: 10,
  },
  uploadBoxTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F4C81',
  },
  uploadBoxSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  browsePill: {
    backgroundColor: '#0F4C81',
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  browsePillText: {
    color: colors.white,
    fontSize: 10,
    fontWeight: '700',
  },
  docsAttachedList: {
    gap: 6,
    marginTop: 8,
  },
  docAttachedChip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
  },
  docAttachedName: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    flex: 1,
    marginLeft: 6,
  },

  // Step 5 Payment
  summaryCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    gap: 6,
    marginBottom: 10,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryHospital: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F4C81',
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryKey: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 4,
  },
  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  summaryTotalKey: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  summaryTotalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
  },
  paymentOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    gap: 10,
    marginBottom: 8,
  },
  paymentOptionCardActive: {
    borderColor: '#0F4C81',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionDisabled: {
    opacity: 0.5,
    backgroundColor: '#F1F5F9',
  },
  paymentRadio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: '#0F4C81',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#0F4C81',
  },
  paymentOptionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  paymentOptionSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },
  mandatoryNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 8,
    padding: 10,
    gap: 8,
    marginTop: 6,
  },
  mandatoryNoteText: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#B45309',
    lineHeight: 15,
  },

  // Step 6 Confirmation
  confirmationWrap: {
    gap: 14,
  },
  successHeader: {
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  successIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#16A34A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#14532D',
  },
  successSub: {
    fontSize: 11,
    color: '#166534',
    textAlign: 'center',
    marginTop: 3,
  },
  passCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#0284C7',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  passTopHospital: {
    backgroundColor: '#072A4A',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  passHospitalName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.5,
  },
  passBranchText: {
    fontSize: 9.5,
    color: '#93C5FD',
    marginTop: 1,
  },
  passBigTokenBox: {
    backgroundColor: '#EFF6FF',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 10,
  },
  passBigTokenLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#0284C7',
    letterSpacing: 0.5,
  },
  passBigTokenNum: {
    fontSize: 26,
    fontWeight: '900',
    color: '#0F4C81',
    marginVertical: 4,
  },
  passDetailsTable: {
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
  },
  passTableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  passKey: {
    fontSize: 11,
    color: '#64748B',
  },
  passVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  passActionButtons: {
    gap: 8,
  },
  downloadPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0F4C81',
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
  },
  downloadPassBtnText: {
    color: colors.white,
    fontSize: 12.5,
    fontWeight: '800',
  },
  whatsappPassBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  whatsappPassBtnText: {
    color: '#15803D',
    fontSize: 12,
    fontWeight: '800',
  },
  videoJoinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0D9488',
    borderRadius: 10,
    paddingVertical: 11,
    gap: 6,
  },
  videoJoinBtnText: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '800',
  },
  doneBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 10,
    paddingVertical: 10,
  },
  doneBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },

  // Footer CTA
  footerCTA: {
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
});
