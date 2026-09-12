"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const plans = [
  {
    name: "G-1",
    amount: 6000,
    today: 200,
    month: 6000,
  },
  {
    name: "G-2",
    amount: 9000,
    today: 3000,
    month: 90000,
  },
  {
    name: "G-3",
    amount: 12000,
    today: 400,
    month: 12000,
  },
  {
    name: "G-4",
    amount: 15000,
    today: 500,
    month: 15000,
  },
  {
    name: "G-5",
    amount: 30000,
    today: 1000,
    month: 300000,
  },
  {
    name: "G-6",
    amount: 50000,
    today: 2000,
    month: 60000,
  },
  {
    name: "G-7",
    amount: 80000,
    today: 3000,
    month: 90000,
  },
];

export default function Plans() {
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    getActivePlan();
  }, []);

  async function getActivePlan() {
    const result = await supabase.auth.getUser();
    const user = result.data.user;

    if (!user) {
      setLoading(false);
      return;
    }

    const response = await supabase
      .from("user_plans")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (response.data) {
      setActive({
        name: response.data.plan_name,
        amount: Number(response.data.amount),
        today: Number(response.data.today_earning),
        month: Number(response.data.month_earning),
      });
    }

    setLoading(false);
  }

  async function activate(plan: any) {
    setMessage("");

    if (active) {
      setMessage("You already have an active plan.");
      return;
    }

    const result = await supabase.auth.getUser();
    const user = result.data.user;

    if (!user) {
      setMessage("Please login first.");
      return;
    }

    const response = await supabase.from("user_plans").insert({
      user_id: user.id,
      plan_name: plan.name,
      amount: plan.amount,
      today_earning: plan.today,
      month_earning: plan.month,
      status: "active",
    });

    if (response.error) {
      setMessage(response.error.message);
      return;
    }

    setActive(plan);
    setMessage(plan.name + " activated successfully.");
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">

      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          Bright <span className="text-cyan-400">Future</span>
        </h1>

        <p className="mt-2 text-slate-400">
          Investment Plans
        </p>

        {/* ACTIVE PLAN */}

        <div className="mt-8">

          <h2 className="mb-4 text-2xl font-bold">
            Active Plan
          </h2>

          {loading ? (
            <div className="rounded-xl bg-white/5 p-6">
              Loading...
            </div>
          ) : active ? (
            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-6">

              <div className="grid gap-5 md:grid-cols-4">

                <div>
                  <p className="text-sm text-slate-400">
                    Plan
                  </p>

                  <p className="text-3xl font-bold text-cyan-400">
                    {active.name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Amount
                  </p>

                  <p className="text-xl font-bold">
                    Rs. {active.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Today Earning
                  </p>

                  <p className="text-xl font-bold text-green-400">
                    Rs. {active.today.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Month Earning
                  </p>

                  <p className="text-xl font-bold text-green-400">
                    Rs. {active.month.toLocaleString()}
                  </p>
                </div>

              </div>

            </div>
          ) : (
            <div className="rounded-xl bg-white/5 p-6 text-slate-400">
              No Active Plan
            </div>
          )}

        </div>

        {/* PLANS TABLE */}

        <div className="mt-10">

          <h2 className="mb-2 text-2xl font-bold">
            Available Plans
          </h2>

          <p className="mb-5 text-slate-400">
            Choose your plan.
          </p>

          <div className="overflow-x-auto rounded-2xl border border-white/10">

            <table className="w-full min-w-[700px]">

              <thead className="bg-cyan-500 text-left text-slate-950">

                <tr>

                  <th className="p-4">
                    Plan
                  </th>

                  <th className="p-4">
                    Amount
                  </th>

                  <th className="p-4">
                    Today Earning
                  </th>

                  <th className="p-4">
                    Month Earning
                  </th>

                  <th className="p-4">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {plans.map(function (plan) {

                  return (
                    <tr
                      key={plan.name}
                      className="border-t border-white/10 bg-white/5"
                    >

                      <td className="p-4 font-bold text-cyan-400">
                        {plan.name}
                      </td>

                      <td className="p-4">
                        Rs. {plan.amount.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-400">
                        Rs. {plan.today.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-400">
                        Rs. {plan.month.toLocaleString()}
                      </td>

                      <td className="p-4">

                        <button
                          onClick={function () {
                            activate(plan);
                          }}
                          disabled={active !== null}
                          className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-slate-950 disabled:opacity-40"
                        >
                          {active && active.name === plan.name
                            ? "Active"
                            : "Activate"}
                        </button>

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

        </div>

        {/* MESSAGE */}

        {message !== "" && (
          <div className="mt-5 rounded-xl bg-cyan-400/10 p-4 text-center text-cyan-300">
            {message}
          </div>
        )}

        {/* NOTICE */}

        <div className="mt-8 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-slate-300">

          <b className="text-yellow-400">
            Plan Information:
          </b>{" "}
          Plan figures are displayed for account planning. This page does not
          automatically add earnings to the wallet.

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