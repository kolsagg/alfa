# Story 8.5: Settings - Notification Section

Status: Done

## Story

As a **user**,
I want **expanded notification settings with configurable reminder timing and time-of-day preferences**,
so that **I can personalize when and how I receive payment reminders to fit my daily routine**.

## Background

Story 8.2 implemented the basic Settings page with a Bildirimler (Notifications) section containing only the existing `NotificationToggle` switch. This story enhances the Notification section to provide:

- Configurable "days before" payment reminder (1-30 days)
- Time-of-day preference for notifications (HH:MM format)
- Clear visual feedback for current settings
- Consistent design language with the Theme section (Story 8.4)

## Acceptance Criteria

### AC1: Enhanced Notification Section UI

- **Given** the user navigates to the Bildirimler section in Settings
- **When** they view the notification options
- **Then** the section displays:
  1. Main toggle (existing `NotificationToggle`) - enable/disable notifications
  2. "Kaç gün önce hatırlat" (Days before reminder) - Select dropdown (1-30)
  3. "Bildirim saati" (Notification time) - Time input (HH:MM format, 24h)
- **And** the additional controls are **only visible when notifications are effectively enabled** (granted + enabled)
- **And** each control has proper labels and helper text in Turkish

### AC2: Days Before Selection Control

- **Given** the user wants to configure reminder timing
- **When** they interact with the "Kaç gün önce hatırlat" control
- **Then** a Select dropdown shows options from 1 to 30 days
- **And** the current value is highlighted/selected
- **And** changing the value immediately updates `settings-store` via `setNotificationDaysBefore()`
- **And** the control uses `Select` from `@/components/ui/select`
- **And** default value is 3 days (from store)

### AC3: Notification Time Control

- **Given** the user wants to set preferred notification time
- **When** they interact with the "Bildirim saati" control
- **Then** a time input allows HH:MM selection (24-hour format)
- **And** the current value is displayed
- **And** changing the value validates against `NotificationSettingsSchema` regex (`^([01]\d|2[0-3]):([0-5]\d)$`)
- **And** valid changes update `settings-store` via `setNotificationTime()`
- **And** invalid input shows inline error feedback
- **And** default value is "09:00" (from store)

### AC4: Conditional Visibility & UX

- **Given** notifications are not effectively enabled (permission denied OR toggle off)
- **When** the user views the Notification section
- **Then** the Days Before and Time controls are **hidden** (not just disabled)
- **And** only the main toggle is visible with its status indicator
- **And** this prevents confusion about configuring unavailable features
- **And** when user enables notifications, controls animate in smoothly (200ms fade)

### AC5: Accessibility & Consistency

- **Given** the new notification controls
- **When** the developer verifies accessibility
- **Then** all controls have proper `aria-label` or `aria-labelledby` attributes
- **And** keyboard navigation works (Tab, Arrow keys for select)
- **And** focus rings follow `focus-visible:ring-2 focus-visible:ring-primary` pattern
- **And** the section respects `prefers-reduced-motion` for transitions
- **And** design matches ThemeSelector visual language from Story 8.4

### AC6: Real-time Schedule Synchronization & Preview

- **Given** the user changes the "Days Before" or "Time" setting
- **When** the store state updates
- **Then** the underlying notification schedule MUST be automatically recalculated (handled by `useNotificationScheduleSync`)
- **And** a dynamic "Next reminder preview" appears below the settings: **"Bir sonraki hatırlatıcı: [Tarih] [Saat]"**
- **And** this preview updates instantly as user changes settings
- **And** the preview is hidden if there are no active subscriptions

### AC7: Native UX & Quality

- **Given** the time input implementation
- **When** the user interacts on a mobile device or modern browser
- **Then** the input uses `type="time"` to trigger the native platform picker
- **And** the layout remains stable during value changes
- **And** `npm run lint && npm run build && npm test -- --run` passes
- **And** new tests verify:
  - Days Before select updates store correctly
  - Time input validates and updates store
  - Conditional visibility based on notification state
  - Schedule recalculation trigger verification
  - Preview text accurately reflects the next scheduled event

## Tasks / Subtasks

