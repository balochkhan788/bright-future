"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const rewards = [
  "Rs. 200",
  "Rs. 400",
  "Rs. 600",
  "Rs. 800",
  "Rs. 1,200",
  "Rs. 1,500",
  "Rs. 2,000",
];

const colors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
];

const eligiblePlans = ["G-3", "G-4", "G-5", "G-6", "G-7"];

export default function SpinWheelPage() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState("");
  const [message, setMessage] = useState("");
  const [checkingPlan, setCheckingPlan] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const [planName, setPlanName] = useState("");

  useEffect(() => {
    checkPlan();
  }, []);

  async function checkPlan() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      window.location.href = "/login";
      return;
    }

    const { data, error } = await supabase
      .from("user_plans")
      .select("plan_name, status, created_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      setAllowed(false);
      setCheckingPlan(false);
      return;
    }

    const currentPlan = String(data.plan_name).trim().toUpperCase();

    setPlanName(currentPlan);
    setAllowed(eligiblePlans.includes(currentPlan));
    setCheckingPlan(false);
  }

  async function spin() {
    if (spinning || !allowed) return;

    setWinner("");
    setMessage("");
    setSpinning(true);

    const { data, error } = await supabase.rpc("spin_wheel_now");

    if (error) {
      setSpinning(false);
      setMessage(error.message);
      return;
    }

    const index = Number(data.index);
    const reward = data.reward;

    const newRotation =
      rotation + 1800 + (360 - index * 45 - 22.5);

    setRotation(newRotation);

    setTimeout(function () {
      setWinner(reward);
      setSpinning(false);
    }, 4000);
  }

  const wheelTransform =
    "rotate(" + rotation + "deg)";

  const wheelBackground =
    "conic-gradient(" +
    colors[0] + " 0deg 51.43deg, " +
    colors[1] + " 51.43deg 102.86deg, " +
    colors[2] + " 102.86deg 154.29deg, " +
    colors[3] + " 154.29deg 205.72deg, " +
    colors[4] + " 205.72deg 257.15deg, " +
    colors[5] + " 257.15deg 308.58deg, " +
    colors[6] + " 308.58deg 360deg)";

  if (checkingPlan) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-md">
          <h1 className="text-center text-3xl font-bold">
            Bright Future
          </h1>

          <p className="mt-10 text-center text-slate-400">
            Checking your plan...
          </p>
        </div>
      </main>
    );
  }

  if (!allowed) {
    return (
      <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">
        <div className="mx-auto max-w-md">
          <h1 className="text-center text-3xl font-bold">
            Bright Future
          </h1>

          <p className="mt-2 text-center text-slate-400">
            Spin & Win
          </p>

          <div className="mt-10 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 p-6 text-center">
            <p className="text-xl font-bold text-yellow-300">
              Spin Wheel Available for G-3 to G-7
            </p>

            <p className="mt-3 text-slate-300">
              Your current plan: {planName || "No Active Plan"}
            </p>

            <p className="mt-3 text-sm text-slate-400">
              Upgrade to an eligible plan to use Spin Wheel.
            </p>
          </div>

          <a
            href="/dashboard"
            className="mt-6 block text-center text-slate-400"
          >
            ← Back to Dashboard
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">

      <div className="mx-auto max-w-md">

        <h1 className="text-center text-3xl font-bold">
          Bright Future
        </h1>

        <p className="mt-2 text-center text-slate-400">
          Spin & Win
        </p>

        <p className="mt-2 text-center text-sm text-cyan-400">
          Active Plan: {planName}
        </p>

        <div className="relative mx-auto mt-10 h-80 w-80">

          {/* Pointer */}
          <div className="absolute left-1/2 top-[-8px] z-30 -translate-x-1/2">
            <div
              className="h-0 w-0"
              style={{
                borderLeft: "15px solid transparent",
                borderRight: "15px solid transparent",
                borderTop: "30px solid white",
              }}
            />
          </div>

          {/* Wheel */}
          <div
            className="relative h-80 w-80 rounded-full border-8 border-white shadow-2xl"
            style={{
              transform: wheelTransform,
              transition: spinning
                ? "transform 4s cubic-bezier(0.12, 0.8, 0.2, 1)"
                : "none",
              background: wheelBackground,
            }}
          >

            {/* Amounts inside wheel */}
            {rewards.map(function (amount, index) {

              const angle =
                index * (360 / rewards.length) +
                (180 / rewards.length);

              const amountTransform =
                "translate(-50%, -50%) " +
                "rotate(" + angle + "deg) " +
                "translateY(-92px)";

              const textTransform =
                "rotate(-" + angle + "deg)";

              return (
                <div
                  key={amount}
                  className="absolute left-1/2 top-1/2"
                  style={{
                    transform: amountTransform,
                  }}
                >

                  <div
                    className="flex h-10 w-20 items-center justify-center rounded-lg bg-black/20 text-center text-xs font-extrabold text-white"
                    style={{
                      transform: textTransform,
                    }}
                  >
                    {amount}
                  </div>

                </div>
              );
            })}

            {/* Center */}
            <div className="absolute left-1/2 top-1/2 z-20 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-4 border-white bg-slate-950 text-sm font-bold shadow-xl">
              SPIN
            </div>

          </div>
        </div>

        {/* Error / Message */}
        {message && (
          <div className="mt-6 rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-center text-red-300">
            {message}
          </div>
        )}

        {/* Spin Button */}
        <button
          onClick={spin}
          disabled={spinning}
          className="mt-10 w-full rounded-xl bg-cyan-400 py-4 text-lg font-bold text-slate-950 disabled:opacity-50"
        >
          {spinning ? "Spinning..." : "SPIN NOW"}
        </button>

        {/* Winner */}
        {winner && (
          <div className="mt-6 rounded-2xl border border-green-400/30 bg-green-400/10 p-5 text-center">

            <p className="text-sm text-slate-400">
              Congratulations!
            </p>

            <p className="mt-2 text-4xl font-bold text-green-400">
              {winner}
            </p>

            <p className="mt-2 text-sm text-green-300">
              Reward added to your available balance.
            </p>

          </div>
        )}

        <a
          href="/dashboard"
          className="mt-6 block text-center text-slate-400"
        >
          ← Back to Dashboard
        </a>

      </div>
    </main>
  );
}

ابھی صرف یہ code save کریں۔ GitHub push نہ کریں۔

Save کرنے کے بعد مجھے Done لکھ دیں۔ پھر ہم پہلے local/build error check کریں گے، اس کے بعد ہی push کریں گے۔