import React, { useState } from 'react';
import { useReveal } from "@/hooks/useReveal";
import { useWordSplit } from "@/hooks/useScrollAnimation";
import { ShieldCheck, Target, Users, Zap, PlayCircle, Quote } from 'lucide-react';

const pillars = [
  {
    id: 'leadership',
    title: 'Leadership',
    subtitle: 'Extreme Ownership',
    text: "Leadership isn't a title — it's a daily decision. We teach our athletes to lead from the front, taking full ownership of their actions and their impact on the team.",
    icon: ShieldCheck,
    lessons: ['Extreme Ownership (Jocko Willink)', 'Leading with Heart (Coach K)', 'Wolfpack Philosophy (Abby Wambach)']
  },
  {
    id: 'character',
    title: 'Character',
    subtitle: 'Integrity Defines You',
    text: "Talent gets you noticed, but character gets you remembered. Our program emphasizes doing the right thing especially when nobody is watching.",
    icon: Target,
    lessons: ['The Definite Dozen (Pat Summitt)', 'Earn It (Derek Jeter)', 'The Process (Nick Saban)']
  },
  {
    id: 'culture',
    title: 'Team Culture',
    subtitle: 'We Over Me',
    text: "The best teams are built on trust and shared commitment. We foster an environment where athletes champion each other's success as much as their own.",
    icon: Users,
    lessons: ['Making Others Better (LeBron James)', 'Preparation as Respect (Peyton Manning)', 'Mamba Mentality (Kobe Bryant)']
  },
  {
    id: 'toughness',
    title: 'Mental Toughness',
    subtitle: 'Built Through Adversity',
    text: "Mental toughness is a skill that can be built. We teach our players to embrace failure as fuel and to develop an unbreakable game-day mindset.",
    icon: Zap,
    lessons: ['Failure to Succeed (Michael Jordan)', 'Don\'t Give Up (Jim Valvano)', 'Purpose Over Circumstance (Inky Johnson)']
  }
];

export function CharacterLab() {
  const [activePillar, setActivePillar] = useState(pillars[0]);
  const ref = useReveal({ className: "reveal-stagger" });
  const titleRef = useWordSplit(55);

  return (
    <section className="bg-black py-16 md:py-32 px-4 md:px-6 relative overflow-hidden border-t border-white/5" id="leadership">
      {/* Ghost Typography */}
      <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none opacity-5">
        <span className="font-display text-[22vw] leading-none text-white select-none">
          CHARACTER
        </span>
      </div>

      <div className="max-w-[1100px] mx-auto relative z-10">
        <div className="flex flex-col items-center md:items-end md:flex-row md:justify-between mb-10 md:mb-24 gap-6 md:gap-8 text-center md:text-left">
          <div className="max-w-[600px]">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              THE_BTB_BLUEPRINT // LEADERSHIP_LAB
            </div>
            <h2 ref={titleRef as React.RefObject<HTMLHeadingElement>} className="font-display text-[clamp(2.2rem,8vw,6rem)] uppercase leading-[0.85] text-white">
              Building <br /> <span className="text-[var(--btb-red)]">Champions.</span>
            </h2>
          </div>
          <p className="text-white/65 text-[1rem] leading-relaxed max-w-[380px] border-l border-white/10 pl-8">
            Our character and leadership curriculum is not an add-on. It is the core of the BTB Standard. We develop the person first, then the player.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          {/* Sidebar Nav */}
          <div className="lg:col-span-4 space-y-2">
            {pillars.map((p) => (
              <button
                key={p.id}
                onClick={() => setActivePillar(p)}
                className={`w-full flex items-center justify-between p-6 transition-all duration-300 group border relative overflow-hidden ${
                  activePillar.id === p.id 
                  ? "bg-[var(--btb-red)] border-[var(--btb-red)] text-white" 
                  : "bg-white/[0.02] border-white/5 text-white/65 hover:bg-white/[0.05] hover:border-white/10"
                }`}
              >
                {/* Active sweep pulse */}
                {activePillar.id === p.id && (
                  <div className="absolute inset-0 bg-white/5 animate-pulse pointer-events-none" />
                )}
                <div className="flex items-center gap-4 relative z-10">
                  <p.icon size={20} className={activePillar.id === p.id ? "text-white" : "text-[var(--btb-red)]"} />
                  <span className="font-display text-xl uppercase tracking-widest">{p.title}</span>
                </div>
                {activePillar.id === p.id ? (
                  <div className="w-2 h-2 rounded-full bg-white animate-ping relative z-10" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-white/10 relative z-10" />
                )}
              </button>
            ))}
          </div>

          {/* Active Content */}
          <div className="lg:col-span-8 bg-white/[0.02] border border-white/5 p-10 md:p-14 relative overflow-hidden">
            {/* Technical Spec Marking */}
            <div className="absolute top-6 right-6 font-mono text-[0.72rem] text-white/55 uppercase tracking-widest">
              MODULE // 0{pillars.indexOf(activePillar) + 1}
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-4 mb-4">
                <div className="font-display text-[4rem] text-white/5 leading-none select-none">
                  0{pillars.indexOf(activePillar) + 1}
                </div>
                <div className="text-[var(--btb-red)] font-mono text-[0.7rem] font-bold uppercase tracking-[3px]">
                  {activePillar.subtitle}
                </div>
              </div>
              <p className="text-white/70 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-[500px]">
                {activePillar.text}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/10">
                <div>
                  <div className="text-[0.75rem] font-black text-white/60 uppercase tracking-[3px] mb-6">Curriculum Highlights</div>
                  <ul className="space-y-4">
                    {activePillar.lessons.map((lesson, i) => (
                      <li key={i} className="flex items-center gap-3 group/item cursor-pointer">
                        <PlayCircle size={16} className="text-[var(--btb-red)] group-hover/item:scale-110 transition-transform" />
                        <span className="text-[0.92rem] font-bold text-white/65 group-hover/item:text-white transition-colors uppercase tracking-wide">
                          {lesson}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-black/40 border border-white/5 p-8 rounded-sm">
                  <Quote className="text-[var(--btb-red)] mb-4 opacity-50" size={20} />
                  <p className="text-[0.95rem] italic text-white/65 leading-relaxed">
                    "The Standard is what you do when nobody is watching. It's the daily decision to outwork your yesterday."
                  </p>
                  <div className="mt-4 text-[0.6rem] font-black uppercase tracking-[2px] text-[var(--btb-red)]">
                    — The BTB Standard
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
