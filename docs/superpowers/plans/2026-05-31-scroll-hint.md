# Clickable Scroll Hint on Every Section — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reusable, clickable scroll hint (bouncing chevron) to every section except Contact, so clicking it smoothly scrolls to the next section.

**Architecture:** Extract the existing Hero scroll hint into a `ScrollHint` component that accepts a `targetId` prop and scrolls `#scroll-container` to that element on click. Each section (Hero, About, Experience, Skills, BeyondWork) renders `<ScrollHint targetId="..." />` at the bottom. The existing inline hint in Hero is removed.

**Tech Stack:** Next.js 14 App Router, TypeScript, Tailwind CSS

---

### Task 1: Create the ScrollHint component

**Files:**
- Create: `src/components/ScrollHint.tsx`

- [ ] **Step 1: Create the component**

  Create `src/components/ScrollHint.tsx` with this exact content:

  ```tsx
  "use client";

  interface ScrollHintProps {
    targetId: string;
  }

  export default function ScrollHint({ targetId }: ScrollHintProps) {
    const handleClick = () => {
      const el = document.getElementById(targetId);
      const container = document.getElementById("scroll-container");
      if (el && container) {
        container.scrollTo({ top: el.offsetTop, behavior: "smooth" });
      }
    };

    return (
      <button
        onClick={handleClick}
        aria-label="Scroll to next section"
        className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-indigo-400 animate-bounce z-10 cursor-pointer bg-transparent border-none p-0"
      >
        <span className="text-[10px] uppercase tracking-widest">Scroll</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
    );
  }
  ```

- [ ] **Step 2: Verify the dev server compiles without errors**

  Run: `npm run dev`
  Expected: no TypeScript or compilation errors in the terminal.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/ScrollHint.tsx
  git commit -m "feat: add reusable ScrollHint component"
  ```

---

### Task 2: Wire ScrollHint into Hero (replace existing hint)

**Files:**
- Modify: `src/components/Hero.tsx`

- [ ] **Step 1: Replace the inline scroll hint with the component**

  In `src/components/Hero.tsx`:

  1. Add the import after the existing imports:
     ```tsx
     import ScrollHint from "@/components/ScrollHint";
     ```

  2. Remove the `scrollToContact` function (lines 9–15) and the button that calls it (the "Get in touch ↓" button still stays — only remove the standalone `scrollToContact` function and its button usage in the scroll hint div, not the CTA button).

     Actually, `scrollToContact` is used by the "Get in touch ↓" CTA button — keep it and the CTA button. Only remove the scroll hint `<div>` at the bottom of the section (lines 79–84 in the original file):

     ```tsx
     {/* Remove this entire block: */}
     <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-indigo-400 animate-bounce z-10">
       <span className="text-[10px] uppercase tracking-widest">Scroll</span>
       <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
         <polyline points="6 9 12 15 18 9" />
       </svg>
     </div>
     ```

  3. Add `<ScrollHint targetId="about" />` in its place, just before the closing `</section>` tag:
     ```tsx
     <ScrollHint targetId="about" />
     ```

- [ ] **Step 2: Check the dev server compiles without errors**

  Run: `npm run dev` and confirm no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Hero.tsx
  git commit -m "feat: replace Hero scroll hint with ScrollHint component"
  ```

---

### Task 3: Add ScrollHint to About

**Files:**
- Modify: `src/components/About.tsx`

- [ ] **Step 1: Add the import and component**

  In `src/components/About.tsx`:

  1. Add import after existing imports:
     ```tsx
     import ScrollHint from "@/components/ScrollHint";
     ```

  2. Add `<ScrollHint targetId="experience" />` just before the closing `</section>` tag.

  The section already has `className="relative ..."` so absolute positioning will work correctly.

- [ ] **Step 2: Confirm no errors**

  Run: `npm run dev`, confirm no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/About.tsx
  git commit -m "feat: add scroll hint to About section"
  ```

---

### Task 4: Add ScrollHint to Experience

**Files:**
- Modify: `src/components/Experience.tsx`

- [ ] **Step 1: Read the current Experience component structure**

  Open `src/components/Experience.tsx` and confirm the `<section>` tag has `relative` in its className. If it does not, add `relative` to the className.

- [ ] **Step 2: Add the import and component**

  1. Add import after existing imports:
     ```tsx
     import ScrollHint from "@/components/ScrollHint";
     ```

  2. Add `<ScrollHint targetId="skills" />` just before the closing `</section>` tag.

- [ ] **Step 3: Confirm no errors**

  Run: `npm run dev`, confirm no errors.

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/Experience.tsx
  git commit -m "feat: add scroll hint to Experience section"
  ```

---

### Task 5: Add ScrollHint to Skills

**Files:**
- Modify: `src/components/Skills.tsx`

- [ ] **Step 1: Add the import and component**

  In `src/components/Skills.tsx`:

  1. Add import after existing imports:
     ```tsx
     import ScrollHint from "@/components/ScrollHint";
     ```

  2. Add `<ScrollHint targetId="beyond-work" />` just before the closing `</section>` tag.

  The section already has `className="relative ..."`.

- [ ] **Step 2: Confirm no errors**

  Run: `npm run dev`, confirm no errors.

- [ ] **Step 3: Commit**

  ```bash
  git add src/components/Skills.tsx
  git commit -m "feat: add scroll hint to Skills section"
  ```

---

### Task 6: Add ScrollHint to BeyondWork

**Files:**
- Modify: `src/components/BeyondWork.tsx`

- [ ] **Step 1: Add the import and component**

  In `src/components/BeyondWork.tsx`:

  1. Add import after existing imports:
     ```tsx
     import ScrollHint from "@/components/ScrollHint";
     ```

  2. Add `<ScrollHint targetId="contact" />` just before the closing `</section>` tag.

  The section already has `className="relative ..."`. Note the section id is `beyond-work` (with hyphen) — the target here is `contact`, which is correct.

- [ ] **Step 2: Confirm no errors**

  Run: `npm run dev`, confirm no errors.

- [ ] **Step 3: Manual browser test**

  With the dev server running at `http://localhost:3000`:
  - Open the site and verify a bouncing "Scroll" chevron appears at the bottom of every section: Hero, About, Experience, Skills, Beyond Work
  - Verify no scroll hint appears on Contact
  - Click the hint on each section and confirm it smoothly scrolls to the next section
  - Test on mobile viewport (DevTools → toggle device toolbar, e.g. 390px wide)

- [ ] **Step 4: Commit**

  ```bash
  git add src/components/BeyondWork.tsx
  git commit -m "feat: add scroll hint to BeyondWork section"
  ```
