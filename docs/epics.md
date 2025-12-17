---
stepsCompleted: [1, 2, 3, 4]
workflowStatus: complete
inputDocuments:
  - docs/prd.md
  - docs/architecture.md
  - docs/ux-design-specification.md
project_name: "SubTracker"
user_name: "kolsag"
date: "2025-12-17"
completedAt: "2025-12-17T16:12:00+03:00"
partyModeUsed: true
epicCount: 7
storyCount: 41
estimatedHours: "128-146"
frCoverage: 26/26
nfrCoverage: 17/17
validationPassed: true
---

# SubTracker - Epic Breakdown

## Overview

Bu doküman, SubTracker projesi için PRD, UX Design ve Architecture dokümanlarından çıkarılan gereksinimleri implementasyona hazır epic ve story'lere dönüştürür.

## Requirements Inventory

### Functional Requirements

**Subscription Management (Core)**

- **FR01:** Kullanıcı yeni bir abonelik ekleyebilir (Platform Adı, Kategori, Fiyat, Para Birimi, Periyot, İlk Ödeme Tarihi, Bağlı Kart).
- **FR02:** Kullanıcı mevcut bir aboneliği düzenleyebilir veya silebilir.
- **FR03:** Kullanıcı abonelikleri kategorilere (Eğlence, İş, Araçlar, vb.) ayırabilir.
- **FR04:** Kullanıcı abonelik döngüsünü (aylık, yıllık, haftalık, custom) seçebilir.
- **FR05:** Kullanıcı her abonelik için bir renk/ikon seçebilir (veya sistem otomatik atar).

**Wallet & Cards**

- **FR06:** Kullanıcı kredi/banka kartlarını tanımlayabilir (Kart Adı, Son 4 Hane, Kesim Tarihi).
- **FR07:** Kullanıcı abonelik eklerken mevcut kartlardan birini seçebilir.
- **FR08:** Kullanıcı kart bazında toplam aylık yükü görüntüleyebilir.

**Notification System (Awareness Engine)**

- **FR09:** Sistem, yaklaşan ödemeler için (kullanıcı tarafından belirlenen süre önce) tarayıcı bildirimi gönderir.
- **FR10:** Kullanıcı, bildirim almak istediği gün sayısını (örn: 3 gün önce) ve saati seçebilir.
- **FR11:** Kullanıcı, iOS cihazında uygulamayı "Ana Ekrana Ekle"mediyse bu konuda uyarı görüntüler.

**Dashboard & Analytics**

- **FR12:** Kullanıcı, dashboard'da toplam aylık ve yıllık tahmini harcamayı görebilir.
- **FR13:** Kullanıcı, yaklaşan ödemeleri kronolojik sırayla (Timeline View) görebilir.
- **FR14:** Kullanıcı, en yakın ödemeyi "Countdown Hero" widget'ında dramatik bir sayaçla görür.

**Data Management & System**

- **FR15:** Kullanıcı, tüm verilerini JSON formatında dışa aktarabilir (Export).
- **FR16:** Kullanıcı, JSON yedeğini geri yükleyebilir (Import).
- **FR17:** Sistem, verileri kullanıcının tarayıcısında (localStorage) saklar.
- **FR18:** Sistem, haftalık olarak kullanıcıya "Yedek al" hatırlatması yapar.
- **FR19:** Kullanıcı, bildirim ayarlarını (açık/kapalı, saat, gün sayısı) yapılandırabilir.

**Settings & Personalization**

- **FR20:** Kullanıcı, uygulamanın light veya dark temada çalışmasını seçebilir (veya sistem ayarını takip eder).

**Onboarding**

- **FR21:** Kullanıcı, ilk açılışta rehberli onboarding akışıyla uygulamayı kurabilir.

**System & Analytics**

- **FR22:** Sistem, kullanıcı aksiyonlarını (subscription_added, notification_shown) anonim olarak loglar.
- **FR23:** Sistem, hiç abonelik yokken kullanıcıya boş state (empty state) ve yönlendirme gösterir.
- **FR24:** Sistem, aynı gün birden fazla ödeme varsa bildirimleri gruplar veya ayrı gönderir.

**Data Handling**

