import { useEffect, useRef, useState } from 'react';
import { LINKS } from '@/data/content';

type Line = { kind: 'cmd' | 'out' | 'ok' | 'warn' | 'info' | 'err'; text: string };

const PROMPT = 'alam@cloud-engineer:~$';

const COMMANDS: Record<string, () => Line[]> = {
  help: () => [
    { kind: 'info', text: 'available commands:' },
    { kind: 'out', text: '  whoami          identity & role' },
    { kind: 'out', text: '  skills          current toolbox' },
    { kind: 'out', text: '  certs           certifications' },
    { kind: 'out', text: '  talks           recent speaking' },
    { kind: 'out', text: '  contact         connection endpoints' },
    { kind: 'out', text: '  kubectl get pods' },
    { kind: 'out', text: '  terraform plan  career trajectory' },
    { kind: 'out', text: '  clear           wipe terminal' },
  ],
  whoami: () => [
    { kind: 'ok', text: 'Alam Ahmed — Cloud Engineer | AWS Community Builder | DevTools Advocate' },
    { kind: 'out', text: 'Currently: Managed Services Support Analyst @ boxxe (NOC), London' },
    { kind: 'out', text: 'From NOC trenches to cloud architecture — Terraform, Kubernetes, Security as Code.' },
  ],
  skills: () => [
    { kind: 'out', text: 'aws ▪ azure ▪ terraform ▪ cdk ▪ ansible ▪ kubernetes ▪ docker' },
    { kind: 'out', text: 'opa ▪ conftest ▪ cdk-nag ▪ guard ▪ python ▪ bash ▪ github-actions' },
  ],
  certs: () => [
    { kind: 'ok', text: '✓ AWS SAA  ✓ AWS DVA  ✓ AWS CCP  ✓ Terraform Associate  ✓ CKAD  ✓ AZ-900' },
    { kind: 'warn', text: '◔ SOA-C03 (CloudOps Engineer – Associate) — booked Dec 2026' },
  ],
  talks: () => [
    { kind: 'out', text: 'Aug 2026 · LogiCast AWS News Podcast S5E27 (Logicata)' },
    { kind: 'out', text: 'Jul 2026 · Terraforming the Well-Architected Way — AWS London WAUG' },
    { kind: 'out', text: 'Mar 2026 · Shifting Security Left — London DevOps Meetup' },
    { kind: 'out', text: 'Feb 2026 · eBPF: Cloud-Native Security — Cloud Native London' },
  ],
  contact: () => [
    { kind: 'out', text: `email    → ${LINKS.email}` },
    { kind: 'out', text: 'linkedin → linkedin.com/in/alam-ahmed-cloud-engineer' },
    { kind: 'out', text: 'github   → github.com/alam-cloud' },
  ],
  'kubectl get pods': () => [
    { kind: 'out', text: 'NAMESPACE    POD                          STATUS' },
    { kind: 'ok', text: 'career       cloud-engineer-7f9d          Running   2y+' },
    { kind: 'ok', text: 'community    aws-builder-5c2e             Running   since Feb 2026' },
    { kind: 'warn', text: 'certs        soa-c03-exam-x1k9              Pending   Dec 2026' },
    { kind: 'ok', text: 'content      talks-and-writing-9h3m       Running   always-on' },
  ],
  'terraform plan': () => [
    { kind: 'info', text: 'Plan: 3 to add, 0 to change, 0 to destroy.' },
    { kind: 'ok', text: '  + open_to: Cloud / Platform Engineer roles' },
    { kind: 'ok', text: '  + booked: AWS SOA-C03 — December 2026' },
    { kind: 'ok', text: '  + building: secure, scalable platforms' },
  ],
  sudo: () => [{ kind: 'err', text: 'alam is not in the sudoers file. This incident will be reported to the NOC.' }],
  exit: () => [{ kind: 'warn', text: 'there is no escape. only infrastructure.' }],
};

export default function Terminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: 'info', text: "last login: today — type 'help' to explore" },
  ]);
  const [input, setInput] = useState('');
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight, behavior: 'smooth' });
  }, [lines]);

  const run = (raw: string) => {
    const cmd = raw.trim().toLowerCase();
    const next: Line[] = [{ kind: 'cmd', text: cmd }];
    if (cmd === 'clear') {
      setLines([]);
      return;
    }
    if (!cmd) {
      setLines((p) => [...p, ...next]);
      return;
    }
    const handler = COMMANDS[cmd];
    next.push(...(handler ? handler() : [{ kind: 'err', text: `command not found: ${cmd} — try 'help'` } as Line]));
    setLines((p) => [...p, ...next]);
  };

  const colorFor = (k: Line['kind']) =>
    k === 'cmd' ? 'text-[#dfe6ef]' : k === 'ok' ? 'text-[#3ce9b6]' : k === 'warn' ? 'text-[#ffd166]' : k === 'info' ? 'text-[#4cc3ff]' : k === 'err' ? 'text-[#ff6b7a]' : 'text-[#7d8a9c]';

  return (
    <div className="card overflow-hidden shadow-[0_24px_80px_rgba(0,0,0,0.5)]" onClick={() => inputRef.current?.focus()}>
      <div className="flex items-center gap-2 bg-[#0b0e14] px-4 py-2.5 border-b border-[#1a2230]">
        <span className="w-3 h-3 rounded-full bg-[#ff6b7a]" />
        <span className="w-3 h-3 rounded-full bg-[#ffd166]" />
        <span className="w-3 h-3 rounded-full bg-[#3ce9b6]" />
        <span className="ml-2 font-mono2 text-[11px] text-[#4c586b]">{PROMPT} — zsh · interactive</span>
      </div>
      <div ref={bodyRef} className="term-body h-[320px] overflow-y-auto px-4 py-3 font-mono2 text-[13px] leading-relaxed">
        {lines.map((l, i) => (
          <div key={i} className={colorFor(l.kind)}>
            {l.kind === 'cmd' && <span className="text-[#3ce9b6]">{PROMPT} </span>}
            {l.text}
          </div>
        ))}
        <div className="flex items-center">
          <span className="text-[#3ce9b6] shrink-0">{PROMPT}&nbsp;</span>
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { run(input); setInput(''); }
              if (e.key === 'Tab') {
                e.preventDefault();
                const match = Object.keys(COMMANDS).find((c) => c.startsWith(input.toLowerCase()));
                if (match) setInput(match);
              }
            }}
            className="bg-transparent outline-none flex-1 text-[#dfe6ef] caret-[#3ce9b6]"
            aria-label="Terminal input"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
      </div>
    </div>
  );
}
