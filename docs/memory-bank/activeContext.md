# Aktif Bağlam

## Mevcut Odak

Şu anda **Epic 2: Abonelik Yönetimi** üzerinde çalışıyoruz.

- **Tamamlanan Son İş:** 2-4 Abonelik Düzenleme ve Silme (Edit/Delete Flow)
- **Sıradaki İş:** 2-5 Periyot Seçimi ve Birraki Ödeme Hesaplaması (Period Selection)

## Son Değişiklikler

- **2025-12-27 (UI Polish & v1.0.0):**

  - **iOS Install Guidance:**
    - Görsel Türkçe versiyonu ile güncellendi (`ios-guidance-tr.png`).
    - İkonlar dikey olarak ortalandı ve hizalamalar düzeltildi.
    - Gereksiz "Kapat" butonu kaldırıldı, sadece aksiyon butonları bırakıldı.
    - Uyarı mesajı basitleştirildi.
    - `DialogTitle` erişilebilirlik ve hizalama sorunları çözüldü (Radix automatic context).
  - **Abonelik Listesi:** Filtre dropdown genişlikleri artırıldı (metin kesilmesi önlendi).
  - **Genel UI:**
    - Alt navigasyon çubuğu altındaki 1px boşluk düzeltildi.
    - Dashboard header boşlukları optimize edildi.
  - **Sürüm:** Uygulama sürümü `1.0.0` olarak güncellendi.

- **2025-12-18 (Story 2.4):**

  - `SubscriptionCard`, `SubscriptionDetailDialog`, `EditSubscriptionDialog`, `DeleteConfirmationDialog` bileşenleri oluşturuldu.
  - `SubscriptionForm` düzenleme moduna (`mode="edit"`) uygun hale getirildi.
  - `DeletionCelebration` bileşeni eklendi (CSS confetti ve `prefers-reduced-motion` desteği).
  - `useReducedMotion` hook'u geliştirildi.
  - `SubscriptionList` ile dashboard üzerindeki tüm abonelik akışı orkestre edildi.

- **2025-12-18 (Story 2.3):**
  - `SubscriptionForm` bileşeni oluşturuldu (Zod validation, Türkçe hata mesajları).

## Aktif Kararlar

1. **Dialog Orkestrasyonu:** Çoklu dialog (Detail -> Edit/Delete) yönetimi için `SubscriptionList` merkezi state holder olarak belirlendi.
2. **Animasyon Stratejisi:** Harici kütüphane yerine CSS Keyframes kullanıldı. Erişilebilirlik için `prefers-reduced-motion` kontrolü eklendi.
3. **Silme UX:** "Pozitif çerçeveleme" (positive framing) kullanılarak kullanıcının ne kadar tasarruf edeceği vurgulandı.

## Sonraki Adımlar

1. Story 2-5 (Period Selection) planlaması.
2. Analytics (Spending Summary) kartlarının planlanması (Story 3.1).
