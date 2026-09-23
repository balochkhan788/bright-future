"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const plans = [
  { name: "G-1", amount: 6000, today: 200, month: 6000 },
  { name: "G-2", amount: 9000, today: 300, month: 9000 },
  { name: "G-3", amount: 12000, today: 400, month: 12000 },
  { name: "G-4", amount: 15000, today: 500, month: 15000 },
  { name: "G-5", amount: 30000, today: 1000, month: 30000 },
  { name: "G-6", amount: 50000, today: 2000, month: 60000 },
  { name: "G-7", amount: 80000, today: 3000, month: 90000 },
];

export default function Plans() {
  const [active, setActive] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getActivePlan();
  }, []);

  async function getActivePlan() {
    setLoading(true);
    setError("");

    const result = await supabase.auth.getUser();
    const user = result.data.user;

    if (!user) {
      setLoading(false);
      setError("Please login first.");
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

    if (response.error) {
      setError(response.error.message);
      setLoading(false);
      return;
    }

    if (response.data) {
      setActive({
        name: response.data.plan_name,
        amount: Number(response.data.amount),
        today: Number(response.data.today_earning),
        month: Number(response.data.month_earning),
      });
    } else {
      setActive(null);
    }

    setLoading(false);
  }

  async function activate(plan: any) {
    setMessage("");
    setError("");

    if (active) {
      setMessage("You already have an active plan.");
      return;
    }

    if (activating) {
      return;
    }

    const result = await supabase.auth.getUser();
    const user = result.data.user;

    if (!user) {
      setError("Please login first.");
      return;
    }

    setActivating(true);

    try {
      /*
        Secure database RPC:

        1. Checks active plan
        2. Checks available balance
        3. Deducts plan amount
        4. Creates active plan
        5. Creates wallet transaction
      */

      const response = await supabase.rpc(
        "activate_user_plan",
        {
          p_plan_name: plan.name,
        }
      );

      if (response.error) {
        throw new Error(response.error.message);
      }

      const data = response.data;

      if (!data || data.success !== true) {
        throw new Error(
          "Plan activation could not be completed."
        );
      }

      setActive({
        name: plan.name,
        amount: Number(plan.amount),
        today: Number(plan.today),
        month: Number(plan.month),
      });

      setMessage(
        `${plan.name} activated successfully. Rs. ${Number(
          plan.amount
        ).toLocaleString()} has been deducted from your available balance.`
      );
    } catch (err) {
      console.error("Plan activation error:", err);

      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unable to activate plan.");
      }
    } finally {
      setActivating(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
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
                    Rs.{" "}
                    {active.amount.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Today Earning
                  </p>

                  <p className="text-xl font-bold text-green-400">
                    Rs.{" "}
                    {active.today.toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-slate-400">
                    Month Earning
                  </p>

                  <p className="text-xl font-bold text-green-400">
                    Rs.{" "}
                    {active.month.toLocaleString()}
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

        {/* AVAILABLE PLANS */}
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

                  const isActive =
                    active &&
                    active.name === plan.name;

                  return (
                    <tr
                      key={plan.name}
                      className="border-t border-white/10 bg-white/5"
                    >

                      <td className="p-4 font-bold text-cyan-400">
                        {plan.name}
                      </td>

                      <td className="p-4">
                        Rs.{" "}
                        {plan.amount.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-400">
                        Rs.{" "}
                        {plan.today.toLocaleString()}
                      </td>

                      <td className="p-4 text-green-400">
                        Rs.{" "}
                        {plan.month.toLocaleString()}
                      </td>

                      <td className="p-4">

                        <button
                          type="button"
                          onClick={function () {
                            activate(plan);
                          }}
                          disabled={
                            active !== null ||
                            activating
                          }
                          className="rounded-lg bg-cyan-500 px-4 py-2 font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-40"
                        >

                          {isActive
                            ? "Active"
                            : activating
                            ? "Activating..."
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

        {/* SUCCESS MESSAGE */}
        {message !== "" && (
          <div className="mt-5 rounded-xl border border-green-400/20 bg-green-400/10 p-4 text-center font-semibold text-green-400">
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error !== "" && (
          <div className="mt-5 rounded-xl border border-red-400/20 bg-red-400/10 p-4 text-center font-semibold text-red-400">
            {error}
          </div>
        )}

        {/* INFORMATION */}
        <div className="mt-8 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4 text-sm text-slate-300">

          <b className="text-yellow-400">
            Plan Information:
          </b>{" "}

          Plan activation requires sufficient available
          balance. The plan amount is deducted when the
          plan is successfully activated.

        </div>

        {/* BACK */}
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