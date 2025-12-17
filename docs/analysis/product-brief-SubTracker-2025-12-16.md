---
stepsCompleted: [1, 2, 3, 4, 5]
inputDocuments:
  - docs/prd.md
  - docs/subtracker-spec.md
workflowType: "product-brief"
lastStep: 5
project_name: "SubTracker"
user_name: "kolsag"
date: "2025-12-16"
---

# Product Brief: SubTracker

**Date:** 2025-12-16
**Author:** kolsag

---

## Executive Summary

SubTracker, kişisel abonelik takip dashboard'u — ama gerçek değeri app içinde değil, **proaktif bildirimlerinde** yatar. Modern dijital hayatta abonelikler "arka planda" çalışır ve otomatik çekim görünmezlik yaratır. SubTracker bu dikkat eksikliğini push-first bildirimlerle çözer.

**Core Truth:** Uygulama nadiren açılacak — değer dışarıda olmalı.

**Positioning:** _"Uygulamayı açmana gerek yok. SubTracker seni bulur."_ — Anti-app yaklaşımı.

**Aha Moment:** Uygulama açılmadan gelen notification ile ödeme farkındalığı.

---

## Core Vision

### Problem Statement

Modern dijital hayatta abonelikler "arka planda" çalışır. Problem unutmak değil, **dikkat eksikliği**:

- Otomatik çekim = görünmezlik = mental accounting yok
- Ödeme anında dikkat çeken trigger yok
- "Bu kesinti ne?" şoku → fatura gelince reaktif fark etme

### Problem Impact

- **Finansal:** Kullanılmayan "zombie" aboneliklere para akıyor
- **Mental:** Beklenmedik kesintiler stres yaratıyor
- **Kontrol:** Toplam gider görünmüyor, bütçe planlaması zorlaşıyor
- **Kur volatilitesi:** USD bazlı abonelikler (Netflix, Spotify, Adobe) TL'de şok yaratıyor

### Why Existing Solutions Fall Short

- **Expense trackerlar:** Reaktif — harcama olduktan SONRA gösterir
- **Banka uygulamaları:** Abonelik kategorisi yok, karışık görünüm
- **US-focused applar (Truebill):** Türk bankalarıyla entegrasyon yok, Türkçe yok
- **Manuel takip:** Friction çok yüksek, sürdürülebilir değil

### Proposed Solution

**Proaktif Awareness Engine:**

1.  **Push Before Pull** — Uygulama açılmadan, ödeme öncesi notification
2.  **Countdown Hero** — En yakın ödeme görsel ve dramatik (24 saat eşiğinde crescendo)
3.  **Kart + Zaman İkiliği** — "Garanti'dan ne?" + "Bu hafta ne?"
4.  **Periyodik Audit** — "Hâlâ kullanıyor musun?" prompt (manuel input yerine)
5.  **FX Shock Alert** — USD/EUR aboneliklerde kur değişim uyarısı

### Key Differentiators

| Özellik              | SubTracker             | Diğerleri                |
| -------------------- | ---------------------- | ------------------------ |
| Notification-first   | ✅ Kalp                | ❌ Eklenti               |
| Privacy-first        | ✅ Sadece localStorage | ❌ Cloud zorunlu         |
| Audit prompts        | ✅ Soru bazlı          | ❌ Manuel "son kullanım" |
| FX Shock Alert       | ✅ Kur değişim uyarısı | ❌ Yok                   |
| Türkçe & TL odaklı   | ✅                     | ❌                       |
| Anti-app positioning | ✅ "Açmana gerek yok"  | ❌ "Her gün aç"          |

### Party Mode Insights (Agent Contributions)

| Agent                   | Insight                                 | Action                                      |
| ----------------------- | --------------------------------------- | ------------------------------------------- |
| **John (PM)**           | Browser notification iOS limitasyonları | Onboarding'de PWA kurulum uyarısı zorunlu   |
| **Sally (UX)**          | Countdown crescendo                     | 24 saat eşiğinde dramatik, öncesi subtle    |
| **Victor (Strategy)**   | Anti-app positioning                    | "Uygulama açma, biz seni buluruz" messaging |
| **Carson (Innovation)** | FX Shock Alert                          | USD aboneliklerde kur karşılaştırma         |
| **Amelia (Dev)**        | FX implementation                       | +2-3 saat dev, free API, 24h cache          |

### Technical Consideration: FX Shock Alert

**Schema addition:**

```typescript
interface Subscription {
  currency: "TRY" | "USD" | "EUR";
  originalAmount: number;
}

interface FxCache {
  lastFetchDate: string;
  rates: { USD: number; EUR: number };
  previousMonthRates: { USD: number; EUR: number };
}
```

**Approach:** USD abonelik eklendiğinde organik olarak sor, friction yok.

---

## Target Users

### Primary User: Emre

**Demografik Profil:**

- **Yaş:** 25
- **Meslek:** Jr. Software Developer (ABAP)
- **Gelir:** 40-45K TRY/ay
- **Lokasyon:** Türkiye, büyükşehir
- **Tech-savviness:** Orta-Yüksek (developer ama abonelik takibi için özel çaba harcamıyor)

