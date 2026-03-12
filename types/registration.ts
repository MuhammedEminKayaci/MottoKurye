export interface CourierRegistration {
  // Kişisel Bilgiler
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  nationality: string;
  phone: string; // Always collected, even for in_app
  contactPreference: "phone" | "in_app" | "both";
  
  // İş Tecrübesi
  experience: string; // 0-1 | 1-3 | 3-5 | 5-10 | 10+
  
  // Çalışma Koşulları
  province: string;
  district: string[];
  workingType: string; // Full Time | Part Time
  earningModel: string; // Saat+Paket Başı | Aylık Sabit | Paket Başı
  workingDays: string; // İzinsiz | Haftanın 1 Günü İzin | Haftanın 2 Günü İzin
  dailyPackageEstimate: string; // 0-15 | 15-25 | 25-40 | 40+
  
  // Motorsiklet Bilgileri
  licenseType: string; // A1 | A | A2
  hasMotorcycle: string; // Var | Yok
  motoBrand?: string;
  motoCc?: string;
  hasBag: string; // Var | Yok
  
  // Belgeler
  p1Certificate: string; // VAR | YOK
  srcCertificate: string; // VAR | YOK
  criminalRecord: string; // VAR | YOK
  p1CertificateFile?: FileList;
  srcCertificateFile?: FileList;
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
  managerContact: string; // Always collected
  contactPreference: "phone" | "in_app" | "both";
  
  // Çalışma Koşulları
  province: string;
  district: string[];
  workingType: string; // Full Time | Part Time
  earningModel: string; // Saat+Paket Başı | Aylık Sabit | Paket Başı
  workingDays: string; // İzinsiz | Haftanın 1 Günü İzin | Haftanın 2 Günü İzin
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
