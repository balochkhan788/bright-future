"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Slide = {
  title1: string;
  title2: string;
  description: string;
};

export default function Dashboard() {
  const [balance, setBalance] = useState(0);
  const [lockedBalance, setLockedBalance] = useState(0);
  const [totalWithdrawal, setTotalWithdrawal] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [referralBonus, setReferralBonus] = useState(0);

  const [planName, setPlanName] = useState("No Active Plan");
  const [userName, setUserName] = useState("User");
  const [loading, setLoading] = useState(true);
  const [slide, setSlide] = useState(0);

  const slides: Slide[] = [
    {
      title1: "Manage Your",
      title2: "Investments & Earnings",
      description: "Track your account activity, balance and earnings.",
    },
    {
      title1: "Track Your",
      title2: "Account Balance",
      description: "View your available, locked and earned balance.",
    },
    {
      title1: "Explore Your",
      title2: "Rewards & Tasks",
      description: "Access available tasks, rewards and referral features.",
    },
  ];

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(timer);
  }, [slides.length]);

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

      const { data: wallet } = await supabase
        .from("wallets")
        .select("available_balance, locked_balance")
        .eq("user_id", user.id)
        .maybeSingle();

      if (wallet) {
        setBalance(Number(wallet.available_balance || 0));
        setLockedBalance(Number(wallet.locked_balance || 0));
      }

      const { data: plan } = await supabase
        .from("user_plans")
        .select("plan_name")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (plan) {
        setPlanName(plan.plan_name || "Active Plan");
      }

      const { data: withdrawals } = await supabase
        .from("withdrawals")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const withdrawalTotal =
        withdrawals?.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ) || 0;

      setTotalWithdrawal(withdrawalTotal);

      const { data: earnings } = await supabase
        .from("earnings")
        .select("amount, created_at")
        .eq("user_id", user.id);

      const allEarnings =
        earnings?.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ) || 0;

      setTotalEarnings(allEarnings);

      const today = new Date().toISOString().split("T")[0];

      const todayTotal =
        earnings
          ?.filter((item) => item.created_at?.startsWith(today))
          .reduce((sum, item) => sum + Number(item.amount || 0), 0) || 0;

      setTodayEarnings(todayTotal);

      const { data: rewards } = await supabase
        .from("referral_rewards")
        .select("amount")
        .eq("user_id", user.id)
        .eq("status", "approved");

      const approvedRewards =
        rewards?.reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        ) || 0;

      setReferralBonus(approvedRewards);
    } catch (error) {
      console.error("Dashboard error:", error);
    } finally {
      setLoading(false);
    }
  }

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
      {/* Header */}
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
              window.location.href = "/login";
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-5 space-y-5">
        {/* Slideshow */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-lg">
          <div className="min-h-[150px] flex flex-col justify-center">
            <p className="text-sm opacity-90 mb-1">
              {slides[slide].title1}
            </p>

            <h2 className="text-2xl sm:text-3xl font-bold">
              {slides[slide].title2}
            </h2>

            <p className="mt-3 text-sm sm:text-base opacity-90">
              {slides[slide].description}
            </p>
          </div>

          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setSlide(index)}
                aria-label={"Slide " + (index + 1)}
                className={`h-2 rounded-full transition-all ${
                  slide === index
                    ? "w-7 bg-white"
                    : "w-2 bg-white/50"
                }`}
              />
            ))}
          </div>
        </section>

        {/* Welcome */}
        <section className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-slate-500">Welcome back</p>

          <h2 className="text-2xl font-bold text-slate-800 mt-1">
            {userName}
          </h2>

          <p className="text-sm text-slate-500 mt-1">
            Manage your account and view your latest activity.
          </p>
        </section>

        {/* Account Summary */}
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
                Rs {totalEarnings.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Locked Balance
              </p>
              <p className="text-xl font-bold text-orange-500 mt-2">
                Rs {lockedBalance.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Total Withdrawal
              </p>
              <p className="text-xl font-bold text-purple-600 mt-2">
                Rs {totalWithdrawal.toLocaleString()}
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

        {/* Earnings Overview */}
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
                Rs {referralBonus.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Today's Earnings
              </p>
              <p className="text-xl font-bold text-blue-600 mt-2">
                Rs {todayEarnings.toLocaleString()}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow p-4">
              <p className="text-xs text-slate-500">
                Total Earnings
              </p>
              <p className="text-xl font-bold text-indigo-600 mt-2">
                Rs {totalEarnings.toLocaleString()}
              </p>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Link
              href="/plans"
              className="bg-blue-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Plans
            </Link>

            <Link
              href="/deposit"
              className="bg-green-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Deposit
            </Link>

            <Link
              href="/withdraw"
              className="bg-orange-500 text-white rounded-xl p-4 text-center font-semibold"
            >
              Withdraw
            </Link>

            <Link
              href="/transactions"
              className="bg-purple-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Transactions
            </Link>

            <Link
              href="/task"
              className="bg-indigo-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Daily Task
            </Link>

            <Link
              href="/referral"
              className="bg-pink-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Referral
            </Link>

            <Link
              href="/referral"
              className="bg-rose-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Referral Rewards
            </Link>

            <Link
              href="/spin-wheel"
              className="bg-cyan-600 text-white rounded-xl p-4 text-center font-semibold"
            >
              Spin Wheel
            </Link>

            <Link
              href="/profile"
              className="bg-slate-700 text-white rounded-xl p-4 text-center font-semibold"
            >
              Profile
            </Link>
          </div>
        </section>

        {/* Account Information */}
        <section className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold text-slate-800 mb-4">
            Account Information
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">Current Plan</span>
              <span className="font-semibold text-slate-800">
                {planName}
              </span>
            </div>

            <div className="flex justify-between border-b pb-3">
              <span className="text-slate-500">
                Available Balance
              </span>
              <span className="font-semibold text-green-600">
                Rs {balance.toLocaleString()}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">
                Total Earnings
              </span>
              <span className="font-semibold text-blue-600">
                Rs {totalEarnings.toLocaleString()}
              </span>
            </div>
          </div>
        </section>

        {/* Notice */}
        <section className="bg-yellow-50 border border-yellow-200 rounded-2xl p-5">
          <h2 className="font-bold text-yellow-800">
            Important Notice
          </h2>

          <p className="text-sm text-yellow-700 mt-2">
            Please review your account activity and transaction
            information regularly.
          </p>
        </section>
      </div>
    </main>
  );
}