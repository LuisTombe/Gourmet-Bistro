---
name: Gourmet Bistro & POS System
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#5a4138'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#8e7166'
  outline-variant: '#e2bfb2'
  surface-tint: '#a73a00'
  primary: '#a33900'
  on-primary: '#ffffff'
  primary-container: '#cc4900'
  on-primary-container: '#fffbff'
  inverse-primary: '#ffb599'
  secondary: '#904d00'
  on-secondary: '#ffffff'
  secondary-container: '#fe932c'
  on-secondary-container: '#663500'
  tertiary: '#515c71'
  on-tertiary: '#ffffff'
  tertiary-container: '#6a758a'
  on-tertiary-container: '#fefcff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbce'
  primary-fixed-dim: '#ffb599'
  on-primary-fixed: '#370e00'
  on-primary-fixed-variant: '#7f2b00'
  secondary-fixed: '#ffdcc3'
  secondary-fixed-dim: '#ffb77d'
  on-secondary-fixed: '#2f1500'
  on-secondary-fixed-variant: '#6e3900'
  tertiary-fixed: '#d8e3fb'
  tertiary-fixed-dim: '#bcc7de'
  on-tertiary-fixed: '#111c2d'
  on-tertiary-fixed-variant: '#3c475a'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 3rem
    fontWeight: '800'
    lineHeight: '1.15'
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 2rem
    fontWeight: '800'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 2.25rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.75rem
    fontWeight: '700'
    lineHeight: '1.25'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.5rem
    fontWeight: '700'
    lineHeight: '1.3'
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.25rem
    fontWeight: '600'
    lineHeight: '1.35'
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 1.125rem
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 1rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.005em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '400'
    lineHeight: '1.45'
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.875rem
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.75rem
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: 0.03em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 0.6875rem
    fontWeight: '700'
    lineHeight: '1.15'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 1.5rem
  margin-lg: 2.5rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system defines an operational and guest-facing digital environment for contemporary gastronomy. Designed to support high-velocity restaurant operations—spanning Kitchen Display Systems (KDS), handheld waitstaff POS terminals, and executive administrative dashboards—it balances culinary craft with high-legibility transactional precision.

The design movement combines **Contemporary Functionalism** with **Warm Gastronomic Tactility**:
- Crisp, hyper-legible interfaces configured for glanceable cognition under high-stress, low-latency kitchen and dining room environments.
- Warm, appetizing visual anchors evoking fire, amber reduction, and cast-iron surfaces without cluttering operational workflows.
- Clear state segmentation that prevents ordering mistakes through precise, distinct status signifiers.
- Professional, restrained ergonomics suitable for greasy fingerprints, variable tablet angles, and low-light ambient dining rooms.

## Colors

The palette centers on warm culinary tones stabilized by dense slate and charcoal foundations. 

### Core Palette
- **Primary (`#EA580C`)**: Ember Orange. Used for primary user conversions, high-priority interactive triggers, active tab states, and checkout/send-to-kitchen CTAs.
- **Secondary (`#D97706`)**: Warm Amber. Anchors secondary alerts, warnings, and highlighting for VIP tables or modified ticket items.
- **Tertiary (`#1E293B`)**: Slate Charcoal. Deployed for structure, system chrome, navigation rails, and header surfaces in POS terminals.
- **Neutral (`#0F172A`)**: Deep Cast Iron. Used for high-contrast typography, high-priority icons, and dark-mode KDS backgrounds.

### Operational State Tokens
- **Order: Pendiente (`#F59E0B`)**: Amber gold indicator signaling an incoming, unacknowledged order ticket.
- **Order: En Preparación (`#3B82F6`)**: Cobalt blue indicator for tickets actively on the line or grill station.
- **Order: Listo (`#10B981`)**: Vivid emerald green denoting plates ready at the pass or expo counter.
- **Order: Entregado (`#64748B`)**: Muted slate signaling completed, archived, or fulfilled orders.
- **Table: Disponible (`#10B981`)**: Emerald for cleared, sanitized, and open seating.
- **Table: Ocupada (`#EF4444`)**: Ruby red denoting active guest seating and open bills.

### Surface Tones
- **Light Surfaces**: Crisp neutral canvas `#FFFFFF` for primary order cards, offset by `#F8FAFC` for page backgrounds and `#E2E8F0` for structural borders.
- **Dark Mode / Kitchen Displays**: Dedicated slate surfaces `#0F172A` (canvas), `#1E293B` (ticket containers), and `#334155` (dividers and inactive ticket headers).

## Typography

The typography uses **Plus Jakarta Sans** across all levels, relying on its crisp geometric structures, generous x-height, and open apertures for immediate scanning.

### Hierarchy & Usage
- **Display & Headings**: Reserved for revenue KPIs, table grid numbers, and total ticket amounts. Numerals carry tabular properties (`tnum`) for vertical alignment in bills, receipts, and split checks.
- **Body**: Used for menu item descriptions, special kitchen modification notes (e.g., "Sin cebolla", "Término medio"), and operational audit logs.
- **Labels & Badges**: Set in medium to bold weights with slight positive letter spacing for order status indicators, station tags (Bar, Cocina, Postres), and table capacity indicators.

## Layout & Spacing

The layout is built upon a flexible 12-column grid system tuned for dense transactional screens, terminal touch targets, and widescreen kitchen overview panels.

