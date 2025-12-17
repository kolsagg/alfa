---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
inputDocuments:
  - docs/subtracker-spec.md
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 1
workflowType: "prd"
lastStep: 11
project_name: "SubTracker"
user_name: "kolsag"
date: "2025-12-16"
---

# Product Requirements Document - SubTracker

**Author:** kolsag
**Date:** 2025-12-16

## Executive Summary

**SubTracker**, kişisel abonelik takip dashboard'udur — ama gerçek değeri app içinde değil, **proaktif bildirimlerinde** yatar.

### Problem: Dikkat Ekonomisi

Modern dijital hayatta abonelikler "arka planda" çalışır. Problem unutmak değil, **dikkat eksikliği**:

- Otomatik çekim = görünmezlik = mental accounting yok
- Ödeme anında dikkat çeken trigger yok
- "Bu kesinti ne?" şoku → fatura gelince reaktif fark etme

### Çözüm: Proaktif Awareness Engine

SubTracker, dikkat eksikliğini proaktif bildirimlerle çözer:

1.  **Push Before Pull** — Uygulama açılmadan, ödeme öncesi notification
2.  **Countdown Hero** — En yakın ödeme görsel ve dramatik
3.  **Kart + Zaman İkiliği** — "Garanti'dan ne?" + "Bu hafta ne?"
4.  **Periyodik Audit** — "Hâlâ Netflix kullanıyor musun?" (manuel input yerine prompt)

### What Makes This Special

**Core Truth:** Uygulama nadiren açılacak — değer **dışarıda** olmalı.

- **Push-First Architecture** — Notification sistemi MVP'nin kalbi
- **Zero Friction Audit** — Manuel "last used" yerine sorulu audit
- **İki Görünüm Dengesi** — Kart (organizasyon) + Zaman (aksiyon)

**Aha Moment:** Uygulama açılmadan gelen notification ile ödeme farkındalığı.

## Project Classification

| Attribute           | Value                               |
| ------------------- | ----------------------------------- |
| **Technical Type**  | Web Application (SPA)               |
| **Domain**          | General (Personal Finance Tracking) |
| **Complexity**      | Low                                 |
| **Project Context** | Greenfield - new project            |

### Technical Stack

- **Framework:** React 18 + Vite
- **Styling:** TailwindCSS v4 + shadcn/ui
- **Storage:** localStorage + JSON (backend-free MVP)
- **Deploy:** Vercel / Netlify (free tier)

## Success Criteria

### User Success

**Primary Success Moments:**

1.  **Onboarding Success** — İlk 2 dakikada 1 abonelik eklendi + notification permission verildi
2.  **First Notification** — Kullanıcı ilk ödeme hatırlatıcısını aldığında "Bu çalışıyor!" hissi
3.  **Zombie Kill** — Kullanılmayan bir aboneliği tespit edip iptal ettiğinde "Para kurtardım!" anı

**Success Indicators:**

