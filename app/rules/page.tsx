"use client";

export default function RulesPage() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">

        <h1 className="text-center text-4xl font-bold text-cyan-400">
          Bright Future Earned App
        </h1>

        <p className="mt-2 text-center text-xl font-semibold">
          User Rules & Guidelines
        </p>

        <div className="mt-8 space-y-6">

          {/* 1 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              1. Purpose of the App
            </h2>
            <p className="text-slate-300">
              Bright Future Earned App provides users with a platform for
              investment and task-based earning activities. Users can
              participate according to the available plans and applicable
              terms displayed in the app.
            </p>
          </section>

          {/* 2 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              2. Investment & Profit
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Users may select an available investment plan.</li>
              <li>
                Plan earning/profit terms will be displayed in the app.
              </li>
              <li>
                Users should review plan details before activation.
              </li>
            </ul>
          </section>

          {/* 3 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              3. Task Schedule
            </h2>
            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Users must complete available daily tasks.</li>
              <li>Sunday is a Task Off day.</li>
              <li>No new daily tasks will be available on Sunday.</li>
              <li>
                Eligible rewards may be added after successful task
                completion according to applicable terms.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              4. Withdrawal Rules
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                <strong>Minimum withdrawal amount: Rs 1,000.</strong>
              </li>

              <li>
                Only the following withdrawal amounts will be eligible for
                approval:
                <span className="font-bold text-white">
                  {" "}
                  Rs 1,000, Rs 1,500, Rs 2,500, Rs 3,500, Rs 5,000,
                  Rs 7,000, Rs 10,000, Rs 12,000, Rs 15,000,
                  Rs 20,000 and Rs 30,000.
                </span>
              </li>

              <li>
                Withdrawal requests below Rs 1,000 will be rejected and will
                not receive company approval.
              </li>

              <li>
                A <strong>5% company/administration fee</strong> will be
                applicable on withdrawals.
              </li>

              <li>Maximum 5 withdrawal requests per week.</li>

              <li>Withdrawal requests are available Monday to Friday.</li>

              <li>Saturday and Sunday are Withdrawal Off days.</li>

              <li>
                <strong>Withdrawal time: 9:00 PM to 12:00 AM.</strong>
              </li>

              <li>
                Withdrawals will be processed to the registered payment
                method/account.
              </li>

              <li>
                Processing time depends on verification and applicable
                procedures.
              </li>
            </ul>
          </section>

          {/* 5 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              5. Payment Details
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                Users must check their payment details before every
                withdrawal.
              </li>
              <li>
                Users are responsible for providing correct account
                information.
              </li>
              <li>
                Incorrect information may cause delay or failed processing.
              </li>
            </ul>
          </section>

          {/* 6 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-4 text-2xl font-bold text-cyan-400">
              6. Weekly Schedule
            </h2>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-cyan-500 text-slate-950">
                    <th className="p-3 text-left">Day</th>
                    <th className="p-3 text-left">Tasks</th>
                    <th className="p-3 text-left">Withdrawal</th>
                  </tr>
                </thead>

                <tbody>
                  {[
                    ["Monday", "Available", "9 PM – 12 AM"],
                    ["Tuesday", "Available", "9 PM – 12 AM"],
                    ["Wednesday", "Available", "9 PM – 12 AM"],
                    ["Thursday", "Available", "9 PM – 12 AM"],
                    ["Friday", "Available", "9 PM – 12 AM"],
                    ["Saturday", "Available", "Withdrawal Off"],
                    ["Sunday", "Task Off", "Withdrawal Off"],
                  ].map(([day, tasks, withdrawal]) => (
                    <tr key={day}>
                      <td className="border-b border-white/10 p-3">
                        {day}
                      </td>
                      <td
                        className={`border-b border-white/10 p-3 ${
                          tasks === "Task Off" ? "text-yellow-400" : ""
                        }`}
                      >
                        {tasks}
                      </td>
                      <td
                        className={`border-b border-white/10 p-3 ${
                          withdrawal === "Withdrawal Off"
                            ? "text-yellow-400"
                            : ""
                        }`}
                      >
                        {withdrawal}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 7 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              7. Weekly Withdrawal Limit
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Maximum 5 withdrawals per user per week.</li>
              <li>
                Users must keep track of their weekly withdrawal limit.
              </li>
              <li>
                Requests exceeding the limit will not be accepted.
              </li>
            </ul>
          </section>

          {/* 8 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              8. Referral, Dinner & Salary Benefit
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                A user who successfully adds or refers{" "}
                <strong>10 qualifying people</strong> may become eligible
                for the Dinner Benefit.
              </li>

              <li>
                Eligible users may receive a{" "}
                <strong>Rs 15,000 monthly dinner allowance</strong>,
                subject to verification and applicable terms.
              </li>

              <li>
                A user who successfully reaches{" "}
                <strong>15 qualifying referrals</strong> may become eligible
                for a <strong>Rs 15,000 monthly salary</strong>, subject to
                verification and applicable terms.
              </li>
            </ul>
          </section>

          {/* 9 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              9. Qualifying Referral Structure
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>G-1 Plan: 4 referrals</li>
              <li>G-2 Plan: 2 referrals</li>
              <li>G-3 Plan: 2 referrals</li>
              <li>G-4 Plan: 2 referrals</li>
            </ul>

            <p className="mt-4 font-bold text-white">
              Total qualifying referrals: 10
            </p>

            <p className="mt-3 text-slate-300">
              Users completing the applicable qualifying referral structure
              may become eligible for the Dinner Benefit. Further eligibility
              for the monthly salary requires 15 qualifying referrals,
              subject to verification and applicable terms.
            </p>
          </section>

          {/* 10 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              10. Referral-Based Salary Structure
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>50 referrals → Rs 20,000 monthly salary</li>
              <li>80 referrals → Rs 25,000 monthly salary</li>
              <li>100 referrals → Rs 30,000 monthly salary</li>
              <li>
                150 referrals → Rs 40,000 monthly salary + Rs 30,000
                Office Allowance
              </li>
            </ul>
          </section>

          {/* 11 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              11. Dinner Picture Submission
            </h2>

            <p className="text-slate-300">
              Eligible users may be required to send a dinner picture to
              the designated Dinner Group and Support Partner. The picture
              may be required for verification of the Dinner Allowance.
            </p>
          </section>

          {/* 12 */}
          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              12. Bright Future Group Benefit
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                Any user who creates a Bright Future group may be eligible
                for additional benefits from the company.
              </li>

              <li>
                The Group Admin should contact the Company Manager and send
                a picture/screenshot of the created Bright Future group for
                verification.
              </li>

              <li>
                After verification, the company may provide a separate
                benefit to the eligible Group Admin according to applicable
                company terms.
              </li>
            </ul>
          </section>

          {/* 13 */}
          <section className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-yellow-400">
              13. Important Note
            </h2>

            <p className="text-slate-300">
              Users should carefully review all plan, task, withdrawal and
              referral terms before participating.
            </p>

            <p className="mt-4 text-slate-300">
              Bright Future Earned App management reserves the right to
              update these rules when necessary. Important changes will be
              communicated through the app.
            </p>
          </section>

        </div>

        <div className="mt-8 text-center">
          <p className="text-xl font-bold text-cyan-400">
            Bright Future Earned App
          </p>

          <p className="mt-2 text-slate-400">
            Work • Earn • Grow
          </p>

          <a
            href="/dashboard"
            className="mt-5 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950"
          >
            ← Back to Dashboard
          </a>
        </div>

      </div>
    </main>
  );
}