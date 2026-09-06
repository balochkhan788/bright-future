export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
          <h1 className="text-2xl font-bold">
            Bright <span className="text-cyan-400">Future</span>
          </h1>

          <div className="flex gap-3">
            <a
              href="/login"
              className="rounded-lg border border-white/20 px-5 py-2 hover:bg-white/10"
            >
              Login
            </a>

            <a
              href="/signup"
              className="rounded-lg bg-cyan-500 px-5 py-2 font-semibold text-slate-950"
            >
              Sign Up
            </a>
          </div>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-24 text-center">
        <p className="mb-4 font-semibold uppercase tracking-widest text-cyan-400">
          Bright Future
        </p>

        <h2 className="text-4xl font-extrabold sm:text-6xl">
          Build Your Future,
          <span className="block text-cyan-400">One Step at a Time.</span>
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300">
          Explore investment simulations, track your virtual balance,
          and learn how different plans could perform over time.
        </p>

        <div className="mt-10 flex justify-center gap-4">
          <a
            href="/signup"
            className="rounded-xl bg-cyan-500 px-8 py-3 font-bold text-slate-950"
          >
            Get Started
          </a>

          <a
            href="/login"
            className="rounded-xl border border-white/20 px-8 py-3 font-bold"
          >
            Login
          </a>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-6 pb-20 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="mb-4 text-3xl">📊</div>
          <h3 className="text-xl font-bold">Track Performance</h3>
          <p className="mt-3 text-slate-400">
            View your simulated balance and performance in one simple dashboard.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="mb-4 text-3xl">💡</div>
          <h3 className="text-xl font-bold">Explore Plans</h3>
          <p className="mt-3 text-slate-400">
            Compare different example plans and understand potential outcomes.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-7">
            <div className="mb-4 text-3xl">🔒</div>
            <h3 className="text-xl font-bold">Simple & Secure</h3>
            <p className="mt-3 text-slate-400">
              A clean interface for financial learning and simulation.
            </p>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 py-6 text-center text-sm text-slate-500">
        © 2026 Bright Future — Demo Platform
      </footer>
    </main>
  );
}