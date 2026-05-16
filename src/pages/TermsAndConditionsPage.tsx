import { FileText } from "lucide-react"

export function TermsAndConditionsPage() {
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 text-[0.7rem] uppercase tracking-[2.5px] text-[var(--btb-red)] font-bold mb-4">
            <FileText size={14} /> Terms and Conditions
          </div>
          <h1 className="font-display text-4xl md:text-5xl text-slate-900 uppercase tracking-tight mb-3 leading-[0.95]">
            Terms and Conditions
          </h1>
          <p className="text-sm text-slate-500">
            Effective May 1, 2026 · Be The Best Sportscamp d/b/a Be The Best Lacrosse Club
          </p>
        </div>

        {/* Body */}
        <div className="space-y-8 text-slate-700 leading-relaxed">
          <section>
            <p className="mb-2">
              These Terms and Conditions govern your use of the Be The Best Lacrosse Club website,
              registrations, programs, communications, and SMS/text messaging services.
            </p>
            <p>
              By using our website, registering for a program, providing your contact information,
              participating in club activities, or opting in to receive SMS/text messages, you agree
              to these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">1. Organization Information</h2>
            <p className="mb-2">
              Be The Best Sportscamp, operating as Be The Best Lacrosse Club, is a youth lacrosse
              organization based in Massapequa, NY.
            </p>
            <p className="mb-1"><strong>Address:</strong></p>
            <p>364 North Iowa Ave</p>
            <p className="mb-2">Massapequa, NY 11758</p>
            <p>
              Email:{" "}
              <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">
                info@bethebestli.com
              </a>
            </p>
            <p>SMS Phone Number: +1 (516) 744&ndash;2747</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">2. Website Use</h2>
            <p className="mb-2">You agree to use our website and online services only for lawful purposes.</p>
            <p className="mb-2">You may not:</p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem]">
              <li>Submit false or misleading information</li>
              <li>Interfere with the security or function of the website</li>
              <li>Attempt unauthorized access to any system or account</li>
              <li>Copy, misuse, or distribute website content without permission</li>
              <li>Use the website in a way that violates applicable law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">3. Program Registration</h2>
            <p className="mb-2">
              Be The Best Lacrosse Club offers youth lacrosse programs, which may include teams,
              training, practices, games, tournaments, clinics, camps, events, and related club
              services.
            </p>
            <p className="mb-2">
              By registering a player, you agree to provide accurate and complete information.
            </p>
            <p>
              Parents and guardians are responsible for the accuracy of registration information
              submitted for minor players, including contact information, emergency contact
              information, player details, and any required medical or safety information.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">4. Program Communications</h2>
            <p className="mb-2">
              Be The Best Lacrosse Club may contact parents, guardians, coaches, and participants
              regarding club operations, including:
            </p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem] mb-2">
              <li>Registration status</li>
              <li>Practice schedules</li>
              <li>Game schedules</li>
              <li>Tournament logistics</li>
              <li>Weather updates</li>
              <li>Venue changes</li>
              <li>Safety notices</li>
              <li>Pickup instructions</li>
              <li>Team updates</li>
              <li>Administrative club matters</li>
            </ul>
            <p>
              These communications may be sent by email, phone, SMS/text message, registration
              platform, team management platform, or other communication channels used by the club.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">5. SMS/Text Messaging Terms</h2>
            <p className="mb-2">
              Be The Best Lacrosse Club sends SMS/text messages from <strong>+1 (516) 744&ndash;2747</strong>.
            </p>
            <p className="mb-2">
              Our SMS/text messages are <strong>transactional and informational only</strong>.
            </p>
            <p className="mb-2">No marketing. No promotional offers. No third-party content.</p>
            <p className="mb-2">Messages may include:</p>
            <ul className="list-disc pl-6 space-y-1 text-[0.95rem] mb-2">
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
            <p className="mb-2">
              Message frequency varies by season, team, schedule, and program activity, but is
              typically under <strong>10 messages per recipient per month</strong>.
            </p>
            <p>Message and data rates may apply.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">6. SMS Opt-In</h2>
            <p className="mb-3">You may opt in to SMS/text messages in one of two ways:</p>

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
            <p className="mb-3">
              You may opt in by texting <strong>START</strong> or <strong>SUBSCRIBE</strong> to{" "}
              <strong>+1 (516) 744&ndash;2747</strong>.
            </p>
            <p className="mb-2">When you opt in by keyword, you may receive the following confirmation message:</p>
            <p className="italic text-slate-600">
              &ldquo;Be The Best Lacrosse Club: You are now subscribed to team updates. Reply HELP
              for help, STOP to opt out. Msg &amp; data rates may apply.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">7. SMS Opt-Out</h2>
            <p className="mb-2">
              You may opt out of SMS/text messages at any time by replying with any of the following
              keywords to <strong>+1 (516) 744&ndash;2747</strong>:
            </p>
            <p className="font-semibold text-slate-900 mb-2">
              STOP, STOPALL, UNSUBSCRIBE, CANCEL, END, QUIT, OPTOUT, REVOKE
            </p>
            <p className="mb-2">
              After opting out, you will receive a final confirmation message and no further texts
              will be sent from this number unless you resubscribe.
            </p>
            <p className="mb-2">When you opt out, you may receive the following confirmation message:</p>
            <p className="italic text-slate-600">
              &ldquo;You have successfully been unsubscribed. You will not receive any more messages
              from this number. Reply START to resubscribe.&rdquo;
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">8. SMS Help</h2>
            <p className="mb-2">For assistance, you may reply with either of the following keywords:</p>
            <p className="font-semibold text-slate-900 mb-2">HELP, INFO</p>
            <p className="mb-2">When you request help by keyword, you may receive the following message:</p>
            <p className="italic text-slate-600 mb-3">
              &ldquo;Reply STOP to unsubscribe. Msg&amp;Data Rates May Apply.&rdquo;
            </p>
            <p>You may also contact us at:</p>
            <p>
              Email:{" "}
              <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">
                info@bethebestli.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">9. SMS Privacy</h2>
            <p className="mb-2">
              Phone numbers collected for SMS are stored on Be The Best Lacrosse Club&rsquo;s internal
              systems and are processed by our SMS delivery provider, Twilio, solely to deliver the
              messages described in these Terms and in our SMS Policy &amp; Privacy Policy.
            </p>
            <p className="mb-2">
              We never share, sell, rent, or disclose your phone number to advertisers, data brokers,
              or third parties for marketing or promotional purposes.
            </p>
            <p className="mb-2">
              No mobile information will be shared with third parties or affiliates for marketing or
              promotional purposes.
            </p>
            <p>
              Your mobile number is used only for communications from Be The Best Lacrosse Club
              directly, or as necessary for service providers such as Twilio to deliver SMS/text
              messages on our behalf.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">10. Message Delivery</h2>
            <p className="mb-2">
              Message delivery may depend on your mobile carrier, network availability, device
              settings, and other factors outside our control.
            </p>
            <p className="mb-2">Mobile carriers are not liable for delayed or undelivered messages.</p>
            <p>You are responsible for any message, data, or other charges imposed by your mobile carrier.</p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">11. Payments, Fees, and Refunds</h2>
            <p className="mb-2">
              Program fees, payment schedules, refund policies, and cancellation terms may vary by
              program.
            </p>
            <p className="mb-2">
              Specific payment and refund terms provided during registration, on invoices, or in
              written program communications control for that program.
            </p>
            <p>
              Unless otherwise stated in writing, registration fees may be non-refundable after
              deadlines, roster placement, team assignment, event registration, uniform ordering, or
              program commencement.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">12. Player, Parent, and Spectator Conduct</h2>
            <p className="mb-2">
              Players, parents, guardians, coaches, and spectators are expected to conduct themselves
              respectfully and appropriately at all Be The Best Lacrosse Club practices, games,
              tournaments, training sessions, clinics, camps, and events.
            </p>
            <p>
              Be The Best Lacrosse Club reserves the right to remove, suspend, or restrict
              participation for conduct that is disruptive, unsafe, abusive, disrespectful, or
              inconsistent with club standards.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">13. Assumption of Risk</h2>
            <p className="mb-2">Lacrosse and athletic training involve inherent risks, including physical injury.</p>
            <p className="mb-2">
              By registering for or participating in Be The Best Lacrosse Club programs, participants
              and their parents or guardians acknowledge that participation involves risk.
            </p>
            <p>
              Participants are responsible for using appropriate equipment, following coach
              instructions, following facility rules, and disclosing relevant medical or safety
              concerns where appropriate.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">14. Photos, Videos, and Media</h2>
            <p className="mb-2">
              Be The Best Lacrosse Club may take photos or videos at practices, games, tournaments,
              training sessions, clinics, camps, or events.
            </p>
            <p className="mb-2">
              These materials may be used for club operations, team communication, marketing, social
              media, website content, promotional materials, or player development purposes.
            </p>
            <p className="mb-2">
              To request a media restriction, contact us in writing at{" "}
              <a href="mailto:info@bethebestli.com" className="text-[var(--btb-red)] underline">
                info@bethebestli.com
              </a>
              .
            </p>
            <p>
              We will make reasonable efforts to honor written requests, but we cannot guarantee
              removal from all group photos, event media, livestreams, tournament media, or
              third-party content.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">15. Intellectual Property</h2>
            <p className="mb-2">
              All website content, club logos, text, graphics, photos, videos, training materials,
              documents, systems, and other materials are owned by or licensed to Be The Best
              Lacrosse Club unless otherwise stated.
            </p>
            <p>
              You may not copy, reproduce, distribute, modify, publish, display, or exploit our
              content without written permission.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">16. Third-Party Services</h2>
            <p className="mb-2">
              Our website, registration process, payment process, communications, or team operations
              may use third-party platforms, including registration systems, payment processors, SMS
              providers, email providers, tournament systems, or scheduling platforms.
            </p>
            <p className="mb-2">
              Be The Best Lacrosse Club is not responsible for third-party websites, services,
              policies, payment systems, or content.
            </p>
            <p>
              Your use of third-party services may be governed by their own terms and privacy
              policies.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">17. Schedule Changes and Operational Changes</h2>
            <p className="mb-2">
              Schedules, rosters, events, coaches, locations, and program details may change due to
              weather, facility availability, tournament changes, staffing, safety concerns, or other
              operational needs.
            </p>
            <p>
              Be The Best Lacrosse Club may adjust program details when necessary to operate safely
              and effectively.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">18. Limitation of Liability</h2>
            <p className="mb-2">
              To the fullest extent permitted by law, Be The Best Sportscamp, Be The Best Lacrosse
              Club, its owners, directors, coaches, employees, contractors, volunteers, and
              representatives shall not be liable for indirect, incidental, special, consequential,
              or punitive damages arising from your use of the website, participation in programs,
              or receipt of communications.
            </p>
            <p>
              Nothing in these Terms is intended to limit rights that cannot be limited under
              applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">19. Updates to These Terms</h2>
            <p className="mb-2">These Terms and Conditions may be updated from time to time.</p>
            <p className="mb-2">The &ldquo;Effective&rdquo; date at the top reflects the current version.</p>
            <p>
              Continued use of our website, registration systems, programs, or communications after
              updates are posted means you accept the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">20. Governing Law</h2>
            <p>
              These Terms and Conditions are governed by the laws of the State of New York, unless a
              different jurisdiction is required by applicable law.
            </p>
          </section>

          <section>
            <h2 className="font-display text-xl uppercase tracking-wide text-slate-900 mb-2">21. Contact</h2>
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

          <p className="text-xs text-slate-400 pt-6 border-t border-slate-200">
            Be The Best Sportscamp &mdash; Massapequa, NY.
          </p>
        </div>
      </div>
    </div>
  )
}

export default TermsAndConditionsPage
