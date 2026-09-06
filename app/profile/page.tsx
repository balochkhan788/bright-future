export default function Profile() {
  return (
    <main className="min-h-screen bg-slate-950 p-8 text-white">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <h2 className="mt-10 text-3xl font-bold">Profile</h2>

        <div className="mt-6 rounded-xl bg-white/10 p-6">
          <p className="text-slate-400">Full Name</p>
          <p className="mt-1 text-xl font-semibold">Demo User</p>

          <p className="mt-6 text-slate-400">Email</p>
          <p className="mt-1 text-xl font-semibold">demo@example.com</p>

          <p className="mt-6 text-slate-400">Account Type</p>
          <p className="mt-1 text-xl font-semibold text-cyan-400">
            Demo Account
          </p>
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