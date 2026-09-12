"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Plan = {
  plan_name: string;
  today_earning: number;
};

export default function TaskPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadTask();
  }, []);

  async function loadTask() {
    setLoading(true);
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    // Active plan
    const planResult = await supabase
      .from("user_plans")
      .select("plan_name, today_earning")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (planResult.error) {
      setMessage(planResult.error.message);
      setLoading(false);
      return;
    }

    if (planResult.data) {
      setPlan({
        plan_name: planResult.data.plan_name,
        today_earning: Number(planResult.data.today_earning),
      });
    }

    // Check today's task
    const now = new Date();

    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");

    const todayDate = year + "-" + month + "-" + day;

    const taskResult = await supabase
      .from("daily_tasks")
      .select("id")
      .eq("user_id", user.id)
      .eq("task_date", todayDate)
      .limit(1);

    if (taskResult.error) {
      setMessage(taskResult.error.message);
    }

    if (
      taskResult.data &&
      taskResult.data.length > 0
    ) {
      setCompleted(true);
    }

    setLoading(false);
  }

  async function completeTask() {
    if (working) {
      return;
    }

    setMessage("");

    if (!plan) {
      setMessage("Please activate a plan first.");
      return;
    }

    if (completed) {
      setMessage("Today's task is already completed.");
      return;
    }

    setWorking(true);

    const result = await supabase.rpc(
      "complete_daily_task"
    );

    if (result.error) {
      setMessage(result.error.message);
      setWorking(false);
      return;
    }

    setCompleted(true);

    const earning = Number(
      result.data?.earning || plan.today_earning
    );

    setMessage(
      "Today's task completed successfully. Rs. " +
        earning.toLocaleString() +
        " has been credited to your wallet."
    );

    setWorking(false);
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-3xl">
          <p>Loading...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-3xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
        </h1>

        <p className="mt-2 text-slate-400">
          Daily Task
        </p>

        {!plan ? (
          <div className="mt-8 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6">

            <h2 className="text-2xl font-bold text-yellow-400">
              No Active Plan
            </h2>

            <p className="mt-3 text-slate-300">
              Please activate a plan before completing
              your daily task.
            </p>

            <a
              href="/plans"
              className="mt-6 inline-block rounded-lg bg-cyan-500 px-6 py-3 font-bold text-slate-950"
            >
              View Plans
            </a>

          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">

            <div className="grid gap-6 md:grid-cols-3">

              <div>
                <p className="text-sm text-slate-400">
                  Active Plan
                </p>

                <p className="mt-2 text-3xl font-bold text-cyan-400">
                  {plan.plan_name}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Daily Earning
                </p>

                <p className="mt-2 text-2xl font-bold text-green-400">
                  Rs. {plan.today_earning.toLocaleString()}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-400">
                  Today&apos;s Status
                </p>

                <p className="mt-2 text-xl font-bold">
                  {completed ? "Completed" : "Available"}
                </p>
              </div>

            </div>

            <button
              onClick={completeTask}
              disabled={completed || working}
              className="mt-8 w-full rounded-xl bg-cyan-500 px-6 py-4 text-lg font-bold text-slate-950 disabled:opacity-40"
            >
              {working
                ? "Processing..."
                : completed
                ? "Today's Task Completed"
                : "Complete Today's Task"}
            </button>

            {message !== "" && (
              <div className="mt-5 rounded-xl bg-cyan-400/10 p-4 text-center text-cyan-300">
                {message}
              </div>
            )}

          </div>
        )}

        <a
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-white/10 px-6 py-3 font-bold"
        >
          ← Back to Dashboard
        </a>

      </div>
    </main>
  );
}