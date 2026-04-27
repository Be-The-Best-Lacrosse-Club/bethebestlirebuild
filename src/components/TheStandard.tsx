import React from 'react';
import { useReveal } from "@/hooks/useReveal";
import { useWordSplit, useStaggerReveal, useParallax } from "@/hooks/useScrollAnimation";
import { Hammer, ShieldAlert, TrendingUp } from 'lucide-react';

const pillars = [
  {
    title: "Hard Work",
    icon: Hammer,
    text: "We don't sell shortcuts. Every spot on our 24 teams is earned through grit and consistent effort. Our athletes embrace the grind because they know it's the only path to the top."
  },
  {
    title: "Accountability",
    icon: ShieldAlert,
    text: "The BTB Standard is non-negotiable. From mandatory film study to our strict attendance policy, we hold our players, coaches, and families to a higher level of commitment."
  },
  {
    title: "Development",
    icon: TrendingUp,
    text: "We are an Academy first, a club second. With 8:1 player-to-coach ratios and a 16-week structured curriculum, we focus on technical mastery and high-level Lacrosse IQ."
  }
];

export function TheStandard() {
  const ref = useReveal({ className: "reveal-stagger" });
  const titleRef = useWordSplit(50);
  const cardsRef = useStaggerReveal(90);
  const bgWordRef = useParallax(0.15);

  return (
    <section className="relative bg-[#D22630] py-16 md:py-32 px-4 md:px-6 overflow-hidden">
      {/* Background Texture & Ghost Type */}
      <div className="absolute inset-0 z-0 opacity-10">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
        <div className="flex items-center justify-center h-full" ref={bgWordRef as React.RefObject<HTMLDivElement>}>
          <span className="font-display text-[30vw] leading-none text-black select-none">
            ELITE
          </span>
        </div>
      </div>

      {/* Dynamic Slashes (Corner Accents) */}
      <div className="absolute top-0 left-0 w-full h-24 bg-black/10 -skew-y-2 origin-top-left" />
      <div className="absolute bottom-0 left-0 w-full h-24 bg-black/10 skew-y-2 origin-bottom-right" />

      <div className="relative z-10 max-w-[1000px] mx-auto">
        <div className="text-center mb-20">
          <div className="inline-block px-4 py-1.5 bg-black text-white text-[0.65rem] font-black uppercase tracking-[4px] rounded-sm mb-6">
            The Difference
          </div>
          <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2rem,6vw,4.5rem)] uppercase tracking-tight text-white leading-[0.95]">
            Culture Built on <br />
            <span className="text-black/40">The Standard.</span>
          </h2>
        </div>

        <div ref={cardsRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((p, i) => (
            <div key={i} className="stagger-child group p-10 bg-black text-white border border-white/5 hover:border-white/20 transition-all duration-300 relative overflow-hidden">
              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-12 h-12 bg-white/5 skew-x-[-45deg] translate-x-6 -translate-y-6" />
              
              <div className="w-14 h-14 bg-[#D22630] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform shadow-lg shadow-black/20">
                <p.icon className="text-white" size={28} strokeWidth={2.5} />
              </div>
              
              <h3 className="font-display text-2xl uppercase tracking-wider mb-5">{p.title}</h3>
              <p className="text-white/50 text-[0.92rem] leading-relaxed group-hover:text-white/80 transition-colors font-medium">
                {p.text}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
