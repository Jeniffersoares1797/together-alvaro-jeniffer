export function Footer() {
  return (
    <footer className="py-12 px-6 border-t border-white/[0.04] bg-[#090807] text-stone-500 text-xs">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-stone-400">
          <span className="font-serif italic font-normal text-[#ede7df]">together.</span>
          <span className="text-stone-600">—</span>
          <span>Um lugar para nós ficarmos juntos.</span>
        </div>

        <div className="text-stone-500 font-mono text-[11px]">
          WebRTC P2P • Privado e sem intermediários
        </div>
      </div>
    </footer>
  );
}
