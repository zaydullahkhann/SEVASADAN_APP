import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Alert } from 'react-native';
import {
  Appointment,
  Prescription,
  TokenQueueStatus,
  BookingFormState,
  UserRole,
  DoctorDutyStatus,
  Doctor,
  DeskCashRegister,
  AuthUser,
  DEMO_CREDENTIALS,
} from '../types';
import {
  INITIAL_APPOINTMENTS,
  INITIAL_PRESCRIPTIONS,
  INITIAL_QUEUES,
  REGISTERED_PATIENTS,
} from '../data/mockData';
import { CLINICS } from '../data/clinics';
import { DOCTORS } from '../data/doctors';

interface AppContextType {
  // Authentication
  isAuthenticated: boolean;
  authUser: AuthUser | null;
  login: (id: string, pass: string, role: UserRole) => boolean;
  signup: (patientData: {
    name: string;
    phone: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    city: string;
    pass: string;
  }) => void;
  logout: () => void;

  // Role & Navigation
  activeRole: UserRole;
  setActiveRole: (role: UserRole) => void;
  activeDoctorId: string;
  setActiveDoctorId: (id: string) => void;
  activeDeskBranchId: string;
  setActiveDeskBranchId: (id: string) => void;

  selectedBranchId: string; // 'all' or branch id
  setSelectedBranchId: (id: string) => void;
  appointments: Appointment[];
  prescriptions: Prescription[];
  queueStatuses: Record<string, TokenQueueStatus>;
  doctors: Doctor[];
  deskRegisters: Record<string, DeskCashRegister>;

  activeTab: 'home' | 'appointments' | 'prescriptions' | 'clinics' | 'profile';
  setActiveTab: (tab: 'home' | 'appointments' | 'prescriptions' | 'clinics' | 'profile') => void;

  // Modals & Flows
  isBookingModalOpen: boolean;
  bookingPrefill: Partial<BookingFormState> | null;
  openBookingModal: (prefill?: Partial<BookingFormState>) => void;
  closeBookingModal: () => void;

  isWalkInModalOpen: boolean;
  openWalkInModal: () => void;
  closeWalkInModal: () => void;

  isRoleSwitcherOpen: boolean;
  openRoleSwitcher: () => void;
  closeRoleSwitcher: () => void;

  isPrescriptionModalOpen: boolean;
  prescriptionModalApt: Appointment | null;
  openPrescriptionModal: (apt: Appointment) => void;
  closePrescriptionModal: () => void;

  activeVideoAppointment: Appointment | null;
  openVideoCall: (apt: Appointment) => void;
  closeVideoCall: () => void;

  currentUserPhone: string;
  setCurrentUserPhone: (phone: string) => void;

  // Patient Actions
  createAppointment: (data: Omit<Appointment, 'id' | 'tokenNumber' | 'tokenIndex' | 'createdAt'>) => Appointment;
  cancelAppointment: (id: string) => void;
  advanceQueue: (clinicId: string) => void;
  lookupPatientByPhone: (phone: string) => typeof REGISTERED_PATIENTS[0] | undefined;
  addPrescription: (rx: Prescription) => void;

  // Doctor Actions
  callNextPatient: (clinicId: string, doctorId: string) => Appointment | null;
  completeConsultation: (appointmentId: string, rxData?: Partial<Prescription>) => void;
  setDoctorDuty: (doctorId: string, status: DoctorDutyStatus) => void;

  // Front Desk Actions
  checkInPatient: (appointmentId: string) => void;
  recordDeskPayment: (clinicId: string, amount: number, method: 'CASH' | 'UPI', isWalkIn: boolean) => void;

  // Admin Actions
  updateDoctorFee: (doctorId: string, clinicFee: number, onlineFee: number) => void;
  updateDoctorBranches: (doctorId: string, clinicIds: string[]) => void;
  toggleDoctorActive: (doctorId: string, isActive: boolean) => void;
}

