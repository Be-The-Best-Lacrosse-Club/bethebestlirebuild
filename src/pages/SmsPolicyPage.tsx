import { MessageSquare } from "lucide-react"

export function SmsPolicyPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[2.5px] text-[var(--btb-red)] font-bold mb-4">
            <MessageSquare size={14} /> SMS Policy &amp; Privacy Policy
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-slate-900 uppercase tracking-tight mb-3 leading-[0.95]">
            Text Message Terms &amp; Privacy
          </h1>
          <p className="text-sm text-slate-500">
            Effective May 1, 2026 · Be The Best Sportscamp d/b/a Be The Best Lacrosse Club
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Who We Are</h2>
            <p className="mb-2">
              Be The Best Sportscamp, operating as Be The Best Lacrosse Club, is a youth lacrosse
              organization based in Massapequa, NY.
            </p>
            <p>
              We send SMS/text messages from <strong>+1 (516) 744&ndash;2747</strong> to parents,
              guardians, coaches, and club participants who have registered a player with the club,
              opted in through our registration process, or opted in by text.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">What We Send</h2>
            <p className="mb-2">
              Our text messages are <strong>transactional and informational only</strong>.
            </p>
            <p className="mb-2">No marketing. No promotional offers. No third-party content.</p>
            <p className="mb-2">Typical messages include:</p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem]">
              <li>Practice reminders with date, time, and location</li>
              <li>Game day logistics, including opponent, time, field, and check-in instructions</li>
              <li>Schedule or venue changes</li>
              <li>Tournament reminders and registration deadlines</li>
              <li>Weather-related cancellations and rescheduling</li>
              <li>Urgent safety or pickup notices</li>
              <li>Team, coach, and program logistics</li>
              <li>Registration-related reminders</li>
              <li>Administrative club updates</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How Often We Send Messages</h2>
            <p className="mb-2">
              Message volume varies by season, team, schedule, and program activity, but is typically
              under <strong>10 messages per recipient per month</strong>.
            </p>
            <p>Message and data rates may apply per your mobile carrier plan.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How You Opt In</h2>
            <p className="mb-3">You opt in to SMS/text messages in one of two ways:</p>

            <h3 className="font-display text-base uppercase tracking-wide text-slate-900 mt-4 mb-2">1. During Player Registration</h3>
            <p className="mb-2">
              You may opt in during player registration. When you provide
              your mobile number during registration, the registration form discloses:
            </p>
            <p className="italic text-slate-600 mb-3">
              &ldquo;By providing your phone number you agree to receive transactional SMS from
              Be The Best Lacrosse Club &mdash; practice reminders, game day info, and urgent
              announcements. Reply STOP to opt out. Reply HELP for help. Msg &amp; data rates may apply.&rdquo;
            </p>

            <h3 className="font-display text-base uppercase tracking-wide text-slate-900 mt-4 mb-2">2. By Text Message</h3>
            <p>
              You may also opt in by texting <strong>START</strong> or <strong>SUBSCRIBE</strong> to{" "}
              <strong>+1 (516) 744&ndash;2747</strong>.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Opt-In Confirmation Message</h2>
            <p className="mb-2">When you opt in by keyword, you may receive the following confirmation message:</p>
            <p className="italic text-slate-600">
              &ldquo;Be The Best Lacrosse Club: You are now subscribed to team updates. Reply HELP
              for help, STOP to opt out. Msg &amp; data rates may apply.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">How You Opt Out</h2>
            <p className="mb-2">
              You may opt out of SMS/text messages at any time by replying with any of the following
              keywords to <strong>+1 (516) 744&ndash;2747</strong>:
            </p>
            <p className="font-semibold text-slate-900 mb-2">
              STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT, OPTOUT, REVOKE
            </p>
            <p>
              After opting out, you will receive a final confirmation message and no further texts
              will be sent from this number unless you resubscribe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Opt-Out Confirmation Message</h2>
            <p className="mb-2">When you opt out, you may receive the following confirmation message:</p>
            <p className="italic text-slate-600">
              &ldquo;You have successfully been unsubscribed. You will not receive any more messages
              from this number. Reply START to resubscribe.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Help Keywords</h2>
            <p className="mb-2">For assistance, you may reply with either of the following keywords:</p>
            <p className="font-semibold text-slate-900 mb-2">HELP, INFO</p>
            <p className="mb-2">You may also contact us directly at:</p>
            <p>
              Email:{" "}
              <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">
                info@bethebestli.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">HELP Message</h2>
            <p className="mb-2">When you request help by keyword, you may receive the following message:</p>
            <p className="italic text-slate-600">
              &ldquo;Reply STOP to unsubscribe. Msg&amp;Data Rates May Apply.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Privacy</h2>
            <p className="mb-2">
              Phone numbers collected for SMS are stored on Be The Best Lacrosse Club&rsquo;s internal
              systems and are processed by our SMS delivery provider, Twilio, solely to deliver the
              messages described in this policy.
            </p>
            <p className="mb-2">
              We never share, sell, rent, or disclose your phone number to advertisers, data brokers,
              or third parties for marketing or promotional purposes.
            </p>
            <p className="mb-2">
              No mobile information will be shared with third parties or affiliates for marketing or
              promotional purposes.
            </p>
            <p className="mb-2">
              Your mobile number is used only for communications from Be The Best Lacrosse Club
              directly, or as necessary for service providers such as Twilio to deliver SMS/text
              messages on our behalf.
            </p>
            <p>
              Opt-out requests are honored immediately, and your number is flagged so no further
              messages are sent from this number unless you resubscribe.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Data Use</h2>
            <p className="mb-2">We may use SMS-related information to:</p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem] mb-2">
              <li>Send transactional and informational club messages</li>
              <li>Manage opt-ins and opt-outs</li>
              <li>Respond to HELP or INFO requests</li>
              <li>Maintain message delivery records</li>
              <li>Comply with legal, carrier, registration, and communications requirements</li>
              <li>Protect the safety and operation of our club programs</li>
            </ul>
            <p>We do not use SMS opt-in data for third-party advertising.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Message Delivery</h2>
            <p className="mb-2">
              Message delivery may depend on your mobile carrier, network availability, device
              settings, and other factors outside our control.
            </p>
            <p>Mobile carriers are not liable for delayed or undelivered messages.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Contact</h2>
            <div className="space-y-1 text-[0.95rem]">
              <p>Be The Best Sportscamp d/b/a Be The Best Lacrosse Club</p>
              <p>364 North Iowa Ave</p>
              <p>Massapequa, NY 11758</p>
              <p>
                Email:{" "}
                <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">
                  info@bethebestli.com
                </a>
              </p>
              <p>SMS Phone Number: +1 (516) 744&ndash;2747</p>
            </div>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">Updates to This Policy</h2>
            <p>
              These terms may be updated from time to time. The &ldquo;Effective&rdquo; date at the
              top reflects the current version.
            </p>
          </section>

          <p className="text-xs text-slate-400 pt-6 border-t border-slate-200">
            Be The Best Sportscamp &mdash; Massapequa, NY.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SmsPolicyPage
