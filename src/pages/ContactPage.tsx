import { useEffect, useState, type FormEvent } from "react"
import { toast } from "sonner"
import { SEO } from "@/components/shared/SEO"
import { Mail, MapPin, ArrowRight, Phone, Send, CheckCircle2 } from "lucide-react"
import { useWordSplit, useFadeUp } from "@/hooks/useScrollAnimation"
import type React from "react"

function encode(data: Record<string, string>) {
  return Object.keys(data)
    .map((key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key]))
    .join("&")
}

function validateEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ContactPage() {
  const titleRef = useWordSplit(55)
  const cardRef = useFadeUp(0)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [botField, setBotField] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { window.scrollTo(0, 0) }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (botField) return
    if (!name || !email || !message) {
      toast.error("Please fill in name, email, and a message.")
      return
    }
    if (!validateEmail(email)) {
      toast.error("Please enter a valid email address.")
      return
    }
    setSubmitting(true)
    try {
      await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: encode({
          "form-name": "contact",
          name,
          email,
          phone,
          subject,
          message,
        }),
      })
      setSubmitted(true)
      toast.success("Message sent — we'll be in touch.")
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.")
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = "w-full h-12 px-4 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.05rem] placeholder:text-white/40 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all"
  const labelClass = "block text-[0.95rem] font-black uppercase tracking-[2px] text-white/85 mb-2"

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
            <div className="text-[var(--btb-red)] font-mono text-[1.15rem] tracking-[5px] mb-6 flex items-center justify-center gap-3">
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
              <p className="text-white/70 group-hover:text-white/80 text-[1.1rem] font-medium transition-colors mb-6">
                For general inquiries, program questions, and tryout info.
              </p>
              <div className="flex items-center gap-2 text-[1.0rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                info@bethebestli.com
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Register */}
            <a
              href="/tryouts"
              className="group relative p-12 bg-black hover:bg-[var(--btb-red)] transition-all duration-300"
            >
              <ArrowRight size={28} className="text-[var(--btb-red)] group-hover:text-white mb-8 transition-colors" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Register Now</h3>
              <p className="text-white/70 group-hover:text-white/80 text-[1.1rem] font-medium transition-colors mb-6">
                Ready to join? Register for the 2026 season.
              </p>
              <div className="flex items-center gap-2 text-[1.0rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Register for 2026 Tryouts
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>

            {/* Location */}
            <div className="group relative p-12 bg-black hover:bg-neutral-900 transition-all duration-300">
              <MapPin size={28} className="text-[var(--btb-red)] mb-8" />
              <h3 className="font-display text-2xl uppercase tracking-wider text-white mb-3">Location</h3>
              <p className="text-white/70 text-[1.1rem] font-medium leading-relaxed">
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
              <p className="text-white/70 group-hover:text-white/80 text-[1.1rem] font-medium transition-colors mb-6">
                Not ready to register? Fill out an interest form and we&apos;ll reach out.
              </p>
              <div className="flex items-center gap-2 text-[1.0rem] font-black uppercase tracking-[2px] text-[var(--btb-red)] group-hover:text-white transition-colors">
                Submit Interest Form
                <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </a>
          </div>

          {/* Direct message form */}
          <div className="mb-12">
            <div className="flex items-center gap-3 text-[var(--btb-red)] font-mono text-[0.95rem] tracking-[4px] mb-6">
              <div className="w-6 h-px bg-[var(--btb-red)]" />
              SEND_A_MESSAGE
            </div>
            <h2 className="font-display text-[clamp(2rem,5vw,3.25rem)] uppercase leading-[0.9] text-white mb-3">
              Or write us <br /> <span className="text-[var(--btb-red)]">directly.</span>
            </h2>
            <p className="text-white/60 text-[1.05rem] leading-relaxed max-w-[560px] mb-10">
              Drop a note and we'll route it to the right coach or staff member. Replies usually go out within one business day.
            </p>

            {submitted ? (
              <div className="border border-white/5 bg-white/[0.02] rounded-2xl p-12 text-center">
                <div className="w-16 h-16 bg-[var(--btb-red)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle2 size={32} className="text-[var(--btb-red)]" />
                </div>
                <h3 className="font-display text-3xl text-white uppercase mb-3">Message Received</h3>
                <p className="text-white/65 leading-relaxed max-w-[420px] mx-auto">
                  Thanks — we got it. A staff member will follow up shortly. Check your email (and spam folder) for our reply.
                </p>
              </div>
            ) : (
              <form
                name="contact"
                method="POST"
                data-netlify="true"
                netlify-honeypot="bot-field"
                onSubmit={handleSubmit}
                className="space-y-6 border border-white/5 bg-white/[0.02] rounded-2xl p-8 md:p-10"
              >
                <input type="hidden" name="form-name" value="contact" />
                <p className="hidden">
                  <label>
                    Don't fill this out if you're human: <input name="bot-field" value={botField} onChange={(e) => setBotField(e.target.value)} />
                  </label>
                </p>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Name *</label>
                    <input type="text" name="name" required className={inputClass} value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input type="email" name="email" required className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input type="tel" name="phone" className={inputClass} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  </div>
                  <div>
                    <label className={labelClass}>Subject</label>
                    <input type="text" name="subject" className={inputClass} placeholder="What's this about?" value={subject} onChange={(e) => setSubject(e.target.value)} />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={5}
                    className="w-full px-4 py-3 bg-white/[0.04] border border-white/10 rounded-lg text-white text-[1.05rem] placeholder:text-white/40 focus:outline-none focus:border-[var(--btb-red)]/50 transition-all resize-none"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 bg-[var(--btb-red)] text-white text-[1.0rem] font-black uppercase tracking-[3px] rounded-lg hover:bg-[var(--btb-red-dark)] hover:-translate-y-0.5 transition-all shadow-xl shadow-red-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  <Send size={14} />
                  {submitting ? "Sending..." : "Send Message"}
                </button>
              </form>
            )}
          </div>

          <p className="text-center text-[1.0rem] text-white/45 uppercase tracking-[2px]">
            Be The Best Lacrosse Club · Long Island, NY · info@bethebestli.com
          </p>
        </div>
      </div>
    </>
  )
}
