import { useEffect, useState } from 'react';
import Terminal from '@/components/Terminal';
import { LINKS } from '@/data/content';

const ROLES = ['Cloud Engineer', 'AWS Community Builder', 'Terraform Author', 'Security-as-Code Advocate', 'Kubernetes Operator'];

function useTypewriter(words: string[]) {
  const [text, setText] = useState('');
  useEffect(() => {
    let w = 0, c = 0, deleting = false, t: ReturnType<typeof setTimeout>;
    const step = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      setText(word.slice(0, c));
      let d = deleting ? 35 : 70;
      if (!deleting && c === word.length) { d = 1800; deleting = true; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; d = 350; }
      t = setTimeout(step, d);
    };
    t = setTimeout(step, 600);
    return () => clearTimeout(t);
  }, [words]);
  return text;
}

const STATS = [
  { v: '2+', l: 'Years in cloud' },
  { v: '6+', l: 'Talks & publications' },
  { v: '7', l: 'Certifications' },
];

export default function Hero() {
  const typed = useTypewriter(ROLES);
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const id = setInterval(() => { setGlitch(true); setTimeout(() => setGlitch(false), 400); }, 7000);
    return () => clearInterval(id);
  }, []);

  return (
    <section id="about" className="relative z-10 min-h-screen flex items-center pt-28 pb-20">
      <div className="max-w-6xl mx-auto px-5 w-full grid lg:grid-cols-[1.05fr_1fr] gap-14 items-center">
        <div>
          <div className="font-mono2 text-[12px] tracking-[0.3em] text-[#3ce9b6] uppercase mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-[#3ce9b6]" /> hello world — I&apos;m
          </div>
          <h1 className={`font-disp font-bold text-6xl sm:text-7xl xl:text-8xl leading-[0.95] tracking-tight mb-4 ${glitch ? 'glitch' : ''}`}>
            Alam<br />
            <span className="bg-gradient-to-r from-[#dfe6ef] via-[#3ce9b6] to-[#4cc3ff] bg-clip-text text-transparent">Ahmed</span>
          </h1>
          <div className="font-mono2 text-[#4cc3ff] text-base sm:text-lg mb-6 h-7">
            {typed}<span className="anim-caret text-[#3ce9b6]">▌</span>
          </div>
          <p className="text-[#7d8a9c] max-w-md text-[15px] leading-relaxed mb-8">
            From NOC trenches to cloud architecture. I design and automate infrastructure across AWS and Azure
            with Terraform and Ansible, orchestrate with Docker and Kubernetes, and enforce security with
            OPA, Conftest and Policy as Code.
          </p>
          <div className="grid grid-cols-3 gap-3 max-w-md mb-9">
            {STATS.map((s) => (
              <div key={s.l} className="card px-3 py-3 text-center">
                <div className="font-mono2 text-2xl font-bold text-[#3ce9b6]">{s.v}</div>
                <div className="text-[10px] uppercase tracking-widest text-[#4c586b] mt-1">{s.l}</div>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-3 font-mono2 text-[13px]">
            <a href="#contact" className="px-5 py-3 rounded-md bg-[#3ce9b6] text-[#04110c] font-bold hover:shadow-[0_0_28px_rgba(60,233,182,0.35)] hover:-translate-y-0.5 transition-all">
              ↗ get in touch
            </a>
            <a href={LINKS.linkedin} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-md border border-[#4cc3ff]/50 text-[#4cc3ff] hover:bg-[#4cc3ff]/10 hover:-translate-y-0.5 transition-all">
              ↗ linkedin
            </a>
            <a href={LINKS.github} target="_blank" rel="noreferrer" className="px-5 py-3 rounded-md border border-[#1a2230] text-[#7d8a9c] hover:text-[#3ce9b6] hover:border-[#3ce9b6]/50 hover:-translate-y-0.5 transition-all">
              ↗ github
            </a>
          </div>
        </div>
        <div className="rv">
          <Terminal />
          <p className="font-mono2 text-[11px] text-[#4c586b] mt-3 text-right">interactive — try <span className="text-[#3ce9b6]">help</span>, <span className="text-[#3ce9b6]">whoami</span>, <span className="text-[#3ce9b6]">terraform plan</span></p>
        </div>
      </div>
    </section>
  );
}
