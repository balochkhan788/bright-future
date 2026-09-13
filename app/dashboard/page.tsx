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

      // Wallet
      const { data: wallet, error: walletError } = await supabase
        .from("wallets")
        .select("available_balance, locked_balance")
        .eq("user_id", user.id)
        .single();

      if (walletError) {
        console.log("Wallet error:", walletError);
      }

      if (wallet) {
        setBalance(Number(wallet.available_balance || 0));
        setLockedBalance(Number(wallet.locked_balance || 0));
      }

      // Current Active Plan
      const { data: activePlan, error: planError } = await supabase
        .from("user_plans")
        .select("plan_name")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (planError) {
        console.log("Plan error:", planError);
      }

      if (activePlan) {
        setCurrentPlan(activePlan.plan_name);
      }

      // Total approved withdrawals
      const { data: withdrawals, error: withdrawalError } =
        await supabase
          .from("withdrawals")
          .select("amount")
          .eq("user_id", user.id)
          .eq("status", "approved");

      if (withdrawalError) {
        console.log("Withdrawal error:", withdrawalError);
      }

      if (withdrawals) {
        const total = withdrawals.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

        setTotalWithdrawal(total);
      }

      // Earnings
      const { data: earnings, error: earningsError } = await supabase
        .from("earnings")
        .select("amount, earning_type, created_at")
        .eq("user_id", user.id);

      if (earningsError) {
        console.log("Earnings error:", earningsError);
      }

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

      // Approved Promotional Referral Rewards
      const {
        data: referralRewards,
        error: referralRewardsError,
      } = await supabase
        .from("referral_rewards")
        .select("amount, status")
        .eq("user_id", user.id)
        .eq("status", "approved");

      if (referralRewardsError) {
        console.log(
          "Referral rewards error:",
          referralRewardsError
        );
      }

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

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">
              Bright{" "}
              <span className="text-cyan-400">
                Future
              </span>
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              Investment Dashboard
            </p>
          </div>

          <a
            href="/login"
            className="rounded-lg border border-white/20 px-4 py-2 text-sm"
          >
            Logout
          </a>
        </div>

        {/* Introduction */}
        <div className="relative mt-8 overflow-hidden rounded-3xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-blue-500/10 to-violet-500/20 p-7 shadow-2xl">

          <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-cyan-400/20 blur-2xl" />

          <div className="absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-500/20 blur-2xl" />

          <div className="relative grid items-center gap-8 md:grid-cols-3">

            <div className="md:col-span-2">

              <div className="mb-3 inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs font-bold tracking-widest text-cyan-300">
                WELCOME TO BRIGHT FUTURE
              </div>

              <h2 className="text-3xl font-extrabold leading-tight sm:text-4xl">
                Manage Your{" "}
                <span className="text-cyan-400">
                  Investments & Earnings
                </span>
              </h2>

              <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300 sm:text-base">
                Bright Future is a simple and modern platform where you can
                manage your investments and earnings in one place. Track your
                account activity, monitor your earnings, complete available
                tasks, and keep your financial records organized with an easy
                and user-friendly experience.
              </p>

            </div>

            <div className="relative flex min-h-[230px] items-center justify-center">

              <div className="relative h-48 w-48">

                <div className="absolute inset-0 rounded-full border border-cyan-400/20 bg-cyan-400/5 shadow-[0_0_80px_rgba(34,211,238,0.15)]" />

                <div className="absolute inset-5 rounded-full border border-blue-400/20 bg-blue-400/10" />

                <div className="absolute inset-10 flex items-center justify-center rounded-3xl border border-cyan-300/30 bg-slate-950/70 shadow-xl backdrop-blur">

                  <div className="text-center">
                    <div className="text-5xl">
                      🚀
                    </div>

                    <div className="mt-2 text-xs font-bold tracking-widest text-cyan-300">
                      FUTURE
                    </div>
                  </div>

                </div>

                <div className="absolute -right-2 top-8 rounded-xl border border-green-400/30 bg-green-400/10 px-3 py-2 text-xs font-bold text-green-400">
                  📈 Growth
                </div>

                <div className="absolute -bottom-2 left-0 rounded-xl border border-violet-400/30 bg-violet-400/10 px-3 py-2 text-xs font-bold text-violet-400">
                  💎 Rewards
                </div>

              </div>

            </div>

          </div>
        </div>

        {/* Welcome */}
        <div className="mt-10">
          <h2 className="text-3xl font-bold">
            Welcome, {userName} 👋
          </h2>

          <p className="mt-2 text-slate-400">
            Manage your account from one place.
          </p>
        </div>

        {/* Main Cards */}
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-5">

          {/* Available Balance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Available Balance
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading
                ? "Loading..."
                : "Rs. " + balance.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-green-400">
              Available for withdrawal
            </p>
          </div>

          {/* Earned Balance */}
          <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-6">
            <p className="text-sm text-slate-400">
              Earned Balance
            </p>

            <p className="mt-3 text-3xl font-bold text-green-400">
              {loading
                ? "Loading..."
                : "Rs. " + totalEarnings.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Recorded earnings
            </p>
          </div>

          {/* Locked Balance */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Locked Balance
            </p>

            <p className="mt-3 text-3xl font-bold text-yellow-400">
              {loading
                ? "Loading..."
                : "Rs. " + lockedBalance.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Pending withdrawal amount
            </p>
          </div>

          {/* Total Withdrawal */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Total Withdrawal
            </p>

            <p className="mt-3 text-3xl font-bold text-orange-400">
              {loading
                ? "Loading..."
                : "Rs. " + totalWithdrawal.toLocaleString()}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Approved withdrawals
            </p>
          </div>

          {/* Current Plan */}
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">
              Current Plan
            </p>

            <p className="mt-3 text-2xl font-bold text-cyan-400">
              {currentPlan || "No Active Plan"}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              {currentPlan
                ? "Your active investment plan"
                : "Choose a plan to continue"}
            </p>
          </div>

        </div>

        {/* Earnings Overview */}
        <div className="mt-10">

          <h3 className="text-xl font-bold">
            Earnings Overview
          </h3>

          <div className="mt-5 grid gap-5 md:grid-cols-3">

            {/* Available Bonus */}
            <div className="rounded-2xl border border-violet-400/20 bg-violet-400/5 p-6">

              <p className="text-sm text-slate-400">
                Available Bonus
              </p>

              <p className="mt-3 text-3xl font-bold text-violet-400">
                {loading
                  ? "Loading..."
                  : "Rs. " + referralBonus.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Approved promotional rewards
              </p>

            </div>

            {/* Today's Earnings */}
            <div className="rounded-2xl border border-green-400/20 bg-green-400/5 p-6">

              <p className="text-sm text-slate-400">
                Today&apos;s Earnings
              </p>

              <p className="mt-3 text-3xl font-bold text-green-400">
                {loading
                  ? "Loading..."
                  : "Rs. " + todayEarnings.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Today&apos;s recorded earnings
              </p>

            </div>

            {/* Total Earnings */}
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-6">

              <p className="text-sm text-slate-400">
                Total Earnings
              </p>

              <p className="mt-3 text-3xl font-bold text-cyan-400">
                {loading
                  ? "Loading..."
                  : "Rs. " + totalEarnings.toLocaleString()}
              </p>

              <p className="mt-2 text-sm text-slate-400">
                Total recorded earnings
              </p>

            </div>

          </div>

        </div>

        {/* Quick Actions */}
        <div className="mt-10">

          <h3 className="text-xl font-bold">
            Quick Actions
          </h3>

          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <a
              href="/plans"
              className="rounded-xl bg-cyan-500 p-5 text-center font-bold text-slate-950"
            >
              📈 View Plans
            </a>

            <a
              href="/profile"
              className="rounded-xl border border-cyan-400 p-5 text-center font-bold text-cyan-400"
            >
              👤 My Profile
            </a>

            <a
              href="/deposit"
              className="rounded-xl border border-green-400 p-5 text-center font-bold text-green-400"
            >
              💰 Deposit
            </a>

            <a
              href="/withdraw"
              className="rounded-xl border border-yellow-400 p-5 text-center font-bold text-yellow-400"
            >
              📤 Withdraw
            </a>

            <a
              href="/withdrawal-history"
              className="rounded-xl border border-orange-400 p-5 text-center font-bold text-orange-400"
            >
              📋 Withdrawal History
            </a>

            <a
              href="/transactions"
              className="rounded-xl border border-purple-400 p-5 text-center font-bold text-purple-400"
            >
              💳 Transactions
            </a>

            <a
              href="/profit-history"
              className="rounded-xl border border-green-400 p-5 text-center font-bold text-green-400"
            >
              📊 Profit History
            </a>

            <a
              href="/task"
              className="rounded-xl border border-blue-400 p-5 text-center font-bold text-blue-400"
            >
              🎯 Tasks
            </a>

            <a
              href="/spin-wheel"
              className="rounded-xl border border-pink-400 p-5 text-center font-bold text-pink-400"
            >
              🎡 Spin Wheel
            </a>

            <a
              href="/referral"
              className="rounded-xl border border-violet-400 p-5 text-center font-bold text-violet-400"
            >
              🎁 Referral
            </a>

            <a
              href="/referral"
              className="rounded-xl border border-pink-400 p-5 text-center font-bold text-pink-400"
            >
              🎁 Referral Rewards
            </a>

            <a
              href="/rules"
              className="rounded-xl border border-slate-400 p-5 text-center font-bold text-slate-300"
            >
              📜 Rules
            </a>

            <a
              href="/notifications"
              className="rounded-xl border border-cyan-300 p-5 text-center font-bold text-cyan-300"
            >
              🔔 Notifications
            </a>

            <a
              href="/support"
              className="rounded-xl border border-red-400 p-5 text-center font-bold text-red-400"
            >
              🎧 Support
            </a>

          </div>

          <a
            href="/deposit-history"
            className="mt-5 block rounded-xl border border-cyan-400 bg-cyan-400/10 p-5 text-center font-bold text-cyan-400"
          >
            📋 Deposit History
          </a>

        </div>

        {/* Account Information */}
        <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">

          <h3 className="text-xl font-bold">
            Account Information
          </h3>

          <div className="mt-5 space-y-4">

            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-slate-400">
                Available Balance
              </span>

              <span className="font-bold text-green-400">
                Rs. {balance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-slate-400">
                Earned Balance
              </span>

              <span className="font-bold text-green-400">
                Rs. {totalEarnings.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between border-b border-white/10 pb-4">
              <span className="text-slate-400">
                Locked Balance
              </span>

              <span className="font-bold text-yellow-400">
                Rs. {lockedBalance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">
                Total Withdrawal
              </span>

              <span className="font-bold text-orange-400">
                Rs. {totalWithdrawal.toLocaleString()}
              </span>
            </div>

          </div>
        </div>

        {/* Notice */}
        <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5 text-sm text-slate-300">

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