- [x] **Task 1: NotificationSettings Component (AC: #1, #2, #3, #4, #6, #7)**

  - [x] 1.1 Create `src/components/features/settings/notification-settings.tsx`
  - [x] 1.2 Import and render existing `NotificationToggle` at top
  - [x] 1.3 Implement `DaysBeforeSelect` using `Select` component
  - [x] 1.4 Implement `NotificationTimeInput` using `Input` with `type="time"`
  - [x] 1.5 Create a `ReminderPreview` sub-component to show the next scheduled reminder
  - [x] 1.6 Add conditional rendering based on `isPushNotificationActive()` state
  - [x] 1.7 Apply fade-in animation with `motion-safe:animate-in fade-in duration-200`

- [x] **Task 2: i18n & Terminology Audit (AC: #1, #6)**

  - [x] 2.1 Add notification section strings to `src/lib/i18n/settings.ts`
  - [x] 2.2 Conduct audit: Ensure "Bildirim" (system) vs "Hatırlatıcı" (user-facing) terms are consistent with `notifications.ts`
  - [x] 2.3 Include: DAYS_BEFORE_LABEL, DAYS_BEFORE_HELPER, TIME_LABEL, TIME_HELPER, TIME_ERROR, PREVIEW_LABEL

- [x] **Task 3: Page Integration (AC: #1, #4)**

  - [x] 3.1 Replace direct `NotificationToggle` with new `NotificationSettings` in `settings-page.tsx`
  - [x] 3.2 Update section description to reflect expanded controls
  - [x] 3.3 Ensure iOS modal functionality preserved via prop pass-through

- [x] **Task 4: Testing & Integration Validation (AC: #6, #7)**
  - [x] 4.1 Create `src/components/features/settings/notification-settings.test.tsx`
  - [x] 4.2 Test days before select behavior and store updates
  - [x] 4.3 Test time input validation (valid/invalid cases)
  - [x] 4.4 Test conditional visibility logic
  - [x] 4.5 **Integration Check:** Verify that updating settings triggers a recalculation in `notification-schedule-store`
  - [x] 4.6 Add accessibility tests (roles, labels, keyboard nav)
  - [x] 4.7 Run full regression suite

## Dev Notes

### 🏗️ Architecture: Component Structure

This builds on the existing notification infrastructure:

```
src/
├── components/
│   ├── features/
│   │   ├── settings/
│   │   │   ├── notification-settings.tsx    ← NEW (Primary)
│   │   │   ├── notification-settings.test.tsx ← NEW
│   │   │   ├── theme-selector.tsx           (Existing - pattern reference)
│   │   │   ├── settings-section.tsx         (Existing - wrapper)
│   │   │   └── index.ts                     (Update exports)
│   │   └── NotificationSettings/
│   │       └── notification-toggle.tsx      (Existing - embedded within new component)
├── stores/
│   └── settings-store.ts                    (Existing - NO CHANGES NEEDED)
├── lib/
│   └── i18n/
│       └── settings.ts                      (Modify - add new strings)
└── pages/
    └── settings-page.tsx                    (Modify - swap component)
```

### ⚙️ Existing Notification Infrastructure (DO NOT MODIFY)

**settings-store.ts v4:**

```typescript
// Notification settings - already validated with Zod
notificationsEnabled: boolean; // Toggle state
notificationPermission: "default" | "granted" | "denied";
notificationDaysBefore: number; // 1-30, default 3
notificationTime: string; // HH:MM format, default "09:00"

// Actions available:
setNotificationDaysBefore: (days: number) => boolean;
setNotificationTime: (time: string) => boolean;
```

**Schedule Sync Hook (`src/hooks/use-notification-schedule-sync.ts`):**
This hook already listens to `notificationDaysBefore` and `notificationTime`. The implementation should simply ensure that state changes propagate correctly.

### 📐 Design Tokens (from Story 8.4)

Use existing OKLCH color system:

- Primary active: `text-primary`, `ring-primary`
- Muted/disabled: `text-muted-foreground`, `bg-muted/50`
- Focus: `focus-visible:ring-2 focus-visible:ring-primary`
- Preview text: `text-xs font-medium text-primary bg-primary/5 p-2 rounded-md`

### 🪝 isPushNotificationActive Utility

**Already exists at `src/lib/notification/utils.ts`:**

```typescript
export function isPushNotificationActive(
  notificationsEnabled: boolean,
  notificationPermission: "default" | "granted" | "denied"
): boolean {
  return notificationsEnabled && notificationPermission === "granted";
}
```

Use this for conditional visibility logic.

### 📝 i18n Strings to Add (settings.ts)

```typescript
// Notification Section (Story 8.5)
SECTION_NOTIFICATIONS_SUBTITLE: "Hatırlatma Ayarları",
DAYS_BEFORE_LABEL: "Kaç gün önce hatırlat",
DAYS_BEFORE_HELPER: "Ödeme tarihinden önce kaç gün bildirim al",
DAYS_BEFORE_UNIT: "gün",
TIME_LABEL: "Bildirim saati",
TIME_HELPER: "Bildirimlerin gönderileceği saat (24h)",
TIME_ERROR: "Geçersiz saat formatı",
PREVIEW_LABEL: "Bir sonraki hatırlatıcı:",
```

### ⚠️ Critical Implementation Notes

1.  **No Store Changes:** All notification settings APIs exist in v4. Do NOT bump version or add migrations.

2.  **Native Experience:** Use `<Input type="time" />` for the best mobile experience. The value should be formatted as `HH:mm`.

3.  **Schedule Sync:** Every change to these settings triggers a recalculation via `useNotificationScheduleSync` which is globally active in `DashboardLayout` or `App`. Verification in tests should confirm this dependency.

4.  **Reminder Preview:** Fetch the earliest entry from `useNotificationScheduleStore` and format it using `formatDate` from `date-utils.ts` to show the preview.

5.  **NotificationToggle Preservation:** The existing toggle is wrapped, not replaced. Pass `onIOSSafariDetected` prop through.

6.  **Keyboard Navigation:** `Select` component from shadcn has built-in arrow key support. Time input needs careful Tab order.

7.  **Animation:** Use `motion-safe:` prefix for all animations to respect `prefers-reduced-motion`.

8.  **Days Array Generation:**

```typescript
const DAYS_OPTIONS = Array.from({ length: 30 }, (_, i) => i + 1);
```

### 🧪 Test Patterns (from 8.4)

```typescript
// Mock store state for conditional visibility
useSettingsStore.setState({
  notificationsEnabled: true,
  notificationPermission: "granted",
  notificationDaysBefore: 3,
  notificationTime: "09:00",
});

// Test select change
const select = screen.getByRole("combobox", { name: /gün önce/i });
await user.click(select);
await user.click(screen.getByRole("option", { name: "7" }));
expect(useSettingsStore.getState().notificationDaysBefore).toBe(7);
```

### 📊 Previous Story Learnings (8.4)

- SettingsSection wrapper provides consistent section styling
- i18n strings centralized in `lib/i18n/settings.ts`
- Turkish labels are required for all user-facing text
- Focus rings: `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2`
- Store sync is synchronous, UI updates immediately

### 🔗 Dependencies

- **Depends On:** Story 8.2 (Settings Page Layout) ✅ DONE
- **Depends On:** Story 8.4 (Theme Section design pattern) ✅ DONE
- **Depends On:** Epic 4 Stories (NotificationToggle, settings-store) ✅ DONE
- **Blocked By:** None
- **Blocks:** None (independent enhancement)

---

## Dev Agent Record

### Context Reference

- `docs/epics.md#Epic-8` - Navigation & Settings Infrastructure
- `docs/architecture.md#Data-Architecture` - Zustand patterns
- `src/stores/settings-store.ts` - Notification state management
- `src/components/features/settings/theme-selector.tsx` - Pattern reference
- `src/lib/notification/utils.ts` - isPushNotificationActive utility

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- ✅ Created `NotificationSettings` component with days before select (1-30), time input (HH:mm), and reminder preview
- ✅ Implemented conditional visibility based on `isPushNotificationActive()` state - controls hide when notifications disabled/denied
- ✅ Added Turkish i18n strings: DAYS_BEFORE_LABEL, DAYS_BEFORE_HELPER, TIME_LABEL, TIME_HELPER, TIME_ERROR, PREVIEW_LABEL, NO_UPCOMING_REMINDER
- ✅ Integrated into `settings-page.tsx` replacing direct `NotificationToggle` usage
- ✅ All accessibility requirements met: aria-labels, aria-describedby, proper focus rings
- ✅ Motion-safe fade-in animations applied per AC4
- ✅ Reminder preview shows next scheduled notification from `notification-schedule-store`
- ✅ 21 comprehensive tests covering all ACs
- ✅ Note: One pre-existing test timeout in subscription-form.test.tsx (unrelated to this story)

### File List

| Action   | File Path                                                         |
| -------- | ----------------------------------------------------------------- |
| Created  | `src/components/features/settings/notification-settings.tsx`      |
| Created  | `src/components/features/settings/notification-settings.test.tsx` |
| Modified | `src/components/features/settings/index.ts`                       |
| Modified | `src/lib/i18n/settings.ts`                                        |
| Modified | `src/pages/settings-page.tsx`                                     |
| Modified | `src/pages/settings-page.test.tsx`                                |

---

## Change Log

| Date       | Change                                                     |
| ---------- | ---------------------------------------------------------- |
| 2025-12-24 | Story drafted - Settings Notification Section expansion    |
| 2025-12-24 | Implementation complete - All tasks done, ready for review |
