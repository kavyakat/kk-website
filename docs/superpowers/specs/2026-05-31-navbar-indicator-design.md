---
title: Navbar scroll indicator + ScrollHint cleanup
date: 2026-05-31
status: approved
---

## Goal

Remove the ScrollHint from all sections except Hero, and add a scroll-aware indicator to the navbar: desktop gets an active link highlight, mobile gets a section name label + progress bar.

## Changes

### 1. Remove ScrollHint from non-Hero sections

Remove `<ScrollHint ... />` and its import from:
- `src/components/About.tsx`
- `src/components/Experience.tsx`
- `src/components/Skills.tsx`
- `src/components/BeyondWork.tsx`

Keep `<ScrollHint targetId="about" />` in `src/components/Hero.tsx`.

### 2. Active section tracking hook

Create `src/hooks/useActiveSection.ts`.

- Accepts `ids: string[]` — the section ids in order
- Uses `IntersectionObserver` on `#scroll-container` as root, threshold 0.5
- Returns `activeId: string` — the id of the section currently most in view
- On mount, sets activeId to the first id (Hero) as default

### 3. Navbar — desktop active link

In `src/components/Navbar.tsx`:
- Call `useActiveSection` with all 6 section ids
- For each desktop nav button, apply dark text + underline when its href matches `#${activeId}`
- Inactive links stay as-is (`text-gray-500`)

Active styles: `text-gray-900 border-b border-gray-900`

### 4. Navbar — mobile label + progress bar

In `src/components/Navbar.tsx`:
- Show current section label to the right of the hamburger icon (same `activeId` from the hook)
- Label text: the `label` from the `links` array matching `activeId`
- Add a 2px progress bar at the bottom of the navbar (below the main row)
- Progress = `(currentIndex / (links.length - 1)) * 100`% width, `bg-gray-900`, transitions smoothly

The mobile label and progress bar are hidden on `md:` and above (`md:hidden`). The desktop active link is hidden below `md:` (`hidden md:flex`).