- Kullanıcı notification'lara güveniyor ve aksiyona geçiyor
- Aylık toplam harcamayı ilk bakışta anlayabiliyor
- Abonelik eklemek <30 saniye sürüyor
- "Bu kesinti ne?" şoku artık yaşanmıyor
- Onboarding tamamlama oranı yüksek (ilk 2 dk'da setup complete)

**Usage Pattern:** Notification-driven pasif kullanım — uygulama nadiren açılıyor, değer bildirimlerle geliyor.

### Business Success

**3 Ay Hedefi (MVP):**

- Kişisel aktif kullanım — her hafta en az 1 notification alıp faydalı buluyor
- En az 1 zombie abonelik tespit edilip iptal edilmiş
- Arkadaşlarla paylaşılabilir kalitede

**6+ Ay Hedefi (Growth):**

- 3-5 arkadaş aktif kullanıyor
- Pozitif feedback alınmış
- Publish kararı için veri toplanmış

**Monetization Consideration:**

- MVP: Tamamen ücretsiz
- Gelecek: Eğer publish edilirse, bir getiri modeli düşünülebilir

### Technical Success

**Öncelik Sırası:**

1.  🔔 **Notification Güvenilirliği** — Works when browser active + permission granted
2.  ⚡ **Performans** — Hızlı, responsive UI, anında tepki
3.  💾 **Data Güvenliği** — Export/import ile yedekleme, otomatik backup önerisi
4.  📱 **Responsive Design** — Mobil ve desktop'ta sorunsuz çalışmalı

**Technical Metrics:**

- First Contentful Paint < 1.5s
- Notification works reliably when browser active
- Zero data loss (export/import + weekly backup prompt)
- Works offline (PWA capability)
- Basic event logging for analytics

### Measurable Outcomes

| Metric                | Target           | Measurement                                  |
| --------------------- | ---------------- | -------------------------------------------- |
| Onboarding Complete   | >80%             | First sub + notification permission in 2 min |
| Notification Works    | 100% when active | Event log: notification_shown                |
| Data Integrity        | 0 loss           | Export/import + weekly backup prompt         |
| Page Load             | <1.5s            | Lighthouse score                             |
| Task Completion       | <30s             | Add subscription flow                        |
| Audit Prompt Response | 1+/quarter       | Completed audit prompts count                |

## Product Scope

### MVP — Minimum Viable Product (Hafta Sonu Projesi)

**Core Features:**

- [ ] Subscription CRUD (ekle, düzenle, sil)
- [ ] Kart eşleştirme (her abonelik → 1 kart)
- [ ] Yaklaşan ödemeler görünümü (7-30 gün)
- [ ] Countdown Hero widget (en yakın ödeme dramatik gösterim)
- [ ] Browser Notification sistemi (ödeme öncesi uyarı)
- [ ] Aylık + yıllık toplam hesaplama
- [ ] Kategori tagleri (TV, Eğlence, Kod, İş)
- [ ] Periyot desteği (aylık, yıllık, custom)
- [ ] Responsive design (mobile + desktop)
- [ ] Dark mode (system follow)
- [ ] JSON Export/Import — Data backup ve taşıma
- [ ] Onboarding flow — Guided first subscription + notification setup
- [ ] Basic event logging — notification_shown, subscription_added events

**Tech Stack:**

- React 18 + Vite
- TailwindCSS v4 + shadcn/ui
- localStorage + JSON
- Browser Notification API
- Vercel/Netlify deploy

### Growth Features (v0.2 — Post-MVP)

- [ ] Zombie Dedektör — Periyodik "hâlâ kullanıyor musun?" audit prompt
- [ ] Kullanım takibi — Basit "son kullandım" butonu
- [ ] ROI hesaplama — ₺/kullanım oranı gösterimi
- [ ] İptal linki — Quick action ile abonelik iptal sayfasına git
- [ ] Weekly auto-backup prompt — Data güvenliği için hatırlatma

### Vision (v1.0+ — Gelecek)

- [ ] Aile modu — Paylaşılan abonelikler, kişi başı maliyet
- [ ] Cloud sync — Supabase ile multi-device sync
- [ ] Freelancer modu — İş gideri tagleme, rapor export
- [ ] Publish & monetization — Eğer iyi giderse

## User Journeys

### Journey 1: "Organize" Emre - Kaostan Kontrole (Onboarding)

**Persona:** Organize Olmak İsteyen Ben
**Goal:** Abonelik karmaşasını çözmek ve toplam gideri görmek.

Emre, akşam kahvesini içerken yine hesap ekstresinde anlamadığı bir Apple çekimi görüp sinirlenir. SubTracker'ı açar.

1.  **Opening Scene:** Temiz, boş bir dashboard. "Hadi ilk aboneliğini ekleyelim" butonu onu karşılıyor.
2.  **Rising Action:** Netflix'i seçiyor, fiyatı ve günü giriyor. Sistem hemen "Hangi karttan?" diye soruyor. Emre "Enpara Kredi Kartı" olarak tanımlıyor. Hemen ardından Spotify ve Adobe'yi ekliyor.
3.  **Climax:** 3. aboneliği eklediği an, üstteki "Aylık Toplam" kartı güncelleniyor: **₺840/ay**. Rakamı görünce hafif bir şok yaşıyor ama ilk defa gerçek rakamı bildiği için bir rahatlama (control) hissediyor.
4.  **Resolution:** Uygulama "Ödeme öncesi haber vereyim mi?" diye soruyor. Emre tereddütsüz "Evet" diyor ve izni veriyor. Artık sürpriz yok.

### Journey 2: "Dalgın" Emre - Büyük İptal (Notification Value)

**Persona:** Sinirli/Şaşıran Ben
**Goal:** Gereksiz yıllık çekimleri engellemek.

Emre iş yerinde yoğun bir gün geçiriyor. Aboneliklerini tamamen unutmuş durumda.

1.  **Opening Scene:** Bilgisayar başında çalışırken sağ üstten bir bildirim düşüyor: **"⚠️ Dikkat: Adobe CC yarın yenileniyor (₺4.200)"**.
2.  **Rising Action:** Emre irkiliyor. "Oha, bu ay mıydı o?" diye düşünüyor. Adobe'yi geçen sene bir proje için almıştı ve aylardır kullanmıyordu.
3.  **Climax:** Eğer bu bildirim gelmeseydi, yarın sabah kartından ₺4.200 çekilecek ve iade almak için saatlerce uğraşacaktı. Hemen Adobe sitesine gidip iptal ediyor.
4.  **Resolution:** SubTracker dashboard'una girip Adobe kartını "Passive" moda alıyor. Kendi kendine "Bu app az önce bana 4 bin lira kazandırdı" diyerek gülümsüyor.

### Journey 3: "Zombie Hunter" - Sessiz Hırsızı Yakalamak (Audit)

**Persona:** Para Kaybeden Ben
**Goal:** Kullanılmayan "zombie" abonelikleri temizlemek.

Pazar sabahı, Emre SubTracker'dan haftalık rutin bir bildirim alır: **"Küçük bir kontrol: Hâlâ BluTV kullanıyor musun?"**

1.  **Opening Scene:** Emre bildirime tıklıyor. Uygulama basit bir soru soruyor: "BluTV en son ne zaman işine yaradı?"
2.  **Rising Action:** Emre düşünüyor. "En son Behzat Ç. izlemiştim... 3 ay önceydi."
3.  **Climax:** Aslında ayda ₺100 ödüyor ama hiç kullanmıyor. Bu bir "Zombie Abonelik". Uygulama içindeki "İptal Linki" (Growth feature) ile hemen siteye yönleniyor.
4.  **Resolution:** Üyeliği iptal ediyor. Dashboard'da aylık toplam ₺100 azalıyor. Yıllık ₺1.200 tasarruf.

### Journey 4: The Safety Net - Felaketten Dönüş (Data Safety)

**Persona:** Organize Ben
**Goal:** Veri kaybını önlemek.

Emre tarayıcı temizliği yapmadan önce SubTracker'a girer.

1.  **Opening Scene:** Dashboard'da "Verilerini en son 7 gün önce yedekledin" uyarısını görür.
2.  **Rising Action:** "Doğru ya, temizlik yapacağım şimdi silinmesin" der. Tek tıkla "Yedekle" butonuna basar.
3.  **Climax:** Sistem tüm veriyi JSON olarak panoya kopyalar veya bir `.json` dosyası indirir.
4.  **Resolution:** Tarayıcıyı temizler. SubTracker sıfırlanır. Ama "Yedeği Geri Yükle" diyerek dosyayı seçer ve her şey geri gelir. Güven tazelenir.

### Journey Requirements Summary

Bu hikayelerden çıkan teknik gereksinimler:

- **Onboarding:** İlk abonelik ekleme akışı < 1 dk olmalı ve friction yaratmamalı.
- **Card Mapping:** Abonelik eklerken kart seçimi/tanımlaması zorunlu olmalı.
- **Smart Notifications:** Browser kapalıyken bile (mümkünse) veya açıldığı an kritik bildirimler gösterilmeli.
- **Audit Prompts:** Sadece hatırlatma değil, düşündürücü sorular ("Hâlâ kullanıyor musun?") sorulmalı.
- **Visual Feedback:** Aylık toplamın anlık güncellenmesi psikolojik etki için kritik.
- **Data Safety:** Export/import ve periyodik yedekleme uyarısı.

## Web Application Specific Requirements

### Project-Type Overview

SubTracker, React tabanlı bir **Single Page Application (SPA)** olarak çalışacak. Sunucu (backend) gerektirmeyen, tüm veriyi kullanıcının tarayıcısında (localStorage) tutan, gizlilik odaklı ve hızlı bir mimari.

### Technical Architecture Considerations

**Browser Support Matrix:**

- **Supported:** Chrome, Safari, Firefox, Edge (Current - 2 versions)
- **Unsupported:** Internet Explorer, Legacy Edge
- **Mobile:** iOS Safari, Android Chrome. **Note:** iOS'te bildirimler için PWA kurulumu (Add to Home Screen) zorunludur.

**Responsive Design Strategy:**

- **Mobile First:** Tasarım önce mobil ekranlara göre yapılacak.
- **Interactions:** Mobilde kartlar için "Swipe Actions" (Sağa kaydır düzenle, Sola kaydır sil) desteği.
- **Desktop:** Geniş ekranda kartlar grid (ızgara) yapısına dönüşecek.

**Performance Targets:**

- **FCP (First Contentful Paint):** < 1.0s
- **Bundle Size:** Gzip sonrası < 350KB (shadcn + libraries overhead)

**Data Structure & Sync:**

- **Schema:** Robust JSON schema with UUIDs, `created_at`, `updated_at` timestamps (Supabase hazır).
- **Sync:** `storage` event listener ile multi-tab senkronizasyonu.

### Implementation Considerations

**Accessibility (Erişilebilirlik):**

- **Color Contrast:** Light/Dark mode uyumlu, renk körü dostu palet.
- **Keyboard Navigation:** Full klavye desteği (shadcn/ui native).

**PWA Capabilities:**

- "Ana Ekrana Ekle" (Add to Home Screen) desteği.
- Offline çalışabilme (Servis Worker).
- **iOS Warning:** Onboarding sırasında iOS kullanıcılarına "Bildirimler için Ana Ekrana Ekle" uyarısı gösterilecek.

## Functional Requirements

### Subscription Management (Core)

- **FR01:** Kullanıcı yeni bir abonelik ekleyebilir (Platform Adı, Kategori, Fiyat, Para Birimi, Periyot, İlk Ödeme Tarihi, Bağlı Kart).
- **FR02:** Kullanıcı mevcut bir aboneliği düzenleyebilir veya silebilir.
- **FR03:** Kullanıcı abonelikleri kategorilere (Eğlence, İş, Araçlar, vb.) ayırabilir.
- **FR04:** Kullanıcı abonelik döngüsünü (aylık, yıllık, haftalık, custom) seçebilir.
- **FR05:** Kullanıcı her abonelik için bir renk/ikon seçebilir (veya sistem otomatik atar).

### Wallet & Cards

- **FR06:** Kullanıcı kredi/banka kartlarını tanımlayabilir (Kart Adı, Son 4 Hane, Kesim Tarihi).
- **FR07:** Kullanıcı abonelik eklerken mevcut kartlardan birini seçebilir.
- **FR08:** Kullanıcı kart bazında toplam aylık yükü görüntüleyebilir.

### Notification System (Awareness Engine)

- **FR09:** Sistem, yaklaşan ödemeler için (kullanıcı tarafından belirlenen süre önce) tarayıcı bildirimi gönderir.
- **FR10:** Kullanıcı, bildirim almak istediği gün sayısını (örn: 3 gün önce) ve saati seçebilir.
- **FR11:** Kullanıcı, iOS cihazında uygulamayı "Ana Ekrana Ekle"mediyse bu konuda uyarı görüntüler.

### Dashboard & Analytics

- **FR12:** Kullanıcı, dashboard'da toplam aylık ve yıllık tahmini harcamayı görebilir.
- **FR13:** Kullanıcı, yaklaşan ödemeleri kronolojik sırayla (Timeline View) görebilir.
- **FR14:** Kullanıcı, en yakın ödemeyi "Countdown Hero" widget'ında dramatik bir sayaçla görür.

### Data Management & System

- **FR15:** Kullanıcı, tüm verilerini JSON formatında dışa aktarabilir (Export).
- **FR16:** Kullanıcı, JSON yedeğini geri yükleyebilir (Import).
- **FR17:** Sistem, verileri kullanıcının tarayıcısında (localStorage) saklar.
- **FR18:** Sistem, haftalık olarak kullanıcıya "Yedek al" hatırlatması yapar.
- **FR19:** Kullanıcı, bildirim ayarlarını (açık/kapalı, saat, gün sayısı) yapılandırabilir.

### Settings & Personalization

- **FR20:** Kullanıcı, uygulamanın light veya dark temada çalışmasını seçebilir (veya sistem ayarını takip eder).

### Onboarding

- **FR21:** Kullanıcı, ilk açılışta rehberli onboarding akışıyla uygulamayı kurabilir.

### System & Analytics

- **FR22:** Sistem, kullanıcı aksiyonlarını (subscription_added, notification_shown) anonim olarak loglar.
- **FR23:** Sistem, hiç abonelik yokken kullanıcıya boş state (empty state) ve yönlendirme gösterir.
- **FR24:** Sistem, aynı gün birden fazla ödeme varsa bildirimleri gruplar veya ayrı gönderir.

### Data Handling

- **FR25:** Kullanıcı, geçmiş tarihli bir abonelik ekleyebilir (sistem bir sonraki periyodu otomatik hesaplar).
- **FR26:** Sistem, kullanıcı verisini hiçbir sunucuya göndermez (privacy-first, tüm veri localStorage'da kalır).

## Non-Functional Requirements

### Performance

- **NFR01:** Sayfa ilk açılışta (First Contentful Paint) < 1.0 saniyede yüklenmeli.
- **NFR02:** Abonelik ekleme/düzenleme işlemi < 100ms içinde UI güncellemesi sağlamalı.
- **NFR03:** Gzip sonrası toplam bundle boyutu < 400KB olmalı (tree-shaking sonrası).
- **NFR04:** 100+ abonelik durumunda virtualized list kullanılmalı, scroll akıcı kalmalı (60fps).

### Security & Privacy

- **NFR05:** Tüm kullanıcı verisi yalnızca localStorage'da tutulmalı, sunucuya gönderilmemeli.
- **NFR06:** JSON Export dosyası hassas veri (kart numarası) içermemeli (sadece kart adı ve son 4 hane).
- **NFR07:** Uygulama, üçüncü taraf tracking scriptleri içermemeli.

### Reliability

- **NFR08:** Uygulama, internet bağlantısı olmadan tam işlevsel çalışmalı (offline-first, cache-first strategy).
- **NFR09:** localStorage temizlense bile JSON import ile veri kurtarılabilmeli.
- **NFR10:** Bildirimler, tarayıcı tab'ı aktif ve focused olduğu sürece %100 güvenilirlikle tetiklenmeli.

### Accessibility

- **NFR11:** Tüm interaktif elementler klavye ile erişilebilir olmalı (Tab/Enter).
- **NFR12:** Renk paleti, WCAG 2.1 AA minimum kontrast oranını (4.5:1) sağlamalı.
- **NFR13:** Kritik bilgiler yalnızca renge bağlı olmamalı (ikon/metin destekli).

### System Limits & Warnings

- **NFR14:** Sistem, kayıt sayısı 500'ü geçerse kullanıcıyı uyarmalı ve yedekleme önermelidir.
- **NFR15:** JSON Export dosya boyutu 5MB'ı geçerse kullanıcı bilgilendirilmeli.

### Notification Hygiene

- **NFR16:** Sistem, aynı abonelik için aynı gün içinde birden fazla bildirim göndermemeli.

### Data Integrity

- **NFR17:** Import edilen JSON, schema doğrulamasından geçmeli; geçersiz veri reject edilmeli.
