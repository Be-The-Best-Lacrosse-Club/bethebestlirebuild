import { useEffect } from "react"
import { ArrowRight, Check, Download, FileArchive, Mail, ShieldCheck } from "lucide-react"
import { SEO } from "@/components/shared/SEO"

const LOGO_PACK_URL = "/downloads/BTB-Approved-SVG-Logo-Pack.zip"

const usageRules = [
  "Use the original SVG file from the approved pack.",
  "Keep the logo's proportions, spacing, and colors intact.",
  "Do not stretch, trace, recolor, crop, outline, or add effects.",
  "Ask BTB before using a logo on merchandise or paid advertising.",
]

export function LogoLibraryPage() {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white" style={{ fontFamily: "'Montserrat', sans-serif" }}>
      <SEO
        title="Official Logos | BTB Lacrosse Club"
        description="Download the approved Be The Best Lacrosse Club vector logo pack for team communications and fundraising."
        path="/logos"
      />

      <section className="relative overflow-hidden px-4 pb-16 pt-28 md:px-6 md:pb-24 md:pt-36">
        <div
          className="absolute inset-0 opacity-70"
          aria-hidden="true"
          style={{
            background:
              "radial-gradient(circle at 72% 34%, rgba(210,38,48,0.22), transparent 27%), linear-gradient(135deg, #050505 0%, #0d0d0d 52%, #050505 100%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-40"
          aria-hidden="true"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 79px, rgba(255,255,255,0.04) 80px), repeating-linear-gradient(90deg, transparent, transparent 79px, rgba(255,255,255,0.04) 80px)",
          }}
        />

        <div className="relative z-10 mx-auto grid max-w-[1160px] items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
          <div>
            <div className="mb-5 flex items-center gap-3 text-[0.78rem] font-black uppercase tracking-[3px] text-[var(--btb-red)]">
              <span className="h-px w-10 bg-[var(--btb-red)]" />
              BTB Brand Resources
            </div>
            <h1 className="font-display text-[clamp(3.2rem,8vw,6.8rem)] uppercase leading-[0.84] tracking-wide">
              Official<br />Logo Files.
            </h1>
            <p className="mt-7 max-w-[670px] text-[1.04rem] leading-[1.8] text-white/70 md:text-[1.18rem]">
              One approved source for BTB team communications, family fundraisers, and club materials. Download the
              original vector pack and use only the logos included in it.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={LOGO_PACK_URL}
                download
                className="inline-flex min-h-14 items-center justify-center gap-3 bg-[var(--btb-red)] px-7 py-4 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white transition-colors hover:bg-[var(--btb-red-dark)]"
              >
                <Download size={18} /> Download Logo Pack
              </a>
              <a
                href="mailto:info@bethebestli.com?subject=BTB%20Logo%20Use%20Question"
                className="inline-flex min-h-14 items-center justify-center gap-3 border border-white/25 px-7 py-4 text-[0.9rem] font-black uppercase tracking-[1.8px] text-white transition-colors hover:border-white/60 hover:bg-white/5"
              >
                Ask Before Printing <ArrowRight size={16} />
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[460px]">
            <div className="absolute -inset-8 rounded-full bg-[var(--btb-red)]/15 blur-3xl" aria-hidden="true" />
            <div className="relative flex min-h-[350px] items-center justify-center border border-white/10 bg-white/[0.035] p-10 shadow-[0_30px_90px_rgba(0,0,0,0.55)]">
              <img
                src="/images/btb-winged-b-logo-transparent.png"
                alt="Be The Best Lacrosse Club winged B logo"
                className="h-auto max-h-[280px] w-full object-contain drop-shadow-[0_22px_35px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-neutral-950 px-4 py-10 md:px-6">
        <div className="mx-auto grid max-w-[1060px] gap-3 sm:grid-cols-3">
          {[
            { label: "Approved Files", value: "39 SVG Logos" },
            { label: "Format", value: "Transparent Vector" },
            { label: "Download", value: "One ZIP Pack" },
          ].map((item) => (
            <div key={item.label} className="border border-white/10 bg-black/35 p-5">
              <div className="text-[0.68rem] font-black uppercase tracking-[2px] text-[var(--btb-red)]">{item.label}</div>
              <div className="mt-2 font-display text-[1.45rem] uppercase tracking-wide text-white">{item.value}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 py-20 md:px-6 md:py-28">
        <div className="mx-auto grid max-w-[1060px] gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="border border-white/10 bg-white/[0.025] p-7 md:p-10">
            <div className="flex h-12 w-12 items-center justify-center bg-[var(--btb-red)]/15 text-[var(--btb-red)]">
              <FileArchive size={24} />
            </div>
            <div className="mt-7 text-[0.72rem] font-black uppercase tracking-[2.5px] text-[var(--btb-red)]">
              Approved Master Pack
            </div>
            <h2 className="mt-3 font-display text-[2.2rem] uppercase leading-none tracking-wide md:text-[2.8rem]">
              Every Mark.<br />One Download.
            </h2>
            <p className="mt-5 text-[1rem] leading-relaxed text-white/65">
              The ZIP contains the complete transparent SVG collection. SVG files stay sharp at any size, from a social
              post to a field banner.
            </p>
            <a
              href={LOGO_PACK_URL}
              download
              className="mt-8 inline-flex w-full items-center justify-center gap-3 bg-white px-6 py-4 text-[0.84rem] font-black uppercase tracking-[1.8px] text-black transition-colors hover:bg-[var(--btb-red)] hover:text-white"
            >
              <Download size={17} /> Download 39 SVG Logos
            </a>
          </div>

          <div className="border border-white/10 bg-neutral-950 p-7 md:p-10">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-[var(--btb-red)]" size={25} />
              <h2 className="font-display text-[2rem] uppercase tracking-wide">Use Them Correctly.</h2>
            </div>
            <p className="mt-4 max-w-[650px] text-[1rem] leading-relaxed text-white/65">
              Consistent logo use protects the club and keeps every team, event, and fundraiser looking like BTB.
            </p>
            <ul className="mt-8 space-y-4">
              {usageRules.map((rule) => (
                <li key={rule} className="flex gap-4 border-t border-white/10 pt-4 text-[0.98rem] leading-relaxed text-white/80">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--btb-red)]/15 text-[var(--btb-red)]">
                    <Check size={14} strokeWidth={3} />
                  </span>
                  {rule}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-[var(--btb-red)] px-4 py-14 md:px-6">
        <div className="mx-auto flex max-w-[1060px] flex-col items-start justify-between gap-7 md:flex-row md:items-center">
          <div>
            <div className="text-[0.72rem] font-black uppercase tracking-[2.5px] text-white/70">Need a different format?</div>
            <h2 className="mt-2 font-display text-[2rem] uppercase leading-none tracking-wide md:text-[2.7rem]">
              Contact BTB Before Rebuilding It.
            </h2>
          </div>
          <a
            href="mailto:info@bethebestli.com?subject=BTB%20Logo%20File%20Request"
            className="inline-flex shrink-0 items-center justify-center gap-3 bg-black px-7 py-4 text-[0.86rem] font-black uppercase tracking-[1.8px] text-white transition-colors hover:bg-neutral-900"
          >
            <Mail size={17} /> Email BTB
          </a>
        </div>
      </section>
    </div>
  )
}
