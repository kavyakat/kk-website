# Personal Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a minimal, modern personal website for Kavya Kathuria using Next.js 14, TypeScript, and Tailwind CSS — a single scrolling page with full-viewport sections and smooth scroll-snap.

**Architecture:** One Next.js App Router page (`app/page.tsx`) renders six self-contained components (Navbar + 5 sections). Each section is `height: 100vh` with CSS scroll-snap. A shared `useInView` hook drives fade-in animations via IntersectionObserver. All content lives as static data arrays inside each component.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Vercel (deployment)

---

## File Map

| File | Action | Purpose |
|------|--------|---------|
| `src/app/layout.tsx` | Create | Root layout — fonts, metadata, body styles |
| `src/app/globals.css` | Create | Base reset, scroll-snap container, animation classes |
| `src/app/page.tsx` | Create | Composes all section components in order |
| `src/components/Navbar.tsx` | Create | Sticky nav with smooth-scroll links, mobile hamburger |
| `src/components/Hero.tsx` | Create | Full-viewport hero — name, bio, CTAs |
| `src/components/About.tsx` | Create | Full-viewport about — paragraph + stat chips |
| `src/components/Experience.tsx` | Create | Full-viewport experience — role cards from static array |
| `src/components/Skills.tsx` | Create | Full-viewport skills — grouped pill tags from static array |
| `src/components/Contact.tsx` | Create | Full-viewport contact — email + social links |
| `src/hooks/useInView.ts` | Create | IntersectionObserver hook used by all sections |
| `tailwind.config.ts` | Create | Extend theme with serif font family |
| `next.config.ts` | Create | Minimal Next.js config |

---

## Task 1: Scaffold Next.js project

**Files:**
- Creates project root with all config files

- [ ] **Step 1: Bootstrap the project**

```bash
cd /Users/I317204/IdeaProjects/kk_website
npx create-next-app@14 . --typescript --tailwind --eslint --app --no-src-dir --import-alias "@/*"
```

When prompted, accept all defaults. This creates `app/`, `public/`, `tailwind.config.ts`, `next.config.ts`, `package.json`.

- [ ] **Step 2: Move app directory under src/**

```bash
mkdir -p src
mv app src/app
mkdir -p src/components src/hooks
```

- [ ] **Step 3: Verify dev server starts**

```bash
npm run dev
```

Expected: `Ready on http://localhost:3000` with no errors. Open the URL — default Next.js page loads.

- [ ] **Step 4: Commit**

```bash
git init
git add .
git commit -m "chore: scaffold Next.js 14 project with TypeScript and Tailwind"
```

---

## Task 2: Base styles and scroll-snap container

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`
- Modify: `tailwind.config.ts`

- [ ] **Step 1: Replace globals.css**

Replace the entire contents of `src/app/globals.css` with:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

html {
  scroll-behavior: smooth;
}

body {
  height: 100vh;
  overflow: hidden;
}

#scroll-container {
  height: 100vh;
  overflow-y: scroll;
  scroll-snap-type: y mandatory;
}

section {
  scroll-snap-align: start;
  height: 100vh;
}

/* Fade-in animation for section content */
.fade-in {
  opacity: 0;
  transform: translateY(20px);
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-in.visible {
  opacity: 1;
  transform: translateY(0);
}
```

- [ ] **Step 2: Update tailwind.config.ts to add serif font**

Replace the entire contents of `tailwind.config.ts` with:

```ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ["Georgia", "Times New Roman", "serif"],
      },
      colors: {
        accent: "#6366f1",
      },
    },
  },
  plugins: [],
};

export default config;
```

- [ ] **Step 3: Update layout.tsx**

Replace the entire contents of `src/app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kavya Kathuria",
  description: "Software Developer · SAP Commerce Analytics",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 4: Verify build is clean**

```bash
npm run build
```

Expected: build succeeds with no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx tailwind.config.ts
git commit -m "style: base styles, scroll-snap container, serif font config"
```

---

## Task 3: useInView hook

**Files:**
- Create: `src/hooks/useInView.ts`

- [ ] **Step 1: Create the hook**

Create `src/hooks/useInView.ts` with:

```ts
import { useEffect, useRef, useState } from "react";

export function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, isVisible };
}
```

- [ ] **Step 2: Commit**

```bash
git add src/hooks/useInView.ts
git commit -m "feat: useInView hook for scroll-triggered fade-in"
```

---

## Task 4: Navbar component

**Files:**
- Create: `src/components/Navbar.tsx`

- [ ] **Step 1: Create Navbar.tsx**

Create `src/components/Navbar.tsx` with:

```tsx
"use client";

import { useState } from "react";

