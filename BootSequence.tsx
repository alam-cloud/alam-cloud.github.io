import { useEffect, useRef, useState } from 'react';

const LINES: { text: string; cls?: string; delay: number }[] = [
  { text: 'ALAM-AHMED :: PORTFOLIO v3.0', cls: 'text-[#7d8a9c]', delay: 0 },
  { text: '──────────────────────────────────────────────', cls: 'text-[#4c586b]', delay: 180 },
  { text: '[ OK ] identity module ............ alam.ahmed', cls: 'text-[#3ce9b6]', delay: 420 },
  { text: '[ OK ] cloud providers ............ aws ✓ azure ✓', cls: 'text-[#3ce9b6]', delay: 620 },
  { text: '[ OK ] iac ........................ terraform ✓ cdk ✓ ansible', cls: 'text-[#3ce9b6]', delay: 820 },
  { text: '[ OK ] security-as-code ........... opa ✓ conftest ✓ cdk-nag', cls: 'text-[#3ce9b6]', delay: 1020 },
  { text: '[ .. ] soa-c03 exam ............... booked · dec 2026', cls: 'text-[#ffd166]', delay: 1260 },
  { text: '[ OK ] community .................. aws community builder', cls: 'text-[#3ce9b6]', delay: 1460 },
  { text: '', delay: 1660 },
  { text: 'mounting /portfolio ... done', cls: 'text-[#4cc3ff]', delay: 1820 },
];

export default function BootSequence({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [fading, setFading] = useState(false);
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    setFading(true);
    setTimeout(onDone, 550);
  };

  useEffect(() => {
    const timers = LINES.map((l, i) => setTimeout(() => setCount(i + 1), l.delay));
    const end = setTimeout(finish, 2600);
    return () => { timers.forEach(clearTimeout); clearTimeout(end); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      onClick={finish}
      className={`fixed inset-0 z-[100] bg-[#07090d] flex items-center justify-center p-6 cursor-pointer transition-opacity duration-500 ${fading ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      role="button"
      aria-label="Skip boot sequence"
    >
      <div className="font-mono2 text-[13px] sm:text-sm w-full max-w-[680px]">
        {LINES.slice(0, count).map((l, i) => (
          <div key={i} className={`boot-line leading-relaxed ${l.cls ?? ''}`}>{l.text || '\u00A0'}</div>
        ))}
        <div className="mt-8 text-[11px] text-[#4c586b] tracking-widest anim-blink">CLICK ANYWHERE TO SKIP ▸</div>
      </div>
    </div>
  );
}
