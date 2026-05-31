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