const INITIAL_DESK_REGISTERS: Record<string, DeskCashRegister> = {
  sarangpur: {
    cashCollected: 6400,
    upiCollected: 4800,
    totalTokensIssued: 28,
    walkInCount: 16,
    onlineCheckInCount: 12,
  },
  shujalpur: {
    cashCollected: 3850,
    upiCollected: 2450,
    totalTokensIssued: 18,
    walkInCount: 10,
    onlineCheckInCount: 8,
  },
  rajgarh: {
    cashCollected: 8200,
    upiCollected: 5800,
    totalTokensIssued: 35,
    walkInCount: 20,
    onlineCheckInCount: 15,
  },
  biaora: {
    cashCollected: 3600,
    upiCollected: 2800,
    totalTokensIssued: 16,
    walkInCount: 9,
    onlineCheckInCount: 7,
  },
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);

  // Role State
  const [activeRole, setActiveRole] = useState<UserRole>('PATIENT');
  const [activeDoctorId, setActiveDoctorId] = useState<string>('doc-ankur');
  const [activeDeskBranchId, setActiveDeskBranchId] = useState<string>('sarangpur');

  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [queueStatuses, setQueueStatuses] = useState<Record<string, TokenQueueStatus>>(INITIAL_QUEUES);
  const [doctors, setDoctors] = useState<Doctor[]>(
    DOCTORS.map((d) => ({ ...d, dutyStatus: 'AVAILABLE', isActive: true }))
  );
  const [deskRegisters, setDeskRegisters] = useState<Record<string, DeskCashRegister>>(INITIAL_DESK_REGISTERS);

  const [activeTab, setActiveTab] = useState<'home' | 'appointments' | 'prescriptions' | 'clinics' | 'profile'>('home');

  // Modals
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [bookingPrefill, setBookingPrefill] = useState<Partial<BookingFormState> | null>(null);

  const [isWalkInModalOpen, setIsWalkInModalOpen] = useState(false);
  const [isRoleSwitcherOpen, setIsRoleSwitcherOpen] = useState(false);

  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [prescriptionModalApt, setPrescriptionModalApt] = useState<Appointment | null>(null);

  const [activeVideoAppointment, setActiveVideoAppointment] = useState<Appointment | null>(null);
  const [currentUserPhone, setCurrentUserPhone] = useState('9826000000');

  const openBookingModal = (prefill?: Partial<BookingFormState>) => {
    setBookingPrefill(prefill || null);
    setIsBookingModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsBookingModalOpen(false);
    setBookingPrefill(null);
  };

  const openWalkInModal = () => setIsWalkInModalOpen(true);
  const closeWalkInModal = () => setIsWalkInModalOpen(false);

  const openRoleSwitcher = () => setIsRoleSwitcherOpen(true);
  const closeRoleSwitcher = () => setIsRoleSwitcherOpen(false);

  const openPrescriptionModal = (apt: Appointment) => {
    setPrescriptionModalApt(apt);
    setIsPrescriptionModalOpen(true);
  };
  const closePrescriptionModal = () => {
    setPrescriptionModalApt(null);
    setIsPrescriptionModalOpen(false);
  };

  const openVideoCall = (apt: Appointment) => {
    if (activeRole !== 'DOCTOR' && activeRole !== 'PATIENT') {
      Alert.alert(
        'Access Restricted',
        'Live video consultations are exclusively reserved between Doctor and Patient roles.'
      );
      return;
    }
    setActiveVideoAppointment(apt);
  };
  const closeVideoCall = () => setActiveVideoAppointment(null);

  const addPrescription = (rx: Prescription) => {
    setPrescriptions((prev) => [rx, ...prev]);
  };

  const login = (id: string, pass: string, role: UserRole): boolean => {
    const cleanId = id.trim().toLowerCase();
    const cleanPass = pass.trim();

    const demo = DEMO_CREDENTIALS[role];
    const isDemo = cleanId === demo.id.toLowerCase() && cleanPass === demo.pass;

    if (isDemo || cleanPass.length >= 4) {
      let name = demo.name;
      const clinicId = demo.clinicId || 'sarangpur';
      const doctorId = demo.doctorId || 'doc-ankur';

      if (role === 'PATIENT') {
        const patient = REGISTERED_PATIENTS.find(
          (p) => p.phone === id.replace(/[^0-9]/g, '')
        );
        if (patient) {
          name = patient.name;
          setCurrentUserPhone(patient.phone);
        } else {
          name = 'Aarav Sharma';
          setCurrentUserPhone(id.replace(/[^0-9]/g, '') || '9826000000');
        }
      } else if (role === 'DOCTOR') {
        setActiveDoctorId(doctorId);
      } else if (role === 'FRONT_DESK') {
        setActiveDeskBranchId(clinicId);
      }

      setActiveRole(role);
      setAuthUser({
        id: cleanId,
        name,
        role,
        clinicId,
        doctorId,
      });
      setIsAuthenticated(true);
      setActiveTab('home');
      return true;
    }
    return false;
  };

  const signup = (patientData: {
    name: string;
    phone: string;
    age: string;
    gender: 'Male' | 'Female' | 'Other';
    city: string;
    pass: string;
  }) => {
    const cleanPhone = patientData.phone.replace(/[^0-9]/g, '');
    REGISTERED_PATIENTS.push({
      phone: cleanPhone,
      name: patientData.name,
      age: patientData.age,
      gender: patientData.gender,
      city: patientData.city,
      parentName: '',
    });

    setCurrentUserPhone(cleanPhone);
    setActiveRole('PATIENT');
    setAuthUser({
      id: cleanPhone,
      name: patientData.name,
      phone: cleanPhone,
      role: 'PATIENT',
      clinicId: 'sarangpur',
    });
    setIsAuthenticated(true);
    setActiveTab('home');
  };

  const logout = () => {
    setIsAuthenticated(false);
    setAuthUser(null);
    setActiveRole('PATIENT');
    setActiveTab('home');
  };

  const lookupPatientByPhone = (phone: string) => {
    const clean = phone.replace(/[^0-9]/g, '');
    return REGISTERED_PATIENTS.find((p) => p.phone === clean);
  };

  const createAppointment = (
    data: Omit<Appointment, 'id' | 'tokenNumber' | 'tokenIndex' | 'createdAt'>
  ): Appointment => {
    const clinic = CLINICS.find((c) => c.id === data.clinicId) || CLINICS[0];
    const currentQueue = queueStatuses[clinic.id] || {
      clinicId: clinic.id,
      clinicName: clinic.name,
      currentServingToken: `${clinic.tokenPrefix}-001`,
      currentServingIndex: 1,
      totalIssuedToday: 1,
      estimatedWaitMinutesPerPatient: 8,
    };

    const nextTokenIndex = currentQueue.totalIssuedToday + 1;
    const tokenNumber =
      data.consultationMode === 'ONLINE_VIDEO'
        ? `VID-${String(nextTokenIndex).padStart(3, '0')}`
        : `${clinic.tokenPrefix}-${String(nextTokenIndex).padStart(3, '0')}`;

    // Update queue total
    setQueueStatuses((prev) => ({
      ...prev,
      [clinic.id]: {
        ...currentQueue,
        totalIssuedToday: nextTokenIndex,
      },
    }));

    // Update desk register tally
    const isWalkIn = !!data.isWalkIn;
    const isCash = data.paymentMethod === 'CASH_COUNTER';
    setDeskRegisters((prev) => {
      const reg = prev[clinic.id] || {
        cashCollected: 0,
        upiCollected: 0,
        totalTokensIssued: 0,
        walkInCount: 0,
        onlineCheckInCount: 0,
      };
      return {
        ...prev,
        [clinic.id]: {
          ...reg,
          cashCollected: isCash ? reg.cashCollected + data.feePaid : reg.cashCollected,
          upiCollected: !isCash ? reg.upiCollected + data.feePaid : reg.upiCollected,
          totalTokensIssued: reg.totalTokensIssued + 1,
          walkInCount: isWalkIn ? reg.walkInCount + 1 : reg.walkInCount,
          onlineCheckInCount: !isWalkIn ? reg.onlineCheckInCount + 1 : reg.onlineCheckInCount,
        },
      };
    });

    const newAppointment: Appointment = {
      ...data,
      id: `apt-${Date.now()}`,
      tokenNumber,
      tokenIndex: nextTokenIndex,
      createdAt: new Date().toISOString(),
      arrivedAtClinic: isWalkIn, // Walk-ins are physically here
    };

    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const cancelAppointment = (id: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === id ? { ...apt, status: 'CANCELLED' } : apt))
    );
  };

  const advanceQueue = (clinicId: string) => {
    setQueueStatuses((prev) => {
      const q = prev[clinicId];
      if (!q) return prev;
      const clinic = CLINICS.find((c) => c.id === clinicId);
      const prefix = clinic?.tokenPrefix || 'OPD';
      const nextServing = q.currentServingIndex + 1;
      return {
        ...prev,
        [clinicId]: {
          ...q,
          currentServingIndex: nextServing,
          currentServingToken: `${prefix}-${String(nextServing).padStart(3, '0')}`,
        },
      };
    });
  };

  // Doctor Operations
  const callNextPatient = (clinicId: string, docId: string): Appointment | null => {
    // Find next confirmed patient waiting for this doctor or clinic
    const waitingApt = appointments.find(
      (a) =>
        a.status === 'CONFIRMED' &&
        (a.doctorId === docId || !docId) &&
        (a.clinicId === clinicId || clinicId === 'all')
    );

    if (waitingApt) {
      // Mark as IN_PROGRESS
      setAppointments((prev) =>
        prev.map((a) => (a.id === waitingApt.id ? { ...a, status: 'IN_PROGRESS' } : a))
      );
      // Advance queue token
      advanceQueue(waitingApt.clinicId);
      return { ...waitingApt, status: 'IN_PROGRESS' };
    }
    return null;
  };

  const completeConsultation = (appointmentId: string, rxData?: Partial<Prescription>) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, status: 'COMPLETED' } : a))
    );

    if (rxData && rxData.diagnosis) {
      const apt = appointments.find((a) => a.id === appointmentId);
      const newRx: Prescription = {
        id: `rx-${Date.now()}`,
        appointmentId,
        doctorId: rxData.doctorId || apt?.doctorId || activeDoctorId,
        patientName: rxData.patientName || apt?.patientName || 'Patient',
        patientPhone: rxData.patientPhone || apt?.patientPhone || '',
        doctorName: rxData.doctorName || apt?.doctorName || 'Dr. Ankur Deshwali',
        doctorSpecialization: rxData.doctorSpecialization || 'Super Specialty OPD',
        clinicName: rxData.clinicName || apt?.clinicName || 'Sarangpur Branch',
        date: 'Today',
        diagnosis: rxData.diagnosis,
        symptomsRecorded: rxData.symptomsRecorded || apt?.symptoms || [],
        medications: rxData.medications || [],
        advice: rxData.advice || 'Follow prescription guidelines. Rest well.',
        followUpDays: rxData.followUpDays || 7,
        followUpDate: rxData.followUpDate || '15 Sep 2026',
        followUpAdvised: rxData.followUpAdvised ?? true,
      };
      addPrescription(newRx);
    }
  };

  const setDoctorDuty = (docId: string, status: DoctorDutyStatus) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, dutyStatus: status } : d))
    );
  };

  // Front Desk Operations
  const checkInPatient = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === appointmentId ? { ...a, arrivedAtClinic: true } : a))
    );
  };

  const recordDeskPayment = (
    clinicId: string,
    amount: number,
    method: 'CASH' | 'UPI',
    isWalkIn: boolean
  ) => {
    setDeskRegisters((prev) => {
      const reg = prev[clinicId] || {
        cashCollected: 0,
        upiCollected: 0,
        totalTokensIssued: 0,
        walkInCount: 0,
        onlineCheckInCount: 0,
      };
      return {
        ...prev,
        [clinicId]: {
          ...reg,
          cashCollected: method === 'CASH' ? reg.cashCollected + amount : reg.cashCollected,
          upiCollected: method === 'UPI' ? reg.upiCollected + amount : reg.upiCollected,
          totalTokensIssued: reg.totalTokensIssued + 1,
          walkInCount: isWalkIn ? reg.walkInCount + 1 : reg.walkInCount,
        },
      };
    });
  };

  // Admin Operations
  const updateDoctorFee = (docId: string, clinicFee: number, onlineFee: number) => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, consultationFeeClinic: clinicFee, consultationFeeOnline: onlineFee }
          : d
      )
    );
  };

  const updateDoctorBranches = (docId: string, clinicIds: string[]) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, clinicsCovered: clinicIds } : d))
    );
  };

  const toggleDoctorActive = (docId: string, isActive: boolean) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isActive } : d))
    );
  };

  return (
    <AppContext.Provider
      value={{
        isAuthenticated,
        authUser,
        login,
        signup,
        logout,
        activeRole,
        setActiveRole,
        activeDoctorId,
        setActiveDoctorId,
        activeDeskBranchId,
        setActiveDeskBranchId,
        selectedBranchId,
        setSelectedBranchId,
        appointments,
        prescriptions,
        queueStatuses,
        doctors,
        deskRegisters,
        activeTab,
        setActiveTab,
        isBookingModalOpen,
        bookingPrefill,
        openBookingModal,
        closeBookingModal,
        isWalkInModalOpen,
        openWalkInModal,
        closeWalkInModal,
        isRoleSwitcherOpen,
        openRoleSwitcher,
        closeRoleSwitcher,
        isPrescriptionModalOpen,
        prescriptionModalApt,
        openPrescriptionModal,
        closePrescriptionModal,
        activeVideoAppointment,
        openVideoCall,
        closeVideoCall,
        currentUserPhone,
        setCurrentUserPhone,
        createAppointment,
        cancelAppointment,
        advanceQueue,
        lookupPatientByPhone,
        addPrescription,
        callNextPatient,
        completeConsultation,
        setDoctorDuty,
        checkInPatient,
        recordDeskPayment,
        updateDoctorFee,
        updateDoctorBranches,
        toggleDoctorActive,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
