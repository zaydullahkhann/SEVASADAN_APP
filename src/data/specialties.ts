export interface Specialty {
  id: string;
  name: string;
  iconName: string;
  doctorCount: number;
  description: string;
}

export const SPECIALTIES: Specialty[] = [
  {
    id: 'all',
    name: 'All Specialties',
    iconName: 'stethoscope',
    doctorCount: 4,
    description: 'Comprehensive OPD care across all branches',
  },
  {
    id: 'pediatric',
    name: 'Pediatric & Neonatal',
    iconName: 'baby',
    doctorCount: 1,
    description: 'Specialized surgery, newborn care & child health',
  },
  {
    id: 'general_medicine',
    name: 'General & Diabetes',
    iconName: 'heart',
    doctorCount: 1,
    description: 'Hypertension, diabetes management & adult medicine',
  },
  {
    id: 'gynaecology',
    name: "Women's Health",
    iconName: 'user',
    doctorCount: 1,
    description: 'Antenatal care, high-risk pregnancy & gynae surgery',
  },
  {
    id: 'orthopedics',
    name: 'Orthopedics & Spine',
    iconName: 'bone',
    doctorCount: 1,
    description: 'Joint replacement, trauma care & fracture repair',
  },
];

export const COMMON_SYMPTOMS = [
  'Pediatric Surgery Review',
  'Fever & Chills',
  'Cold & Cough',
  'Abdominal Pain',
  'Child Hernia / Swelling',
  'Diabetes Checkup',
  'Joint / Knee Pain',
  'Follow-up Review',
  'Skin Rash / Allergy',
  'General Weakness',
];

export const TIME_SLOTS = [
  '09:00 AM',
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:00 AM',
  '11:30 AM',
  '12:00 PM',
  '12:30 PM',
  '04:00 PM',
  '04:30 PM',
  '05:00 PM',
  '05:30 PM',
  '06:00 PM',
  '06:30 PM',
  '07:00 PM',
  '07:30 PM',
];
