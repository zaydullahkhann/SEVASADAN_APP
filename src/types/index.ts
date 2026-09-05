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
    id: 'dr.ankur@sevasadan.com',
    pass: 'doctor123',
    name: 'Dr. Ankur Deshwali',
    subtitle: 'Chief Consultant Surgeon',
    doctorId: 'doc-ankur',
    clinicId: 'sarangpur',
  },
  FRONT_DESK: {
    role: 'FRONT_DESK',
    id: 'desk.sarangpur',
    pass: 'desk123',
    name: 'Sarangpur Reception Desk',
    subtitle: 'OPD Counter Operator',
    clinicId: 'sarangpur',
  },
  ADMIN: {
    role: 'ADMIN',
    id: 'admin@sevasadan.com',
    pass: 'admin123',
    name: 'Hospital Director',
    subtitle: 'Executive Super Admin',
  },
};
