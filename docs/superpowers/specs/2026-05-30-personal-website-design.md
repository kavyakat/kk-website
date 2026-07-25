# Personal Website — Design Spec

**Date:** 2026-05-30
**Author:** Kavya Kathuria

---

## Context

Kavya needs a personal website to serve as a general "here's who I am" showcase, primarily for recruiters and hiring managers. The site should communicate her role, experience, and skills clearly and professionally — the content does the work, the design stays out of the way.

---

## Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Deployment:** Vercel (free tier, deploy from GitHub)
- **Animations:** CSS `scroll-snap` + `IntersectionObserver` for fade-in transitions

---

## Visual Style

- **Theme:** Minimal and clean — white/off-white backgrounds, dark gray typography, generous whitespace
- **Background:** White (`#ffffff`) and light gray (`#fafafa`) alternating between sections. No black backgrounds.
- **Typography:** Section headings use a serif italic style — Georgia or equivalent serif font, `font-style: italic`, `font-weight: 400`, `font-size: ~42px`, with slightly wider letter-spacing (`letter-spacing: 0.04em`). Airy and editorial, not heavy. Body text at 14–15px, sans-serif, line-height 1.8. Hero name remains large and bold (sans-serif, ~5rem) as the centrepiece.
- **Accent color:** A single muted accent (e.g. `#6366f1` indigo) used sparingly for hover states and links.
- **Animations:** Scroll-triggered fade-in + subtle upward translate per section. Smooth scroll-snap between full-height sections.

---

## Layout

Single scrolling page (`/`) with **CSS scroll-snap** — each section is `height: 100vh`, the browser snaps to each one as the user scrolls. A sticky navbar at the top allows jumping to any section directly.

A subtle section counter (e.g. `01 / 05`) appears bottom-left of each section.

### Sections (in order)

| # | Section | Component file |
|---|---------|---------------|
| 1 | Hero | `src/components/Hero.tsx` |
| 2 | About | `src/components/About.tsx` |
| 3 | Experience | `src/components/Experience.tsx` |
| 4 | Skills | `src/components/Skills.tsx` |
| 5 | Contact | `src/components/Contact.tsx` |

**Adding/removing a section:** Create or delete the component file and add/remove one line in `src/app/page.tsx`. Each section is fully self-contained.

---

## Component Details

### Navbar (`src/components/Navbar.tsx`)
- Sticky, top of page, `z-index: 50`
- Left: initials "KK" as a logo/home link
- Right: smooth-scroll links to each section anchor
- Thin bottom border, white background, no shadow
- On mobile: collapses to a hamburger menu

### Hero
- Full viewport height (`100vh`)
- Content vertically centered
- Large name: "Kavya Kathuria" at ~5rem bold
- Subtitle: role + company label above the name (small caps, muted)
- One-line bio below the name
- Two CTAs: "Get in touch" (scrolls to Contact) + icon links for GitHub and LinkedIn
- Section counter bottom-left

### About
- Full viewport height
- Large "About" title
- 2–3 sentence paragraph about role and focus
- Row of 3 stat chips below: Role / Company / Focus

### Experience
- Full viewport height
- Large "Experience" title
- List of role cards (title, company, date range, 1–2 line description)
- Data sourced from a static array in the component — easy to edit

### Skills
- Full viewport height
- Large "Skills" title
- Grouped tag rows: Languages / Platform / Tools / Other
- Pill-shaped tags with light border, no fill
- Data sourced from a static array in the component

### Contact
- Full viewport height
- Large "Contact" heading
- Short line of copy
- "Email me" button (mailto link) + GitHub + LinkedIn icon buttons
  - GitHub: https://github.com/kavyakat
  - LinkedIn: https://linkedin.com/in/kavyakathuria

---

## Scroll & Animation Behavior

- Container: `scroll-snap-type: y mandatory`, `overflow-y: scroll`, `height: 100vh`
- Each section: `scroll-snap-align: start`, `height: 100vh`
- Fade-in: each section's content fades in + translates up ~20px when it enters the viewport, using `IntersectionObserver` toggling a CSS class
- Navbar smooth-scroll links use `scroll-behavior: smooth`

---

## File Structure

```
kk_website/
├── src/
│   ├── app/
│   │   ├── page.tsx          ← imports and renders all section components
│   │   ├── layout.tsx        ← root layout, fonts, metadata
│   │   └── globals.css       ← base styles, scroll-snap container
│   └── components/
│       ├── Navbar.tsx
│       ├── Hero.tsx
│       ├── About.tsx
│       ├── Experience.tsx
│       ├── Skills.tsx
│       └── Contact.tsx
├── public/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

---

## Data

No database or CMS. All content (experience entries, skills, links) lives as static TypeScript arrays directly in each component file. To update content, edit the array.

---

## Deployment

1. Push to GitHub
2. Connect repo to Vercel
3. Vercel auto-deploys on every push to `main`

---

## Verification

- `npm run dev` — site loads at localhost:3000, all 5 sections visible, scroll-snap works
- Scroll through each section — fade-in animation triggers on each
- Navbar links — clicking each one snaps to the correct section
- Contact buttons — "Email me" opens mail client, GitHub/LinkedIn open correct URLs in new tab
- Mobile — navbar collapses, sections still full-height and readable
- `npm run build` — no TypeScript or build errors
