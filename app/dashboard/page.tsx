"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);

  const [referralBonus, setReferralBonus] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  const [currentPlan, setCurrentPlan] = useState("");

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    getDashboardData();
  }, []);

  async function getDashboardData() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      setUserName(user.email?.split("@")[0] || "User");

      const { data: wallet } = await supabase
        .from("wallets")
        .select("available_balance, locked_balance")
        .eq("user_id", user.id)
        .single();

      if (wallet) {
        setBalance(Number(wallet.available_balance || 0));
        setLockedBalance(Number(wallet.locked_balance || 0));
      }

      const { data: activePlan } = await supabase
        .from("user_plans")
        .select("plan_name")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activePlan) {
        setCurrentPlan(activePlan.plan_name);
      }

      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (withdrawals) {
        setTotalWithdrawal(
          withdrawals.reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          )
        );
      }

      const { data: earnings } = await supabase
        .from("earnings")
        .select("amount, earning_type, created_at")
        .eq("user_id", user.id);

      if (earnings) {
        const total = earnings.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

        setTotalEarnings(total);

        const today = new Date();

        const todayTotal = earnings
          .filter((item) => {
            const earningDate = new Date(item.created_at);

            return (
              earningDate.getFullYear() === today.getFullYear() &&
              earningDate.getMonth() === today.getMonth() &&
              earningDate.getDate() === today.getDate()
            );
          })
          .reduce(
            (sum, item) => sum + Number(item.amount || 0),
            0
          );

        setTodayEarnings(todayTotal);
      }

      const { data: referralRewards } = await supabase
        .from("referral_rewards")
        .select("amount, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (referralRewards) {
        const referralTotal = referralRewards.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

        setReferralBonus(referralTotal);
      }
    } catch (error) {
      console.log("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

  const money = (value: number) =>
    "Rs. " + value.toLocaleString();

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-950 px-3 py-4 text-white sm:px-5 sm:py-6">
      <div className="mx-auto w-full max-w-7xl">

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold sm:text-3xl">
              Bright <span className="text-cyan-400">Future</span>
            </h1>

            <p className="mt-1 text-xs text-slate-400 sm:text-sm">
              Investment Dashboard
            </p>
          </div>

          <a
            href="/login"
            className="w-full rounded-lg border border-white/20 px-4 py-3 text-center text-sm sm:w-auto sm:py-2"
          >
            Logout
          </a>
        </div>

        {/* Introduction */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 p-4 shadow-2xl sm:mt-8 sm:rounded-3xl sm:p-7">

          <div className="absolute -right-16 -top-16 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-40 w-40 rounded-full bg-violet-500/20 blur-2xl" />

          <div className="relative grid items-center gap-6 md:grid-cols-3">

            <div className="md:col-span-2">

              <div className="mb-3 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-[10px] font-bold tracking-widest text-cyan-300 sm:px-4 sm:text-xs">
                WELCOME TO BRIGHT FUTURE
              </div>

              <h2 className="text-2xl font-extrabold leading-tight sm:text-4xl">
                Manage Your{" "}
                <span className="text-cyan-400">
                  Investments & Earnings
                </span>
              </h2>

              <p className="mt-3 text-sm leading-6 text-slate-300 sm:mt-4 sm:text-base sm:leading-7">
                Bright Future is a simple and modern platform where you can
                manage your investments and earnings in one place.
              </p>
            </div>

            <div className="hidden items-center justify-center md:flex">
              <div className="relative h-44 w-44 lg:h-48 lg:w-48">

                <div className="absolute inset-0 rounded-full border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_80px_rgba(34,211,238,0.15)]" />

                <div className="absolute inset-5 rounded-full border border-blue-400/20 bg-blue-400/10" />

                <div className="absolute inset-10 flex items-center justify-center rounded-3xl border border-cyan-300/30 bg-slate-950/70 shadow-xl backdrop-blur">

                  <div className="text-center">
                    <div className="text-4xl lg:text-5xl">
                      🚀
                    </div>

                    <div className="mt-2 text-xs font-bold tracking-widest text-cyan-300">
                      FUTURE
                    </div>
                  </div>
                </div>

                <div className="absolute -right-2 top-8 rounded-xl border border-green-400/30 bg-green-400/10 px-2 py-1 text-[10px] font-bold text-green-400 lg:px-3 lg:py-2 lg:text-xs">
                  📈 Growth
                </div>

                <div className="absolute -bottom-2 left-0 rounded-xl border border-violet-400/30 bg-violet-400/10 px-2 py-1 text-[10px] font-bold text-violet-400 lg:px-3 lg:py-2 lg:text-xs">
                  💎 Rewards
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Welcome */}
        <div className="mt-7 sm:mt-10">
          <h2 className="break-words text-2xl font-bold sm:text-3xl">
            Welcome, {userName} 👋
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Manage your account from one place.
          </p>
        </div>

        {/* Main Cards */}
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-5 lg:grid-cols-5">

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <p className="text-xs text-slate-400 sm:text-sm">
              Available Balance
            </p>

            <p className="mt-2 break-words text-2xl font-bold sm:mt-3 sm:text-3xl">
              {loading ? "Loading..." : money(balance)}
            </p>

            <p className="mt-2 text-xs text-green-400 sm:text-sm">
              Available for withdrawal
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-green-400/20 bg-green-400/5 p-4 sm:p-6">
            <p className="text-xs text-slate-400 sm:text-sm">
              Earned Balance
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-green-400 sm:mt-3 sm:text-3xl">
              {loading ? "Loading..." : money(totalEarnings)}
            </p>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              Recorded earnings
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <p className="text-xs text-slate-400 sm:text-sm">
              Locked Balance
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-yellow-400 sm:mt-3 sm:text-3xl">
              {loading ? "Loading..." : money(lockedBalance)}
            </p>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              Pending withdrawal amount
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <p className="text-xs text-slate-400 sm:text-sm">
              Total Withdrawal
            </p>

            <p className="mt-2 break-words text-2xl font-bold text-orange-400 sm:mt-3 sm:text-3xl">
              {loading ? "Loading..." : money(totalWithdrawal)}
            </p>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              Approved withdrawals
            </p>
          </div>

          <div className="min-w-0 rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
            <p className="text-xs text-slate-400 sm:text-sm">
              Current Plan
            </p>

            <p className="mt-2 break-words text-xl font-bold text-cyan-400 sm:mt-3 sm:text-2xl">
              {currentPlan || "No Active Plan"}
            </p>

            <p className="mt-2 text-xs text-slate-400 sm:text-sm">
              {currentPlan
                ? "Your active investment plan"
                : "Choose a plan to continue"}
            </p>
          </div>
        </div>

        {/* Earnings Overview */}
        <div className="mt-8 sm:mt-10">
          <h3 className="text-lg font-bold sm:text-xl">
            Earnings Overview
          </h3>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:mt-5 md:grid-cols-3 sm:gap-5">

            <div className="min-w-0 rounded-2xl border border-violet-400/20 bg-violet-400/5 p-4 sm:p-6">
              <p className="text-xs text-slate-400 sm:text-sm">
                Available Bonus
              </p>

              <p className="mt-2 break-words text-2xl font-bold text-violet-400 sm:mt-3 sm:text-3xl">
                {loading ? "Loading..." : money(referralBonus)}
              </p>

              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Approved promotional rewards
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-green-400/20 bg-green-400/5 p-4 sm:p-6">
              <p className="text-xs text-slate-400 sm:text-sm">
                Today&apos;s Earnings
              </p>

              <p className="mt-2 break-words text-2xl font-bold text-green-400 sm:mt-3 sm:text-3xl">
                {loading ? "Loading..." : money(todayEarnings)}
              </p>

              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Today&apos;s recorded earnings
              </p>
            </div>

            <div className="min-w-0 rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 sm:p-6">
              <p className="text-xs text-slate-400 sm:text-sm">
                Total Earnings
              </p>

              <p className="mt-2 break-words text-2xl font-bold text-cyan-400 sm:mt-3 sm:text-3xl">
                {loading ? "Loading..." : money(totalEarnings)}
              </p>

              <p className="mt-2 text-xs text-slate-400 sm:text-sm">
                Total recorded earnings
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 sm:mt-10">
          <h3 className="text-lg font-bold sm:text-xl">
            Quick Actions
          </h3>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:mt-5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">

            <a
              href="/plans"
              className="rounded-xl bg-cyan-500 p-4 text-center text-sm font-bold text-slate-950 sm:p-5"
            >
              📈 View Plans
            </a>

            <a
              href="/profile"
              className="rounded-xl border border-cyan-400 p-4 text-center text-sm font-bold text-cyan-400 sm:p-5"
            >
              👤 My Profile
            </a>

            <a
              href="/deposit"
              className="rounded-xl border border-green-400 p-4 text-center text-sm font-bold text-green-400 sm:p-5"
            >
              💰 Deposit
            </a>

            <a
              href="/withdraw"
              className="rounded-xl border border-yellow-400 p-4 text-center text-sm font-bold text-yellow-400 sm:p-5"
            >
              📤 Withdraw
            </a>

            <a
              href="/withdrawal-history"
              className="rounded-xl border border-orange-400 p-4 text-center text-sm font-bold text-orange-400 sm:p-5"
            >
              📋 Withdrawal History
            </a>

            <a
              href="/transactions"
              className="rounded-xl border border-purple-400 p-4 text-center text-sm font-bold text-purple-400 sm:p-5"
            >
              💳 Transactions
            </a>

            <a
              href="/profit-history"
              className="rounded-xl border border-green-400 p-4 text-center text-sm font-bold text-green-400 sm:p-5"
            >
              📊 Profit History
            </a>

            <a
              href="/task"
              className="rounded-xl border border-blue-400 p-4 text-center text-sm font-bold text-blue-400 sm:p-5"
            >
              🎯 Tasks
            </a>

            <a
              href="/spin-wheel"
              className="rounded-xl border border-pink-400 p-4 text-center text-sm font-bold text-pink-400 sm:p-5"
            >
              🎡 Spin Wheel
            </a>

            <a
              href="/referral"
              className="rounded-xl border border-violet-400 p-4 text-center text-sm font-bold text-violet-400 sm:p-5"
            >
              🎁 Referral
            </a>

            <a
              href="/referral"
              className="rounded-xl border border-pink-400 p-4 text-center text-sm font-bold text-pink-400 sm:p-5"
            >
              🎁 Referral Rewards
            </a>

            <a
              href="/rules"
              className="rounded-xl border border-slate-400 p-4 text-center text-sm font-bold text-slate-300 sm:p-5"
            >
              📜 Rules
            </a>

            <a
              href="/notifications"
              className="rounded-xl border border-cyan-300 p-4 text-center text-sm font-bold text-cyan-300 sm:p-5"
            >
              🔔 Notifications
            </a>

            <a
              href="/support"
              className="rounded-xl border border-red-400 p-4 text-center text-sm font-bold text-red-400 sm:p-5"
            >
              🎧 Support
            </a>
          </div>

          <a
            href="/deposit-history"
            className="mt-3 block rounded-xl border border-cyan-400 bg-cyan-400/10 p-4 text-center text-sm font-bold text-cyan-400 sm:mt-5 sm:p-5"
          >
            📋 Deposit History
          </a>
        </div>

        {/* Account Information */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 sm:mt-10 sm:p-6">

          <h3 className="text-lg font-bold sm:text-xl">
            Account Information
          </h3>

          <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">

            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
              <span className="text-xs text-slate-400 sm:text-sm">
                Available Balance
              </span>

              <span className="text-right text-sm font-bold text-green-400 sm:text-base">
                {money(balance)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
              <span className="text-xs text-slate-400 sm:text-sm">
                Earned Balance
              </span>

              <span className="text-right text-sm font-bold text-green-400 sm:text-base">
                {money(totalEarnings)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 sm:pb-4">
              <span className="text-xs text-slate-400 sm:text-sm">
                Locked Balance
              </span>

              <span className="text-right text-sm font-bold text-yellow-400 sm:text-base">
                {money(lockedBalance)}
              </span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-400 sm:text-sm">
                Total Withdrawal
              </span>

              <span className="text-right text-sm font-bold text-orange-400 sm:text-base">
                {money(totalWithdrawal)}
              </span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="mt-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-xs leading-6 text-slate-300 sm:mt-8 sm:p-5 sm:text-sm">
          <strong className="text-cyan-400">
            Account Balance:
          </strong>{" "}
          Available Balance is loaded from your secure account wallet.
          Earned Balance shows recorded earnings separately and is not
          automatically added to the withdrawable wallet.
        </div>

      </div>
    </main>
  );
}