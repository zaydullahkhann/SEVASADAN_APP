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
  Clinic,
  DeskStaff,
  CareService,
  RevenueAuditRecord,
  EMRLogRecord,
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
import {
  ADMIN_BRANCHES,
  ADMIN_DOCTORS,
  ADMIN_DESK_STAFF,
  ADMIN_CARE_SERVICES,
  ADMIN_REVENUE_RECORDS,
  ADMIN_EMR_LOGS,
} from '../data/adminData';

export type AdminTabType =
  | 'admin_overview'
  | 'admin_branches'
  | 'admin_doctors'
  | 'admin_staff'
  | 'admin_services'
  | 'admin_revenue'
  | 'admin_emr';

export type AppTabType =
  | 'home'
  | 'doctors'
  | 'clinics'
  | 'care_services'
  | 'lab'
  | 'pharmacy'
  | 'appointments'
  | 'prescriptions'
  | 'articles'
  | 'profile'
  | AdminTabType;

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

  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;

  // Admin Specific Tab
  activeAdminTab: AdminTabType;
  setActiveAdminTab: (tab: AdminTabType) => void;

  // Drawer
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

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

  // Admin State & Actions
  adminBranches: Clinic[];
  addAdminBranch: (branch: Clinic) => void;
  updateAdminBranch: (branch: Clinic) => void;
  deleteAdminBranch: (id: string) => void;

  adminDoctors: Doctor[];
  addAdminDoctor: (doctor: Doctor) => void;
  updateAdminDoctor: (doctor: Doctor) => void;
  deleteAdminDoctor: (id: string) => void;

  deskStaffList: DeskStaff[];
  addDeskStaff: (staff: DeskStaff) => void;
  updateDeskStaff: (staff: DeskStaff) => void;
  deleteDeskStaff: (id: string) => void;

  careServices: CareService[];
  addCareService: (service: CareService) => void;
  updateCareService: (service: CareService) => void;
  deleteCareService: (id: string) => void;

  revenueRecords: RevenueAuditRecord[];
  addRevenueRecord: (record: RevenueAuditRecord) => void;
  updateRevenueStatus: (id: string, status: 'PAID' | 'PENDING' | 'SETTLED') => void;

  emrLogs: EMRLogRecord[];

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
  const [activeDeskBranchId, setActiveDeskBranchId] = useState<string>('rajgarh');

  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(INITIAL_PRESCRIPTIONS);
  const [queueStatuses, setQueueStatuses] = useState<Record<string, TokenQueueStatus>>(INITIAL_QUEUES);
  const [doctors, setDoctors] = useState<Doctor[]>(
    DOCTORS.map((d) => ({ ...d, dutyStatus: 'AVAILABLE', isActive: true }))
  );
  const [deskRegisters, setDeskRegisters] = useState<Record<string, DeskCashRegister>>(INITIAL_DESK_REGISTERS);

  // Tab & Navigation State
  const [activeTab, setActiveTab] = useState<AppTabType>('home');
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTabType>('admin_overview');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Admin Data State
  const [adminBranches, setAdminBranches] = useState<Clinic[]>(ADMIN_BRANCHES);
  const [adminDoctors, setAdminDoctors] = useState<Doctor[]>(ADMIN_DOCTORS);
  const [deskStaffList, setDeskStaffList] = useState<DeskStaff[]>(ADMIN_DESK_STAFF);
  const [careServices, setCareServices] = useState<CareService[]>(ADMIN_CARE_SERVICES);
  const [revenueRecords, setRevenueRecords] = useState<RevenueAuditRecord[]>(ADMIN_REVENUE_RECORDS);
  const [emrLogs, setEmrLogs] = useState<EMRLogRecord[]>(ADMIN_EMR_LOGS);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

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

    // Allow demo or flexible login
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
      } else if (role === 'ADMIN') {
        name = 'Hospital Director';
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
      if (role === 'ADMIN') {
        setActiveTab('admin_overview');
        setActiveAdminTab('admin_overview');
      } else {
        setActiveTab('home');
      }
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
    setActiveAdminTab('admin_overview');
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

    // Also add to EMR Logs & Revenue Audit
    const newEmr: EMRLogRecord = {
      id: `emr-${Date.now()}`,
      tokenNumber,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientAge: data.patientAge,
      patientGender: data.patientGender,
      doctorName: data.doctorName,
      clinicName: data.clinicName,
      clinicId: data.clinicId,
      mode: data.consultationMode === 'ONLINE_VIDEO' ? 'ONLINE_VIDEO' : 'PHYSICAL',
      amount: data.feePaid,
      status: 'CONFIRMED',
      date: 'Today',
      timeSlot: data.timeSlot,
    };
    setEmrLogs((prev) => [newEmr, ...prev]);

    const newRev: RevenueAuditRecord = {
      id: `CASH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      patientName: data.patientName,
      doctorName: data.doctorName,
      clinicName: data.clinicName,
      clinicId: data.clinicId,
      method: isCash ? 'CASH' : 'ONLINE_UPI',
      amount: data.feePaid,
      status: isCash ? 'PENDING' : 'PAID',
      date: 'Today',
      tokenNumber,
    };
    setRevenueRecords((prev) => [newRev, ...prev]);

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
    const waitingApt = appointments.find(
      (a) =>
        a.status === 'CONFIRMED' &&
        (a.doctorId === docId || !docId) &&
        (a.clinicId === clinicId || clinicId === 'all')
    );

    if (waitingApt) {
      setAppointments((prev) =>
        prev.map((a) => (a.id === waitingApt.id ? { ...a, status: 'IN_PROGRESS' } : a))
      );
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
    setAdminDoctors((prev) =>
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

  // Admin Operations - Branches
  const addAdminBranch = (branch: Clinic) => {
    setAdminBranches((prev) => [...prev, branch]);
  };

  const updateAdminBranch = (branch: Clinic) => {
    setAdminBranches((prev) => prev.map((b) => (b.id === branch.id ? branch : b)));
  };

  const deleteAdminBranch = (id: string) => {
    setAdminBranches((prev) => prev.filter((b) => b.id !== id));
  };

  // Admin Operations - Doctors
  const addAdminDoctor = (doctor: Doctor) => {
    setAdminDoctors((prev) => [...prev, doctor]);
    setDoctors((prev) => [...prev, doctor]);
  };

  const updateAdminDoctor = (doctor: Doctor) => {
    setAdminDoctors((prev) => prev.map((d) => (d.id === doctor.id ? doctor : d)));
    setDoctors((prev) => prev.map((d) => (d.id === doctor.id ? doctor : d)));
  };

  const deleteAdminDoctor = (id: string) => {
    setAdminDoctors((prev) => prev.filter((d) => d.id !== id));
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  // Admin Operations - Desk Staff
  const addDeskStaff = (staff: DeskStaff) => {
    setDeskStaffList((prev) => [...prev, staff]);
  };

  const updateDeskStaff = (staff: DeskStaff) => {
    setDeskStaffList((prev) => prev.map((s) => (s.id === staff.id ? staff : s)));
  };

  const deleteDeskStaff = (id: string) => {
    setDeskStaffList((prev) => prev.filter((s) => s.id !== id));
  };

  // Admin Operations - Care Services
  const addCareService = (service: CareService) => {
    setCareServices((prev) => [...prev, service]);
  };

  const updateCareService = (service: CareService) => {
    setCareServices((prev) => prev.map((s) => (s.id === service.id ? service : s)));
  };

  const deleteCareService = (id: string) => {
    setCareServices((prev) => prev.filter((s) => s.id !== id));
  };

  // Admin Operations - Revenue Records
  const addRevenueRecord = (record: RevenueAuditRecord) => {
    setRevenueRecords((prev) => [record, ...prev]);
  };

  const updateRevenueStatus = (id: string, status: 'PAID' | 'PENDING' | 'SETTLED') => {
    setRevenueRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
  };

  const updateDoctorFee = (docId: string, clinicFee: number, onlineFee: number) => {
    setDoctors((prev) =>
      prev.map((d) =>
        d.id === docId
          ? { ...d, consultationFeeClinic: clinicFee, consultationFeeOnline: onlineFee }
          : d
      )
    );
    setAdminDoctors((prev) =>
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
    setAdminDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, clinicsCovered: clinicIds } : d))
    );
  };

  const toggleDoctorActive = (docId: string, isActive: boolean) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === docId ? { ...d, isActive } : d))
    );
    setAdminDoctors((prev) =>
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
        activeAdminTab,
        setActiveAdminTab,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
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
        adminBranches,
        addAdminBranch,
        updateAdminBranch,
        deleteAdminBranch,
        adminDoctors,
        addAdminDoctor,
        updateAdminDoctor,
        deleteAdminDoctor,
        deskStaffList,
        addDeskStaff,
        updateDeskStaff,
        deleteDeskStaff,
        careServices,
        addCareService,
        updateCareService,
        deleteCareService,
        revenueRecords,
        addRevenueRecord,
        updateRevenueStatus,
        emrLogs,
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
