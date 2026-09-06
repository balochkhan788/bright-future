export default function Transactions() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <div className="mt-10">
          <h2 className="text-3xl font-bold">
            Transaction History
          </h2>

          <p className="mt-2 text-slate-400">
            Your demo account activity
          </p>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-white/10 bg-white/5">

          <div className="grid grid-cols-3 border-b border-white/10 px-6 py-4 text-sm font-semibold text-slate-400">
            <span>Type</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
          </div>

          <div className="grid grid-cols-3 border-b border-white/10 px-6 py-5">
            <span className="font-semibold text-green-400">
              Demo Deposit
            </span>

            <span className="text-slate-400">
              03 Sep 2026
            </span>

            <span className="text-right font-bold text-green-400">
              + Rs. 9,000
            </span>
          </div>

          <div className="grid grid-cols-3 px-6 py-5">
            <span className="font-semibold text-yellow-400">
              Demo Withdrawal
            </span>

            <span className="text-slate-400">
              03 Sep 2026
            </span>

            <span className="text-right font-bold text-yellow-400">
              - Rs. 5,000
            </span>
          </div>

        </div>

        <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300">
          <strong className="text-cyan-400">
            Demo Mode:
          </strong>{" "}
          Transaction records are simulated. No real money is processed.
        </div>

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950"
        >
          ← Back to Dashboard
        </a>

      </div>
    </main>
  );
}