import React from 'react';
import { useReveal } from "@/hooks/useReveal";

const featuredCoaches = [
  {
    name: "Dan Achatz",
    accolade: "Rutgers University",
    role: "Founder / SSDM Specialist",
    spec: "ACADEMY_DIR // 01",
    img: "/assets/coaches/dan.jpg"
  },
  {
    name: "Sean Reynolds",
    accolade: "Plainedge Varsity HC",
    role: "Boys Program Director",
    spec: "PROGRAM_DIR // 02",
    img: "/assets/coaches/sean.jpg"
  },
  {
    name: "Marisa D'Angelo",
    accolade: "Manhattanville First-Team",
    role: "Girls Futures Director",
    spec: "FUTURES_DIR // 03",
    img: "/assets/coaches/marisa.jpg"
  },
  {
    name: "Mike Guercio",
    accolade: "Foundation Specialist",
    role: "Boys Futures Director",
    spec: "FUTURES_DIR // 04",
    img: "/assets/coaches/mike.jpg"
  }
];

export function FeaturedCoaches() {
  const ref = useReveal({ className: "reveal-stagger" });

  return (
    <section className="bg-black py-32 px-6 relative overflow-hidden border-t border-white/5">
      {/* Ghost Typography Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <span className="font-display text-[22vw] leading-none text-white/[0.02] select-none translate-y-12">
          PRO_STAFF
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="text-center mb-24">
          <div className="inline-flex items-center gap-3 text-[var(--btb-red)] font-display text-sm tracking-[5px] mb-6">
            <div className="w-8 h-px bg-[var(--btb-red)]" />
            ELITE COACHING ROSTER
            <div className="w-8 h-px bg-[var(--btb-red)]" />
          </div>
          <h2 className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85] text-white">
            Led by the <br /> <span className="text-[var(--btb-red)]">Professionals.</span>
          </h2>
        </div>

        <div ref={ref} className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {featuredCoaches.map((coach, i) => (
            <div key={i} className="reveal-child group relative bg-neutral-950 border border-white/5 p-1 transition-all duration-500 hover:border-[var(--btb-red)]/50">
              {/* Image Container with Technical Treatment */}
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 text-[10px] font-mono text-white/40 group-hover:text-[var(--btb-red)] transition-colors">
                  {coach.spec}
                </div>
                
                {/* Image Placeholder with Duotone effect */}
                <div className="w-full h-full flex items-center justify-center text-white/5 italic text-[0.6rem] group-hover:scale-110 transition-transform duration-700">
                  COACH_HEADSHOT
                </div>

                {/* Bottom Info Overlay */}
                <div className="absolute bottom-6 left-6 right-6 z-20">
                  <div className="font-display text-2xl uppercase tracking-wider text-white mb-1 group-hover:text-[var(--btb-red)] transition-colors">
                    {coach.name}
                  </div>
                  <div className="text-[0.65rem] font-black text-white/40 uppercase tracking-[2px]">
                    {coach.accolade}
                  </div>
                </div>
              </div>

              {/* Technical Footnote Section */}
              <div className="px-5 py-4 bg-black flex flex-col gap-1">
                <div className="text-[0.6rem] text-[var(--btb-red)] font-black uppercase tracking-[1px]">
                  {coach.role}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="h-1 flex-1 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-[var(--btb-red)] w-0 group-hover:w-full transition-all duration-1000 delay-300" />
                  </div>
                  <span className="text-[8px] font-mono text-white/20 uppercase">verified</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 text-center">
          <a href="/coaches" className="inline-flex items-center gap-4 text-white/40 hover:text-white transition-colors group">
            <span className="text-[0.65rem] font-black uppercase tracking-[4px]">Access Full Staff Directory</span>
            <div className="w-10 h-px bg-white/20 group-hover:w-16 group-hover:bg-[var(--btb-red)] transition-all" />
          </a>
        </div>
      </div>
    </section>
  );
}
