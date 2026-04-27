import React from 'react';
import { useReveal } from "@/hooks/useReveal";
import { useWordSplit } from "@/hooks/useScrollAnimation";

type Coach = {
  name: string
  accolade: string
  role: string
  spec: string
  img: string | null
}

const featuredCoaches: Coach[] = [
  {
    name: "Dan Achatz",
    accolade: "Rutgers University",
    role: "Founder / SSDM Specialist",
    spec: "ACADEMY_DIR // 01",
    img: "/assets/dan.jpeg"
  },
  {
    name: "Sean Reynolds",
    accolade: "Plainedge Varsity HC",
    role: "Boys Program Director",
    spec: "PROGRAM_DIR // 02",
    img: null
  },
  {
    name: "Marisa D'Angelo",
    accolade: "Manhattanville First-Team",
    role: "Girls Futures Director",
    spec: "FUTURES_DIR // 03",
    img: null
  },
  {
    name: "Mike Guercio",
    accolade: "Foundation Specialist",
    role: "Boys Futures Director",
    spec: "FUTURES_DIR // 04",
    img: null
  }
];

export function FeaturedCoaches() {
  const ref = useReveal({ className: "reveal-stagger" });
  const titleRef = useWordSplit(55);

  return (
    <section className="bg-black py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-white/5">
      {/* Ghost Typography Background */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
        <span className="font-display text-[22vw] leading-none text-white/[0.02] select-none translate-y-12">
          PRO_STAFF
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="text-center mb-12 md:mb-24">
          <div className="inline-flex items-center gap-3 text-[var(--btb-red)] font-display text-sm tracking-[5px] mb-6">
            <div className="w-8 h-px bg-[var(--btb-red)]" />
            ELITE COACHING ROSTER
            <div className="w-8 h-px bg-[var(--btb-red)]" />
          </div>
          <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2.2rem,8vw,6rem)] uppercase leading-[0.85] text-white">
            Led by the <br /> <span className="text-[var(--btb-red)]">Professionals.</span>
          </h2>
        </div>

        {/* Coach Cards */}
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-0.5">
          {featuredCoaches.map((coach, i) => (
            <div key={i} className="reveal-child group relative bg-neutral-950 border border-white/5 p-1 transition-all duration-500 hover:border-[var(--btb-red)]/50">
              {/* Image or Initials */}
              <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
                <div className="absolute top-4 left-4 z-20 text-[10px] font-mono text-white/40 group-hover:text-[var(--btb-red)] transition-colors">
                  {coach.spec}
                </div>

                {coach.img ? (
                  <img
                    src={coach.img}
                    alt={coach.name}
                    className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-900 to-black">
                    <span className="font-display text-[5rem] text-white/10 select-none">
                      {coach.name.split(" ").map((n: string) => n[0]).join("")}
                    </span>
                  </div>
                )}

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

        {/* Coaching Standards Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0.5 bg-white/10 border border-white/10 mb-8 md:mb-12">
          {[
            { num: "30+", label: "Coaches on Staff", detail: "Every one background-checked, SafeSport certified, and US Lacrosse trained." },
            { num: "8:1", label: "Player-Coach Ratio", detail: "Real reps. Real corrections. Not a number in a line drill." },
            { num: "100%", label: "Written Practice Plans", detail: "Every BTB session is planned in advance with timed segments and coaching points." },
          ].map((s) => (
            <div key={s.label} className="group p-10 bg-black hover:bg-neutral-900 transition-all duration-300">
              <div className="font-display text-[3.5rem] text-[var(--btb-red)] leading-none mb-3">{s.num}</div>
              <div className="font-display text-lg uppercase tracking-wider text-white mb-3">{s.label}</div>
              <p className="text-[0.8rem] text-white/30 leading-relaxed">{s.detail}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="/boys/coaches" className="inline-flex items-center gap-4 text-white/40 hover:text-white transition-colors group">
            <span className="text-[0.65rem] font-black uppercase tracking-[4px]">View Full Staff Directory</span>
            <div className="w-10 h-px bg-white/20 group-hover:w-16 group-hover:bg-[var(--btb-red)] transition-all" />
          </a>
        </div>
      </div>
    </section>
  );
}
