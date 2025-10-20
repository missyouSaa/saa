# ITSU Analytics Design Guidelines - Extended

## Design Approach: Material Design for Educational Analytics Platform

**Selected Approach:** Design System (Material Design)  
**Justification:** Information-dense educational platform requiring data clarity, professional presentation, and consistent patterns for forms, authentication, and surveys.

---

## Core Design Elements

### A. Color Palette

**Light Mode:**
- Background: 0 0% 100%
- Foreground: 240 10% 3.9%
- Primary: 210 90% 48% (Educational Blue)
- Secondary: 210 20% 92%
- Muted: 210 15% 95%
- Border: 214 15% 91%

**Dark Mode:**
- Background: 240 10% 3.9%
- Foreground: 0 0% 98%
- Primary: 210 85% 55%
- Card: 240 8% 8%
- Border: 214 15% 15%

**Data Visualization:**
- Chart 1: 210 85% 50% (Blue)
- Chart 2: 185 70% 48% (Teal)
- Chart 3: 265 75% 55% (Purple)
- Chart 4: 145 60% 48% (Green)
- Chart 5: 35 85% 58% (Amber)

**Semantic:**
- Success: 145 65% 45%
- Warning: 35 90% 55%
- Error: 0 75% 52%

---

### B. Typography

**Font Families:**
- Sans: Inter (primary UI, forms, buttons)
- Serif: Merriweather (section headers, data labels)
- Mono: JetBrains Mono (student IDs, system codes)

**Scale:**
- Display: text-4xl font-bold (page titles)
- H1: text-2xl font-semibold (section headers)
- H2: text-xl font-semibold (subsections)
- Body: text-base (main content)
- Labels: text-sm font-medium (form labels)
- Caption: text-xs text-muted-foreground (helper text)

---

### C. Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 8, 12, 16  
Examples: p-2, p-4, m-8, gap-12, py-16

**Container Widths:**
- Authentication forms: max-w-md mx-auto
- Survey forms: max-w-2xl mx-auto
- Dashboard analytics: max-w-7xl mx-auto
- Content sections: max-w-6xl

**Grid Patterns:**
- Metric cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6
- Survey questions: Single column with consistent spacing
- Student lists: Full-width responsive table

---

### D. Component Library

#### Authentication Components

**Login Card:**
- Centered layout with max-w-md
- Card with shadow-lg and border
- Logo/app name at top (text-2xl font-bold)
- Role selector tabs (Student/Teacher) with primary background when active
- Email and password inputs with floating labels
- Primary button full-width (Login)
- Helper links below (Forgot password, Register)
- Clean white/card background with subtle border

**Registration Form:**
- Similar card structure
- Additional fields: First name, Last name, Student ID (for students), Department (for teachers)
- Role auto-assigned based on Student ID presence
- Validation messages inline with error color
- Success redirect to respective dashboard

#### Survey Module Components

**Survey Form Container:**
- Clean card with max-w-2xl
- Progress indicator at top (X of Y questions completed)
- Section dividers between question groups
- Auto-save indicator (small text, muted color)

**Question Types:**
1. **Multiple Choice:** Radio buttons with clear labels, vertical stack, gap-3
2. **Likert Scale:** Horizontal button group, 1-5 scale with labels
3. **Text Input:** Textarea with character counter, min-height: 120px
4. **Cognitive Profile:** Slider component with labels at extremes (e.g., Sequential ←→ Global)

**Survey Card (Admin View):**
- Student name and ID at top
- Completion badge (Success green if complete, Warning amber if pending)
- Progress bar showing percentage
- "View Responses" button (outline variant)
- Last updated timestamp

#### Role-Based Dashboards

**Student Dashboard:**
- Personal greeting (H1 with student name)
- Single metric overview (My Progress, Tasks Completed, Current Average)
- Weekly progress timeline (horizontal scroll on mobile)
- Pending surveys alert card with primary CTA
- Recommended tasks section

**Teacher Dashboard:**
- Global metrics grid (4 columns on desktop)
- Class overview charts
- Student list with quick filters
- Survey completion tracker
- Export data button (secondary variant)

---

### E. Images & Visual Elements

**No Hero Images** - Utility-focused application

**Illustrations (Empty States Only):**
- No surveys yet: Clipboard illustration, max-w-xs mx-auto, grayscale with primary accent
- No students enrolled: Group silhouette illustration
- Survey completed: Checkmark with form document

**Icons:**
- Use Lucide React icons throughout
- Size: 20px (default), 24px (emphasis)
- Color: foreground for neutral, primary for interactive

---

## Interactions & Animations

**Minimal Animations Philosophy:**
- Only functional transitions, no decorative effects
- Form validation: Shake animation on error (200ms)
- Success states: Subtle fade-in with checkmark
- Loading: Skeleton loaders for data tables, spinner for form submission

**Hover States:**
- Cards: shadow-md transition-all duration-200
- Buttons: Built-in variant states (no custom)
- Links: Underline decoration on hover

**Active States:**
- Selected items: ring-2 ring-primary
- Current week/section: border-l-4 border-primary

---

## Accessibility Standards

- Consistent dark mode across all form inputs and text fields
- All form fields with visible labels (not placeholder-only)
- Keyboard navigation for all interactive elements
- ARIA labels on icon-only buttons
- Color + text/patterns for all status indicators
- Focus rings always visible (ring-2 ring-offset-2)

---

## Key Design Principles

1. **Information Hierarchy:** Data takes precedence over decoration
2. **Consistency:** Same patterns for similar actions across roles
3. **Clarity:** Clear labels, helper text, and validation messages
4. **Efficiency:** Minimal clicks to complete tasks
5. **Trust:** Professional appearance builds credibility with educational data
6. **Responsiveness:** Mobile-first approach with sensible breakpoints