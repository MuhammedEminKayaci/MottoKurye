"use client";
import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import type { CourierRegistration } from "../../../types/registration";
import { ISTANBUL_DISTRICTS } from "../../../lib/istanbul-districts";
import { MultiSelect } from "../../_components/MultiSelect";

const courierSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter"),
  lastName: z.string().min(2, "Soyad en az 2 karakter"),
  age: z.number().int().min(18, "18 yaşından büyük olmalısınız").max(80, "Geçerli yaş girin"),
  gender: z.enum(["Erkek", "Kadın"]),
  nationality: z.string().min(1, "Uyruk seçin"),
  phone: z.string().optional(),
  contactPreference: z.enum(["phone", "in_app"]),
  experience: z.enum(["0-1", "1-3", "3-5", "5-10", "10+"]),
  province: z.string().min(1, "İl seçin"),
  district: z.array(z.string()).min(1, "En az bir ilçe seçin"),
  workingType: z.enum(["Full Time", "Part Time"]),
  earningModel: z.enum(["Saat+Paket Başı", "Paket Başı", "Aylık Sabit"]),
  workingDays: z.array(z.string()).min(1, "En az bir gün seçin"),
  dailyPackageEstimate: z.enum(["0-15 PAKET", "15-25 PAKET", "25-40 PAKET", "40 VE ÜZERİ"]),
  licenseType: z.enum(["A1", "A", "A2"]),
  hasMotorcycle: z.enum(["VAR", "YOK"]),
  motoBrand: z.string().optional(),
  motoCc: z.string().optional(),
  hasBag: z.enum(["VAR", "YOK"]),
  p1Certificate: z.enum(["VAR", "YOK"], { required_error: "P1 yetki belgesi durumu gerekli" }),
  criminalRecord: z.enum(["VAR", "YOK"], { required_error: "Sabıka kaydı durumu gerekli" }),
  p1CertificateFile: z.any(),
  criminalRecordFile: z.any(),
  acceptTerms: z.literal(true, { errorMap: () => ({ message: "Kullanım şartlarını kabul etmelisiniz" }) }),
  acceptPrivacy: z.literal(true, { errorMap: () => ({ message: "Gizlilik politikasını kabul etmelisiniz" }) }),
  acceptKVKK: z.literal(true, { errorMap: () => ({ message: "KVKK aydınlatma metnini kabul etmelisiniz" }) }),
  acceptCommercial: z.literal(true, { errorMap: () => ({ message: "Ticari ileti iznini onaylamalısınız" }) }),
  avatarFile: z.any().optional(),
}).superRefine((val, ctx) => {
  if (val.contactPreference === "phone") {
    if (!val.phone || val.phone.trim().length < 10) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Telefon gerekli",
        path: ["phone"],
      });
    }
  }
  const validateFile = (fileList: FileList | undefined | null, field: "p1CertificateFile" | "criminalRecordFile") => {
    if (!fileList || (fileList as any).length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Belge yüklemek zorunlu", path: [field] });
      return;
    }
    const file = (fileList as any)[0] as File;
    const allowed = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowed.includes(file.type)) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Sadece JPEG, PNG veya PDF yükleyin", path: [field] });
    }
  };

  validateFile(val.p1CertificateFile as FileList, "p1CertificateFile");
  validateFile(val.criminalRecordFile as FileList, "criminalRecordFile");
});

export interface CourierFormProps {
  onSubmit: (data: CourierRegistration) => void;
  disabled?: boolean;
}

const days = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];

