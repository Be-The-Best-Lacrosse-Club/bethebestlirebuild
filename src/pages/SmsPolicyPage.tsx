import { MessageSquare, Mail, MapPin } from "lucide-react"

export function SmsPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[2.5px] text-[var(--btb-red)] font-bold mb-4">
            <MessageSquare size={14} /> SMS Policy
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-slate-900 uppercase tracking-tight mb-3 leading-[0.95]">
            Text Message Terms &amp; Privacy
          </h1>
          <p className="text-sm text-slate-500">
            Effective April 22, 2026 · Be The Best Sportscamp (d/b/a Be The Best Lacrosse Club)
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Who we are</h2>
            <p>
              Be The Best Sportscamp, operating as Be The Best Lacrosse Club, is a youth lacrosse
              organization based in Massapequa, NY. We send SMS (text) messages from
              <strong> +1 (516) 744&ndash;2747</strong> to parents and coaches who have
              registered a player with the club.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">What we send</h2>
            <p className="mb-2">
              Our text messages are <strong>transactional and informational only</strong>. No marketing.
              No promotional offers. No third-party content. Typical messages include:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem]">
              <li>Practice reminders with date, time, and location</li>
              <li>Game day logistics (opponent, time, field, check-in instructions)</li>
              <li>Schedule or venue changes</li>
              <li>Tournament reminders and registration deadlines</li>
              <li>Weather-related cancellations and rescheduling</li>
              <li>Urgent safety or pickup notices</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How often</h2>
            <p>
              Volume varies by season and team but is typically under <strong>10 messages per recipient
              per month</strong>. Message and data rates may apply per your mobile carrier plan.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How you opt in</h2>
            <p className="mb-2">
              You opt in to SMS in one of two ways:
            </p>
            <ol className="list-decimal pl-6 space-y-1 text-[0.95rem]">
              <li>
                <strong>During player registration</strong> on our LeagueApps portal. When you provide
                your mobile number during registration, the registration form discloses:
                <em className="block mt-1 text-slate-600">
                  &ldquo;By providing your phone number you agree to receive transactional SMS from
                  Be The Best Lacrosse Club — practice reminders, game day info, and urgent
                  announcements. Reply STOP to opt out. Reply HELP for help. Msg &amp; data rates may apply.&rdquo;
                </em>
              </li>
              <li>
                <strong>By text</strong> — reply <strong>START</strong> or <strong>SUBSCRIBE</strong>
                to +1 (516) 744&ndash;2747 to opt in.
              </li>
            </ol>
            <p className="mt-3">
              We never share, sell, or rent your phone number to any third party. Your number is used
              only for communications from Be The Best Lacrosse Club directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How you opt out</h2>
            <p>
              Reply <strong>STOP</strong>, <strong>UNSUBSCRIBE</strong>, <strong>CANCEL</strong>,
              <strong> END</strong>, or <strong>QUIT</strong> to any message from +1 (516) 744&ndash;2747
              at any time. You will receive a final confirmation message and no further texts will be
              sent. Reply <strong>START</strong> later to resubscribe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Help</h2>
            <p>
              Reply <strong>HELP</strong> or <strong>INFO</strong> to any message for assistance,
              or email <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">info@bethebestli.com</a>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Privacy</h2>
            <p>
              Phone numbers collected for SMS are stored on Be The Best Lacrosse Club's internal
              systems and are processed by our SMS delivery provider (Twilio) solely to deliver
              the messages described above. Numbers are not shared with advertisers, data brokers,
              or any third parties. Opt-out requests are honored immediately and your number is
              flagged so no further messages are sent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Contact</h2>
            <div className="space-y-1 text-[0.95rem]">
              <p className="flex items-center gap-2">
                <Mail size={14} className="text-slate-400" />
                <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">info@bethebestli.com</a>
              </p>
              <p className="flex items-center gap-2">
                <MapPin size={14} className="text-slate-400" />
                364 North Iowa Ave, Massapequa, NY 11758
              </p>
            </div>
          </section>

          <p className="text-xs text-slate-400 pt-6 border-t border-slate-200">
            These terms may be updated from time to time. The &ldquo;Effective&rdquo; date at the top reflects
            the current version. Be The Best Sportscamp &mdash; Massapequa, NY.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SmsPolicyPage
