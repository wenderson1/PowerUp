---
name: Kinetic Blue-Shift
colors:
  surface: '#0f141a'
  surface-dim: '#0f141a'
  surface-bright: '#353940'
  surface-container-lowest: '#0a0e15'
  surface-container-low: '#181c22'
  surface-container: '#1c2026'
  surface-container-high: '#262a31'
  surface-container-highest: '#31353c'
  on-surface: '#dfe2eb'
  on-surface-variant: '#c0c7d5'
  inverse-surface: '#dfe2eb'
  inverse-on-surface: '#2c3137'
  outline: '#8a919f'
  outline-variant: '#404753'
  surface-tint: '#a4c9ff'
  primary: '#a4c9ff'
  on-primary: '#00315d'
  primary-container: '#1693ff'
  on-primary-container: '#002a51'
  inverse-primary: '#0060ac'
  secondary: '#a7c9fa'
  on-secondary: '#06315a'
  secondary-container: '#274a75'
  on-secondary-container: '#99baeb'
  tertiary: '#ffb68a'
  on-tertiary: '#522300'
  tertiary-container: '#e66f06'
  on-tertiary-container: '#481e00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#d4e3ff'
  primary-fixed-dim: '#a4c9ff'
  on-primary-fixed: '#001c39'
  on-primary-fixed-variant: '#004883'
  secondary-fixed: '#d3e3ff'
  secondary-fixed-dim: '#a7c9fa'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#254872'
  tertiary-fixed: '#ffdbc8'
  tertiary-fixed-dim: '#ffb68a'
  on-tertiary-fixed: '#321300'
  on-tertiary-fixed-variant: '#743400'
  background: '#0f141a'
  on-background: '#dfe2eb'
  surface-variant: '#31353c'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Lexend
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Lexend
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Lexend
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.2'
  data-display:
    fontFamily: Space Grotesk
    fontSize: 40px
    fontWeight: '700'
    lineHeight: '1'
    letterSpacing: -0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 4px
  xs: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  gutter: 16px
  margin: 20px
---

## Brand & Style

This design system is built for a high-performance fitness environment where clarity and energy are paramount. The brand personality is authoritative yet encouraging, mirroring the precision of a professional coach and the steady, unstoppable momentum of a focused athlete.

The aesthetic is a fusion of **High-Contrast Bold** and **Minimalism**. By stripping away unnecessary decorative elements, the design system focuses the user's attention on their performance data and primary actions. The emotional response is one of calm confidence and technical mastery—using dark mode to reduce eye strain during early morning or late-night sessions, paired with vibrant blue accents to signal progress and high-priority actions.

## Colors

The palette is centered on a **Vivid Blue** primary color (#0090fe). This color is reserved for active states, primary call-to-actions, and progress completion. The background uses a sophisticated **Deep Neutral** derived from a grayish-blue base (#73777f) to ensure high legibility while maintaining a premium dark-mode atmosphere.

A **Muted Steel Blue** (#5879a6) is used for secondary elements and informational alerts to provide visual variety without overwhelming the user. To introduce a sense of urgency or highlight critical metrics like heart rate peaks, a **Burned Orange** tertiary color (#e36d02) is utilized. Surfaces and cards use tonal variations of the neutral base to create depth.

## Typography

This design system employs a dual-font strategy to balance technical precision with athletic readability. 

**Space Grotesk** is used for all headlines and large data displays. Its geometric, slightly technical character reinforces the professional, performance-tracking nature of the app. It should be set with tight letter-spacing for large numerals to create a sense of urgency and impact.

**Lexend** is used for all body copy, labels, and instructional text. Designed specifically for readability and speed, Lexend ensures that users can quickly digest information while in motion or mid-workout. Bold weights of Lexend are used for labels to maintain a strong hierarchy against the vibrant primary colors.

## Layout & Spacing

The design system utilizes a **Fluid Grid** based on an 8-column system for mobile, scaling to 12 columns for larger viewports. The spacing rhythm follows a strict 4px baseline grid to ensure mathematical harmony between typography and container heights.

Margins are set to 20px to provide a comfortable "breathing room" against the screen edges, while internal card padding is typically set to 24px (lg) to give data visualizations and buttons plenty of tap-target area. Elements are grouped using proximity; related data points use 8px spacing, while distinct sections use 32px spacing to clear the visual field.

## Elevation & Depth

To maintain a clean and modern look, the design system avoids traditional drop shadows. Instead, it uses **Tonal Layers** and **Low-Contrast Outlines**.

1.  **Base Layer:** The darkest background color (#1A1C1E).
2.  **Surface Layer:** Cards and containers use surface-container levels (approx #1E2022).
3.  **Accent Outlines:** Active elements or focused cards may use a 1px solid border of the primary Vivid Blue or a subtle gray variant to define edges.

Depth is primarily communicated through color saturation. The most important interactive elements "glow" with the primary Vivid Blue, while background elements recede into the dark neutrals.

## Shapes

The shape language is defined by **Rounded** geometry (0.5rem base radius). This softens the high-contrast color palette, making the app feel approachable rather than aggressive. 

- **Standard Cards:** Use `rounded-lg` (1rem / 16px) to create a friendly, containerized feel for workout blocks.
- **Buttons & Chips:** Use a full pill-shape (3rem / 48px) to signify "interactivity" and "motion."
- **Progress Bars:** Use fully rounded end-caps to mirror the fluid nature of movement and time.

## Components

**Buttons**
Primary buttons are pill-shaped, filled with Vivid Blue, and use high-contrast white text for maximum legibility. Secondary buttons are outlined with 1.5px borders in the primary color.

**Cards**
Workout and data cards use the neutral Surface background. They should never have shadows; instead, use a 1px border (#43474E) to separate them from the background if they sit on a similar tone.

**Progress Indicators**
Circular and linear progress indicators should use a thick stroke (4px+) with the Vivid Blue color. For peak zones or warnings, use the Burned Orange tertiary color.

**Chips/Tags**
Used for muscle groups or equipment. These should be small, pill-shaped elements with a dark fill and light-gray text, only turning Vivid Blue when selected.

**Data Inputs**
Input fields use a bottom-border-only style or a very subtle dark-filled container. When focused, the border or a "caret" element should pulse in the primary Vivid Blue to indicate readiness.