const links = [
  { label: "About", href: "#about" },
  { label: "Experience", href: "#experience" },
  { label: "Skills", href: "#skills" },
  { label: "Contact", href: "#contact" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleNavClick = (href: string) => {
    setMenuOpen(false);
    const id = href.replace("#", "");
    const el = document.getElementById(id);
    const container = document.getElementById("scroll-container");
    if (el && container) {
      container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => handleNavClick("#hero")}
          className="text-sm font-bold tracking-widest text-gray-900 hover:text-accent transition-colors"
        >
          KK
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex gap-8">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors tracking-wide"
            >
              {link.label}
            </button>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-gray-500 hover:text-gray-900"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            {menuOpen ? (
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-6 py-4 flex flex-col gap-4">
          {links.map((link) => (
            <button
              key={link.href}
              onClick={() => handleNavClick(link.href)}
              className="text-sm text-gray-600 hover:text-gray-900 text-left transition-colors"
            >
              {link.label}
            </button>
          ))}
        </div>
      )}
    </nav>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Navbar.tsx
git commit -m "feat: Navbar with smooth-scroll links and mobile hamburger"
```

---

## Task 5: Hero component

**Files:**
- Create: `src/components/Hero.tsx`

- [ ] **Step 1: Create Hero.tsx**

Create `src/components/Hero.tsx` with:

```tsx
"use client";

import { useInView } from "@/hooks/useInView";

export default function Hero() {
  const { ref, isVisible } = useInView();

  const scrollToContact = () => {
    const el = document.getElementById("contact");
    const container = document.getElementById("scroll-container");
    if (el && container) {
      container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
    }
  };

  return (
    <section
      id="hero"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <p className="text-xs text-gray-400 uppercase tracking-widest mb-4">
          Software Developer · SAP
        </p>
        <h1 className="text-7xl md:text-8xl font-bold text-gray-900 leading-none tracking-tight mb-6">
          Kavya<br />Kathuria
        </h1>
        <p className="text-sm text-gray-500 leading-relaxed max-w-md mb-8">
          Building analytics infrastructure for SAP Commerce Cloud.
          Event-driven systems, data pipelines, platform engineering.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={scrollToContact}
            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
          >
            Get in touch ↓
          </button>
          <a
            href="https://github.com/kavyakat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/kavyakathuria"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        01 / 05
      </span>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Hero.tsx
git commit -m "feat: Hero section — name, bio, CTAs"
```

---

## Task 6: About component

**Files:**
- Create: `src/components/About.tsx`

- [ ] **Step 1: Create About.tsx**

Create `src/components/About.tsx` with:

```tsx
"use client";

import { useInView } from "@/hooks/useInView";

export default function About() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="about"
      className="relative flex items-center bg-gray-50 px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          About
        </h2>
        <p className="text-sm text-gray-600 leading-loose max-w-xl mb-10">
          I&apos;m a software developer on the Commerce Analytics team at SAP,
          where I build the CCv2 platform&apos;s analytics layer — the systems
          that track, move, and make sense of commerce events at scale. My work
          sits at the intersection of platform engineering and data, spanning
          event-driven architecture, data pipelines, and cloud-native services
          on SAP BTP.
        </p>
        <div className="flex gap-4 flex-wrap">
          {[
            { label: "Role", value: "Software Developer" },
            { label: "Company", value: "SAP" },
            { label: "Focus", value: "Platform · Analytics" },
          ].map((chip) => (
            <div
              key={chip.label}
              className="px-4 py-3 bg-white border border-gray-200 rounded-lg"
            >
              <p className="text-xs text-gray-400 mb-1">{chip.label}</p>
              <p className="text-sm text-gray-700">{chip.value}</p>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        02 / 05
      </span>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/About.tsx
git commit -m "feat: About section — bio and stat chips"
```

---

## Task 7: Experience component

**Files:**
- Create: `src/components/Experience.tsx`

- [ ] **Step 1: Create Experience.tsx**

Create `src/components/Experience.tsx` with:

```tsx
"use client";

import { useInView } from "@/hooks/useInView";

const experience = [
  {
    title: "Software Developer",
    company: "SAP",
    team: "Commerce Analytics",
    period: "2023 — Present",
    description:
      "Building the analytics layer of the CCv2 platform — event tracking systems, data pipelines, and cloud-native services on SAP BTP.",
  },
  // Add more roles here
];

export default function Experience() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="experience"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          Experience
        </h2>
        <div className="flex flex-col gap-4">
          {experience.map((role, i) => (
            <div
              key={i}
              className="flex items-start justify-between p-5 border border-gray-100 rounded-lg hover:border-gray-300 transition-colors"
            >
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {role.title}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {role.company} · {role.team}
                </p>
                <p className="text-xs text-gray-400 mt-3 leading-relaxed max-w-md">
                  {role.description}
                </p>
              </div>
              <p className="text-xs text-gray-300 whitespace-nowrap ml-6 mt-0.5">
                {role.period}
              </p>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        03 / 05
      </span>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Experience.tsx
git commit -m "feat: Experience section — role cards from static array"
```

---

## Task 8: Skills component

**Files:**
- Create: `src/components/Skills.tsx`

- [ ] **Step 1: Create Skills.tsx**

Create `src/components/Skills.tsx` with:

```tsx
"use client";

import { useInView } from "@/hooks/useInView";

const skills = [
  {
    group: "Languages",
    tags: ["Java", "Python"],
  },
  {
    group: "Platform",
    tags: ["SAP BTP", "CCv2", "mTLS", "XSUAA"],
  },
  {
    group: "Architecture",
    tags: ["Event-driven", "Message queues", "Data pipelines"],
  },
  {
    group: "Tools",
    tags: ["CI/CD", "Git"],
  },
];

export default function Skills() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="skills"
      className="relative flex items-center bg-gray-50 px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl w-full ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-8">
          Skills
        </h2>
        <div className="flex flex-col gap-5">
          {skills.map((group) => (
            <div key={group.group} className="flex items-start gap-4">
              <span className="text-xs text-gray-400 w-24 pt-1 shrink-0">
                {group.group}
              </span>
              <div className="flex flex-wrap gap-2">
                {group.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 text-xs text-gray-600 border border-gray-200 rounded-full bg-white"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        04 / 05
      </span>
    </section>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Skills.tsx
git commit -m "feat: Skills section — grouped pill tags from static array"
```

---

## Task 9: Contact component

**Files:**
- Create: `src/components/Contact.tsx`

- [ ] **Step 1: Create Contact.tsx**

Create `src/components/Contact.tsx` with:

```tsx
"use client";

import { useInView } from "@/hooks/useInView";

export default function Contact() {
  const { ref, isVisible } = useInView();

  return (
    <section
      id="contact"
      className="relative flex items-center bg-white px-6 md:px-16"
    >
      <div
        ref={ref}
        className={`fade-in max-w-2xl ${isVisible ? "visible" : ""}`}
      >
        <h2 className="font-serif italic text-5xl md:text-6xl text-gray-900 tracking-wide mb-6">
          Contact
        </h2>
        <p className="text-sm text-gray-500 leading-loose mb-8 max-w-md">
          Interested in working together or just want to say hello? My inbox is
          open.
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <a
            href="mailto:kavya.kathuria@example.com"
            className="px-5 py-2.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-700 transition-colors"
          >
            Email me
          </a>
          <a
            href="https://github.com/kavyakat"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://linkedin.com/in/kavyakathuria"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 border border-gray-200 text-gray-600 text-xs rounded hover:border-gray-400 hover:text-gray-900 transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>

      <span className="absolute bottom-6 left-6 md:left-16 text-xs text-gray-200 tracking-widest">
        05 / 05
      </span>
    </section>
  );
}
```

> **Note:** Replace `kavya.kathuria@example.com` with Kavya's real email address before deploying.

- [ ] **Step 2: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "feat: Contact section — email, GitHub, LinkedIn"
```

---

## Task 10: Compose page.tsx

**Files:**
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Replace page.tsx**

Replace the entire contents of `src/app/page.tsx` with:

```tsx
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Experience from "@/components/Experience";
import Skills from "@/components/Skills";
import Contact from "@/components/Contact";

export default function Home() {
  return (
    <>
      <Navbar />
      <div id="scroll-container">
        <Hero />
        <About />
        <Experience />
        <Skills />
        <Contact />
      </div>
    </>
  );
}
```

To add a section later: create the component, import it here, and add it inside `#scroll-container`. To remove one: delete the component and remove the line.

- [ ] **Step 2: Start dev server and verify**

```bash
npm run dev
```

Open http://localhost:3000. Check:
- All 5 sections are visible as you scroll
- Scroll-snap snaps cleanly between sections
- Navbar links scroll to the correct section
- Each section fades in as it enters the viewport
- Section counters appear bottom-left (01/05 … 05/05)
- Mobile: navbar collapses to hamburger at small screen widths

- [ ] **Step 3: Run build to confirm no TypeScript errors**

```bash
npm run build
```

Expected: `Route (app) / — static` with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose page — all sections wired together"
```

---

## Task 11: Add real email address

**Files:**
- Modify: `src/components/Contact.tsx`

- [ ] **Step 1: Replace placeholder email**

In `src/components/Contact.tsx`, replace:
```tsx
href="mailto:kavya.kathuria@example.com"
```
with Kavya's real email address:
```tsx
href="mailto:<real-email-here>"
```

- [ ] **Step 2: Commit**

```bash
git add src/components/Contact.tsx
git commit -m "chore: add real contact email"
```

---

## Task 12: Deploy to Vercel

- [ ] **Step 1: Push to GitHub**

Create a new GitHub repository at https://github.com/new (name it `kk-website` or similar), then:

```bash
git remote add origin https://github.com/kavyakat/<repo-name>.git
git push -u origin main
```

- [ ] **Step 2: Connect to Vercel**

1. Go to https://vercel.com/new
2. Import the GitHub repository
3. Leave all settings as default (Next.js is auto-detected)
4. Click Deploy

- [ ] **Step 3: Verify live site**

Open the Vercel URL. Check all sections, scroll-snap, navbar links, and contact buttons work correctly on a real device.
