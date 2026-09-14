import { useEffect, useRef, useState } from 'react';

function useLondonClock() {
  const [now, setNow] = useState('');
  useEffect(() => {
    const tick = () =>
      setNow(new Date().toLocaleTimeString('en-GB', { timeZone: 'Europe/London', hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now;
}

function Sparkline({ data }: { data: number[] }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    const w = (c.width = 72 * 2), h = (c.height = 24 * 2);
    ctx.clearRect(0, 0, w, h);
    const max = Math.max(...data), min = Math.min(...data);
    const pts = data.map((v, i) => [(i / (data.length - 1)) * w, h - 4 - ((v - min) / (max - min || 1)) * (h - 8)]);
    ctx.beginPath();
    pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
    ctx.strokeStyle = '#3ce9b6';
    ctx.lineWidth = 2;
    ctx.stroke();
    const [lx, ly] = pts[pts.length - 1];
    ctx.beginPath(); ctx.arc(lx, ly, 3.5, 0, Math.PI * 2); ctx.fillStyle = '#3ce9b6'; ctx.fill();
  }, [data]);
  return <canvas ref={ref} className="w-[72px] h-[24px] opacity-90" />;
}

export default function Telemetry() {
  const clock = useLondonClock();
  const [latency, setLatency] = useState<number[]>(() => Array.from({ length: 24 }, () => 18 + Math.random() * 14));
  const [push, setPush] = useState<string>('—');
  const uptimeDays = Math.floor((Date.now() - new Date('2023-03-01').getTime()) / 86400000);

  useEffect(() => {
    const id = setInterval(() => {
      setLatency((p) => [...p.slice(1), 18 + Math.random() * 14]);
    }, 1500);
    fetch('https://api.github.com/users/alam-cloud/events/public?per_page=10')
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((evts: { type: string; created_at: string }[]) => {
        const p = evts.find((e) => e.type === 'PushEvent') ?? evts[0];
        if (p) {
          const hrs = Math.max(0, (Date.now() - new Date(p.created_at).getTime()) / 3600000);
          setPush(hrs < 1 ? 'just now' : hrs < 24 ? `${Math.floor(hrs)}h ago` : `${Math.floor(hrs / 24)}d ago`);
        }
      })
      .catch(() => setPush('recently'));
    return () => clearInterval(id);
  }, []);

  const items = [
    { label: 'London · local time', value: clock, sub: 'GMT — based in the UK', color: 'text-[#dfe6ef]' },
    { label: 'edge latency', value: `${Math.round(latency[latency.length - 1])}ms`, sub: 'simulated heartbeat', color: 'text-[#3ce9b6]', spark: true },
    { label: 'days in production', value: uptimeDays.toLocaleString(), sub: 'since first network engineer role', color: 'text-[#4cc3ff]' },
    { label: 'last git push', value: push, sub: 'live · github.com/alam-cloud', color: 'text-[#3ce9b6]' },
  ];

  return (
    <section className="relative z-10 border-y border-[#131a26] bg-[#0b0e14]/70">
      <div className="max-w-6xl mx-auto px-5 py-8 grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((it) => (
          <div key={it.label} className="card px-4 py-3.5 relative overflow-hidden">
            <div className="font-mono2 text-[10px] uppercase tracking-[0.18em] text-[#4c586b]">{it.label}</div>
            <div className={`font-mono2 text-xl font-bold mt-1.5 ${it.color}`}>{it.value || '—'}</div>
            <div className="text-[11px] text-[#7d8a9c] mt-0.5">{it.sub}</div>
            {it.spark && <div className="absolute right-3 bottom-3"><Sparkline data={latency} /></div>}
          </div>
        ))}
      </div>
    </section>
  );
}
