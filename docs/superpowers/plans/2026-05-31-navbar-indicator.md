# Navbar Scroll Indicator + ScrollHint Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove ScrollHint from all sections except Hero, and add a scroll-aware active section indicator to the navbar (desktop: active link highlight; mobile: section label + progress bar).

**Architecture:** A new `useActiveSection` hook observes `#scroll-container` using `IntersectionObserver` to track which section is currently in view. The Navbar consumes this hook to drive both the desktop active-link highlight and the mobile label+progress bar. ScrollHint imports and usages are removed from About, Experience, Skills, and BeyondWork.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS, IntersectionObserver API

---

## File Structure

| File | Action | Responsibility |
|---|---|---|
| `src/hooks/useActiveSection.ts` | Create | Tracks active section id via IntersectionObserver |
| `src/components/Navbar.tsx` | Modify | Consumes hook; renders desktop highlight + mobile label/bar |
| `src/components/About.tsx` | Modify | Remove ScrollHint import and usage |
| `src/components/Experience.tsx` | Modify | Remove ScrollHint import and usage |
| `src/components/Skills.tsx` | Modify | Remove ScrollHint import and usage |
| `src/components/BeyondWork.tsx` | Modify | Remove ScrollHint import and usage |

---

### Task 1: Create useActiveSection hook

**Files:**
- Create: `src/hooks/useActiveSection.ts`

- [ ] **Step 1: Create the hook**

  Create `src/hooks/useActiveSection.ts` with this exact content:

  ```ts
  import { useEffect, useState } from "react";

  export function useActiveSection(ids: string[]): string {
    const [activeId, setActiveId] = useState(ids[0] ?? "");

    useEffect(() => {
      const root = document.getElementById("scroll-container");
      if (!root) return;

      const observers: IntersectionObserver[] = [];

      ids.forEach((id) => {
        const el = document.getElementById(id);
        if (!el) return;

        const observer = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              setActiveId(id);
            }
          },
          { root, threshold: 0.5 }
        );

        observer.observe(el);
        observers.push(observer);
      });

      return () => observers.forEach((o) => o.disconnect());
    }, [ids]);

    return activeId;
  }
  ```

- [ ] **Step 2: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/hooks/useActiveSection.ts
  git commit -m "feat: add useActiveSection hook"
  ```

---

### Task 2: Update Navbar with active section indicator

**Files:**
- Modify: `src/components/Navbar.tsx`

The current Navbar has:
- Desktop: `hidden md:flex gap-8` div with nav buttons, all styled `text-xs text-gray-500 hover:text-gray-900`
- Mobile: hamburger button + dropdown menu

Replace the entire file with this:

- [ ] **Step 1: Rewrite Navbar.tsx**

  ```tsx
  "use client";

  import { useState } from "react";
  import { useActiveSection } from "@/hooks/useActiveSection";

  const links = [
    { label: "Home", href: "#hero" },
    { label: "About", href: "#about" },
    { label: "Experience", href: "#experience" },
    { label: "Skills", href: "#skills" },
    { label: "Beyond Work", href: "#beyond-work" },
    { label: "Contact", href: "#contact" },
  ];

  const sectionIds = links.map((l) => l.href.replace("#", ""));

  export default function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const activeId = useActiveSection(sectionIds);

    const activeIndex = sectionIds.indexOf(activeId);
    const progressPct = sectionIds.length > 1
      ? (activeIndex / (sectionIds.length - 1)) * 100
      : 0;
    const activeLabel = links.find((l) => l.href === `#${activeId}`)?.label ?? "";

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
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between md:justify-center">
          {/* Desktop links */}
          <div className="hidden md:flex gap-8">
            {links.map((link) => {
              const isActive = link.href === `#${activeId}`;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className={`text-xs tracking-wide transition-colors border-b pb-0.5 ${
                    isActive
                      ? "text-gray-900 border-gray-900"
                      : "text-gray-500 border-transparent hover:text-gray-900"
                  }`}
                >
                  {link.label}
                </button>
              );
            })}
          </div>

          {/* Mobile: hamburger + active section label */}
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
          <span className="md:hidden text-[11px] uppercase tracking-wider font-semibold text-gray-700">
            {activeLabel}
          </span>
        </div>

        {/* Mobile progress bar */}
        <div className="md:hidden h-[2px] bg-gray-100">
          <div
            className="h-[2px] bg-gray-900 transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
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

- [ ] **Step 2: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Navbar.tsx
  git commit -m "feat: add active section indicator to navbar"
  ```

---

### Task 3: Remove ScrollHint from About, Experience, Skills, BeyondWork

**Files:**
- Modify: `src/components/About.tsx`
- Modify: `src/components/Experience.tsx`
- Modify: `src/components/Skills.tsx`
- Modify: `src/components/BeyondWork.tsx`

For each file: remove the `import ScrollHint from "@/components/ScrollHint";` line and the `<ScrollHint targetId="..." />` JSX element.

- [ ] **Step 1: Remove ScrollHint from About.tsx**

  The current `src/components/About.tsx` has:
  - Line 4: `import ScrollHint from "@/components/ScrollHint";`
  - Second-to-last line before `</section>`: `<ScrollHint targetId="experience" />`

  Remove both. The file should end with:
  ```tsx
        </div>
      </section>
    );
  }
  ```

- [ ] **Step 2: Remove ScrollHint from Experience.tsx**

  Remove:
  - `import ScrollHint from "@/components/ScrollHint";`
  - `<ScrollHint targetId="skills" />`

- [ ] **Step 3: Remove ScrollHint from Skills.tsx**

  Remove:
  - `import ScrollHint from "@/components/ScrollHint";`
  - `<ScrollHint targetId="beyond-work" />`

- [ ] **Step 4: Remove ScrollHint from BeyondWork.tsx**

  Remove:
  - `import ScrollHint from "@/components/ScrollHint";`
  - `<ScrollHint targetId="contact" />`

- [ ] **Step 5: Verify TypeScript compiles**

  Run: `npx tsc --noEmit`
  Expected: no errors.

- [ ] **Step 6: Manual browser test**

  With dev server running at `http://localhost:3000` (or whichever port is active):
  - Scroll through all sections and confirm:
    - Scroll hint (bouncing chevron) appears only on Hero
    - Desktop navbar: active link is dark + underlined, others are gray
    - Mobile viewport (375px): section label appears to the right of the hamburger, progress bar fills as you scroll
    - Clicking any nav link scrolls to the correct section
    - Progress bar is at 0% on Home, 100% on Contact

- [ ] **Step 7: Commit**

  ```bash
  git add src/components/About.tsx src/components/Experience.tsx src/components/Skills.tsx src/components/BeyondWork.tsx
  git commit -m "feat: remove ScrollHint from non-Hero sections"
  ```
