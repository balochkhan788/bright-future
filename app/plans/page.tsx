"use client";

import { useState } from "react";

export default function Plans() {
  const [selectedPlan, setSelectedPlan] = useState("");

  const plans = [
    {
      name: "Starter",
      amount: "Rs. 9,000",
      description: "Basic demo plan",
    },
    {
      name: "Growth",
      amount: "Rs. 12,000",
      description: "Standard demo plan",
    },
    {
      name: "Premium",
      amount: "Rs. 15,000",
      description: "Advanced demo plan",
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-5xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <div className="mt-10">
          <h2 className="text-3xl font-bold">
            Choose a Demo Plan
          </h2>

          <p className="mt-2 text-slate-400">
            Select a plan for simulation purposes.
          </p>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-3">

          {plans.map((plan) => (
            <div
              key={plan.name}
              className="rounded-2xl border border-white/10 bg-white/5 p-6"
            >
              <h3 className="text-2xl font-bold">
                {plan.name}
              </h3>

              <p className="mt-3 text-slate-400">
                {plan.description}
              </p>

              <p className="mt-5 text-3xl font-bold text-cyan-400">
                {plan.amount}
              </p>

              <button
                onClick={() => setSelectedPlan(plan.name)}
                className="mt-6 w-full rounded-lg bg-cyan-500 px-5 py-3 font-bold text-slate-950 hover:bg-cyan-400"
              >
                Select Plan
              </button>

              {selectedPlan === plan.name && (
                <p className="mt-4 text-center text-sm text-green-400">
                  {plan.name} selected successfully!
                </p>
              )}
            </div>
          ))}

        </div>

        <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300">
          <strong className="text-cyan-400">
            Demo Mode:
          </strong>{" "}
          These plans are for simulation only. No real money is processed.
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