export function CourierForm({ onSubmit, disabled }: CourierFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CourierRegistration>({
    resolver: zodResolver(courierSchema),
    defaultValues: {
      province: "İstanbul",
      district: [],
      nationality: "Türkiye",
      workingType: "Full Time",
      earningModel: "Saat+Paket Başı",
      dailyPackageEstimate: "15-25 PAKET",
      workingDays: ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma"],
      hasMotorcycle: "VAR",
      hasBag: "VAR",
      licenseType: "A",
      experience: "0-1",
      gender: "Erkek",
      contactPreference: "phone",
      p1Certificate: "YOK",
      criminalRecord: "YOK",
      p1CertificateFile: undefined,
      criminalRecordFile: undefined,
      acceptTerms: false,
      acceptPrivacy: false,
      acceptKVKK: false,
      acceptCommercial: false,
    },
  });

  const hasMotorcycle = watch("hasMotorcycle");
  const contactPreference = watch("contactPreference");
  // Always use Istanbul districts
  const districts = ISTANBUL_DISTRICTS;
  const avatarWatch = watch("avatarFile");
  const p1FileWatch = watch("p1CertificateFile");
  const criminalFileWatch = watch("criminalRecordFile");
  const [preview, setPreview] = useState<string | null>(null);
  
  useEffect(() => {
    if (avatarWatch && avatarWatch.length > 0) {
      const url = URL.createObjectURL(avatarWatch[0]);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreview(null);
    }
  }, [avatarWatch]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Profil Fotoğrafı */}
      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-full overflow-hidden bg-white/40 flex items-center justify-center border">
          {preview ? (
            <img src={preview} alt="Önizleme" className="object-cover w-full h-full" />
          ) : (
            <span className="text-3xl">👤</span>
          )}
        </div>
        <div className="flex-1">
          <label className="block text-xs font-medium text-white mb-1">Profil Fotoğrafı (Opsiyonel)</label>
          <input type="file" accept="image/*" className="input-field text-xs" {...register("avatarFile")}/>
        </div>
      </div>

      {/* KİŞİSEL BİLGİLER */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">KİŞİSEL BİLGİLER</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Ad *</label>
            <input className="input-field text-sm" {...register("firstName")} placeholder="Adınız" />
            {errors.firstName && <p className="text-[10px] text-red-200 mt-1">{errors.firstName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Soyad *</label>
            <input className="input-field text-sm" {...register("lastName")} placeholder="Soyadınız" />
            {errors.lastName && <p className="text-[10px] text-red-200 mt-1">{errors.lastName.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Yaş *</label>
            <input type="number" className="input-field text-sm" {...register("age", { valueAsNumber: true })} placeholder="25" />
            {errors.age && <p className="text-[10px] text-red-200 mt-1">{errors.age.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Cinsiyet *</label>
            <select className="input-field text-sm" {...register("gender")}>
              <option value="Erkek">Erkek</option>
              <option value="Kadın">Kadın</option>
            </select>
            {errors.gender && <p className="text-[10px] text-red-200 mt-1">{errors.gender.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Uyruk *</label>
            <select className="input-field text-sm" {...register("nationality")}>
              <option value="Türkiye">Türkiye</option>
              <option value="Azerbaycan">Azerbaycan</option>
              <option value="Gürcistan">Gürcistan</option>
              <option value="Diğer">Diğer</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Telefon *</label>
            <input className="input-field text-sm" {...register("phone")} placeholder="05XXXXXXXXX" disabled={contactPreference === "in_app"} />
            {errors.phone && <p className="text-[10px] text-red-200 mt-1">{errors.phone.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">İletişim Tercihi *</label>
            <select className="input-field text-sm" {...register("contactPreference")}>
              <option value="phone">Telefon ile iletişim (arama/WhatsApp)</option>
              <option value="in_app">Uygulama içi iletişim (yakında)</option>
            </select>
            <p className="text-[10px] text-white/70 mt-1">Telefon seçilirse arama/WhatsApp açıktır. Uygulama içi seçilirse telefonla arama yapılmaz.</p>
          </div>
        </div>
      </div>

      {/* İŞ TECRÜBE */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">İŞ TECRÜBE</h3>
        <div>
          <label className="block text-xs font-medium text-white mb-1">Tecrübe Süresi *</label>
          <select className="input-field text-sm" {...register("experience")}>
            <option value="0-1">0-1 YIL</option>
            <option value="1-3">1-3 YIL</option>
            <option value="3-5">3-5 YIL</option>
            <option value="5-10">5-10 YIL</option>
            <option value="10+">10 YIL ÜZERİ</option>
          </select>
          {errors.experience && <p className="text-[10px] text-red-200 mt-1">{errors.experience.message}</p>}
        </div>
      </div>

      {/* ÇALIŞMA KOŞULLARI */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">ÇALIŞMA KOŞULLARI</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışılacak İl *</label>
            <input type="text" className="input-field text-sm bg-white/20" value="İstanbul" disabled {...register("province")} />
            {errors.province && <p className="text-[10px] text-red-200 mt-1">{errors.province.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışılacak İlçe *</label>
            <Controller
              name="district"
              control={control}
              render={({ field }) => (
                <MultiSelect
                  options={districts}
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="İlçe Seçin"
                />
              )}
            />
            {errors.district && <p className="text-[10px] text-red-200 mt-1">{errors.district.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Çalışma Tipi *</label>
            <select className="input-field text-sm" {...register("workingType")}>
              <option value="Full Time">Full Time</option>
              <option value="Part Time">Part Time</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Kazanç Modeli *</label>
            <select className="input-field text-sm" {...register("earningModel")}>
              <option value="Saat+Paket Başı">Saat + Paket Başı</option>
              <option value="Paket Başı">Paket Başı</option>
              <option value="Aylık Sabit">Aylık Sabit</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="block text-xs font-medium text-white mb-1">Tahmini Günlük Paket *</label>
            <select className="input-field text-sm" {...register("dailyPackageEstimate")}>
              <option value="0-15 PAKET">0-15 PAKET</option>
              <option value="15-25 PAKET">15-25 PAKET</option>
              <option value="25-40 PAKET">25-40 PAKET</option>
              <option value="40 VE ÜZERİ">40 VE ÜZERİ</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-white mb-2">Çalışma Günleri *</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {days.map(day => (
              <label key={day} className="flex items-center gap-1.5 text-xs text-white bg-white/10 rounded px-2 py-1.5">
                <input type="checkbox" value={day} {...register("workingDays")} className="accent-[#ff7a00]" />
                <span>{day}</span>
              </label>
            ))}
          </div>
          {errors.workingDays && <p className="text-[10px] text-red-200 mt-1">{errors.workingDays.message}</p>}
        </div>
      </div>

      {/* MOTORSİKLET BİLGİLERİ */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">MOTORSİKLET BİLGİLERİ</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">Ehliyet Türü *</label>
            <select className="input-field text-sm" {...register("licenseType")}>
              <option value="A1">A1</option>
              <option value="A">A</option>
              <option value="A2">A2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Motorsiklet Durumu *</label>
            <select className="input-field text-sm" {...register("hasMotorcycle")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
          </div>
          {hasMotorcycle === "VAR" && (
            <>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Motorsiklet Marka</label>
                <input className="input-field text-sm" {...register("motoBrand")} placeholder="Yamaha, Honda..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-white mb-1">Motorsiklet CC</label>
                <input className="input-field text-sm" {...register("motoCc")} placeholder="125, 150..." />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs font-medium text-white mb-1">Taşıma Çantası *</label>
            <select className="input-field text-sm" {...register("hasBag")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
          </div>
        </div>
      </div>

      {/* BELGELER */}
      <div className="space-y-3">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">BELGELER</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-white mb-1">P1 Yetki Belgesi *</label>
            <select className="input-field text-sm" {...register("p1Certificate")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
            {errors.p1Certificate && <p className="text-[10px] text-red-200 mt-1">{errors.p1Certificate.message as any}</p>}
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="input-field text-xs mt-2" {...register("p1CertificateFile")}/>
            {errors.p1CertificateFile && <p className="text-[10px] text-red-200 mt-1">{errors.p1CertificateFile.message as any}</p>}
            <p className="text-[10px] text-white/70 mt-1">JPEG, PNG veya PDF yüklenmelidir.</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-white mb-1">Sabıka Kaydı *</label>
            <select className="input-field text-sm" {...register("criminalRecord")}>
              <option value="VAR">VAR</option>
              <option value="YOK">YOK</option>
            </select>
            {errors.criminalRecord && <p className="text-[10px] text-red-200 mt-1">{errors.criminalRecord.message as any}</p>}
            <input type="file" accept=".jpg,.jpeg,.png,.pdf" className="input-field text-xs mt-2" {...register("criminalRecordFile")}/>
            {errors.criminalRecordFile && <p className="text-[10px] text-red-200 mt-1">{errors.criminalRecordFile.message as any}</p>}
            <p className="text-[10px] text-white/70 mt-1">JPEG, PNG veya PDF yüklenmelidir.</p>
          </div>
        </div>
      </div>

      {/* SÖZLEŞMELER VE İZİNLER */}
      <div className="space-y-2">
        <h3 className="text-white font-bold text-sm border-b border-white/30 pb-1">SÖZLEŞMELER VE İZİNLER</h3>
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptTerms")} />
          <span>
            <a href="/kullanim-sartlari" target="_blank" className="text-white underline hover:text-white/80">Kullanım Şartları</a>'nı okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptTerms && <p className="text-[10px] text-red-200">{errors.acceptTerms.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptPrivacy")} />
          <span>
            <a href="/gizlilik-politikasi" target="_blank" className="text-white underline hover:text-white/80">Gizlilik Politikası</a>'nı okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptPrivacy && <p className="text-[10px] text-red-200">{errors.acceptPrivacy.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptKVKK")} />
          <span>
            <a href="/kvkk-aydinlatma" target="_blank" className="text-white underline hover:text-white/80">KVKK Aydınlatma Metni</a>'ni okudum ve kabul ediyorum. *
          </span>
        </label>
        {errors.acceptKVKK && <p className="text-[10px] text-red-200">{errors.acceptKVKK.message as any}</p>}
        <label className="flex items-start gap-2 text-xs text-white">
          <input type="checkbox" className="mt-0.5 accent-[#ff7a00]" {...register("acceptCommercial")} />
          <span>
            <a href="/ticari-ileti-izni" target="_blank" className="text-white underline hover:text-white/80">Ticari İleti İzni</a>'ni okudum ve ticari elektronik ileti almayı kabul ediyorum. *
          </span>
        </label>
        {errors.acceptCommercial && <p className="text-[10px] text-red-200">{errors.acceptCommercial.message as any}</p>}
        <p className="text-[10px] text-white/70 mt-2">
          * Tüm onaylar zorunludur. Kişisel verilerinizin işlenmesi hakkında detaylı bilgi için lütfen ilgili metinleri okuyun.
        </p>
      </div>

      <button type="submit" disabled={disabled} className="primary-btn w-full">
        {disabled ? "Kaydediliyor..." : "Kurye Kaydını Tamamla"}
      </button>
    </form>
  );
}
