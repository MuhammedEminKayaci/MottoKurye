export interface CourierRegistration {
  // Kişisel Bilgiler
  firstName: string;
  lastName: string;
  age: number;
  gender: string;
  nationality: string;
  phone: string;
  
  // İş Tecrübesi
  experience: string; // 0-1 | 1-3 | 3-5 | 5-10 | 10+
  
  // Çalışma Koşulları
  province: string;
  district: string;
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
  
  avatarFile?: FileList;
}

export interface BusinessRegistration {
  // Firma Bilgileri
  businessName: string;
  businessSector: string;
  managerName: string;
  managerContact: string;
  
  // Çalışma Koşulları
  province: string;
  district: string;
  workingType: string; // Full Time | Part Time
  earningModel: string; // Saat+Paket | Paket | Aylık Sabit
  workingDays: string[];
  dailyPackageEstimate: string; // 0-15 | 15-25 | 25-40 | 40+
  
  avatarFile?: FileList;
}

export type RoleType = "kurye" | "isletme";
