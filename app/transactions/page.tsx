export default function Transactions() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-4xl">
        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <h2 className="mt-10 text-3xl font-bold">
          Transaction History
        </h2>

        <p className="mt-2 text-slate-400">
          Demo transaction records
        </p>

        <div className="mt-8 rounded-xl border border-white/10 bg-white/5 p-5">
          <div className="flex justify-between border-b border-white/10 py-4">
            <span>Deposit</span>
            <span className="text-green-400">Rs. 9,000</span>
          </div>

          <div className="flex justify-between py-4">
            <span>Withdrawal</span>
            <span className="text-yellow-400">Rs. 5,000</span>
          </div>
        </div>

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950"
        >
          Back to Dashboard
        </a>
      </div>
    </main>
  );
}