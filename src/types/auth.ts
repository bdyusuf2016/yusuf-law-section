export type SystemRole = 
  | 'super_admin'       // কমিশনার / সুপার অ্যাডমিন
  | 'jc_adc'            // যুগ্ম / অতিরিক্ত কমিশনার
  | 'dc_ac'             // উপ-কমিশনার / সহকারী কমিশনার (সার্কেল প্রধান)
  | 'ro'                // রাজস্ব কর্মকর্তা (RO)
  | 'aro'               // সহকারী রাজস্ব কর্মকর্তা (ARO)
  | 'viewer';           // নিরীক্ষক / অডিটর / পরিদর্শক

export interface UserAccount {
  id: string;
  username: string;
  fullName: string;
  email: string;
  mobile?: string;
  role: SystemRole;
  designationBangla: string;
  circle: string; // '১', '২', '৩', '৪', '৫', '৬' or 'all'
  avatarUrl?: string;
  permissions: string[];
}

export interface AuthState {
  isLoggedIn: boolean;
  currentUser: UserAccount | null;
  token?: string;
  loginTime?: string;
}

export const PRESET_USERS: UserAccount[] = [
  {
    id: 'user-comm-1',
    username: 'commissioner',
    fullName: 'ড. মুহাম্মদ মোফিজুর রহমান',
    email: 'commissioner@vat.gov.bd',
    mobile: '০১৭১১-২২৩৩৪৪',
    role: 'super_admin',
    designationBangla: 'কমিশনার (সুপার অ্যাডমিন)',
    circle: 'all',
    permissions: ['all']
  },
  {
    id: 'user-jcadc-1',
    username: 'jcadc',
    fullName: 'কাজী শাহেদ হোসেন',
    email: 'jcadc@vat.gov.bd',
    mobile: '০১৮১১-৩৩৪৪৫৫',
    role: 'jc_adc',
    designationBangla: 'অতিরিক্ত কমিশনার (JC/ADC)',
    circle: 'all',
    permissions: ['cases.read', 'cases.write', 'orders.approve', 'circle.supervise']
  },
  {
    id: 'user-dc-1',
    username: 'dc_circle1',
    fullName: 'ফারহানা আহমেদ',
    email: 'dc.circle1@vat.gov.bd',
    mobile: '০১৯১১-৪৪৫৫৬৬',
    role: 'dc_ac',
    designationBangla: 'উপ-কমিশনার (সার্কেল-১ প্রধান)',
    circle: '১',
    permissions: ['cases.read', 'cases.write', 'scn.issue', 'orders.issue', 'circle.manage']
  },
  {
    id: 'user-ro-1',
    username: 'ro_circle1',
    fullName: 'মোঃ মাহবুবুর রহমান',
    email: 'ro.circle1@vat.gov.bd',
    mobile: '০১৬১১-৫৫৬৬৭৭',
    role: 'ro',
    designationBangla: 'রাজস্ব কর্মকর্তা (RO)',
    circle: '১',
    permissions: ['cases.read', 'cases.write', 'hearings.create', 'tasks.manage']
  },
  {
    id: 'user-aro-1',
    username: 'aro_circle1',
    fullName: 'আনিসুর রহমান',
    email: 'aro.circle1@vat.gov.bd',
    mobile: '০১৫১১-৬৬৭৭৮৮',
    role: 'aro',
    designationBangla: 'সহকারী রাজস্ব কর্মকর্তা (ARO)',
    circle: '১',
    permissions: ['cases.read', 'cases.write', 'tasks.update']
  },
  {
    id: 'user-auditor-1',
    username: 'auditor',
    fullName: 'তানভীর হাসান',
    email: 'auditor@vat.gov.bd',
    mobile: '০১৭২২-৩৩৪৪৫৫',
    role: 'viewer',
    designationBangla: 'অভ্যন্তরীণ নিরীক্ষক (Viewer)',
    circle: 'all',
    permissions: ['cases.read', 'reports.view']
  }
];
