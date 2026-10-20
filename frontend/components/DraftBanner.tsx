import Link from "next/link";

export default function DraftBanner() {
  return (
    <aside
      aria-label="Draft Mode Active"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-[#1b1c19] text-[#faf9f4] border border-[#e0afa0]/50 shadow-2xl px-5 py-3 rounded-full text-xs font-sans tracking-wider backdrop-blur-md transition-all animate-bounce-subtle"
    >
      <span className="flex h-2 w-2 relative">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
      </span>
      <span className="font-medium tracking-widest uppercase">
        Draft Preview Mode
      </span>
      <span className="text-[#faf9f4]/40">|</span>
      <Link
        href="/api/disable-draft"
        className="text-[#e0afa0] font-semibold underline underline-offset-4 hover:text-white transition-colors"
      >
        Exit Preview
      </Link>
    </aside>
  );
}

