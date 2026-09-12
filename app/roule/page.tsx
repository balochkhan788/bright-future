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

          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              4. Withdrawal Rules
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>Maximum 5 withdrawal requests per week.</li>
              <li>Withdrawal requests are available Monday to Friday.</li>
              <li>Saturday and Sunday are Withdrawal Off days.</li>
              <li>Withdrawal time: 10:00 AM to 12:00 AM.</li>
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
                  <tr>
                    <td className="border-b border-white/10 p-3">Monday</td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3">
                      10 AM – 12 AM
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-white/10 p-3">Tuesday</td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3">
                      10 AM – 12 AM
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-white/10 p-3">
                      Wednesday
                    </td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3">
                      10 AM – 12 AM
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-white/10 p-3">Thursday</td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3">
                      10 AM – 12 AM
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-white/10 p-3">Friday</td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3">
                      10 AM – 12 AM
                    </td>
                  </tr>

                  <tr>
                    <td className="border-b border-white/10 p-3">Saturday</td>
                    <td className="border-b border-white/10 p-3">
                      Available
                    </td>
                    <td className="border-b border-white/10 p-3 text-yellow-400">
                      Withdrawal Off
                    </td>
                  </tr>

                  <tr>
                    <td className="p-3">Sunday</td>
                    <td className="p-3 text-yellow-400">
                      Task Off
                    </td>
                    <td className="p-3 text-yellow-400">
                      Withdrawal Off
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

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

          <section className="rounded-xl bg-white/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-cyan-400">
              8. Referral Benefit
            </h2>

            <ul className="list-disc space-y-2 pl-6 text-slate-300">
              <li>
                A user who successfully adds or refers 10 people may become
                eligible for the referral benefit.
              </li>
              <li>
                Eligible users may apply for the benefit daily, subject to
                verification.
              </li>
              <li>
                The app may provide a dinner allowance to eligible users.
              </li>
              <li>
                Referral eligibility is subject to the applicable referral
                terms.
              </li>
            </ul>
          </section>

          <section className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-6">
            <h2 className="mb-3 text-2xl font-bold text-yellow-400">
              9. Important Note
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