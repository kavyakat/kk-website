# kk-website Project Memory

Project-specific memory for kk_website, moved out of the global `about-me/memory.md` (in `C:\claude`) on 2026-07-23 to keep the global file lean. See the global memory for the cross-project summary and pointer back here.

---

## kk_website — Personal Website
- **Location:** `C:\Projects\kk-website`
- **Live URL:** https://kavyakathuria.vercel.app
- **Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Structure:** `src/app/` for routing, `src/components/`, `src/hooks/`
- **tsconfig `@/*` alias** points to `./src/*`
- **Status:** Feature-complete and deployed to Vercel. 6 sections: Hero, About, Experience, Skills, Beyond Work, Contact.
- **Features:** scroll-snap container, `useInView` fade-in animations, `useActiveSection` scroll-spy, mobile responsive layout with hamburger nav, horizontal experience card carousel, faded photo background on Hero (desktop only)
- **Current state (committed + pushed, live on Vercel):**
  - Hero photo: desktop — right-anchored faded bg; mobile — circle to the right of the name
  - Hero: subtitle on one line (mobile), content at pt-[20vh] on mobile, animated scroll hint at bottom (`ScrollHint` component — Hero only, removed from other sections)
  - Hero body copy: "10+ years across software engineering, data engineering, and AI — currently focused on analytical insights at SAP Commerce Cloud. Based in Munich."
  - Navbar: KK logo removed, all links centered (Home · About · Experience · Skills · Beyond Work · Contact)
  - Navbar active-section indicator (`src/hooks/useActiveSection.ts`, IntersectionObserver-based, threshold 0.5): desktop shows underline on the active link; mobile shows a thin progress bar under the navbar (width scales with active section index) plus an underline on the active link in the dropdown; mobile section-name label was tried and removed (too easily truncated)
  - Section number indicators removed from all sections
  - Beyond Work section (`src/components/BeyondWork.tsx`): table tennis — TTC 1992 München (Bavarian district league) + SAP Munich corporate league captain; links to https://www.mytischtennis.de/click-tt/spieler/P1435A5023/spielerportrait
  - Vercel Analytics installed and wired into root layout
  - Resume: `public/Kavya_Kathuria_Resume.pdf`, download attribute set to "Kavya Kathuria Resume"
  - `useInView` uses `#scroll-container` as IntersectionObserver root (fixes fade-in inside scroll-snap)
  - Sections use `min-height` not `height` so tall sections (About on mobile) don't clip content
- **Table tennis data (scraped):** Club: TTC 1992 München e.V., TTR: 1266 (peak 1326 on 14.10.2025), League: Bezirksklasse B Gruppe 3 München-West (ByTTV)
