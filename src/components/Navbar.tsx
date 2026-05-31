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
          {links.map((link) => {
            const isActive = link.href === `#${activeId}`;
            return (
              <button
                key={link.href}
                onClick={() => handleNavClick(link.href)}
                className={`text-sm text-left transition-colors border-b pb-0.5 w-fit ${
                  isActive
                    ? "text-gray-900 border-gray-900"
                    : "text-gray-600 border-transparent hover:text-gray-900"
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      )}
    </nav>
  );
}
