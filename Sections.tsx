import { EXPERIENCE, TALKS, ARTICLES, SKILLS, CERTS, NOW_LOG, LINKS } from '@/data/content';
import GitHubProjects from '@/components/GitHubProjects';

export function SectionHead({ no, tag, title, desc }: { no: string; tag: string; title: string; desc?: string }) {
  return (
    <div className="mb-12 rv">
      <div className="sec-no mb-2">{no} / {tag}</div>
      <h2 className="font-disp text-4xl sm:text-5xl font-bold tracking-tight mb-3">{title}</h2>
      {desc && <p className="text-[#7d8a9c] max-w-xl text-[15px]">{desc}</p>}
    </div>
  );
}

export function Experience() {
  return (
    <section id="experience" className="relative z-10 py-24">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="01" tag="deployment history" title="Experience" desc="Infrastructure doesn't build itself. Here's the production history." />
        <div className="relative pl-6 sm:pl-10 border-l border-[#1a2230] space-y-10">
          {EXPERIENCE.map((e) => (
            <div key={e.role} className="relative rv">
              <span className={`absolute -left-[29px] sm:-left-[45px] top-1.5 w-3 h-3 rounded-full border-2 ${e.current ? 'bg-[#3ce9b6] border-[#3ce9b6] shadow-[0_0_12px_rgba(60,233,182,0.7)]' : 'bg-[#07090d] border-[#4c586b]'}`} />
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <h3 className="font-disp text-xl font-semibold">{e.role}</h3>
                <span className="font-mono2 text-[11px] text-[#ffd166] bg-[#ffd166]/10 rounded px-2 py-0.5">{e.period}</span>
                {e.current && <span className="font-mono2 text-[10px] tracking-widest text-[#3ce9b6]">● ACTIVE</span>}
              </div>
              <div className="text-[#4cc3ff] text-sm font-medium mt-0.5 mb-2">{e.company} · {e.location}</div>
              <p className="text-[#7d8a9c] text-[14px] leading-relaxed max-w-2xl">{e.desc}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                {e.tags.map((t) => <span key={t} className="tag-chip">{t}</span>)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const TYPE_COLOR: Record<string, string> = { Podcast: 'text-[#ff6b7a]', Speaker: 'text-[#3ce9b6]', Author: 'text-[#4cc3ff]' };

export function Talks() {
  return (
    <section id="talks" className="relative z-10 py-24 bg-[#0b0e14]/60 border-y border-[#131a26]">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="02" tag="event logs" title="Talks & Podcasts" desc="Sharing knowledge with the community — building in public is how we level up." />
        <div className="border-t border-[#131a26]">
          {TALKS.map((t) => (
            <div key={t.title} className="ledger-row rv grid sm:grid-cols-[90px_110px_1fr_auto] gap-x-6 gap-y-1 items-baseline px-4 py-5 border-b border-[#131a26]">
              <span className="font-mono2 text-[11px] text-[#4c586b]">{t.date}</span>
              <span className={`font-mono2 text-[10px] uppercase tracking-[0.2em] ${TYPE_COLOR[t.type]}`}>● {t.type}</span>
              <div>
                <div className="font-medium text-[15px]">{t.title}{t.featured && <span className="ml-2 font-mono2 text-[9px] tracking-widest text-[#ffd166] border border-[#ffd166]/40 rounded px-1.5 py-0.5 align-middle">FEATURED</span>}</div>
                <div className="text-[#7d8a9c] text-[13px] mt-0.5">{t.venue}</div>
              </div>
              <div className="flex gap-4 font-mono2 text-[12px]">
                {t.links?.map((l) => (
                  <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="text-[#4cc3ff] hover:text-[#3ce9b6] transition-colors">{l.label} →</a>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Writing() {
  return (
    <section id="writing" className="relative z-10 py-24">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="03" tag="published intelligence" title="Writing on AWS Builder Center" desc="Long-form articles on cloud security, IAM, policy as code, and developer velocity — published as an AWS Community Builder." />
        <div className="grid sm:grid-cols-2 gap-4">
          {ARTICLES.map((a) => (
            <a key={a.title} href={a.href} target="_blank" rel="noreferrer" className="card p-5 flex flex-col gap-2 group rv hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-3">
                <span className="font-mono2 text-[10px] uppercase tracking-[0.2em] text-[#4cc3ff]">▸ Article{a.badge ? ` · ${a.badge}` : ''}</span>
                <span className="font-mono2 text-[11px] text-[#4c586b]">{a.date}</span>
              </div>
              <h3 className="font-medium text-[15px] leading-snug group-hover:text-[#3ce9b6] transition-colors">{a.title}</h3>
              <p className="text-[#7d8a9c] text-[13px] leading-relaxed flex-1">{a.desc}</p>
              <span className="font-mono2 text-[12px] text-[#3ce9b6] mt-1">Read →</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Projects() {
  return (
    <section id="projects" className="relative z-10 py-24 bg-[#0b0e14]/60 border-y border-[#131a26]">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="04" tag="open source" title="Projects & Repos" desc="Pulled live from github.com/alam-cloud on every visit — what I'm building, breaking, and documenting." />
        <GitHubProjects />
        <p className="rv font-mono2 text-[11px] text-[#4c586b] mt-5">
          live · github api · older work lives on the legacy account <a href={LINKS.githubLegacy} target="_blank" rel="noreferrer" className="text-[#4cc3ff] hover:text-[#3ce9b6]">InfraPlatformer</a>
        </p>
      </div>
    </section>
  );
}

const LEVEL_W: Record<string, string> = { 'Daily driver': 'w-full', Production: 'w-4/5', 'Working knowledge': 'w-3/5' };

export function Stack() {
  return (
    <section id="stack" className="relative z-10 py-24">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="05" tag="toolbox" title="Technical Stack" desc="Labelled by how I actually use them — daily driver, production, working knowledge. No made-up percentages." />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {SKILLS.map((g) => (
            <div key={g.name} className="card p-5 rv">
              <h3 className="font-mono2 text-[11px] uppercase tracking-[0.2em] text-[#3ce9b6] mb-4">{g.name}</h3>
              {g.items.map((it) => (
                <div key={it.name} className="mb-3.5 last:mb-0">
                  <div className="flex justify-between gap-3 text-[13px] mb-1.5">
                    <span>{it.name}</span>
                    <span className="font-mono2 text-[10px] text-[#4c586b] whitespace-nowrap">{it.level}</span>
                  </div>
                  <div className="h-[3px] bg-[#131a26] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full bg-gradient-to-r from-[#3ce9b6] to-[#4cc3ff] ${LEVEL_W[it.level] ?? 'w-1/2'}`} />
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Certs() {
  return (
    <section id="certs" className="relative z-10 py-24 bg-[#0b0e14]/60 border-y border-[#131a26]">
      <div className="max-w-6xl mx-auto px-5">
        <SectionHead no="06" tag="verified artifacts" title="Certifications" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {CERTS.map((c) => (
            <div key={c.name} className="card px-4 py-3.5 flex items-center gap-3 rv hover:translate-x-1">
              <span className="font-mono2 text-[#3ce9b6] text-lg">✓</span>
              <div>
                <div className="text-[13px] font-medium leading-snug">{c.name}</div>
                <div className="text-[11px] text-[#4c586b]">{c.issuer}</div>
              </div>
            </div>
          ))}
          <div className="card px-4 py-3.5 flex items-center gap-3 rv border-[#ffd166]/40">
            <span className="text-lg">⏱</span>
            <div>
              <div className="text-[13px] font-medium leading-snug text-[#ffd166]">SOA-C03 — CloudOps Engineer · Associate</div>
              <div className="text-[11px] text-[#4c586b]">Exam booked · December 2026</div>
            </div>
          </div>
        </div>
        <a href={LINKS.credly} target="_blank" rel="noreferrer" className="rv inline-block font-mono2 text-[12px] text-[#4cc3ff] hover:text-[#3ce9b6] transition-colors">
          🏆 view all badges on Credly →
        </a>
      </div>
    </section>
  );
}

export function Now() {
  return (
    <section id="now" className="relative z-10 py-24">
      <div className="max-w-4xl mx-auto px-5">
        <SectionHead no="07" tag="git log --oneline" title="Now / Changelog" desc="What I'm building, studying or shipping right now — newest first." />
        <div className="card overflow-hidden rv">
          <div className="bg-[#0b0e14] px-4 py-2.5 border-b border-[#1a2230] font-mono2 text-[11px] text-[#4c586b]">now.log — latest entries</div>
          <div className="p-5 font-mono2 text-[13px] space-y-3">
            {NOW_LOG.map((n) => (
              <div key={n.date} className="flex gap-4">
                <span className="text-[#4cc3ff] shrink-0">{n.date}</span>
                <span className="text-[#7d8a9c]"><span className="text-[#3ce9b6]">+</span> {n.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Contact() {
  const links = [
    { k: '✉', label: LINKS.email, href: `mailto:${LINKS.email}`, sub: 'email — fastest response' },
    { k: 'in', label: 'linkedin.com/in/alam-ahmed-cloud-engineer', href: LINKS.linkedin, sub: 'professional network' },
    { k: 'gh', label: 'github.com/alam-cloud', href: LINKS.github, sub: 'code & experiments' },
    { k: '✓', label: 'credly.com/users/alam-zaib-ahmad', href: LINKS.credly, sub: 'verified credentials' },
  ];
  return (
    <section id="contact" className="relative z-10 py-24 bg-[#0b0e14]/60 border-t border-[#131a26]">
      <div className="max-w-6xl mx-auto px-5 grid lg:grid-cols-2 gap-12 items-center">
        <div className="rv">
          <div className="sec-no mb-2">08 / connection endpoints</div>
          <h2 className="font-disp text-4xl sm:text-5xl font-bold tracking-tight mb-4">Let&apos;s build<br />something that <span className="text-[#3ce9b6]">scales</span>.</h2>
          <p className="text-[#7d8a9c] text-[15px] max-w-md mb-6">
            Open to Cloud / Platform Engineer roles, speaking invitations, and collaborations on
            open-source cloud tooling. Based in the UK, working everywhere.
          </p>
          <div className="font-mono2 text-[13px] text-[#4c586b]">
            <span className="text-[#3ce9b6]">$</span> curl -X POST alamahmed.dev/contact<br />
            <span className="text-[#3ce9b6]">→</span> 200 OK · response within 24h
          </div>
        </div>
        <div className="space-y-3">
          {links.map((l) => (
            <a key={l.href} href={l.href} target={l.href.startsWith('mailto') ? undefined : '_blank'} rel="noreferrer" className="card px-4 py-4 flex items-center gap-4 rv hover:translate-x-2 group">
              <span className="w-10 h-10 shrink-0 rounded-md border border-[#1a2230] bg-[#0b0e14] flex items-center justify-center font-mono2 font-bold text-[#3ce9b6]">{l.k}</span>
              <div className="min-w-0">
                <div className="font-mono2 text-[13px] truncate group-hover:text-[#3ce9b6] transition-colors">{l.label}</div>
                <div className="text-[11px] text-[#4c586b]">{l.sub}</div>
              </div>
              <span className="ml-auto text-[#4c586b] group-hover:text-[#3ce9b6] transition-colors">→</span>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-[#131a26] py-8">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono2 text-[11px] text-[#4c586b]">
        <span>© {new Date().getFullYear()} alam ahmed · built with terraform & coffee</span>
        <span>uptime: continuous · <a href="#top" className="text-[#4cc3ff] hover:text-[#3ce9b6]">back to top ↑</a></span>
      </div>
    </footer>
  );
}