### Responsive Breakpoints & Grids
- **Mobile Handheld (360px – 767px)**: 4-column layout, `margin`: `1rem`, `gutter`: `1rem`. Prioritizes single-column full-width order lists, sticky footer command buttons for table orders, and bottom-sheet modifiers.
- **Tablet / Terminal POS (768px – 1024px)**: 8-column layout, `margin`: `1.5rem`, `gutter`: `1.5rem`. Split-screen layout: 5 columns dedicated to the visual category/item menu grid, 3 columns pinned to the live guest ticket and subtotal actions.
- **KDS / Admin Desktop (1025px+)**: 12-column fluid canvas, `margin`: `2.5rem`, `gutter`: `2rem`. Column-based ticket flow where order cards wrap seamlessly across horizontal lanes.

### Density Rules
Interactive elements strictly respect minimum touch targets of `44px × 44px` on tablet/mobile POS to ensure rapid server operation without mis-taps. Quantity steppers and fast modifiers utilize compact padding (`space-xs` and `space-sm`) nested inside comfortable hit boundaries.

## Elevation & Depth

Visual hierarchy uses a refined hybrid approach: clean tonal containment bolstered by crisp, low-contrast structural outlines and warm, diffused ambient shadows.

### Elevation Levels
- **Level 0 (Flat Canvas)**: `#F8FAFC` in standard mode, `#0F172A` in kitchen/dark mode. Used for application backdrops, sidebar navigation, and floor plan canvas areas.
- **Level 1 (Card & Ticket Surface)**: Pure `#FFFFFF` resting on `#F8FAFC`, bound by a `1px` continuous border in `#E2E8F0`. Shadow: `0 1px 3px 0 rgba(15, 23, 42, 0.04), 0 1px 2px -1px rgba(15, 23, 42, 0.02)`. Used for order items, table grid elements, and menu cards.
- **Level 2 (Hover & Active States)**: Raised surfaces during drag-and-drop table reorganizations or hovering over available tables. Shadow: `0 4px 6px -1px rgba(234, 88, 12, 0.08), 0 2px 4px -2px rgba(15, 23, 42, 0.05)`.
- **Level 3 (Modals, Slide-over Tickets, Split-Bill Drawers)**: High-prominence overlays. Shadow: `0 20px 25px -5px rgba(15, 23, 42, 0.12), 0 8px 10px -6px rgba(15, 23, 42, 0.04)`.
- **Level 4 (Floating Kitchen Alerts & Overdue Timers)**: Prominent system-level interruptions. Surface uses a subtle border colored according to the status token (e.g., `#EF4444` for tickets exceeding 25 minutes).

## Shapes

The system standardizes on a **Rounded (Level 2)** shape profile:
- **Base Components (Inputs, Buttons, Badges, Modifiers)**: `0.5rem` (8px) radius. Balances approachable warmth with structured geometry.
- **Containers & Surface Panels (Order Cards, Table Cells, Modal Dialogs)**: `1rem` (16px) radius (`rounded-lg`). Creates soft containment that reduces interface fatigue during multi-hour shifts.
- **Large Contextual Overlays (Slide-out Drawers, Bottom Sheets)**: `1.5rem` (24px) radius (`rounded-xl`).
- **Pill Elements**: Reserved exclusively for status indicators (e.g., *Pendiente*, *Listo*), category filter pills, and table capacity tags (`rounded-full`).

## Components

### Buttons & Action Triggers
- **Primary Action (Send Order, Cobrar)**: Solid Ember Orange (`#EA580C`) background, white text, `0.5rem` border radius, minimum height of `48px` on touch displays.
- **Secondary Action (Print Pre-bill, Hold Item)**: Slate surface (`#F1F5F9`), charcoal text (`#1E293B`), border `1px` solid `#E2E8F0`.
- **Danger Action (Void Item, Cancel Order)**: Ghost or subtle tinted fill (`#FEF2F2`) with Ruby text (`#EF4444`) and border (`#FCA5A5`).

### Status Badges
Status indicators leverage a tinted background with a high-contrast label and a 6px solid dot:
- **Pendiente**: Background `#FEF3C7`, Text `#B45309`, Dot `#F59E0B`.
- **En Preparación**: Background `#EFF6FF`, Text `#1D4ED8`, Dot `#3B82F6`.
- **Listo**: Background `#ECFDF5`, Text `#047857`, Dot `#10B981`.
- **Entregado**: Background `#F1F5F9`, Text `#475569`, Dot `#64748B`.

### Table Management Nodes
- Floor-plan cards display table ID (e.g., "Mesa 12"), seat count, elapsed time, and total bill.
- **Disponible**: Outlined in `#10B981` with soft emerald wash (`#ECFDF5`), clear icon indicator.
- **Ocupada**: Outlined in `#EF4444` with soft rose wash (`#FEF2F2`), displaying active waiter initials and dynamic timer.

### Order Tickets & Tables
- **Tabular Order Summary**: Clean line-item rows with fixed tabular figures. Quantity callouts displayed in bold (`2x`), item title with subtext modifiers (e.g., *Término: Medio / Sin sal* in `#64748B`), and right-aligned prices.
- **Quick Quantity Stepper**: Compact trio control `[-] [Qty] [+]` with minimum width `108px`, providing immediate feedback through subtle active scaling.
- **Filter Tabs by State**: Horizontal scrollable tab container with pill indicators showing live count tokens (e.g., `Cocina (4)`).