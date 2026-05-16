import { useEffect } from "react"
import { SEO } from "@/components/shared/SEO"
import { Mail, MapPin, ArrowRight, Phone } from "lucide-react"
import { useWordSplit, useFadeUp } from "@/hooks/useScrollAnimation"
import type React from "react"

export function ContactPage() {
  const titleRef = useWordSplit(55)
  const cardRef = useFadeUp(0)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  return (
    <>
      <SEO
        title="Contact | BTB Lacrosse"
        description="Get in touch with Be The Best Lacrosse Club — Long Island's premier youth lacrosse development program."
        path="/contact"
      />
      <div className="min-h-screen bg-black text-white pt-28 pb-24 px-6">
        <div className="max-w-[900px] mx-auto">

          {/* Header */}
          <div className="text-center mb-20">
            <div className="text-[var(--btb-red)] font-mono text-[0.65rem] tracking-[5px] mb-6 flex items-center justify-center gap-3">
              <div className="w-8 h-px bg-[var(--btb-red)]" />
              CONTACT_BTB
              <div className="w-8 h-px bg-[var(--btb-red)]" />
            </div>
            <h1
              ref={titleRef as React.RefObject<HTMLHeadingElement>}
              className="font-display text-[clamp(3rem,8vw,6rem)] uppercase leading-[0.85] text-white"
            >
              Get In <br /><span className="text-[var(--btb-red)]">Touch.</span>
            </h1>
          </div>

          <div ref={cardRef as React.RefObject<HTMLDivElement>} className="grid grid-cols-1 md:grid-cols-2 gap-0.5 bg-white/10 border border-white/10 mb-12">

            {/* Email */}
            <a
              href="mailto:info@bethebestli.com"
              className="group relative p-12 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <Mail size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Email Us</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                For general inquiries, program questions, and tryout info.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                info@bethebestli.com
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Register */}
            <a
              href="/register-tryouts"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative p-12 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <ArrowRight size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Register Now</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                Ready to join? Register for the 2026 season.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Register for 2026 Tryouts
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Location */}
            <div className="group relative p-12 bg-black hover:bg-neutral-900 transition-all duration-300">
              <MapPin size={28} className="text-[var(--btb-red)] mb-8" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Location</h3>
              <p className="text-white/40 text-[0.85rem] font-medium leading-relaxed">
                Long Island, New York<br />
                Training facilities across Nassau &amp; Suffolk County
              </p>
            </div>

            {/* Interest Form */}
            <a
              href="/interest"
              className="group relative p-12 bg-black hover:bg-neutral-900 transition-all duration-300"
            >
              <Phone size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Interest Form</h3>
              <p className="text-white/40 group-hover:text-white/80 text-[0.85rem] font-medium transition-colors mb-6">
                Not ready to register? Fill out an interest form and we&apos;ll reach out.
              </p>
              <div className="flex items-center gap-2 text-[0.72rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Submit Interest Form
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          <p className="text-center text-[0.72rem] text-white/20 uppercase tracking-[2px]">
            Be The Best Lacrosse Club · Long Island, NY · info@bethebestli.com
          </p>
        </div>
      </div>
    </>
  )
}
