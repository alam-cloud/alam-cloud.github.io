import { useEffect, useState } from 'react';

const NAV = [
  { n: '01', label: 'experience', href: '#experience' },
  { n: '02', label: 'talks', href: '#talks' },
  { n: '03', label: 'writing', href: '#writing' },
  { n: '04', label: 'projects', href: '#projects' },
  { n: '05', label: 'stack', href: '#stack' },
  { n: '06', label: 'contact', href: '#contact' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 24);
      const h = document.documentElement;
      setProgress(h.scrollTop / (h.scrollHeight - h.clientHeight || 1));
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <div className="fixed top-0 left-0 h-[2px] z-[60] bg-gradient-to-r from-[#3ce9b6] to-[#4cc3ff]" style={{ width: `${progress * 100}%` }} />
      <header className={`fixed top-0 w-full z-50 border-b transition-all duration-300 ${scrolled ? 'bg-[#07090d]/90 backdrop-blur-md border-[#1a2230] py-2.5' : 'bg-transparent border-transparent py-4'}`}>
        <div className="max-w-6xl mx-auto px-5 flex items-center justify-between gap-4">
          <a href="#top" className="font-mono2 font-bold text-[#3ce9b6] text-sm tracking-tight whitespace-nowrap">
            <span className="text-[#4cc3ff]">◈</span> alam<span className="text-[#4c586b]">@</span>cloud<span className="text-[#4c586b]">:~$</span>
          </a>
          <nav className="hidden md:flex items-center gap-6 font-mono2 text-[12px]">
            {NAV.map((i) => (
              <a key={i.n} href={i.href} className="text-[#7d8a9c] hover:text-[#3ce9b6] transition-colors">
                <span className="text-[#3ce9b6]/60 mr-1">{i.n}.</span>{i.label}
              </a>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-2 font-mono2 text-[11px] text-[#3ce9b6]">
            <span className="w-2 h-2 rounded-full bg-[#3ce9b6] anim-blink shadow-[0_0_8px_rgba(60,233,182,0.6)]" />
            open to roles
          </div>
          <button onClick={() => setOpen(!open)} className="md:hidden font-mono2 text-[#3ce9b6] border border-[#1a2230] rounded px-2.5 py-1 text-sm" aria-label="Toggle menu">
            {open ? '✕' : '≡'}
          </button>
        </div>
        {open && (
          <nav className="md:hidden border-t border-[#1a2230] bg-[#07090d]/95 backdrop-blur-md px-5 py-3 flex flex-col gap-2 font-mono2 text-sm">
            {NAV.map((i) => (
              <a key={i.n} href={i.href} onClick={() => setOpen(false)} className="text-[#7d8a9c] hover:text-[#3ce9b6] py-1">
                <span className="text-[#3ce9b6]/60 mr-2">{i.n}.</span>{i.label}
              </a>
            ))}
          </nav>
        )}
      </header>
    </>
  );
}
