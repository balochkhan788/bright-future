"use client";

import { useState } from "react";

const rewards = [
  "Rs. 200",
  "Rs. 400",
  "Rs. 600",
  "Rs. 800",
  "Rs. 1000",
  "Rs. 1200",
  "Rs. 1400",
  "Rs. 1600",
];

const colors = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
];

export default function SpinWheelPage() {
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [winner, setWinner] = useState("");

  function spin() {
    if (spinning) return;

    const index = Math.floor(Math.random() * rewards.length);
    const newRotation =
      rotation + 1800 + (360 - index * 45 - 22.5);

    setWinner("");
    setSpinning(true);
    setRotation(newRotation);

    setTimeout(function () {
      setWinner(rewards[index]);
      setSpinning(false);
    }, 4000);
  }

  const wheelTransform =
    "rotate(" + rotation + "deg)";

  const wheelBackground =
    "conic-gradient(" +
    colors[0] + " 0deg 45deg, " +
    colors[1] + " 45deg 90deg, " +
    colors[2] + " 90deg 135deg, " +
    colors[3] + " 135deg 180deg, " +
    colors[4] + " 180deg 225deg, " +
    colors[5] + " 225deg 270deg, " +
    colors[6] + " 270deg 315deg, " +
    colors[7] + " 315deg 360deg)";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-white">

      <div className="mx-auto max-w-md">

        <h1 className="text-center text-3xl font-bold">
          Bright Future
        </h1>

        <p className="mt-2 text-center text-slate-400">
          Spin & Win
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

              const angle = index * 45 + 22.5;

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