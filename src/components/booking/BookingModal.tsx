import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
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

import { Step1ConsultationMode } from './Step1ConsultationMode';
import { Step2BranchDoctor } from './Step2BranchDoctor';
import { Step3SchedulePatient } from './Step3SchedulePatient';
import { Step4IntakeConsent } from './Step4IntakeConsent';
import { Step5Payment } from './Step5Payment';
import { Step6ConfirmationToken } from './Step6ConfirmationToken';

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
  const [patientName, setPatientName] = useState<string>('');
  const [patientPhone, setPatientPhone] = useState<string>('9826000000');
  const [patientAge, setPatientAge] = useState<string>('5');
  const [patientGender, setPatientGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [reasonForVisit, setReasonForVisit] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE_UPI');
  const [telemedicineConsentAccepted, setTelemedicineConsentAccepted] = useState<boolean>(true);
  const [createdAppointment, setCreatedAppointment] = useState<Appointment | null>(null);

  // Apply prefill whenever modal opens or prefill changes
  useEffect(() => {
    if (isBookingModalOpen) {
      setStep(1);
      setCreatedAppointment(null);

      if (bookingPrefill) {
        if (bookingPrefill.consultationMode) {
          setConsultationMode(bookingPrefill.consultationMode);
        }
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

  const handleUpdateField = (field: string, value: any) => {
    switch (field) {
      case 'date':
        setDate(value);
        break;
      case 'timeSlot':
        setTimeSlot(value);
        break;
      case 'patientType':
        setPatientType(value);
        break;
      case 'patientName':
        setPatientName(value);
        break;
      case 'patientPhone':
        setPatientPhone(value);
        break;
      case 'patientAge':
        setPatientAge(value);
        break;
      case 'patientGender':
        setPatientGender(value);
        break;
      case 'symptoms':
        setSymptoms(value);
        break;
      case 'reasonForVisit':
        setReasonForVisit(value);
        break;
      case 'telemedicineConsentAccepted':
        setTelemedicineConsentAccepted(value);
        break;
    }
  };

  const handleNext = () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!clinicId) {
        Alert.alert('Selection Required', 'Please select a clinic branch.');
        return;
      }
      if (!doctorId) {
        Alert.alert('Selection Required', 'Please select a doctor.');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (!patientName.trim()) {
        Alert.alert('Missing Field', 'Please enter the patient full name.');
        return;
      }
      if (!patientPhone.trim() || patientPhone.replace(/[^0-9]/g, '').length < 10) {
        Alert.alert('Invalid Mobile', 'Please enter a valid 10-digit mobile phone number.');
        return;
      }
      setStep(4);
    } else if (step === 4) {
      if (!telemedicineConsentAccepted) {
        Alert.alert('Consent Required', 'Please accept medical & telemedicine consent to proceed.');
        return;
      }
      setStep(5);
    } else if (step === 5) {
      // Process Booking and generate token!
      const doctor = DOCTORS.find((d) => d.id === doctorId) || DOCTORS[0];
      const clinic = CLINICS.find((c) => c.id === clinicId) || CLINICS[0];
      const fee =
        consultationMode === 'ONLINE_VIDEO'
          ? doctor.consultationFeeOnline
          : doctor.consultationFeeClinic;

      const newApt = createAppointment({
        consultationMode,
        patientType,
        clinicId: clinic.id,
        clinicName: clinic.name,
        doctorId: doctor.id,
        doctorName: doctor.name,
        date,
        timeSlot,
        patientName,
        patientPhone: patientPhone.replace(/[^0-9]/g, ''),
        patientAge,
        patientGender,
        reasonForVisit: reasonForVisit || (symptoms.length > 0 ? symptoms.join(', ') : 'Consultation'),
        symptoms,
        status: 'CONFIRMED',
        paymentMethod,
        paymentStatus: 'PAID',
        feePaid: fee,
        telemedicineConsentAccepted: true,
        linkedPrescriptionId: bookingPrefill?.linkedPrescriptionId,
      });

      setCreatedAppointment(newApt);
      setStep(6);
    }
  };

  const handleBack = () => {
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

  const handleJoinVideoFromConfirmation = () => {
    if (createdAppointment) {
      closeBookingModal();
      openVideoCall(createdAppointment);
    }
  };

  const stepTitles = [
    'Mode',
    'Doctor',
    'Schedule',
    'Intake',
    'Payment',
    'Pass',
  ];

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
          {/* Modal Header */}
          <View style={styles.header}>
            {step > 1 && step < 6 ? (
              <TouchableOpacity
                onPress={handleBack}
                style={styles.navButton}
                activeOpacity={0.7}
              >
                <Icon name="chevron-left" size={16} color={colors.white} />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.navPlaceholder} />
            )}

            <View style={styles.headerTitleContainer}>
              <Text style={styles.headerTitle}>
                {step === 6 ? 'Pass Allotted' : `Book OPD (${step}/5)`}
              </Text>
            </View>

            <TouchableOpacity
              onPress={step === 6 ? handleFinish : closeBookingModal}
              style={styles.closeButton}
              activeOpacity={0.7}
            >
              <Icon name="close" size={14} color={colors.white} />
            </TouchableOpacity>
          </View>

          {/* Step Indicator (Steps 1 - 5) */}
          {step < 6 && (
            <View style={styles.stepperContainer}>
              {stepTitles.slice(0, 5).map((label, idx) => {
                const stepNum = idx + 1;
                const isCompleted = stepNum < step;
                const isCurrent = stepNum === step;

                return (
                  <View key={label} style={styles.stepItem}>
                    <View
                      style={[
                        styles.stepBullet,
                        isCompleted && styles.stepBulletCompleted,
                        isCurrent && styles.stepBulletCurrent,
                      ]}
                    >
                      {isCompleted ? (
                        <Icon name="check" size={10} color={colors.white} />
                      ) : (
                        <Text
                          style={[
                            styles.stepBulletNumber,
                            isCurrent && styles.stepBulletNumberCurrent,
                          ]}
                        >
                          {stepNum}
                        </Text>
                      )}
                    </View>
                    <Text
                      style={[
                        styles.stepLabel,
                        (isCurrent || isCompleted) && styles.stepLabelActive,
                      ]}
                    >
                      {label}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}

          {/* Step Content */}
          <ScrollView
            style={styles.contentScroll}
            contentContainerStyle={styles.contentContainer}
            keyboardShouldPersistTaps="handled"
          >
            {step === 1 && (
              <Step1ConsultationMode
                selectedMode={consultationMode}
                onSelectMode={(mode) => setConsultationMode(mode)}
              />
            )}

            {step === 2 && (
              <Step2BranchDoctor
                consultationMode={consultationMode}
                selectedClinicId={clinicId}
                selectedDoctorId={doctorId}
                onSelectClinic={(cId) => setClinicId(cId)}
                onSelectDoctor={(dId) => setDoctorId(dId)}
              />
            )}

            {step === 3 && (
              <Step3SchedulePatient
                selectedDate={date}
                selectedTimeSlot={timeSlot}
                patientType={patientType}
                patientName={patientName}
                patientPhone={patientPhone}
                patientAge={patientAge}
                patientGender={patientGender}
                onUpdate={handleUpdateField}
              />
            )}

            {step === 4 && (
              <Step4IntakeConsent
                consultationMode={consultationMode}
                symptoms={symptoms}
                reasonForVisit={reasonForVisit}
                telemedicineConsentAccepted={telemedicineConsentAccepted}
                onUpdate={handleUpdateField}
              />
            )}

            {step === 5 && (
              <Step5Payment
                consultationMode={consultationMode}
                clinicId={clinicId}
                doctorId={doctorId}
                paymentMethod={paymentMethod}
                onSelectPaymentMethod={(pm) => setPaymentMethod(pm)}
              />
            )}

            {step === 6 && createdAppointment && (
              <Step6ConfirmationToken
                appointment={createdAppointment}
                onJoinVideo={handleJoinVideoFromConfirmation}
                onFinish={handleFinish}
              />
            )}
          </ScrollView>

          {/* Footer Navigation (Steps 1 to 5) */}
          {step < 6 && (
            <View style={styles.footer}>
              <View style={styles.footerInfo}>
                <Text style={styles.footerStepText}>Step {step} of 5</Text>
                <Text style={styles.footerHelpText}>
                  {step === 5 ? 'Confirm & Allot Token' : 'Next Step'}
                </Text>
              </View>

              <Button
                title={step === 5 ? 'Confirm & Get Token Pass' : 'Continue'}
                onPress={handleNext}
                variant={step === 5 ? 'secondary' : 'primary'}
                size="md"
                icon={step === 5 ? 'token' : 'chevron-right'}
                iconPosition="right"
                style={styles.continueButton}
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
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 10,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    minWidth: 50,
  },
  navPlaceholder: {
    minWidth: 50,
  },
  backButtonText: {
    color: colors.white,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.sizes.sm + 1,
    fontWeight: typography.weights.bold,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 50,
    alignSelf: 'flex-end',
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepBullet: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.borderDark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  stepBulletCurrent: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  stepBulletCompleted: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  stepBulletNumber: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
  },
  stepBulletNumberCurrent: {
    color: colors.white,
  },
  stepLabel: {
    fontSize: 9,
    color: colors.textLight,
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: typography.weights.bold,
  },
  contentScroll: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingTop: 8,
    paddingBottom: 24,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingHorizontal: spacing.screenPaddingHorizontal,
    paddingVertical: 10,
  },
  footerInfo: {
    justifyContent: 'center',
  },
  footerStepText: {
    fontSize: typography.sizes.xxs,
    color: colors.textMuted,
  },
  footerHelpText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.bold,
    color: colors.text,
  },
  continueButton: {
    minWidth: 160,
  },
});
