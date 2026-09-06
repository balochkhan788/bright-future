export default function Dashboard() {
  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bright <span className="text-cyan-400">Future</span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Demo Investment Dashboard
            </p>
          </div>

          <a
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm"
          >
            Logout
          </a>
        </div>

        <div className="mt-10">
          <h2 className="text-3xl font-bold">
            Welcome, Demo User 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your demo account from one place.
          </p>
        </div>

        <div className="mt-8 grid gap-5 md:grid-cols-3">

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Demo Balance</p>
            <p className="mt-3 text-3xl font-bold">Rs. 50,000</p>
            <p className="mt-2 text-sm text-green-400">
              Available Balance
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Virtual Profit</p>
            <p className="mt-3 text-3xl font-bold text-green-400">
              Rs. 2,500
            </p>
            <p className="mt-2 text-sm text-slate-400">
              Demo earnings
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Current Plan</p>
            <p className="mt-3 text-3xl font-bold text-cyan-400">
              Demo Plan
            </p>
            <p className="mt-2 text-sm text-slate-400">Active</p>
          </div>

        </div>

        <div className="mt-10">
          <h3 className="text-xl font-bold">Quick Actions</h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

            <a
              href="/plans"
              className="rounded-xl bg-cyan-500 p-5 text-center font-bold text-slate-950"
            >
              View Plans
            </a>

            <a
              href="/profile"
              className="rounded-xl border border-cyan-400 p-5 text-center font-bold text-cyan-400"
            >
              My Profile
            </a>

            <a
              href="/deposit"
              className="rounded-xl border border-green-400 p-5 text-center font-bold text-green-400"
            >
              Demo Deposit
            </a>

            <a
              href="/withdraw"
              className="rounded-xl border border-yellow-400 p-5 text-center font-bold text-yellow-400"
            >
              Withdraw
            </a>

            <a
              href="/transactions"
              className="rounded-xl border border-purple-400 p-5 text-center font-bold text-purple-400"
            >
              Transactions
            </a>

          </div>
        </div>

        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
          <h3 className="text-xl font-bold">
            Recent Activity
          </h3>

          <div className="mt-5 space-y-4">

            <div className="flex justify-between border-b border-white/10 pb-4">
              <span>Demo Deposit</span>
              <span className="font-bold text-green-400">
                + Rs. 9,000
              </span>
            </div>

            <div className="flex justify-between">
              <span>Demo Withdrawal</span>
              <span className="font-bold text-yellow-400">
                - Rs. 5,000
              </span>
            </div>

          </div>
        </div>

        <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300">
          <strong className="text-cyan-400">Demo Mode:</strong>{" "}
          This application is a simulation. No real money is processed.
        </div>

      </div>
    </main>
  );
}