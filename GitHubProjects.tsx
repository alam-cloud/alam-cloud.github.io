import { useEffect, useState } from 'react';

interface Repo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  pushed_at: string;
  fork: boolean;
}

const LANG_COLORS: Record<string, string> = {
  HCL: '#7b42bc', Python: '#3572A5', TypeScript: '#3178c6', JavaScript: '#f1e05a',
  Go: '#00ADD8', Shell: '#89e051', HTML: '#e34c26', 'Jupyter Notebook': '#DA5B0B',
};

const FALLBACK: Repo[] = [
  { name: 'elastic-terraform-demo', description: 'Automating Elastic Stack deployments with Terraform — companion to the Elastic Observability talk.', html_url: 'https://github.com/InfraPlatformer/elastic-terraform-demo', language: 'HCL', stargazers_count: 0, forks_count: 0, pushed_at: '', fork: false },
  { name: 'alam-cloud', description: 'Building secure, scalable platforms on AWS — Terraform, Kubernetes, Policy as Code.', html_url: 'https://github.com/alam-cloud', language: 'HCL', stargazers_count: 0, forks_count: 0, pushed_at: '', fork: false },
];

export default function GitHubProjects() {
  const [repos, setRepos] = useState<Repo[] | null>(null);

  useEffect(() => {
    fetch('https://api.github.com/users/alam-cloud/repos?sort=pushed&per_page=9')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: Repo[]) => setRepos(data.filter((r) => !r.fork).slice(0, 6)))
      .catch(() => setRepos(FALLBACK));
  }, []);

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {repos === null
        ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 w-2/3 bg-[#1a2230] rounded" />
              <div className="h-3 w-full bg-[#131a26] rounded mt-3" />
              <div className="h-3 w-4/5 bg-[#131a26] rounded mt-2" />
              <div className="h-3 w-1/3 bg-[#1a2230] rounded mt-4" />
            </div>
          ))
        : repos.map((r) => (
            <a key={r.html_url} href={r.html_url} target="_blank" rel="noreferrer" className="card p-5 flex flex-col gap-2 group hover:-translate-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono2 text-[13px] font-semibold text-[#4cc3ff] group-hover:text-[#3ce9b6] transition-colors truncate">
                  <span className="text-[#3ce9b6] mr-1.5">⌥</span>{r.name}
                </span>
                <span className="font-mono2 text-[9px] tracking-widest text-[#3ce9b6] border border-[#3ce9b6]/40 rounded px-1.5 py-0.5 shrink-0">LIVE</span>
              </div>
              <p className="text-[13px] text-[#7d8a9c] flex-1 leading-relaxed">{r.description ?? 'Infrastructure, experiments and tooling.'}</p>
              <div className="flex items-center gap-4 font-mono2 text-[11px] text-[#4c586b]">
                {r.language && (
                  <span>
                    <span className="inline-block w-2.5 h-2.5 rounded-full mr-1 align-[-1px]" style={{ background: LANG_COLORS[r.language] ?? '#7d8a9c' }} />
                    {r.language}
                  </span>
                )}
                <span>★ {r.stargazers_count}</span>
                <span>⑂ {r.forks_count}</span>
              </div>
            </a>
          ))}
    </div>
  );
}