**Abonelik Profili:**

- **Algılanan abonelik sayısı:** 5-6 adet (kafasında tuttuğu)
- **Gerçek abonelik sayısı:** 8-10 adet (unutulanlar dahil) ← _SubTracker ile keşfedilecek_
- **Tipik abonelikler:** Netflix, Spotify, Adobe CC, GitHub Copilot, ChatGPT Plus, iCloud, Google One, unutulmuş deneme abonelikleri
- **Para birimi karışımı:** Hem TRY hem USD bazlı
- **Ödeme yöntemi:** 1-2 kredi kartı

**Trigger Event (Uygulama Arama Nedeni):**

> Ay sonu ekstresinde 3 tane tanımadığı kesinti gördü. "Bu ne? Bu da ne?" şoku yaşadı.
> VEYA: Arkadaşı SubTracker ile 3 zombie bulduğunu ve ₺300/ay kurtardığını söyledi.

**Problem Deneyimi:**

- **Pain seviyesi:** 5-6/10 (ama hidden subs fark edilince 7-8'e çıkıyor)
- **Belirtiler:**
  - Ay sonu ekstre şoku: "Bu kesinti ne?"
  - Yıllık yenilemeleri unutma (Adobe gibi)
  - Kullanmadığı halde ödediği "zombie" abonelikler
  - USD aboneliklerde kur sürprizleri
  - **Farkında olmadığı abonelikler** (deneme sonrası unuttukları)

**Mevcut Çözümler (Workarounds):**

- Takvime hatırlatıcı ekleme (ama unutuyor)
- Banka ekstresini ayda 1 kontrol (reaktif, eksik)
- Hiçbir şey yapmıyor, akışına bırakıyor

**Başarı Vizyonu:**

- "Ödeme olmadan ÖNCE bilmek istiyorum"
- "Toplam ne harcıyorum bir bakışta görmeliyim"
- "Kullanmadığım şeyi fark edip iptal edebilmeliyim"
- **"Ödediğimi bile bilmediğim şeyleri keşfetmek istiyorum"**

**Value Discovery Moment:**

> İlk setup'ta tüm aboneliklerini girerken "Oha, ben bunlara da mı ödüyormuşum?" şoku.
> Ortalama kullanıcı 2-3 "hidden" abonelik keşfediyor.

---

### User Journeys

#### Journey 0: Keşif Şoku (First Value Moment)

> Emre SubTracker'a aboneliklerini girerken banka ekstresine bakmak zorunda kalır.
> "Hoppala, Evernote'a hâlâ mı ödüyormuşum?" — 2 yıldır kullanmıyor.
> İlk zombie bulundu. Değer teslim edildi.

#### Journey 1: Kaostan Kontrole (Onboarding)

> İlk 2 dakikada 1 abonelik + notification permission → "₺940/ay" şoku → kontrol hissi

#### Journey 2: Büyük İptal (Notification Value)

> Adobe CC ₺4.200 yenileme bildirimi → "Oha bu ay mıydı?" → son dakika iptal → para kurtarma

#### Journey 3: Zombie Hunter (Audit)

> "Hâlâ BluTV kullanıyor musun?" prompt → 3 ay önce son kullanım → iptal → ₺1.200/yıl tasarruf

#### Journey 4: Safety Net (Data Backup)

> Tarayıcı temizliği öncesi export → localStorage silinir → import ile geri yükleme → güven

---

### Secondary Users

> Not: MVP için secondary user analizi ertelendi. Growth phase'de değerlendirilecek:
>
> - Aile modu (paylaşılan abonelikler)
> - Freelancer modu (iş gideri tagleme)

---

## Success Metrics

### Core Metrics (5 Max — Actionable Only)

| #   | Metric                         | Target | Measurement                                   | Action if Low         |
| --- | ------------------------------ | ------ | --------------------------------------------- | --------------------- |
| 1   | **Onboarding Complete**        | >80%   | First sub + notification permission in 2 min  | Simplify flow         |
| 2   | **Time to First Value (TTFV)** | <5 min | Setup → first zombie OR first notification    | Improve discovery UX  |
| 3   | **Zombie Discovery Rate**      | >50%   | Users who found at least 1 zombie             | Enhance audit prompts |
| 4   | **Notification Action Rate**   | >30%   | notification_clicked / notification_shown     | Improve copy/timing   |
| 5   | **Confirmed Savings**          | Track  | Sum of user-confirmed cancelled subscriptions | Retention indicator   |

### Business Objectives

**3 Ay (MVP):**

- Kişisel aktif kullanım — her hafta en az 1 notification alıp faydalı buluyor
- En az 1 zombie abonelik tespit edilip iptal edilmiş
- TTFV <5 dakika
- Arkadaşlarla paylaşılabilir kalitede

**6+ Ay (Growth):**

- 3-5 arkadaş aktif kullanıyor
- Pozitif feedback alınmış
- Ortalama confirmed savings >₺200/kullanıcı
- Publish kararı için veri toplanmış

### Technical Metrics (Background)

| Metric                   | Target                   | Notes                  |
| ------------------------ | ------------------------ | ---------------------- |
| Notification Reliability | 100% when browser active | Core promise           |
| Data Integrity           | 0 loss                   | Export/import fallback |
| Page Load (FCP)          | <1.5s                    | Lighthouse tracking    |

### Analytics Schema

```typescript
interface Analytics {
  // Core metrics
  onboardingCompleted: boolean;
  timeToFirstValue: number; // seconds
  zombiesFound: number;
  notificationsShown: number;
  notificationsClicked: number;

  // Savings tracking
  potentialSavings: number; // zombie marked but not confirmed
  confirmedSavings: number; // user clicked "I cancelled"

  // Supporting
  subscriptionsAdded: number;
  subscriptionsCancelled: number;
}
```

### Party Mode Insights

| Agent                 | Contribution                                        |
| --------------------- | --------------------------------------------------- |
| **John (PM)**         | "5 metrics max, vanity vs actionable"               |
| **Murat (TEA)**       | "Split savings: potential vs confirmed for honesty" |
| **Victor (Strategy)** | "Time to First Value — most critical SaaS metric"   |

---

## MVP Scope

### Core Features (Must Have)

| Feature                    | Description                                    | Priority    | Est. Time        |
| -------------------------- | ---------------------------------------------- | ----------- | ---------------- |
| **Subscription CRUD**      | Ekle, düzenle, sil, listele                    | 🔴 Critical | 6-8h             |
| **Kart Eşleştirme**        | Her abonelik → 1 kart                          | 🔴 Critical | (incl.)          |
| **Countdown Hero**         | En yakın ödeme dramatik sayaç (24h crescendo)  | 🔴 Critical | (incl.)          |
| **Browser Notification**   | Ödeme öncesi uyarı (PWA ready)                 | 🔴 Critical | 3-4h             |
| **FX Shock Alert**         | USD/EUR aboneliklerde kur değişim uyarısı      | 🔴 Critical | 2-3h             |
| **Yaklaşan Ödemeler**      | Timeline view (7-30 gün)                       | 🔴 Critical | (incl.)          |
| **Toplam Hesaplama**       | Aylık + yıllık tahmini                         | 🔴 Critical | (incl.)          |
| **Simple Zombie Detector** | 90 gün kullanılmayan için audit prompt         | 🟡 High     | 2h               |
| **Kategori Tagleri**       | TV, Eğlence, Kod, İş                           | 🟢 Medium   | 1h               |
| **Periyot Desteği**        | Aylık, yıllık, haftalık, custom                | 🟢 Medium   | (incl.)          |
| **JSON Export/Import**     | Data backup ve taşıma                          | 🔴 Critical | 1-2h             |
| **Onboarding Flow**        | Guided first subscription + notification setup | 🔴 Critical | 3-4h             |
| **Responsive Design**      | Mobile + desktop                               | 🔴 Critical | (incl.)          |
| **Dark Mode**              | System follow                                  | 🟢 Medium   | (free w/ shadcn) |
| **Basic Analytics**        | TTFV, zombie count, savings tracking           | 🟡 High     | 1-2h             |

**Total Estimate:** 17-21 saat

### Out of Scope for MVP

| Feature                        | Reason                              | Target Version |
| ------------------------------ | ----------------------------------- | -------------- |
| **Detailed kullanım takibi**   | Friction ekler, basit audit yeterli | v0.2           |
| **ROI hesaplama (₺/kullanım)** | Analytics bağımlı, önce data topla  | v0.2           |
| **İptal linki veritabanı**     | Content curation gerekli            | v0.2           |
| **Weekly auto-backup prompt**  | Nice-to-have, manuel export yeterli | v0.2           |
| **Aile modu**                  | Complexity artışı, multi-user UX    | v1.0           |
| **Cloud sync (Supabase)**      | Privacy-first MVP, cloud later      | v1.0           |
| **Freelancer modu**            | Niche feature, core odak değil      | v1.0           |
| **Swipe actions (mobile)**     | Touch UX, click yeterli MVP için    | v0.2           |

### MVP Success Criteria

- [ ] Onboarding complete >80% (2 dakikada 1 sub + notification)
- [ ] TTFV <5 dakika (setup → ilk değer)
- [ ] En az 1 zombie bulundu
- [ ] En az 1 FX alert tetiklendi (USD abonelik varsa)
- [ ] 0 data loss (export/import çalışıyor)
- [ ] Notification reliability 100% when browser active

**Go/No-Go Decision:**

> 2 hafta kullanım sonrası değerlendirme

### Future Vision

**v0.2 (1 ay sonra):**

- Detaylı kullanım takibi + ROI
- İptal linki veritabanı
- Weekly backup prompt
- Swipe actions (mobile)

**v1.0 (3+ ay sonra):**

- Aile modu + Cloud sync
- Freelancer modu

### Scope Party Mode Insights

| Agent                | Contribution                                   |
| -------------------- | ---------------------------------------------- |
| **Amelia (Dev)**     | 17-21h realistic, PWA iOS test early           |
| **John (PM)**        | Brutal cut option rejected — full scope chosen |
| **Barry (Solo Dev)** | Countdown Hero is the heart — don't cut        |
