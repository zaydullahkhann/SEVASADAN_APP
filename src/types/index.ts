export type ConsultationMode = 'IN_CLINIC' | 'ONLINE_VIDEO';

export type PatientType = 'NEW' | 'EXISTING' | 'FOLLOW_UP';

export type AppointmentStatus = 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export type PaymentMethod = 'ONLINE_UPI' | 'CASH_COUNTER';

export type PaymentStatus = 'PAID' | 'PENDING' | 'WAIVED';

export type UserRole = 'PATIENT' | 'DOCTOR' | 'FRONT_DESK' | 'ADMIN';

export type DoctorDutyStatus = 'AVAILABLE' | 'IN_SURGERY' | 'ON_BREAK' | 'OFF_DUTY';

export interface Clinic {
  id: string;
  name: string;
  shortName: string;
  fullName: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  emergencyHelpline: string;
  operatingHours: string;
  activeDoctorCount: number;
  rating: number;
  tokenPrefix: string;
  slotIntervalMinutes?: number;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualification: string;
  specialization: string;
  regNumber: string;
  bio: string;
  experienceYears: number;
  rating: number;
  totalReviews: number;
  consultationFeeClinic: number;
  consultationFeeOnline: number;
  clinicsCovered: string[]; // clinic IDs
  awards: string[];
  languages: string[];
  opdSchedule: string;
  isHeadSurgeon?: boolean;
  dutyStatus?: DoctorDutyStatus;
  isActive?: boolean;
}

export interface DeskStaff {
  id: string;
  name: string;
  email: string;
  phone: string;
  clinicId: string;
  clinicName: string;
  roleTitle: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedDate: string;
}

export interface CareService {
  id: string;
  name: string;
  category: 'DIAGNOSTICS' | 'PHARMACY' | 'LABORATORY' | 'CLINICAL' | 'SURGERY';
  price: number;
  description: string;
  turnaroundTime?: string;
  homeCollectionAvailable?: boolean;
}

export interface RevenueAuditRecord {
  id: string;
  patientName: string;
  doctorName: string;
  clinicName: string;
  clinicId: string;
  method: 'CASH' | 'ONLINE_UPI' | 'NET_BANKING';
  amount: number;
  status: 'PAID' | 'PENDING' | 'SETTLED';
  date: string;
  tokenNumber?: string;
}

export interface EMRLogRecord {
  id: string;
  tokenNumber: string;
  patientName: string;
  patientPhone: string;
  patientAge?: string;
  patientGender?: string;
  doctorName: string;
  clinicName: string;
  clinicId: string;
  mode: 'PHYSICAL' | 'ONLINE_VIDEO';
  amount: number;
  status: AppointmentStatus;
  date: string;
  timeSlot?: string;
}

export interface Appointment {
  id: string;
  tokenNumber: string;
  tokenIndex: number;
  consultationMode: ConsultationMode;
  patientType: PatientType;
  clinicId: string;
  clinicName: string;
  doctorId: string;
  doctorName: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  patientGender: 'Male' | 'Female' | 'Other';
  reasonForVisit: string;
  symptoms: string[];
  status: AppointmentStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  feePaid: number;
  telemedicineConsentAccepted: boolean;
  createdAt: string;
  linkedPrescriptionId?: string;
  previousAppointmentId?: string;
  isWalkIn?: boolean;
  arrivedAtClinic?: boolean;
}

export interface Medication {
  name: string;
  dosage: string; // e.g. 5ml, 500mg
  frequency: string; // e.g. 1-0-1, TDS
  duration: string; // e.g. 5 days
  instructions: string; // e.g. After meals
}

export interface Prescription {
  id: string;
  appointmentId: string;
  doctorId?: string;
  patientName: string;
  patientPhone: string;
  doctorName: string;
  doctorSpecialization: string;
  clinicName: string;
  date: string;
  diagnosis: string;
  symptomsRecorded: string[];
  medications: Medication[];
  advice: string;
  followUpDays: number;
  followUpDate: string;
  followUpAdvised: boolean;
}

export interface TokenQueueStatus {
  clinicId: string;
  clinicName: string;
  currentServingToken: string;
  currentServingIndex: number;
  totalIssuedToday: number;
  estimatedWaitMinutesPerPatient: number;
}

export interface BookingFormState {
  consultationMode: ConsultationMode;
  patientType: PatientType;
  clinicId: string;
  doctorId: string;
  date: string;
  timeSlot: string;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  patientGender: 'Male' | 'Female' | 'Other';
  symptoms: string[];
  reasonForVisit: string;
  paymentMethod: PaymentMethod;
  telemedicineConsentAccepted: boolean;
  linkedPrescriptionId?: string;
}

export interface DeskCashRegister {
  cashCollected: number;
  upiCollected: number;
  totalTokensIssued: number;
  walkInCount: number;
  onlineCheckInCount: number;
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  phone?: string;
  email?: string;
  clinicId?: string;
  doctorId?: string;
}

export interface DemoCredential {
  role: UserRole;
  id: string;
  pass: string;
  name: string;
  subtitle: string;
  clinicId?: string;
  doctorId?: string;
}

export const DEMO_CREDENTIALS: Record<UserRole, DemoCredential> = {
  PATIENT: {
    role: 'PATIENT',
    id: '9826000000',
    pass: 'patient123',
    name: 'Aarav Sharma',
    subtitle: 'Existing Patient Profile',
    clinicId: 'sarangpur',
  },
  DOCTOR: {
    role: 'DOCTOR',
    id: 'alisamad9571@gmail.com',
    pass: 'Doctor@12345',
    name: 'Dr. Syed',
    subtitle: 'Consultant Specialist (OPD Chamber)',
    doctorId: 'doc-ankur',
    clinicId: 'sarangpur',
  },
  FRONT_DESK: {
    role: 'FRONT_DESK',
    id: 'ayan.08m@outlook.com',
    pass: 'desk123',
    name: 'Ayan (Desk Staff)',
    subtitle: 'Rajgarh & Sarangpur Reception Desk',
    clinicId: 'rajgarh',
  },
  ADMIN: {
    role: 'ADMIN',
    id: 'jansevaarogyam@gmail.com',
    pass: 'Ankur@12345',
    name: 'Hospital Director',
    subtitle: 'Executive Super Admin Console',
  },
};
