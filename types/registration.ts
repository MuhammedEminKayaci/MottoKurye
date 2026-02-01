export interface CourierRegistration {
  // Kişisel Bilgiler
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  nationality: string;
  phone?: string;
  contactPreference: "phone" | "in_app" | "both";
  
  // İş Tecrübesi
  experience: string; // 0-1 | 1-3 | 3-5 | 5-10 | 10+
  
  // Çalışma Koşulları
  province: string;
  district: string[];
  workingType: string; // Full Time | Part Time
  earningModel: string; // Saat+Paket | Paket | Aylık Sabit
  workingDays: string[];
  dailyPackageEstimate: string; // 0-15 | 15-25 | 25-40 | 40+
  
  // Motorsiklet Bilgileri
  licenseType: string; // A1 | A | A2
  hasMotorcycle: string; // Var | Yok
  motoBrand?: string;
  motoCc?: string;
  hasBag: string; // Var | Yok
  
  // Belgeler
  p1Certificate: string; // VAR | YOK
  criminalRecord: string; // VAR | YOK
  p1CertificateFile?: FileList;
  criminalRecordFile?: FileList;
  
  // Onaylar
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptKVKK: boolean;
  acceptCommercial: boolean;
  
  // Consent Metadata (KVKK uyumu)
  consentVersion?: string;
  consentIpAddress?: string;
  
  avatarFile?: FileList;
  selectedAvatar?: string;
}

export interface BusinessRegistration {
  // Firma Bilgileri
  businessName: string;
  businessSector: string;
  managerName: string;
  managerContact?: string;
  contactPreference: "phone" | "in_app" | "both";
  
  // Çalışma Koşulları
  province: string;
  district: string[];
  workingType: string; // Full Time | Part Time
  earningModel: string; // Saat+Paket | Paket | Aylık Sabit
  workingDays: string[];
  dailyPackageEstimate: string; // 0-15 | 15-25 | 25-40 | 40+
  
  // Onaylar
  acceptTerms: boolean;
  acceptPrivacy: boolean;
  acceptKVKK: boolean;
  acceptCommercial: boolean;
  
  // Consent Metadata (KVKK uyumu)
  consentVersion?: string;
  consentIpAddress?: string;

  avatarFile?: FileList;
  selectedAvatar?: string;
}

export type RoleType = "kurye" | "isletme";
