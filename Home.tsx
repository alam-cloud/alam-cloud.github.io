import { useState } from 'react';
import BootSequence from '@/components/BootSequence';
import Header from '@/components/Header';
import Telemetry from '@/components/Telemetry';
import Hero from '@/sections/Hero';
import { Experience, Talks, Writing, Projects, Stack, Certs, Now, Contact, Footer } from '@/sections/Sections';
import { useReveal } from '@/hooks/useReveal';

export default function Home() {
  const [booted, setBooted] = useState(false);
  useReveal([booted]);

  return (
    <div id="top">
      {!booted && <BootSequence onDone={() => setBooted(true)} />}
      <div className="grid-bg" />
      <div className="vignette" />
      <Header />
      <main>
        <Hero />
        <Telemetry />
        <Experience />
        <Talks />
        <Writing />
        <Projects />
        <Stack />
        <Certs />
        <Now />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
