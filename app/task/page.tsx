"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Plan = {
  plan_name: string;
  today_earning: number;
};

type Task = {
  task_number: number;
  completed: boolean;
};

const TASKS_PER_PLAN: Record<string, number> = {
  "G-1": 4,
  "G-2": 6,
  "G-3": 8,
  "G-4": 10,
  "G-5": 20,
  "G-6": 40,
  "G-7": 60,
};

const TASK_EARNING = 50;
const COUNTDOWN_SECONDS = 10;

export default function TaskPage() {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [workingTask, setWorkingTask] = useState<number | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [message, setMessage] = useState("");

  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    loadTasks();

    const refresh = () => {
      if (workingTask === null) {
        loadTasks();
      }
    };

    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);

      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {});
      }
    };
  }, [workingTask]);

  function getAudioContext() {
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as typeof window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;

      if (!AudioContextClass) return null;

      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContextClass();
      }

      return audioContextRef.current;
    } catch {
      return null;
    }
  }

  function playTickSound() {
    try {
      const audioContext = getAudioContext();

      if (!audioContext) return;

      const now = audioContext.currentTime;

      const oscillator = audioContext.createOscillator();
      const gain = audioContext.createGain();

      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(850, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        now + 0.12
      );

      oscillator.connect(gain);
      gain.connect(audioContext.destination);

      oscillator.start(now);
      oscillator.stop(now + 0.12);
    } catch {
      // Ignore audio errors
    }
  }

  function playSuccessSound() {
    try {
      const audioContext = getAudioContext();

      if (!audioContext) return;

      const now = audioContext.currentTime;
      const frequencies = [700, 900, 1150, 1400];

      frequencies.forEach((frequency, index) => {
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();

        const startTime = now + index * 0.12;
        const endTime = startTime + 0.18;

        oscillator.type = "sine";
        oscillator.frequency.setValueAtTime(
          frequency,
          startTime
        );

        gain.gain.setValueAtTime(0.14, startTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          endTime
        );

        oscillator.connect(gain);
        gain.connect(audioContext.destination);

        oscillator.start(startTime);
        oscillator.stop(endTime);
      });
    } catch {
      // Ignore audio errors
    }
  }

  function getPakistanDate() {
    const formatter = new Intl.DateTimeFormat(
      "en-CA",
      {
        timeZone: "Asia/Karachi",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }
    );

    return formatter.format(new Date());
  }

  async function loadTasks() {
    setMessage("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setMessage("Please login first.");
      setLoading(false);
      return;
    }

    const planResult = await supabase
      .from("user_plans")
      .select("plan_name, today_earning, status")
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

    /*
      NO ACTIVE PLAN

      Tasks will remain visible as LOCKED.
      They will automatically become active
      when the user activates a plan.
    */
    if (!planResult.data) {
      setPlan(null);

      const lockedTaskCount = 4;

      setTasks(
        Array.from(
          { length: lockedTaskCount },
          (_, index) => ({
            task_number: index + 1,
            completed: false,
          })
        )
      );

      setLoading(false);
      return;
    }

    const activePlan: Plan = {
      plan_name: planResult.data.plan_name,
      today_earning: Number(
        planResult.data.today_earning
      ),
    };

    setPlan(activePlan);

    const taskCount =
      TASKS_PER_PLAN[activePlan.plan_name] || 0;

    if (taskCount === 0) {
      setTasks([]);
      setLoading(false);
      return;
    }

    const todayDate = getPakistanDate();

    const taskResult = await supabase
      .from("daily_tasks")
      .select("task_number")
      .eq("user_id", user.id)
      .eq("task_date", todayDate)
      .order("task_number", {
        ascending: true,
      });

    if (taskResult.error) {
      setMessage(taskResult.error.message);
      setLoading(false);
      return;
    }

    const completedNumbers = new Set(
      (taskResult.data || []).map(
        (item) => Number(item.task_number)
      )
    );

    const taskList: Task[] = [];

    for (let i = 1; i <= taskCount; i++) {
      taskList.push({
        task_number: i,
        completed: completedNumbers.has(i),
      });
    }

    setTasks(taskList);
    setLoading(false);
  }

  async function completeTask(taskNumber: number) {
    if (workingTask !== null) return;

    setMessage("");

    if (!plan) {
      setMessage(
        "No Plan Active. Please activate a plan first, then your task earnings will start."
      );
      return;
    }

    const selectedTask = tasks.find(
      (task) => task.task_number === taskNumber
    );

    if (!selectedTask) return;

    if (selectedTask.completed) {
      setMessage(
        "This task has already been completed today."
      );
      return;
    }

    const audioContext = getAudioContext();

    if (audioContext) {
      try {
        if (audioContext.state === "suspended") {
          await audioContext.resume();
        }
      } catch {
        // Ignore audio errors
      }
    }

    setWorkingTask(taskNumber);
    setCountdown(COUNTDOWN_SECONDS);

    let remaining = COUNTDOWN_SECONDS;

    playTickSound();

    const timer = window.setInterval(() => {
      remaining -= 1;

      setCountdown(remaining);

      if (remaining > 0) {
        playTickSound();
      }

      if (remaining <= 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    await new Promise((resolve) =>
      window.setTimeout(
        resolve,
        COUNTDOWN_SECONDS * 1000
      )
    );

    window.clearInterval(timer);

    const result = await supabase.rpc(
      "complete_daily_task",
      {
        p_task_number: taskNumber,
      }
    );

    if (result.error) {
      setMessage(result.error.message);
      setWorkingTask(null);
      setCountdown(0);
      return;
    }

    playSuccessSound();

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.task_number === taskNumber
          ? {
              ...task,
              completed: true,
            }
          : task
      )
    );

    setWorkingTask(null);
    setCountdown(0);

    setMessage(
      "Task #" +
        taskNumber +
        " completed successfully. Rs. " +
        TASK_EARNING.toLocaleString() +
        " credited to your wallet."
    );
  }

  const completedCount = tasks.filter(
    (task) => task.completed
  ).length;

  const totalCount = tasks.length;

  const totalEarned =
    completedCount * TASK_EARNING;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-950 p-6 text-white">
        <div className="mx-auto max-w-4xl">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-slate-300">
              Loading Daily Tasks...
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 text-white md:p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="text-center">
          <h1 className="text-4xl font-bold">
            Bright{" "}
            <span className="text-cyan-400">
              Future
            </span>
          </h1>

          <p className="mt-2 text-slate-400">
            Daily Tasks
          </p>
        </div>

        {/* PLAN STATUS */}
        <div className="mt-6 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5 text-center">

          {plan ? (
            <>
              <p className="text-sm text-slate-400">
                Active Plan
              </p>

              <p className="mt-1 text-2xl font-bold text-cyan-400">
                {plan.plan_name}
              </p>

              <p className="mt-2 text-sm text-green-400">
                Your daily tasks are active.
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-yellow-400">
                🔒 No Plan Active
              </p>

              <p className="mt-2 text-sm text-slate-300">
                {totalCount} tasks are available,
                but they are locked until a plan is activated.
              </p>

              <Link
                href="/plans"
                className="mt-4 inline-block rounded-xl bg-cyan-500 px-6 py-3 font-bold text-slate-950"
              >
                Activate Plan
              </Link>
            </>
          )}

        </div>

        {/* TASK SUMMARY */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-5">
            <p className="text-sm text-slate-400">
              Tasks
            </p>

            <p className="mt-2 text-3xl font-bold text-cyan-400">
              {totalCount}
            </p>

            {!plan && (
              <p className="mt-1 text-xs text-yellow-400">
                Locked
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-5">
            <p className="text-sm text-slate-400">
              Tasks Completed
            </p>

            <p className="mt-2 text-3xl font-bold text-green-400">
              {completedCount} / {totalCount}
            </p>
          </div>

          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-5">
            <p className="text-sm text-slate-400">
              Today Earned
            </p>

            <p className="mt-2 text-3xl font-bold text-yellow-400">
              Rs. {totalEarned.toLocaleString()}
            </p>
          </div>

        </div>

        {/* PROGRESS */}
        {plan && (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">

            <div className="mb-3 flex justify-between text-sm">
              <span className="text-slate-400">
                Daily Progress
              </span>

              <span className="font-bold text-cyan-400">
                {completedCount} / {totalCount}
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                style={{
                  width:
                    totalCount === 0
                      ? "0%"
                      : (completedCount /
                          totalCount) *
                          100 +
                        "%",
                }}
              />
            </div>

          </div>
        )}

        {/* TASKS */}
        <div className="mt-8">

          <div className="mb-4 flex items-center justify-between">

            <h2 className="text-2xl font-bold">
              Today&apos;s Tasks
            </h2>

            <span className="rounded-full bg-cyan-400/10 px-4 py-2 text-sm font-bold text-cyan-400">
              Rs. {TASK_EARNING} / Task
            </span>

          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {tasks.map((task) => {

              const isWorking =
                workingTask === task.task_number;

              return (
                <div
                  key={task.task_number}
                  className={
                    "rounded-2xl border p-5 transition " +
                    (
                      task.completed
                        ? "border-green-400/20 bg-green-400/5"
                        : !plan
                        ? "border-white/10 bg-white/5"
                        : isWorking
                        ? "border-yellow-400/30 bg-yellow-400/5"
                        : "border-white/10 bg-white/5 hover:border-cyan-400/30"
                    )
                  }
                >

                  <div className="flex items-center justify-between">

                    <div>
                      <p className="text-sm text-slate-400">
                        Daily Task
                      </p>

                      <h3 className="mt-1 text-2xl font-bold">
                        #{task.task_number}
                      </h3>
                    </div>

                    <div className="text-3xl">
                      {task.completed
                        ? "✅"
                        : !plan
                        ? "🔒"
                        : isWorking
                        ? "⏳"
                        : "🎯"}
                    </div>

                  </div>

                  <div className="mt-5">

                    <p className="text-sm text-slate-400">
                      Task Reward
                    </p>

                    <p className="mt-1 text-2xl font-bold text-green-400">
                      Rs. {TASK_EARNING}
                    </p>

                  </div>

                  {!plan ? (

                    <button
                      type="button"
                      onClick={() =>
                        completeTask(
                          task.task_number
                        )
                      }
                      className="mt-5 w-full cursor-not-allowed rounded-xl bg-white/10 px-4 py-3 font-bold text-slate-500"
                    >
                      🔒 Locked — Activate Plan
                    </button>

                  ) : isWorking ? (

                    <div className="mt-5">

                      <div className="mb-2 flex justify-between text-sm">

                        <span className="text-yellow-400">
                          Completing...
                        </span>

                        <span className="font-bold text-yellow-400">
                          {countdown}s
                        </span>

                      </div>

                      <div className="h-3 overflow-hidden rounded-full bg-slate-800">

                        <div
                          className="h-full rounded-full bg-yellow-400 transition-all duration-1000"
                          style={{
                            width:
                              ((COUNTDOWN_SECONDS -
                                countdown) /
                                COUNTDOWN_SECONDS) *
                                100 +
                              "%",
                          }}
                        />

                      </div>

                    </div>

                  ) : (

                    <button
                      type="button"
                      onClick={() =>
                        completeTask(
                          task.task_number
                        )
                      }
                      disabled={task.completed}
                      className={
                        "mt-5 w-full rounded-xl px-4 py-3 font-bold transition " +
                        (
                          task.completed
                            ? "cursor-not-allowed bg-green-500/20 text-green-400"
                            : "bg-cyan-500 text-slate-950 hover:scale-[1.02]"
                        )
                      }
                    >

                      {task.completed
                        ? "✓ Completed"
                        : "Start Task"}

                    </button>

                  )}

                </div>
              );
            })}

          </div>
        </div>

        {/* MESSAGE */}
        {message !== "" && (
          <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-4 text-center text-cyan-300">
            {message}
          </div>
        )}

        {/* ALL COMPLETE */}
        {plan &&
          completedCount === totalCount &&
          totalCount > 0 && (

            <div className="mt-6 rounded-2xl border border-green-400/20 bg-green-400/10 p-6 text-center">

              <div className="text-4xl">
                🎉
              </div>

              <h2 className="mt-3 text-2xl font-bold text-green-400">
                All Daily Tasks Completed
              </h2>

              <p className="mt-2 text-slate-300">
                Today&apos;s total task earning:
                {" "}
                <b className="text-green-400">
                  Rs.{" "}
                  {totalEarned.toLocaleString()}
                </b>
              </p>

            </div>
          )}

        {/* BACK */}
        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-xl bg-white/10 px-6 py-3 font-bold hover:bg-white/20"
        >
          ← Back to Dashboard
        </Link>

      </div>
    </main>
  );
}