- **FR25:** Kullanıcı, geçmiş tarihli bir abonelik ekleyebilir (sistem bir sonraki periyodu otomatik hesaplar).
- **FR26:** Sistem, kullanıcı verisini hiçbir sunucuya göndermez (privacy-first, tüm veri localStorage'da kalır).

### NonFunctional Requirements

**Performance**

- **NFR01:** Sayfa ilk açılışta (First Contentful Paint) < 1.0 saniyede yüklenmeli.
- **NFR02:** Abonelik ekleme/düzenleme işlemi < 100ms içinde UI güncellemesi sağlamalı.
- **NFR03:** Gzip sonrası toplam bundle boyutu < 400KB olmalı (tree-shaking sonrası).
- **NFR04:** 100+ abonelik durumunda virtualized list kullanılmalı, scroll akıcı kalmalı (60fps).

**Security & Privacy**

- **NFR05:** Tüm kullanıcı verisi yalnızca localStorage'da tutulmalı, sunucuya gönderilmemeli.
- **NFR06:** JSON Export dosyası hassas veri (kart numarası) içermemeli (sadece kart adı ve son 4 hane).
- **NFR07:** Uygulama, üçüncü taraf tracking scriptleri içermemeli.

**Reliability**

- **NFR08:** Uygulama, internet bağlantısı olmadan tam işlevsel çalışmalı (offline-first, cache-first strategy).
- **NFR09:** localStorage temizlense bile JSON import ile veri kurtarılabilmeli.
- **NFR10:** Bildirimler, tarayıcı tab'ı aktif ve focused olduğu sürece %100 güvenilirlikle tetiklenmeli.

**Accessibility**

- **NFR11:** Tüm interaktif elementler klavye ile erişilebilir olmalı (Tab/Enter).
- **NFR12:** Renk paleti, WCAG 2.1 AA minimum kontrast oranını (4.5:1) sağlamalı.
- **NFR13:** Kritik bilgiler yalnızca renge bağlı olmamalı (ikon/metin destekli).

**System Limits & Warnings**

- **NFR14:** Sistem, kayıt sayısı 500'ü geçerse kullanıcıyı uyarmalı ve yedekleme önermelidir.
- **NFR15:** JSON Export dosya boyutu 5MB'ı geçerse kullanıcı bilgilendirilmeli.

**Notification Hygiene**

- **NFR16:** Sistem, aynı abonelik için aynı gün içinde birden fazla bildirim göndermemeli.

**Data Integrity**

- **NFR17:** Import edilen JSON, schema doğrulamasından geçmeli; geçersiz veri reject edilmeli.

### Additional Requirements

#### From Architecture Document

**Proje Zaten Kurulu (Greenfield HAYIR)**

- React 19.2.0, Vite 7.2.4, TypeScript 5.9.3, TailwindCSS 4.1.18 kurulu
- shadcn/ui 14 core component installed
- Radix UI, date-fns, lucide-react, sonner mevcut

**Ek Paket Gereksinimleri (P0)**

- `zustand` — State management (persist middleware ile localStorage)
- `zod` — Schema validation
- `vite-plugin-pwa` — PWA capabilities (manifest, service worker)
- `vitest`, `@testing-library/react` — Testing

**Schema Versioning (CRITICAL)**

- Zustand persist `version: 1` ile başlamalı
- Environment-aware storage namespace (dev vs prod)
- Migration function tanımlanmalı

**Cross-Cutting Concerns**

- iOS PWA detection + guidance component zorunlu
- Missed notifications recovery (localStorage key)
- OKLCH color palette + crescendo urgency system
- 44x44px touch targets

**Testing Requirements (Party Mode)**

- Zustand persist + migration: 100% test coverage
- iOS PWA detection: Browser matrix testing
- Notification permission flow: Happy + error paths

#### From UX Design Document

**Countdown Crescendo System**

- 7+ gün: subtle (text-only)
- 3-7 gün: attention (colored badge)
- 24 saat: urgent (pulsing animation + warning icon)
- <1 saat: critical (red alert, dramatic)

**Quick-Add Grid**

- Popüler servislerin (Netflix, Spotify, iCloud, Adobe, ChatGPT, GitHub) tek tıkla eklenmesi
- 2-col mobile, 3-4 col desktop

**Just-in-Time Permission Flow**

- İlk abonelik eklenince notification permission sorulmalı
- Context-aware request = higher acceptance rate

**iOS Install Prompt**

- Safari detection → Modal → Screenshot'lı instructions
- PWA kurulmadan notification çalışmaz

**Graceful Degradation**

- Notification denied: Dashboard'da banner + in-app countdown emphasis
- iOS without PWA: Persistent prompt
- localStorage full: Export suggestion

**Empty State**

- Hybrid onboarding: Welcome + Quick-Add Grid + Custom Entry
- Minimal form: sadece zorunlu alanlar

**Savings Celebration**

- İptal edildiğinde confetti animation
- prefers-reduced-motion fallback

**Typography**

- Plus Jakarta Sans (display + body)
- Tabular lining figures for numbers
- Hero numbers: 48px, bold

**Component States**

- Her component için: default, empty, loading (skeleton), error
- forwardRef pattern (shadcn consistency)

## FR Coverage Map

### Functional Requirements Coverage

| FR   | Epic   | Açıklama                                    |
| ---- | ------ | ------------------------------------------- |
| FR01 | Epic 2 | Yeni abonelik ekleme                        |
| FR02 | Epic 2 | Abonelik düzenleme/silme                    |
| FR03 | Epic 2 | Kategori atama                              |
| FR04 | Epic 2 | Döngü seçimi (aylık/yıllık/haftalık/custom) |
| FR05 | Epic 2 | Renk/ikon seçimi                            |
| FR06 | Epic 6 | Kart tanımlama                              |
| FR07 | Epic 6 | Aboneliğe kart bağlama                      |
| FR08 | Epic 6 | Kart bazında aylık yük görüntüleme          |
| FR09 | Epic 4 | Yaklaşan ödemeler için bildirim             |
| FR10 | Epic 4 | Bildirim zamanlaması ayarları               |
| FR11 | Epic 4 | iOS PWA uyarısı                             |
| FR12 | Epic 3 | Toplam aylık/yıllık harcama                 |
| FR13 | Epic 3 | Timeline view                               |
| FR14 | Epic 3 | Countdown Hero widget                       |
| FR15 | Epic 5 | JSON export                                 |
| FR16 | Epic 5 | JSON import                                 |
| FR17 | Epic 1 | localStorage data storage                   |
| FR18 | Epic 5 | Haftalık yedek hatırlatması                 |
| FR19 | Epic 4 | Bildirim ayarları yapılandırma              |
| FR20 | Epic 1 | Light/dark theme                            |
| FR21 | Epic 2 | Onboarding akışı                            |
| FR22 | Epic 7 | Anonim event logging                        |
| FR23 | Epic 2 | Empty state gösterimi                       |
| FR24 | Epic 4 | Grouped notifications                       |
| FR25 | Epic 2 | Geçmiş tarihli abonelik ekleme              |
| FR26 | Epic 7 | Privacy-first (no server data)              |

### Non-Functional Requirements Coverage

| NFR      | Epic          | Açıklama                             |
| -------- | ------------- | ------------------------------------ |
| NFR01-04 | Cross-cutting | Performance requirements (all epics) |
| NFR05    | Epic 1        | localStorage only                    |
| NFR06    | Epic 6        | Hassas veri koruması (kart)          |
| NFR07    | Epic 7        | No tracking scripts                  |
| NFR08    | Epic 1        | Offline-first PWA                    |
| NFR09    | Epic 5        | JSON import ile veri kurtarma        |
| NFR10    | Epic 4        | Bildirim güvenilirliği               |
| NFR11-13 | Cross-cutting | Accessibility (all epics)            |
| NFR14-15 | Epic 5        | System limits & warnings             |
| NFR16    | Epic 4        | Duplicate notification prevention    |
| NFR17    | Epic 5        | Schema validation                    |

## Epic List

### Epic 1: Project Foundation & Core Infrastructure

**Goal:** Uygulama çalışır durumda, PWA olarak yüklenebilir, theme seçilebilir, store infrastructure hazır.

**User Outcome:** Kullanıcı uygulamayı mobilde "Ana Ekrana Ekle" ile yükleyebilir, light/dark theme seçebilir.

**FRs covered:** FR17, FR20
**NFRs covered:** NFR05, NFR08

**Implementation Notes:**

- Zustand store infrastructure (persist middleware, migration fn, namespace)
- PWA manifest + service worker (vite-plugin-pwa)
- Theme system (system preference detection + manual override)
- iOS PWA detection + guidance component
- Dashboard skeleton (Countdown Hero mount point)

---

### Epic 2: Subscription Management + Onboarding

**Goal:** Kullanıcı abonelik ekleyebilir, düzenleyebilir, silebilir. İlk açılışta minimal onboarding ile yönlendirilir.

**User Outcome:** Kullanıcı Netflix, Spotify gibi aboneliklerini sisteme kaydedebilir ve yönetebilir.

**FRs covered:** FR01, FR02, FR03, FR04, FR05, FR21, FR23, FR25

**Implementation Notes:**

- Subscription Zustand slice
- CRUD operations (add/edit/delete)
- Category system (Eğlence, İş, Araçlar, vb.)
- Period selection (monthly/yearly/weekly/custom)
- Color/icon picker (auto-assign fallback)
- Quick-Add Grid (popüler servisler)
- Empty state + CTA
- Minimal onboarding flow
- Past date handling (next period calculation)
- **Notification permission stub** (integration point for Epic 4)

---

### Epic 3: Dashboard & Analytics

**Goal:** Kullanıcı harcamalarını görüntüleyebilir, yaklaşan ödemeleri kronolojik sırayla takip edebilir.

**User Outcome:** Kullanıcı aylık/yıllık toplam harcamasını ve en yakın ödeme tarihini dramatik bir countdown ile görebilir.

**FRs covered:** FR12, FR13, FR14

**Implementation Notes:**

- Monthly/yearly spending summary cards
- Timeline view (chronological payment list)
- Countdown Hero widget (crescendo urgency system)
  - 7+ gün: subtle
  - 3-7 gün: attention
  - 24 saat: urgent (pulsing)
  - <1 saat: critical (red alert)
- Plus Jakarta Sans typography
- Hero numbers: 48px, bold, tabular figures

---

### Epic 4: Notification System (Awareness Engine)

**Goal:** Kullanıcı yaklaşan ödemeler için tarayıcı bildirimi alır, bildirim tercihlerini yapılandırabilir.

**User Outcome:** Kullanıcı ödeme gününden önce hatırlatma alır, bildirimleri kaçırmaz.

**FRs covered:** FR09, FR10, FR11, FR19, FR24
**NFRs covered:** NFR10, NFR16

**Implementation Notes:**

- Browser notification system (Notification API)
- Just-in-time permission flow (ilk subscription sonrası)
- Notification preferences (days before, time of day)
- Grouped notifications (same day handling)
- iOS PWA install prompt (Safari detection + modal + screenshot instructions)
- Graceful degradation (denied → dashboard banner)
- Missed notifications recovery (localStorage key)
- Tab visibility handling

---

### Epic 5: Data Export/Import & Backup

**Goal:** Kullanıcı verilerini JSON olarak yedekleyebilir ve geri yükleyebilir.

**User Outcome:** Kullanıcı verilerini kaybetme riski olmadan güvenle kullanabilir.

**FRs covered:** FR15, FR16, FR18
**NFRs covered:** NFR09, NFR14, NFR15, NFR17

**Implementation Notes:**

- JSON export (Blob + download)
- JSON import (File input + schema validation with Zod)
- Weekly backup reminder (localStorage timestamp check)
- Size warnings (500+ records, 5MB+ export)
- Schema validation (invalid data rejection with error message)

---

### Epic 6: Wallet & Cards

**Goal:** Kullanıcı kredi/banka kartlarını tanımlayabilir ve aboneliklere bağlayabilir.

**User Outcome:** Kullanıcı hangi kartından ne kadar çekileceğini kesim tarihine göre takip edebilir.

**FRs covered:** FR06, FR07, FR08
**NFRs covered:** NFR06

**Implementation Notes:**

- Cards Zustand slice
- Card CRUD (name, last 4 digits, cut-off date)
- Card assignment to subscriptions (optional foreign key)
- Per-card monthly spending view
- Wallet tab/view
- Card picker dropdown in subscription form
- Privacy: sadece son 4 hane saklanır

---

### Epic 7: System Analytics & Events

**Goal:** Sistem anonim event'leri loglar, privacy-first yaklaşımı korunur.

**User Outcome:** (Internal) Uygulama davranışı izlenebilir, debugging kolaylaşır.

**FRs covered:** FR22, FR26
**NFRs covered:** NFR07

**Implementation Notes:**

- Anonymous event logging (subscription_added, notification_shown, etc.)
- Privacy-first: hiçbir veri sunucuya gönderilmez
- No third-party tracking scripts
- Local-only analytics (optional: export with data)
- Graceful degradation paths

---

## Dependency Graph

```
Epic 1 (Foundation)
    ↓
Epic 2 (Subscriptions) ──→ Epic 3 (Dashboard) ──→ Epic 4 (Notifications)
    ↓                                               ↓
Epic 6 (Cards) ←────────────────────────────────────┘
    ↓
Epic 5 (Export/Import) ← can be developed in parallel after Epic 2
    ↓
Epic 7 (Analytics) ← cross-cutting, can be developed alongside any epic
```

## Party Mode Consensus Notes

- **Cards MVP'de kalıyor** (deadline kaygısı yok)
- **Onboarding Epic 2'ye merge edildi** (Sally/Amelia consensus)
- **Notification stub Epic 2'de** (Murat requirement)
- **Dashboard skeleton Epic 1'de kurulacak** (Winston suggestion)
- **Slice-based store extension** paterni kullanılacak (Amelia)

---

# Epic Stories

## Epic 1: Project Foundation & Core Infrastructure

**Goal:** Uygulama çalışır durumda, PWA olarak yüklenebilir, theme seçilebilir, store infrastructure hazır.

**FRs covered:** FR17, FR20
**NFRs covered:** NFR05, NFR08

**Estimated Effort:** 18-23 hours (2-3 dev-days)

---

### Story 1.1: Zustand Store Infrastructure Setup

**As a** developer,
**I want** a properly configured Zustand store with persistence,
**So that** all future slices can use consistent storage patterns.

**Acceptance Criteria:**

**Given** the application starts
**When** the store initializes
**Then** it connects to localStorage with environment-aware namespace (`subtracker-dev` vs `subtracker-prod`)
**And** schema versioning starts at `version: 1`
**And** migration function template is defined
**And** persist middleware is configured with `partialize` for selective persistence
**And** Zustand DevTools is enabled in development mode
**And** typed store hooks are exported for type-safe access
**And** unit tests cover persist/rehydrate cycle with mock storage
**And** migration function is testable with sample data

---

### Story 1.2: PWA Manifest and Service Worker Setup

**As a** user,
**I want** the app to be installable as a PWA,
**So that** I can use it like a native app on my device.

**Acceptance Criteria:**

**Given** the user visits the application
**When** they view the page
**Then** a valid `manifest.json` is served with app name, icons, theme color
**And** a service worker is registered via `vite-plugin-pwa`
**And** the app works offline with cached assets (cache-first strategy)
**And** "Add to Home Screen" prompt is available on supported browsers
**And** service worker registration is tested in Vitest environment
**And** offline behavior is verifiable via network simulation test

---

### Story 1.3: Theme System Implementation

**As a** user,
**I want** to switch between light, dark, or system-default theme,
**So that** the app matches my preference.

**Acceptance Criteria:**

**Given** the user opens the app for the first time
**When** no preference is set
**Then** the app follows system preference (`prefers-color-scheme`)

**Given** the user selects "Dark" theme in settings
**When** settings are saved
**Then** the app immediately switches to dark mode
**And** the preference persists in localStorage
**And** on next visit, dark mode is applied automatically

**Given** the user selects "System" theme
**When** their OS switches from light to dark
**Then** the app automatically updates theme without refresh

---

### Story 1.4: iOS PWA Detection and Guidance Component

**As an** iOS Safari user,
**I want** clear instructions on how to install the app,
**So that** I can enable full PWA features including notifications.

**Acceptance Criteria:**

**Given** a user visits from iOS Safari (not standalone PWA)
**When** they interact with the app
**Then** a guidance modal appears explaining "Add to Home Screen"
**And** the modal includes step-by-step screenshot instructions
**And** user can dismiss the modal (preference saved)
**And** modal reappears after 7 days if not installed

**Given** the user is already in standalone PWA mode
**When** they open the app
**Then** no guidance modal is shown

---

### Story 1.5: Dashboard Layout Skeleton

**As a** developer,
**I want** the main dashboard layout with placeholder mount points,
**So that** future epics can add components without restructuring.

**Acceptance Criteria:**

**Given** the application runs
**When** the user navigates to the dashboard
**Then** the layout includes:

- Header with app title and theme toggle
- Countdown Hero placeholder area
- Main content area for subscription list
- Bottom navigation (Dashboard, Add, Settings)
  **And** layout is responsive (mobile-first)
  **And** 44x44px touch targets on all interactive elements
  **And** OKLCH color palette is configured in CSS custom properties
  **And** Plus Jakarta Sans font is loaded (display + body weights)
  **And** tabular-nums is applied to number displays
  **And** spacing follows 4px base grid (--spacing-1 through --spacing-12)

---

### Story 1.6: Error Boundary and Fallback UI

**As a** user,
**I want** the app to handle crashes gracefully,
**So that** I don't lose my context when errors occur.

**Acceptance Criteria:**

**Given** a runtime error occurs in a component
**When** the error propagates
**Then** the error boundary catches it
**And** a friendly fallback UI is displayed ("Something went wrong")
**And** user can click "Retry" to attempt recovery
**And** error details are logged to console (dev) / suppressed (prod)

---

**Epic 1 Complete: 6 Stories**

---

## Epic 2: Subscription Management + Onboarding

**Goal:** Kullanıcı abonelik ekleyebilir, düzenleyebilir, silebilir. İlk açılışta minimal onboarding ile yönlendirilir.

**FRs covered:** FR01, FR02, FR03, FR04, FR05, FR21, FR23, FR25

**Estimated Effort:** 25-30 hours (3-4 dev-days)

---

### Story 2.1: Subscription Zustand Slice

**As a** developer,
**I want** a typed subscription slice in the store,
**So that** I can manage subscription data with type safety.

**Acceptance Criteria:**

**Given** the subscription slice is initialized
**When** I access the store
**Then** I have typed actions: `addSubscription`, `updateSubscription`, `deleteSubscription`, `getSubscriptions`
**And** subscription schema includes: id, name, categoryId, price, currency, period, nextPaymentDate, color, icon, cardId (optional)
**And** slice is persisted to localStorage
**And** unit tests cover all CRUD actions

---

### Story 2.2: Category System

**As a** user,
**I want** to organize subscriptions into categories,
**So that** I can see my spending by type.

**Acceptance Criteria:**

**Given** the user creates a subscription
**When** they select a category
**Then** they can choose from predefined categories (Eğlence, İş, Araçlar, Eğitim, Sağlık, Diğer)
**And** each category has an associated icon and color
**And** categories are stored in the subscription record
**And** "Diğer" is the default category if none selected

---

### Story 2.3: Subscription Form - Add Flow

**As a** user,
**I want** to add a new subscription,
**So that** I can track my recurring payments.

**Acceptance Criteria:**

**Given** user clicks "Add Subscription" button
**When** the form opens
**Then** required fields are: Name, Price, Currency, Period, First Payment Date
**And** optional fields are: Category, Color, Icon, Card
**And** form validates input before submission
**And** on submit, subscription is added to store
**And** toast notification confirms success
**And** form closes and dashboard updates

---

### Story 2.4: Subscription Form - Edit/Delete Flow

**As a** user,
**I want** to edit or delete an existing subscription,
**So that** I can keep my data accurate.

**Acceptance Criteria:**

**Given** user taps on a subscription card
**When** the detail view opens
**Then** "Edit" button opens the same form pre-filled with data
**And** "Delete" button shows confirmation dialog
**And** on confirm delete, subscription is removed
**And** cancellation celebration shows confetti (prefers-reduced-motion respected)

---

### Story 2.5: Period Selection and Next Payment Calculation

**As a** user,
**I want** to set custom billing periods,
**So that** the app correctly calculates my next payment.

**Acceptance Criteria:**

**Given** user sets a billing period (monthly, yearly, weekly, custom)
**When** they set the first payment date
**Then** the system calculates the next payment date based on period
**And** if first payment date is in the past, next payment is calculated forward
**And** custom period allows user to set days between payments
**And** next payment date updates when period changes

---

### Story 2.6: Quick-Add Grid

**As a** user,
**I want** to quickly add popular subscriptions,
**So that** I don't have to type common services.

**Acceptance Criteria:**

**Given** user is on the add screen
**When** they see the Quick-Add Grid
**Then** popular services are shown: Netflix, Spotify, iCloud, Adobe, ChatGPT, GitHub, YouTube Premium, Amazon Prime
**And** each service has pre-filled name, icon, suggested category
**And** tapping a service opens form with pre-filled data
**And** grid is 2-col on mobile, 3-4 col on desktop

---

### Story 2.7: Color/Icon Picker

**As a** user,
**I want** to customize subscription appearance,
**So that** I can visually distinguish my subscriptions.

**Acceptance Criteria:**

**Given** user is editing subscription details
**When** they tap on color/icon field
**Then** a picker opens with OKLCH color options
**And** icon picker shows category-relevant icons (lucide-react)
**And** if user doesn't pick, system assigns based on category
**And** selected color/icon previews immediately

---

### Story 2.8: Empty State and Minimal Onboarding

**As a** first-time user,
**I want** guidance when the app is empty,
**So that** I know how to get started.

**Acceptance Criteria:**

**Given** user has no subscriptions
**When** they view the dashboard
**Then** empty state shows: welcome message, illustration, Quick-Add Grid, "Add Custom" CTA
**And** minimal tutorial highlights: "Tap + to add", "Set reminders in settings"
**And** empty state disappears after first subscription added

---

### Story 2.9: Notification Permission Stub

**As a** developer,
**I want** a notification permission integration point,
**So that** Epic 4 can build on existing flow.

**Acceptance Criteria:**

**Given** user adds their first subscription
**When** subscription is saved successfully
**Then** a prompt appears: "Enable notifications to never miss a payment"
**And** tapping "Enable" triggers `Notification.requestPermission()`
**And** result (granted/denied) is stored in settings slice
**And** if denied, graceful degradation message shown
**And** stub is testable in isolation

---

**Epic 2 Complete: 9 Stories**

---

## Epic 3: Dashboard & Analytics

**Goal:** Kullanıcı harcamalarını görüntüleyebilir, yaklaşan ödemeleri kronolojik sırayla takip edebilir.

**FRs covered:** FR12, FR13, FR14

**Estimated Effort:** 19 hours (2-3 dev-days)

---

### Story 3.1: Monthly/Yearly Spending Summary Cards

**As a** user,
**I want** to see my total subscription spending at a glance,
**So that** I understand my recurring costs.

**Acceptance Criteria:**

**Given** user has subscriptions
**When** they view the dashboard
**Then** summary cards show: Total Monthly, Total Yearly (projected)
**And** currency is displayed based on user's primary currency
**And** mixed currencies show conversion note or separate breakdowns
**And** values update in real-time when subscriptions change
**And** numbers use tabular-nums for alignment

---

### Story 3.2: Timeline View (Upcoming Payments)

**As a** user,
**I want** to see upcoming payments in chronological order,
**So that** I can plan my finances.

**Acceptance Criteria:**

**Given** user has subscriptions
**When** they view the timeline
**Then** payments are listed chronologically by next payment date
**And** each item shows: subscription name, amount, date, days remaining
**And** past due items (if any) are highlighted at top
**And** list is scrollable with smooth 60fps performance
**And** empty timeline shows "No upcoming payments" message
**And** past due detection is unit tested with various date scenarios
**And** timezone handling is tested (Istanbul, UTC, PST)

---

### Story 3.3: Countdown Hero Widget

**As a** user,
**I want** a dramatic countdown to my next payment,
**So that** I'm always aware of imminent charges.

**Acceptance Criteria:**

**Given** user has at least one subscription
**When** they view the dashboard
**Then** Countdown Hero shows the soonest payment with:

- Subscription name and icon
- Amount
- Countdown timer (days, hours, minutes)
- Urgency level visualization

**Crescendo Urgency System:**

- 7+ days: subtle (muted colors, small text)
- 3-7 days: attention (colored badge, slightly larger)
- 24 hours: urgent (pulsing animation, warning icon)
- <1 hour: critical (red alert, dramatic pulse, shows seconds)

**And** when remaining time < 1 hour, display includes seconds
**And** critical state (<1h) includes subtle attention shake animation
**And** all animations respect `prefers-reduced-motion`
**And** Hero updates every minute (every second when < 1 hour)

---

### Story 3.4: Subscription List View

**As a** user,
**I want** to see all my subscriptions in a list,
**So that** I can manage them easily.

**Acceptance Criteria:**

**Given** user has subscriptions
**When** they view the subscription list
**Then** each card shows: name, icon, category badge, price, next payment date
**And** cards are tappable to view/edit details
**And** virtualization uses `@tanstack/react-virtual` for 100+ items
**And** scroll maintains 60fps with 100 items (measurable via DevTools Performance tab)
**And** initial render completes in < 100ms for 100 items
**And** sorting options: by date, by price, by name
**And** filtering by category is available

---

### Story 3.5: Category Breakdown Visualization

**As a** user,
**I want** to see spending breakdown by category,
**So that** I know where my money goes.

**Acceptance Criteria:**

**Given** user has subscriptions in multiple categories
**When** they view the analytics section
**Then** a visual breakdown shows percentage per category using CSS progress bars
**And** each category displays: name, icon, total amount, percentage
**And** tapping a category filters the subscription list
**And** breakdown is hidden if only 1 category exists
**And** bars are accessible with aria-valuenow and visible percentages
**And** visualization is not color-only (includes text labels)

---

**Epic 3 Complete: 5 Stories**

---

## Epic 4: Notification System (Awareness Engine)

**Goal:** Kullanıcı yaklaşan ödemeler için tarayıcı bildirimi alır, bildirim tercihlerini yapılandırabilir.

**FRs covered:** FR09, FR10, FR11, FR19, FR24
**NFRs covered:** NFR10, NFR16

**Estimated Effort:** 28 hours (3-4 dev-days)

**⚠️ Important Scope Note:** This is a foreground-only notification system. No server-side push notifications. Notifications fire when app/PWA is open or in background (platform-dependent).

---

### Story 4.1: Notification Settings Slice

**As a** developer,
**I want** a notification settings slice in the store,
**So that** user preferences are persisted.

**Acceptance Criteria:**

**Given** the notification slice is initialized
**When** I access the store
**Then** settings include: enabled (boolean), daysBefore (number), notifyTime (time string), permissionStatus
**And** defaults are: enabled=true, daysBefore=3, notifyTime="09:00"
**And** slice is persisted to localStorage
**And** unit tests cover all settings mutations

---

### Story 4.2: Browser Notification Permission Flow

**As a** user,
**I want** to grant notification permission,
**So that** I can receive payment reminders.

**Acceptance Criteria:**

**Given** user has not granted permission
**When** they enable notifications in settings
**Then** browser permission prompt appears
**And** if granted, status updates to "granted"
**And** if denied, status updates to "denied"
**And** if denied, graceful degradation banner appears on dashboard
**And** permission request happens at contextually appropriate time (just-in-time)

---

### Story 4.3: Notification Scheduling Logic

**As a** system,
**I want** to schedule notifications based on subscription data,
**So that** users are reminded before payments.

**Acceptance Criteria:**

**Given** user has subscriptions and notifications enabled
**When** the app calculates notification schedule
**Then** notifications are scheduled for X days before each payment (user configurable)
**And** notification time matches user preference (e.g., 09:00)
**And** schedule recalculates when subscriptions change
**And** schedule persists in localStorage for recovery
**And** scheduling handles DST transitions correctly (test with Europe/Istanbul timezone)
**And** scheduling works for newly added subscriptions with < daysBefore remaining
**And** leap year dates are handled correctly
**And** scheduling is foreground-based (no server push)

---

### Story 4.4: Notification Display and Handling

**As a** user,
**I want** to receive and interact with notifications,
**So that** I'm reminded about payments.

**Acceptance Criteria:**

**Given** a scheduled notification triggers
**When** the browser is open (tab active or background)
**Then** notification shows: subscription name, amount, "Payment due in X days"
**And** clicking notification opens the app to that subscription
**And** notification includes app icon
**And** duplicate notifications for same subscription/day are prevented (NFR16)
**And** on iOS PWA: notifications only fire when app is in foreground
**And** on Android/Desktop PWA: notifications attempt background firing (best-effort via SW)
**And** notification reliability is logged for debugging

---

### Story 4.5: Grouped Notifications (Same Day)

**As a** user,
**I want** multiple same-day payments grouped,
**So that** I'm not overwhelmed by notifications.

**Acceptance Criteria:**

**Given** multiple subscriptions have payments on the same day
**When** notification triggers
**Then** a grouped notification shows: "3 payments due tomorrow - ₺450 total"
**And** clicking opens dashboard with filtered view
**And** if only 1 payment, regular single notification is shown

---

### Story 4.6: iOS PWA Install Prompt

**As an** iOS user,
**I want** clear guidance to install the PWA,
**So that** I can receive notifications.

**Acceptance Criteria:**

**Given** user is on iOS Safari (not standalone)
**When** they try to enable notifications
**Then** a modal explains: "Notifications require installing the app"
**And** step-by-step instructions with Safari screenshots are shown
**And** instructions use generic icons or locale-aware screenshots (Turkish/English)
**And** detection uses `navigator.standalone` for iOS
**And** modal has "I've installed it" and "Remind me later" buttons
**And** after install detection, modal auto-dismisses

---

### Story 4.7: Graceful Degradation for Denied/Unavailable

**As a** user who denied notifications,
**I want** alternative awareness methods,
**So that** I don't miss payments.

**Acceptance Criteria:**

**Given** notifications are denied or unavailable
**When** user views the dashboard
**Then** a persistent banner shows: "Notifications off - enable in settings"
**And** banner shows always for first 7 days after denial
**And** after 7 days, banner only shows if payment imminent (≤3 days)
**And** "Don't remind me" option permanently hides banner
**And** Countdown Hero has increased visual emphasis
**And** in-app badge shows count of imminent payments (3 days)

---

### Story 4.8: Missed Notifications Recovery

**As a** user,
**I want** missed notifications to be shown on next app open,
**So that** I don't miss important reminders.

**Acceptance Criteria:**

**Given** app was closed when notifications should have fired
**When** user opens the app
**Then** missed notifications are detected (compare schedule vs current time)
**And** a toast shows: "You missed X payment reminders"
**And** missed notifications are cleared once viewed
**And** localStorage key tracks last notification check

---

**Epic 4 Complete: 8 Stories**

---

## Epic 5: Data Export/Import & Backup

**Goal:** Kullanıcı verilerini JSON olarak yedekleyebilir ve geri yükleyebilir.

**FRs covered:** FR15, FR16, FR18
**NFRs covered:** NFR09, NFR14, NFR15, NFR17

**Estimated Effort:** 15-18 hours (2 dev-days)

---

### Story 5.1: JSON Export Functionality

**As a** user,
**I want** to export all my data as a JSON file,
**So that** I have a backup I can store safely.

**Acceptance Criteria:**

**Given** user clicks "Export Data" in settings
**When** export is triggered
**Then** a JSON file is generated containing: subscriptions, cards, settings, schema version
**And** file is named `subtracker-backup-{date}.json`
**And** file downloads automatically via browser download API
**And** sensitive data (if any) is excluded or masked
**And** export includes schema version for future compatibility

---

### Story 5.2: JSON Import Functionality

**As a** user,
**I want** to import a previously exported backup,
**So that** I can restore my data.

**Acceptance Criteria:**

**Given** user clicks "Import Data" in settings
**When** they select a JSON file
**Then** file is parsed and validated against schema (Zod)
**And** if valid, confirmation modal shows: "Import X subscriptions, Y cards?"
**And** on confirm, data replaces current store
**And** if invalid, error message shows specific issues
**And** import creates a backup of current data before replacing (safety net)

---

### Story 5.3: Schema Validation with Zod

**As a** developer,
**I want** robust schema validation for import,
**So that** corrupted or malicious data is rejected.

**Acceptance Criteria:**

**Given** a JSON file is imported
**When** validation runs
**Then** Zod schema validates: all required fields, correct types, valid dates, valid currencies
**And** unknown fields are stripped (forward compatibility)
**And** missing optional fields get defaults
**And** schema version mismatch triggers migration attempt
**And** validation errors are human-readable

---

### Story 5.4: Weekly Backup Reminder

**As a** user,
**I want** periodic reminders to backup my data,
**So that** I don't forget and lose everything.

**Acceptance Criteria:**

**Given** it's been 7+ days since last backup
**When** user opens the app
**Then** a non-intrusive reminder appears: "It's been a week since your last backup"
**And** reminder has "Backup Now" and "Remind Me Later" options
**And** "Backup Now" triggers export flow
**And** last backup timestamp is stored in localStorage
**And** reminder respects "Don't remind me" preference

---

### Story 5.5: Storage Limit Warnings

**As a** user,
**I want** warnings when approaching storage limits,
**So that** I don't unexpectedly lose data.

**Acceptance Criteria:**

**Given** user has many subscriptions
**When** count exceeds 500 records
**Then** a warning banner shows: "You have many records - consider exporting a backup"
**And** warning includes estimated storage usage
**And** if export file would exceed 5MB, additional warning is shown
**And** warnings are dismissable but reappear on threshold breach

---

**Epic 5 Complete: 5 Stories**

---

## Epic 6: Wallet & Cards

**Goal:** Kullanıcı kredi/banka kartlarını tanımlayabilir ve aboneliklere bağlayabilir.

**FRs covered:** FR06, FR07, FR08
**NFRs covered:** NFR06

**Estimated Effort:** 15-18 hours (2 dev-days)

---

### Story 6.1: Cards Zustand Slice

**As a** developer,
**I want** a typed cards slice in the store,
**So that** I can manage card data with type safety.

**Acceptance Criteria:**

**Given** the cards slice is initialized
**When** I access the store
**Then** I have typed actions: `addCard`, `updateCard`, `deleteCard`, `getCards`
**And** card schema includes: id, name, lastFourDigits, cutoffDate, color (optional)
**And** slice is persisted to localStorage
**And** unit tests cover all CRUD actions

---

### Story 6.2: Card Management UI (Add/Edit/Delete)

**As a** user,
**I want** to manage my payment cards,
**So that** I can track which card pays for what.

**Acceptance Criteria:**

**Given** user navigates to Wallet section
**When** they view the cards list
**Then** they see all saved cards with name and last 4 digits
**And** "Add Card" button opens form modal
**And** form fields: Card Name, Last 4 Digits, Cut-off Date
**And** tapping a card opens edit mode
**And** delete option with confirmation is available
**And** privacy note explains only last 4 digits are stored

---

### Story 6.3: Card Assignment to Subscriptions

**As a** user,
**I want** to assign a card to each subscription,
**So that** I know which card will be charged.

**Acceptance Criteria:**

**Given** user adds/edits a subscription
**When** they view the card field
**Then** a dropdown shows all saved cards + "No card" option
**And** selected card is saved with subscription
**And** subscription card displays card name in list view
**And** if assigned card is deleted, subscription shows "No card assigned"

---

### Story 6.4: Per-Card Monthly Spending View

**As a** user,
**I want** to see how much each card will be charged monthly,
**So that** I can manage my card limits.

**Acceptance Criteria:**

**Given** user has cards with assigned subscriptions
**When** they view the Wallet section
**Then** each card shows: total monthly spending on that card
**And** spending is calculated from all assigned subscriptions
**And** unassigned subscriptions show under "Other" or "No Card"
**And** cut-off date context is displayed (e.g., "Next statement: Jan 15")

---

### Story 6.5: Card Cut-off Date Awareness

**As a** user,
**I want** to see which payments fall on current statement,
**So that** I can predict my credit card bill.

**Acceptance Criteria:**

**Given** a card has a cut-off date set
**When** user views card details
**Then** upcoming payments before cut-off are highlighted
**And** total for "this statement period" is calculated
**And** payments after cut-off show as "next statement"
**And** cut-off date respects monthly recurrence

---

**Epic 6 Complete: 5 Stories**

---

## Epic 7: System Analytics & Events

**Goal:** Sistem anonim event'leri loglar, privacy-first yaklaşımı korunur.

**FRs covered:** FR22, FR26
**NFRs covered:** NFR07

**Estimated Effort:** 8-10 hours (1 dev-day)

---

### Story 7.1: Anonymous Event Logging System

**As a** developer,
**I want** an event logging system,
**So that** I can track user actions for debugging without compromising privacy.

**Acceptance Criteria:**

**Given** the logging system is initialized
**When** user performs actions
**Then** events are logged locally: event_type, timestamp, metadata (non-PII)
**And** logged events include: subscription_added, subscription_deleted, notification_shown, export_triggered, import_triggered
**And** no personal data (names, amounts, card info) is included in logs
**And** logs are stored in localStorage with size limit (max 1000 entries, FIFO)

---

### Story 7.2: Privacy-First Data Handling

**As a** user,
**I want** assurance that my data stays private,
**So that** I can trust the app with my financial information.

**Acceptance Criteria:**

**Given** the application is running
**When** any operation occurs
**Then** no data is sent to any external server
**And** no third-party tracking scripts are loaded
**And** no analytics services (GA, Mixpanel, etc.) are integrated
**And** network requests are limited to: font loading, PWA manifest
**And** this is verifiable via DevTools Network tab

---

### Story 7.3: Debug Log Export (Developer Mode)

**As a** developer/power user,
**I want** to export debug logs,
**So that** I can troubleshoot issues.

**Acceptance Criteria:**

**Given** user enables developer mode (hidden setting or URL param)
**When** they access debug options
**Then** "Export Logs" generates a JSON with anonymized event logs
**And** logs include app version, browser info, error traces
**And** export clearly marks as "debug data, no personal info"
**And** developer mode is hidden from regular UI

---

**Epic 7 Complete: 3 Stories**

---

# 📊 Complete Epic Summary

## Story Count by Epic

| Epic      | Title                       | Stories        | Estimated Hours   |
| --------- | --------------------------- | -------------- | ----------------- |
| 1         | Foundation & Infrastructure | 6              | 18-23h            |
| 2         | Subscription Management     | 9              | 25-30h            |
| 3         | Dashboard & Analytics       | 5              | 19h               |
| 4         | Notification System         | 8              | 28h               |
| 5         | Export/Import & Backup      | 5              | 15-18h            |
| 6         | Wallet & Cards              | 5              | 15-18h            |
| 7         | System Analytics            | 3              | 8-10h             |
| **TOTAL** |                             | **41 Stories** | **128-146 hours** |

## Estimated Timeline

- **Solo developer pace:** ~15-18 dev-days (3-4 weeks)
- **Comfortable pace with testing:** 4-5 weeks
- **With polish and edge cases:** 5-6 weeks

## FR Coverage Verification

✅ All 26 Functional Requirements mapped to stories
✅ All 17 Non-Functional Requirements addressed
✅ Party Mode consensus incorporated
✅ Test coverage requirements included in ACs

---

**🎉 Epic and Story Creation Complete!**
