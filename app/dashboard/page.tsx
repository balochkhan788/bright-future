"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Slide = {
  title1: string;
  title2: string;
  description: string;
};

const slideImages = [
  "/slide/1.jpg",
  "/slide/2.jpg",
  "/slide/3.jpg",
  "/slide/4.jpg",
  "/slide/5.jpg",
  "/slide/6.jpg",
];

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

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);

  const [planName, setPlanName] = useState("No Active Plan");

  const [dailyTaskTotal, setDailyTaskTotal] = useState(0);
  const [dailyTaskCompleted, setDailyTaskCompleted] =
    useState(0);

  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  const [installPrompt, setInstallPrompt] =
    useState<any>(null);

  const slides: Slide[] = [
    {
      title1: "Manage Your",
      title2: "Investments & Earnings",
      description:
        "Track your account activity, balance and earnings.",
    },
    {
      title1: "Track Your",
      title2: "Account Balance",
      description:
        "View your available, locked and earned balance.",
    },
    {
      title1: "Explore Your",
      title2: "Rewards & Tasks",
      description:
        "Access available tasks, rewards and referral features.",
    },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide(
        (prev) => (prev + 1) % slideImages.length
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const handler = (event: any) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handler
    );

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handler
      );
    };
  }, []);

  async function installApp() {
    if (installPrompt) {
      installPrompt.prompt();

      const result =
        await installPrompt.userChoice;

      if (result.outcome === "accepted") {
        setInstallPrompt(null);
      }

      return;
    }

    alert(
      "Install option is not available right now. Please use Chrome menu to install Bright Future."
    );
  }

  async function loadDashboard() {
    try {
      setLoading(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      const name =
        user.user_metadata?.full_name ||
        user.email?.split("@")[0] ||
        "User";

      setUserName(name);

      // WALLET
      const { data: wallet } =
        await supabase
          .from("wallets")
          .select(
            "available_balance, locked_balance"
          )
          .eq("user_id", user.id)
          .maybeSingle();

      if (wallet) {
        setBalance(
          Number(
            wallet.available_balance || 0
          )
        );

        setLockedBalance(
          Number(
            wallet.locked_balance || 0
          )
        );
      }

      // ACTIVE PLAN
      const { data: plan } =
        await supabase
          .from("user_plans")
          .select("plan_name")
          .eq("user_id", user.id)
          .eq("status", "active")
          .order("created_at", {
            ascending: false,
          })
          .limit(1)
          .maybeSingle();

      if (plan) {
        const activePlan =
          plan.plan_name || "Active Plan";

        setPlanName(activePlan);

        const taskCount =
          TASKS_PER_PLAN[activePlan] || 0;

        setDailyTaskTotal(taskCount);

        // TODAY'S TASKS
        const now = new Date();

        const year =
          now.getFullYear();

        const month = String(
          now.getMonth() + 1
        ).padStart(2, "0");

        const day = String(
          now.getDate()
        ).padStart(2, "0");

        const todayDate =
          year +
          "-" +
          month +
          "-" +
          day;

        const { data: taskData } =
          await supabase
            .from("daily_tasks")
            .select("task_number")
            .eq("user_id", user.id)
            .eq(
              "task_date",
              todayDate
            );

        const completedTasks =
          taskData?.length || 0;

        setDailyTaskCompleted(
          completedTasks
        );
      } else {
        setDailyTaskTotal(0);
        setDailyTaskCompleted(0);
      }

      // WITHDRAWALS
      const { data: withdrawals } =
        await supabase
          .from("withdrawals")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "approved");

      const withdrawalTotal =
        withdrawals?.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        ) || 0;

      setTotalWithdrawal(
        withdrawalTotal
      );

      // EARNINGS
      const { data: earnings } =
        await supabase
          .from("earnings")
          .select(
            "amount, created_at"
          )
          .eq("user_id", user.id);

      const allEarnings =
        earnings?.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        ) || 0;

      setTotalEarnings(
        allEarnings
      );

      const today =
        new Date()
          .toISOString()
          .split("T")[0];

      const todayTotal =
        earnings
          ?.filter((item) =>
            item.created_at?.startsWith(
              today
            )
          )
          .reduce(
            (sum, item) =>
              sum +
              Number(
                item.amount || 0
              ),
            0
          ) || 0;

      setTodayEarnings(
        todayTotal
      );

      // REFERRAL BONUS
      const { data: rewards } =
        await supabase
          .from("referral_rewards")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "approved");

      const approvedRewards =
        rewards?.reduce(
          (sum, item) =>
            sum +
            Number(
              item.amount || 0
            ),
          0
        ) || 0;

      setReferralBonus(
        approvedRewards
      );
    } catch (error) {
      console.error(
        "Dashboard error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  const taskProgress =
    dailyTaskTotal > 0
      ? Math.round(
          (dailyTaskCompleted /
            dailyTaskTotal) *
            100
        )
      : 0;

  const taskEarned =
    dailyTaskCompleted *
    TASK_EARNING;

  if (loading) {
    return (
      <main className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow p-6 text-center">
          <p className="text-lg font-semibold text-slate-700">
            Loading Dashboard...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-100">

      <header className="bg-white border-b shadow-sm">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">

          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800">
              Bright Future
            </h1>

            <p className="text-xs sm:text-sm text-slate-500">
              Dashboard
            </p>
          </div>

          <button
            onClick={async () => {
              await supabase.auth.signOut();
              window.location.href =
                "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>

        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">

        {/* SLIDESHOW */}
        <section className="bg-white rounded-2xl shadow-lg overflow-hidden">

          <div className="relative w-full h-56 sm:h-72 md:h-80">

            <img
              src={slideImages[slide]}
              alt={
                "Bright Future Slide " +
                (slide + 1)
              }
              className="w-full h-full object-cover"
            />

            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">

              {slideImages.map(
                (_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() =>
                      setSlide(index)
                    }
                    aria-label={
                      "Slide " +
                      (index + 1)
                    }
                    className={
                      slide === index
                        ? "h-3 w-8 rounded-full bg-white shadow"
                        : "h-3 w-3 rounded-full bg-white/60"
                    }
                  />
                )
              )}

            </div>

          </div>

        </section>

        {/* WELCOME */}
        <section className="bg-white rounded-2xl shadow p-5">

          <p className="text-sm text-slate-500">
            Welcome back
          </p>

          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            {userName}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Manage your account and view
            your latest activity.
          </p>

        </section>

        {/* ACCOUNT SUMMARY */}
        <section>

          <h2 className="text-lg font-bold text-slate-800 mb-3">
            Account Summary
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Available Balance
              </p>

              <p className="text-xl font-bold text-green-600 mt-2">
                Rs {balance.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Earned Balance
              </p>

              <p className="text-xl font-bold text-blue-600 mt-2">
                Rs{" "}
                {totalEarnings.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Locked Balance
              </p>

              <p className="text-xl font-bold text-orange-500 mt-2">
                Rs{" "}
                {lockedBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Total Withdrawal
              </p>

              <p className="text-xl font-bold text-purple-600 mt-2">
                Rs{" "}
                {totalWithdrawal.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Current Plan
              </p>

              <p className="text-lg font-bold text-slate-800 mt-2">
                {planName}
              </p>
            </div>

          </div>

        </section>

        {/* DAILY TASK PROGRESS */}
        <section className="bg-white rounded-2xl shadow p-5">

          <div className="flex items-center justify-between gap-3">

            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Daily Task
              </h2>

              <p className="text-sm text-slate-500 mt-1">
                Complete your daily tasks and earn Rs 50 per task.
              </p>
            </div>

            <div className="text-3xl">
              🎯
            </div>

          </div>

          {dailyTaskTotal > 0 ? (
            <>

              <div className="mt-5 grid grid-cols-2 md:grid-cols-3 gap-3">

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Completed
                  </p>

                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {dailyTaskCompleted} /{" "}
                    {dailyTaskTotal}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">
                    Progress
                  </p>

                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {taskProgress}%
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-4 col-span-2 md:col-span-1">
                  <p className="text-xs text-slate-500">
                    Task Earned
                  </p>

                  <p className="text-2xl font-bold text-green-600 mt-1">
                    Rs{" "}
                    {taskEarned.toLocaleString()}
                  </p>
                </div>

              </div>

              <div className="mt-5">

                <div className="flex justify-between text-xs mb-2">
                  <span className="text-slate-500">
                    Daily Progress
                  </span>

                  <span className="font-bold text-blue-600">
                    {dailyTaskCompleted}/
                    {dailyTaskTotal}
                  </span>
                </div>

                <div className="h-3 rounded-full bg-slate-200 overflow-hidden">

                  <div
                    className="h-full rounded-full bg-blue-600 transition-all duration-500"
                    style={{
                      width:
                        taskProgress + "%",
                    }}
                  />

                </div>

              </div>
<button
  type="button"
  onClick={() => {
    window.location.href = "/task";
  }}
  className="mt-5 block w-full rounded-xl bg-indigo-600 text-white p-4 text-center font-bold shadow-md hover:scale-[1.01] transition"
>
  🎯 Open Daily Tasks
</button>
            </>
          ) : (
            <div className="mt-5 rounded-xl bg-yellow-50 border border-yellow-200 p-4">

              <p className="font-semibold text-yellow-800">
                No Active Plan
              </p>

              <p className="text-sm text-yellow-700 mt-1">
                Activate a plan to access Daily Tasks.
              </p>

              <Link
                href="/plans"
                className="mt-3 inline-block rounded-lg bg-blue-600 text-white px-5 py-2 font-semibold"
              >
                View Plans
              </Link>

            </div>
          )}

        </section>

        {/* EARNINGS OVERVIEW */}
        <section>

          <h2 className="text-lg font-bold text-slate-800 mb-3">
            Earnings Overview
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Available Bonus
              </p>

              <p className="text-xl font-bold text-green-600 mt-2">
                Rs{" "}
                {referralBonus.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Today&apos;s Earnings
              </p>

              <p className="text-xl font-bold text-blue-600 mt-2">
                Rs{" "}
                {todayEarnings.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Total Earnings
              </p>

              <p className="text-xl font-bold text-indigo-600 mt-2">
                Rs{" "}
                {totalEarnings.toLocaleString()}
              </p>
            </div>

          </div>

        </section>

        {/* QUICK ACTIONS */}
<section>

  <h2 className="text-lg font-bold text-slate-800 mb-3">
    Quick Actions
  </h2>

  <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">

    <Link
      href="/plans"
      className="bg-blue-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        📋
      </div>
      Plans
    </Link>

    <Link
      href="/deposit"
      className="bg-green-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        💰
      </div>
      Deposit
    </Link>

    <Link
      href="/withdraw"
      className="bg-orange-500 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        💸
      </div>
      Withdraw
    </Link>

    <Link
      href="/transactions"
      className="bg-purple-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        📊
      </div>
      Transactions
    </Link>

    <Link
      href="/task"
      className="bg-indigo-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        🎯
      </div>
      Daily Task
    </Link>

    <Link
      href="/referral"
      className="bg-pink-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        👥
      </div>
      Referral
    </Link>

    <Link
      href="/referral-rewards"
      className="bg-rose-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        🎁
      </div>
      Referral Rewards
    </Link>

    <Link
      href="/spin-wheel"
      className="bg-cyan-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        🎡
      </div>
      Spin Wheel
    </Link>

    <Link
      href="/profile"
      className="bg-slate-700 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        👤
      </div>
      Profile
    </Link>
<Link
  href="/rules"
  className="bg-slate-800 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
>
  <div className="text-3xl mb-2">
    📋
  </div>
  Rules
</Link>
    <Link
      href="/support-partner"
      className="bg-teal-600 text-white rounded-xl p-4 text-center font-semibold shadow-md hover:scale-105 transition"
    >
      <div className="text-3xl mb-2">
        🤝
      </div>
      Support Partner
    </Link>

    <button
      type="button"
      onClick={installApp}
      className="col-span-2 lg:col-span-4 w-full rounded-xl bg-cyan-500 p-4 font-bold text-slate-950 shadow-lg hover:scale-[1.02] transition cursor-pointer"
    >
      <div className="text-3xl mb-1">
        📲
      </div>
      Install Bright Future App
    </button>

  </div>

</section>

        {/* ACCOUNT INFORMATION */}
        <section className="bg-white rounded-2xl shadow p-5">

          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Account Information
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">
                Current Plan
              </span>

              <span className="font-semibold text-slate-800">
                {planName}
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">
                Available Balance
              </span>

              <span className="font-semibold text-green-600">
                Rs{" "}
                {balance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Total Earnings
              </span>

              <span className="font-semibold text-blue-600">
                Rs{" "}
                {totalEarnings.toLocaleString()}
              </span>
            </div>

          </div>

        </section>

        {/* NOTICE */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">

          <h2 className="font-bold text-yellow-800">
            Important Notice
          </h2>

          <p className="text-sm text-yellow-700 mt-2">
            Please review your account activity and transaction information regularly.
          </p>

        </section>

      </div>
    </main>
  );
}