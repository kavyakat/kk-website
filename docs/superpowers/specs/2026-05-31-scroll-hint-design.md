---
title: Clickable scroll hint on every section
date: 2026-05-31
status: approved
---

## Goal

Add a clickable scroll hint to every section except the last (Contact), so users can click to advance to the next section.

## Component

Extract a `ScrollHint` client component at `src/components/ScrollHint.tsx`.

**Props:**
- `targetId: string` — the `id` of the section to scroll to on click

**Behaviour:**
- On click: find `#scroll-container` and call `scrollTo({ top: el.offsetTop, behavior: "smooth" })` targeting the element with `id === targetId`
- Visual: identical to the existing Hero scroll hint — bouncing "Scroll" label + chevron SVG, `text-indigo-400`, `animate-bounce`
- Positioned: `absolute bottom-6 left-1/2 -translate-x-1/2`, `z-10`, `cursor-pointer`
- Uses a `<button>` (not a `<div>`) for accessibility

## Section wiring

Sections and their targets, in order:

| Section component | File | Target |
|---|---|---|
| Hero | `src/components/Hero.tsx` | `about` |
| About | `src/components/About.tsx` | `experience` |
| Experience | `src/components/Experience.tsx` | `skills` |
| Skills | `src/components/Skills.tsx` | `beyondwork` |
| BeyondWork | `src/components/BeyondWork.tsx` | `contact` |
| Contact | — | no hint |

Each section already has `position: relative` implied by flex/grid layout. The `<section>` element needs `relative` class added where missing so the absolute-positioned hint is contained correctly.

## Removing old scroll hint from Hero

The existing inline scroll hint `<div>` in `Hero.tsx` is replaced by `<ScrollHint targetId="about" />`.

## No new state or hooks required

The component is stateless — just a button with an `onClick` handler.
