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

const AVAILABLE_SLOTS = [
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
];

const QUICK_SYMPTOMS = [
  'Fever',
  'Cough & Cold',
  'Child Vaccination',
  'Routine Checkup',
  'Follow-up Visit',
  'Stomach Pain',
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

  // Form State
  const [consultationMode, setConsultationMode] = useState<ConsultationMode>('IN_CLINIC');
  const [clinicId, setClinicId] = useState<string>(
    selectedBranchId !== 'all' ? selectedBranchId : 'sarangpur'
  );
  const [doctorId, setDoctorId] = useState<string>('doc-ankur');
  const [date, setDate] = useState<string>('Today');
  const [timeSlot, setTimeSlot] = useState<string>('11:00 AM');
  const [patientType, setPatientType] = useState<PatientType>('NEW');
  const [patientName, setPatientName] = useState<string>('Aarav Sharma');
  const [patientPhone, setPatientPhone] = useState<string>('9826000000');
  const [patientAge, setPatientAge] = useState<string>('5');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_UPI');
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Apply prefill whenever modal opens or prefill changes
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setCreatedAppointment(null);

      if (bookingPrefill) {
        if (bookingPrefill.consultationMode) setConsultationMode(bookingPrefill.consultationMode);
        if (bookingPrefill.clinicId) {
          setClinicId(bookingPrefill.clinicId);
        } else if (selectedBranchId !== 'all') {
          setClinicId(selectedBranchId);
        }
        if (bookingPrefill.doctorId) setDoctorId(bookingPrefill.doctorId);
        if (bookingPrefill.date) setDate(bookingPrefill.date);
        if (bookingPrefill.timeSlot) setTimeSlot(bookingPrefill.timeSlot);
        if (bookingPrefill.patientType) setPatientType(bookingPrefill.patientType);
        if (bookingPrefill.patientName) setPatientName(bookingPrefill.patientName);
        if (bookingPrefill.patientPhone) setPatientPhone(bookingPrefill.patientPhone);
        if (bookingPrefill.patientAge) setPatientAge(bookingPrefill.patientAge);
        if (bookingPrefill.patientGender) setPatientGender(bookingPrefill.patientGender);
        if (bookingPrefill.symptoms) setSymptoms(bookingPrefill.symptoms);
        if (bookingPrefill.reasonForVisit) setReasonForVisit(bookingPrefill.reasonForVisit);
        if (bookingPrefill.paymentMethod) setPaymentMethod(bookingPrefill.paymentMethod);
      } else {
        if (selectedBranchId !== 'all') {
          setClinicId(selectedBranchId);
        }
      }
    }
  }, [isBookingModalOpen, bookingPrefill, selectedBranchId]);

  const selectedDoctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
  const selectedClinic = CLINICS.find((c) => c.id === clinicId) || CLINICS[0];
  const consultationFee =
    consultationMode === 'ONLINE_VIDEO'
      ? selectedDoctor.consultationFeeOnline
      : selectedDoctor.consultationFeeClinic;

  const toggleSymptom = (sym: string) => {
    if (symptoms.includes(sym)) {
      setSymptoms(symptoms.filter((s) => s !== sym));
    } else {
      setSymptoms([...symptoms, sym]);
    }
  };

  const handleNext = () => {
    if (step === 1) {
      if (!clinicId && consultationMode === 'IN_CLINIC') {
        Alert.alert('Selection Required', 'Please choose a hospital branch.');
        return;
      }
      if (!doctorId) {
        Alert.alert('Selection Required', 'Please select a doctor.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!patientName.trim()) {
        Alert.alert('Name Required', 'Please enter patient name.');
        return;
      }
      if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 10) {
        Alert.alert('Mobile Number Required', 'Please enter a valid 10-digit mobile number.');
        return;
      }

      // Create appointment and generate token pass
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
        reasonForVisit: reasonForVisit || (symptoms.length > 0 ? symptoms.join(', ') : 'General Consultation'),
        symptoms,
        status: 'CONFIRMED',
        paymentMethod,
        paymentStatus: 'PAID',
        feePaid: consultationFee,
        telemedicineConsentAccepted: true,
        linkedPrescriptionId: bookingPrefill?.linkedPrescriptionId,
      });

      setCreatedAppointment(newApt);
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    } else {
      closeBookingModal();
    }
  };

  const handleFinish = () => {
    closeBookingModal();
    setActiveTab('appointments');
  };

  const handleJoinVideo = () => {
    if (createdAppointment) {
      closeBookingModal();
      openVideoCall(createdAppointment);
    }
  };

  return (
    <Modal
      visible={isBookingModalOpen}
      animationType="slide"
      transparent={false}
      onRequestClose={step === 3 ? handleFinish : closeBookingModal}
    >
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalRoot}>
          {/* Header */}
          <View style={styles.header}>
            {step === 2 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn} activeOpacity={0.7}>
                <Icon name="chevron-left" size={16} color={colors.white} />
                <Text style={styles.backBtnText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.headerPlaceholder} />
            )}

            <View style={styles.headerTitleWrap}>
              <Text style={styles.headerTitle}>
                {step === 3
                  ? 'Booking Confirmed'
                  : step === 1
                  ? 'Book Appointment (Step 1/2)'
                  : 'Patient Details (Step 2/2)'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={step === 3 ? handleFinish : closeBookingModal}
              style={styles.closeBtn}
              activeOpacity={0.7}
            >
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Stepper Bar (Steps 1 & 2) */}
          {step < 3 && (
            <View style={styles.stepperContainer}>
              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step >= 1 && styles.stepCircleActive]}>
                  {step > 1 ? (
                    <Icon name="check" size={10} color={colors.white} />
                  ) : (
                    <Text style={[styles.stepCircleNum, step === 1 && styles.stepCircleNumActive]}>1</Text>
                  )}
                </View>
                <Text style={[styles.stepLabelText, step >= 1 && styles.stepLabelTextActive]}>
                  Doctor & Slot
                </Text>
              </View>

              <View style={[styles.stepLine, step >= 2 && styles.stepLineActive]} />

              <View style={styles.stepItem}>
                <View style={[styles.stepCircle, step >= 2 && styles.stepCircleActive]}>
                  <Text style={[styles.stepCircleNum, step === 2 && styles.stepCircleNumActive]}>2</Text>
                </View>
                <Text style={[styles.stepLabelText, step >= 2 && styles.stepLabelTextActive]}>
                  Patient & Pay
                </Text>
              </View>
            </View>
          )}

          {/* Scrollable Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* STEP 1: Doctor, Mode & Slot */}
            {step === 1 && (
              <View>
                {/* 1. Visit Type Switch */}
                <Text style={styles.sectionLabel}>Consultation Type</Text>
                <View style={styles.modeToggleRow}>
                  <TouchableOpacity
                    style={[
                      styles.modeOptionCard,
                      consultationMode === 'IN_CLINIC' && styles.modeOptionCardActive,
                    ]}
                    onPress={() => setConsultationMode('IN_CLINIC')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="hospital"
                      size={20}
                      color={consultationMode === 'IN_CLINIC' ? colors.primary : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.modeTitle,
                        consultationMode === 'IN_CLINIC' && styles.modeTitleActive,
                      ]}
                    >
                      In-Clinic Visit
                    </Text>
                    <Text style={styles.modeSub}>Hospital OPD token</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.modeOptionCard,
                      consultationMode === 'ONLINE_VIDEO' && styles.modeOptionCardActive,
                    ]}
                    onPress={() => setConsultationMode('ONLINE_VIDEO')}
                    activeOpacity={0.8}
                  >
                    <Icon
                      name="video"
                      size={20}
                      color={consultationMode === 'ONLINE_VIDEO' ? colors.secondaryDark : colors.textMuted}
                    />
                    <Text
                      style={[
                        styles.modeTitle,
                        consultationMode === 'ONLINE_VIDEO' && styles.modeTitleActive,
                      ]}
                    >
                      Doctor Video Call
                    </Text>
                    <Text style={styles.modeSub}>Private Tele-OPD</Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Branch Selection (For In-Clinic) */}
                {consultationMode === 'IN_CLINIC' && (
                  <View style={styles.fieldSection}>
                    <Text style={styles.sectionLabel}>Select Hospital Branch</Text>
                    <View style={styles.chipsWrap}>
                      {CLINICS.map((clinic) => {
                        const isSelected = clinicId === clinic.id;
                        return (
                          <TouchableOpacity
                            key={clinic.id}
                            style={[styles.branchChip, isSelected && styles.branchChipActive]}
                            onPress={() => setClinicId(clinic.id)}
                            activeOpacity={0.8}
                          >
                            <Text style={[styles.branchChipText, isSelected && styles.branchChipTextActive]}>
                              {clinic.name}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {/* 3. Doctor Selection */}
                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Choose Specialist</Text>
                  {DOCTORS.map((doc) => {
                    const isSelected = doctorId === doc.id;
                    const fee =
                      consultationMode === 'ONLINE_VIDEO'
                        ? doc.consultationFeeOnline
                        : doc.consultationFeeClinic;

                    return (
                      <TouchableOpacity
                        key={doc.id}
                        style={[styles.doctorSelectCard, isSelected && styles.doctorSelectCardActive]}
                        onPress={() => setDoctorId(doc.id)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.doctorAvatar}>
                          <Icon name="doctor" size={20} color={isSelected ? colors.white : colors.primary} />
                        </View>
                        <View style={styles.doctorSelectInfo}>
                          <View style={styles.doctorNameRow}>
                            <Text style={styles.doctorSelectName}>{doc.name}</Text>
                            <Text style={styles.doctorFeeText}>₹{fee}</Text>
                          </View>
                          <Text style={styles.doctorSelectSpecialty}>{doc.specialization}</Text>
                          <Text style={styles.doctorSelectExp}>
                            {doc.experienceYears}+ yrs exp • {doc.qualification}
                          </Text>
                        </View>
                        {isSelected && (
                          <View style={styles.selectedCheck}>
                            <Icon name="check" size={12} color={colors.white} />
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* 4. Date & Time Selection */}
                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Select Day & Time</Text>
                  {/* Day Pills */}
                  <View style={styles.dayPillsRow}>
                    {['Today', 'Tomorrow', 'Day After'].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.dayPill, date === d && styles.dayPillActive]}
                        onPress={() => setDate(d)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.dayPillText, date === d && styles.dayPillTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Time Slots Grid */}
                  <View style={styles.slotsGrid}>
                    {AVAILABLE_SLOTS.map((slot) => {
                      const isSelected = timeSlot === slot;
                      return (
                        <TouchableOpacity
                          key={slot}
                          style={[styles.slotChip, isSelected && styles.slotChipActive]}
                          onPress={() => setTimeSlot(slot)}
                          activeOpacity={0.8}
                        >
                          <Text style={[styles.slotChipText, isSelected && styles.slotChipTextActive]}>
                            {slot}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              </View>
            )}

            {/* STEP 2: Patient Info & Payment */}
            {step === 2 && (
              <View>
                {/* Summary Banner */}
                <View style={styles.summaryBanner}>
                  <View style={styles.summaryLeft}>
                    <Text style={styles.summaryDocName}>{selectedDoctor.name}</Text>
                    <Text style={styles.summaryMeta}>
                      {consultationMode === 'ONLINE_VIDEO' ? 'Doctor Video Call' : selectedClinic.name} • {date}, {timeSlot}
                    </Text>
                  </View>
                  <View style={styles.summaryFeeBadge}>
                    <Text style={styles.summaryFeeText}>₹{consultationFee}</Text>
                  </View>
                </View>

                {/* Patient Form Fields */}
                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Patient Full Name</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientName}
                    onChangeText={setPatientName}
                    placeholder="Enter patient's full name"
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Mobile Phone (10 Digits)</Text>
                  <TextInput
                    style={styles.textInput}
                    value={patientPhone}
                    onChangeText={setPatientPhone}
                    placeholder="Enter 10-digit mobile number"
                    keyboardType="phone-pad"
                    maxLength={10}
                    placeholderTextColor={colors.textLight}
                  />
                </View>

                {/* Age & Gender Row */}
                <View style={styles.formRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.sectionLabel}>Age (Years)</Text>
                    <TextInput
                      style={styles.textInput}
                      value={patientAge}
                      onChangeText={setPatientAge}
                      placeholder="e.g. 28"
                      keyboardType="numeric"
                      maxLength={3}
                      placeholderTextColor={colors.textLight}
                    />
                  </View>
                  <View style={{ flex: 1.5 }}>
                    <Text style={styles.sectionLabel}>Gender</Text>
                    <View style={styles.genderRow}>
                      {(['Male', 'Female', 'Other'] as const).map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.genderChip, patientGender === g && styles.genderChipActive]}
                          onPress={() => setPatientGender(g)}
                          activeOpacity={0.8}
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

                {/* Symptoms / Reason */}
                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Symptoms / Reason (Optional)</Text>
                  <View style={styles.chipsWrap}>
                    {QUICK_SYMPTOMS.map((sym) => {
                      const active = symptoms.includes(sym);
                      return (
                        <TouchableOpacity
                          key={sym}
                          style={[styles.symptomChip, active && styles.symptomChipActive]}
                          onPress={() => toggleSymptom(sym)}
                          activeOpacity={0.8}
                        >
                          <Icon
                            name={active ? 'check' : 'plus'}
                            size={10}
                            color={active ? colors.white : colors.primary}
                          />
                          <Text style={[styles.symptomChipText, active && styles.symptomChipTextActive, { marginLeft: 4 }]}>
                            {sym}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>

                {/* Payment Option */}
                <View style={styles.fieldSection}>
                  <Text style={styles.sectionLabel}>Select Payment Method</Text>
                  <View style={styles.paymentOptionsRow}>
                    <TouchableOpacity
                      style={[
                        styles.paymentCard,
                        paymentMethod === 'ONLINE_UPI' && styles.paymentCardActive,
                      ]}
                      onPress={() => setPaymentMethod('ONLINE_UPI')}
                      activeOpacity={0.8}
                    >
                      <Icon
                        name="credit-card"
                        size={18}
                        color={paymentMethod === 'ONLINE_UPI' ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.paymentTitle,
                          paymentMethod === 'ONLINE_UPI' && styles.paymentTitleActive,
                        ]}
                      >
                        Online UPI
                      </Text>
                      <Text style={styles.paymentSub}>GPay / PhonePe / Paytm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[
                        styles.paymentCard,
                        paymentMethod === 'CASH_COUNTER' && styles.paymentCardActive,
                      ]}
                      onPress={() => setPaymentMethod('CASH_COUNTER')}
                      activeOpacity={0.8}
                    >
                      <Icon
                        name="receipt"
                        size={18}
                        color={paymentMethod === 'CASH_COUNTER' ? colors.primary : colors.textMuted}
                      />
                      <Text
                        style={[
                          styles.paymentTitle,
                          paymentMethod === 'CASH_COUNTER' && styles.paymentTitleActive,
                        ]}
                      >
                        Pay at Counter
                      </Text>
                      <Text style={styles.paymentSub}>Cash / Card at Clinic</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            )}

            {/* STEP 3: Confirmed Token Pass */}
            {step === 3 && createdAppointment && (
              <View style={styles.passContainer}>
                {/* Success Icon */}
                <View style={styles.successCircle}>
                  <Icon name="check" size={32} color={colors.white} />
                </View>
                <Text style={styles.confirmedTitle}>Appointment Confirmed!</Text>
                <Text style={styles.confirmedSub}>
                  Your digital token pass has been generated.
                </Text>

                {/* Big Token Pass Box */}
                <View style={styles.passBox}>
                  <View style={styles.passHeader}>
                    <Text style={styles.passHospitalName}>SEVASADAN HOSPITAL</Text>
                    <Badge
                      label={
                        createdAppointment.consultationMode === 'ONLINE_VIDEO'
                          ? 'Video Tele-OPD'
                          : 'In-Clinic OPD'
                      }
                      variant="primary"
                      size="sm"
                    />
                  </View>

                  <View style={styles.passTokenDisplay}>
                    <Text style={styles.passTokenLabel}>YOUR TOKEN NUMBER</Text>
                    <Text style={styles.passTokenBig}>{createdAppointment.tokenNumber}</Text>
                    <Text style={styles.passTokenSub}>
                      {createdAppointment.consultationMode === 'ONLINE_VIDEO'
                        ? 'Join online when your turn arrives'
                        : 'Room 1 (OPD Counter)'}
                    </Text>
                  </View>

                  <View style={styles.passDetailsList}>
                    <View style={styles.passRow}>
                      <Text style={styles.passLabel}>Patient:</Text>
                      <Text style={styles.passVal}>{createdAppointment.patientName}</Text>
                    </View>
                    <View style={styles.passRow}>
                      <Text style={styles.passLabel}>Doctor:</Text>
                      <Text style={styles.passVal}>{createdAppointment.doctorName}</Text>
                    </View>
                    <View style={styles.passRow}>
                      <Text style={styles.passLabel}>Schedule:</Text>
                      <Text style={styles.passVal}>
                        {createdAppointment.date} at {createdAppointment.timeSlot}
                      </Text>
                    </View>
                    <View style={styles.passRow}>
                      <Text style={styles.passLabel}>Branch:</Text>
                      <Text style={styles.passVal}>{createdAppointment.clinicName}</Text>
                    </View>
                    <View style={[styles.passRow, { borderBottomWidth: 0 }]}>
                      <Text style={styles.passLabel}>Fee Paid:</Text>
                      <Text style={[styles.passVal, { color: colors.secondaryDark, fontWeight: '700' }]}>
                        ₹{createdAppointment.feePaid} ({createdAppointment.paymentMethod === 'ONLINE_UPI' ? 'Paid via UPI' : 'Pay at Counter'})
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Actions */}
                {createdAppointment.consultationMode === 'ONLINE_VIDEO' ? (
                  <View style={styles.passActions}>
                    <Button
                      title="Join Doctor Video Call Now"
                      onPress={handleJoinVideo}
                      variant="secondary"
                      size="lg"
                      icon="video"
                      fullWidth
                    />
                    <Button
                      title="View in Appointments"
                      onPress={handleFinish}
                      variant="outline"
                      size="md"
                      fullWidth
                      style={{ marginTop: 8 }}
                    />
                  </View>
                ) : (
                  <View style={styles.passActions}>
                    <Button
                      title="Done & View Appointments"
                      onPress={handleFinish}
                      variant="primary"
                      size="lg"
                      icon="check"
                      fullWidth
                    />
                  </View>
                )}
              </View>
            )}
          </ScrollView>

          {/* Footer (Steps 1 & 2) */}
          {step < 3 && (
            <View style={styles.footer}>
              <View style={styles.footerFeeWrap}>
                <Text style={styles.footerFeeLabel}>Total Fee</Text>
                <Text style={styles.footerFeeVal}>₹{consultationFee}</Text>
              </View>

              <Button
                title={step === 1 ? 'Continue to Details' : 'Confirm & Get Token'}
                onPress={handleNext}
                variant={step === 2 ? 'secondary' : 'primary'}
                size="md"
                icon={step === 2 ? 'token' : 'chevron-right'}
                iconPosition="right"
                style={{ minWidth: 170 }}
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
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 60,
  },
  headerPlaceholder: {
    minWidth: 60,
  },
  backBtnText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  headerTitleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
  },
  closeBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
    alignSelf: 'flex-end',
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stepCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepCircleNum: {
    fontSize: 11,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  stepCircleNumActive: {
    color: colors.white,
  },
  stepLabelText: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    fontWeight: typography.weights.medium,
  },
  stepLabelTextActive: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 12,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 24,
  },
  sectionLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeToggleRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  modeOptionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
  },
  modeOptionCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  modeTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 6,
  },
  modeTitleActive: {
    color: colors.primary,
  },
  modeSub: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  fieldSection: {
    marginBottom: 16,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  branchChip: {
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  branchChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  branchChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  branchChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  doctorSelectCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
  },
  doctorSelectCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  doctorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  doctorSelectInfo: {
    flex: 1,
  },
  doctorNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  doctorSelectName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  doctorFeeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  doctorSelectSpecialty: {
    fontSize: typography.sizes.xs,
    color: colors.primary,
    fontWeight: typography.weights.medium,
    marginTop: 1,
  },
  doctorSelectExp: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  selectedCheck: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  dayPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  dayPill: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  dayPillActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  dayPillText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  dayPillTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  slotChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  slotChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  slotChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text,
    fontWeight: typography.weights.medium,
  },
  slotChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  summaryBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 16,
  },
  summaryLeft: {
    flex: 1,
  },
  summaryDocName: {
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
    color: colors.primary,
  },
  summaryMeta: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    marginTop: 2,
  },
  summaryFeeBadge: {
    backgroundColor: colors.white,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  summaryFeeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
  textInput: {
    backgroundColor: colors.white,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: typography.sizes.sm,
    color: colors.text,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 6,
  },
  genderChip: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  genderChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  genderChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  genderChipTextActive: {
    color: colors.white,
    fontWeight: typography.weights.bold,
  },
  symptomChip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  symptomChipActive: {
    backgroundColor: colors.primaryLight,
    borderColor: colors.primary,
  },
  symptomChipText: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
  },
  symptomChipTextActive: {
    color: colors.primary,
    fontWeight: typography.weights.bold,
  },
  paymentOptionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  paymentCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  paymentCardActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  paymentTitle: {
    fontSize: typography.sizes.xs + 1,
    fontWeight: typography.weights.bold,
    color: colors.text,
    marginTop: 4,
  },
  paymentTitleActive: {
    color: colors.primary,
  },
  paymentSub: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 2,
    textAlign: 'center',
  },
  passContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  successCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  confirmedTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  confirmedSub: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
    marginTop: 2,
    marginBottom: 16,
  },
  passBox: {
    width: '100%',
    backgroundColor: colors.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    marginBottom: 16,
  },
  passHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surfaceSecondary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  passHospitalName: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.5,
  },
  passTokenDisplay: {
    alignItems: 'center',
    paddingVertical: 16,
    backgroundColor: colors.primaryLight,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  passTokenLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    letterSpacing: 1,
  },
  passTokenBig: {
    fontSize: 32,
    fontWeight: typography.weights.extraBold,
    color: colors.primary,
    marginVertical: 2,
  },
  passTokenSub: {
    fontSize: typography.sizes.xs,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  passDetailsList: {
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  passRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: colors.surfaceSecondary,
  },
  passLabel: {
    fontSize: typography.sizes.xs,
    color: colors.textMuted,
  },
  passVal: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colors.text,
  },
  passActions: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerFeeWrap: {
    justifyContent: 'center',
  },
  footerFeeLabel: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  footerFeeVal: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.secondaryDark,
  },
});
