# Story 1.5: Dashboard Layout Skeleton

Status: done

## Story

As a **developer**,
I want **the main dashboard layout with placeholder mount points**,
So that **future epics can add components without restructuring**.

## Acceptance Criteria

1.  **Given** the application runs
    **When** the user navigates to the dashboard
    **Then** the layout includes:

    - Header with app title and theme toggle
    - Countdown Hero placeholder area
    - Main content area for subscription list
    - Bottom navigation (Dashboard, Add, Settings)

2.  **And** layout is responsive (mobile-first)

3.  **And** 44x44px touch targets on all interactive elements

4.  **And** OKLCH color palette is configured in CSS custom properties

5.  **And** Plus Jakarta Sans font is loaded (display + body weights)

6.  **And** tabular-nums is applied to number displays

7.  **And** spacing follows 4px base grid (--spacing-1 through --spacing-12)

## Tasks / Subtasks

- [x] **Task 1: Layout Structure** (AC: #1)

  - [x] 1.1 Create `src/components/layout/dashboard-layout.tsx` with header, main, and footer areas.
  - [x] 1.2 Create `src/components/layout/header.tsx` with app title and ThemeToggle.
  - [x] 1.3 Create `src/components/layout/bottom-nav.tsx` with Dashboard, Add, Settings tabs.
  - [x] 1.4 Create placeholder `src/components/dashboard/countdown-hero-placeholder.tsx`.

- [x] **Task 2: Typography & Fonts** (AC: #5, #6)

  - [x] 2.1 Load Plus Jakarta Sans from Google Fonts in `index.html`.
  - [x] 2.2 Define font family utilities in `index.css` or `tailwind.config`.
  - [x] 2.3 Add `tabular-nums` utility for number displays.

- [x] **Task 3: Design Tokens** (AC: #4, #7)

  - [x] 3.1 Verify OKLCH color palette is fully configured in `index.css`.
  - [x] 3.2 Define spacing scale (--spacing-1 to --spacing-12) in `index.css`.

- [x] **Task 4: Touch Targets & Accessibility** (AC: #3)

  - [x] 4.1 Ensure all interactive elements in bottom-nav have min 44x44px hit areas.
  - [x] 4.2 Ensure header elements have proper ARIA labels.

- [x] **Task 5: Integration & Testing** (AC: #1, #2)
  - [x] 5.1 Integrate `DashboardLayout` into `App.tsx`.
  - [x] 5.2 Create `src/tests/dashboard-layout.test.tsx` for rendering.
  - [x] 5.3 Manual: Verify responsiveness across mobile and desktop viewports.

## Dev Notes

### UX Design (from `ux-design-specification.md`)

- **Header:** App title "SubTracker", ThemeToggle on the right.
- **Bottom Nav:** 3-tab mobile pattern. Icons: `LayoutDashboard`, `Plus`, `Settings` from Lucide.
- **Spacing:** 4px base grid.
- **Touch Targets:** 44x44px minimum.

### Typography

- **Font:** Plus Jakarta Sans (Google Fonts).
- **Fallback:** system-ui, sans-serif.
- **Hero Numbers:** 48px, bold, tabular-nums.

## File List

- `src/components/layout/dashboard-layout.tsx` (New)
- `src/components/layout/header.tsx` (New)
- `src/components/layout/bottom-nav.tsx` (New)
- `src/components/dashboard/countdown-hero-placeholder.tsx` (New)
- `src/App.tsx`
- `src/index.css`
- `index.html`
- `src/tests/dashboard-layout.test.tsx` (New)

## Change Log

- **Status Update:** backlog -> in-progress
