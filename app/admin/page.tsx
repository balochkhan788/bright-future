"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Deposit = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
};

type WithdrawalMethod = {
  method: string;
  account_name: string;
  account_number: string;
};

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  payment_transaction_id: string | null;
  paid_at: string | null;
  withdrawal_method_id: string | null;
  withdrawal_method: WithdrawalMethod | null;
};

type ReferralReward = {
  id: string;
  user_id: string;
  reward_type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
};

type AdminNotification = {
  id: string;
  type: string;
  title: string;
  message: string;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

export default function AdminDashboard() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referralRewards, setReferralRewards] =
    useState<ReferralReward[]>([]);

  const [notifications, setNotifications] =
    useState<AdminNotification[]>([]);

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [processingDeposit, setProcessingDeposit] =
    useState<string | null>(null);

  const [processingWithdrawal, setProcessingWithdrawal] =
    useState<string | null>(null);

  const [processingReward, setProcessingReward] =
    useState<string | null>(null);

  const [rewardAmounts, setRewardAmounts] =
    useState<Record<string, string>>({});

  // MEMBERS & PLAN COUNTS
  const [totalMembers, setTotalMembers] = useState(0);
  const [activePlanMembers, setActivePlanMembers] = useState(0);
  const [withoutPlanMembers, setWithoutPlanMembers] = useState(0);

  const [planCounts, setPlanCounts] = useState<
    Record<string, number>
  >({
    "G-1": 0,
    "G-2": 0,
    "G-3": 0,
    "G-4": 0,
    "G-5": 0,
    "G-6": 0,
    "G-7": 0,
  });

  useEffect(() => {
    loadAdmin();
  }, []);

  async function loadAdmin() {
    setLoading(true);
    setMessage("");

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      const { data: admin, error: adminError } =
        await supabase
          .from("admin_users")
          .select("user_id")
          .eq("user_id", user.id)
          .maybeSingle();

      if (adminError || !admin) {
        setMessage("Access denied. Admin only.");
        return;
      }

      // ==========================================
      // MEMBERS & PLAN STATISTICS
      // ==========================================

      const {
        data: walletUsers,
        error: walletUsersError,
      } = await supabase
        .from("wallet")
        .select("user_id");

      if (walletUsersError) {
        console.error(walletUsersError);
      }

      const allUserIds = Array.from(
        new Set(
          (walletUsers || []).map(
            (item: { user_id: string }) =>
              item.user_id
          )
        )
      );

      setTotalMembers(allUserIds.length);

      const {
        data: activePlans,
        error: activePlansError,
      } = await supabase
        .from("user_plans")
        .select("user_id, plan_name")
        .eq("status", "active");

      if (activePlansError) {
        console.error(activePlansError);
      }

      const activePlanRows = activePlans || [];

      const activeUserIds = new Set(
        activePlanRows.map(
          (item: { user_id: string }) =>
            item.user_id
        )
      );

      setActivePlanMembers(activeUserIds.size);

      const usersWithoutPlan = allUserIds.filter(
        (userId) => !activeUserIds.has(userId)
      );

      setWithoutPlanMembers(
        usersWithoutPlan.length
      );

      const counts: Record<string, number> = {
        "G-1": 0,
        "G-2": 0,
        "G-3": 0,
        "G-4": 0,
        "G-5": 0,
        "G-6": 0,
        "G-7": 0,
      };

      activePlanRows.forEach(
        (item: {
          user_id: string;
          plan_name: string;
        }) => {
          if (
            counts[item.plan_name] !== undefined
          ) {
            counts[item.plan_name] += 1;
          }
        }
      );

      setPlanCounts(counts);

      // ==========================================
      // DEPOSITS
      // ==========================================

      const {
        data: depositData,
        error: depositError,
      } = await supabase
        .from("deposits")
        .select(
          "id, user_id, amount, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (depositError) {
        console.error(depositError);
      }

      // ==========================================
      // WITHDRAWALS
      // ==========================================

      const {
        data: withdrawalData,
        error: withdrawalError,
      } = await supabase
        .from("withdrawals")
        .select(
          `
          id,
          user_id,
          amount,
          status,
          created_at,
          payment_transaction_id,
          paid_at,
          withdrawal_method_id,
          withdrawal_method:withdrawal_methods (
            method,
            account_name,
            account_number
          )
        `
        )
        .order("created_at", {
          ascending: false,
        });

      if (withdrawalError) {
        console.error(withdrawalError);
      }

      const formattedWithdrawals: Withdrawal[] = (
        withdrawalData || []
      ).map((item: any) => ({
        id: item.id,
        user_id: item.user_id,
        amount: Number(item.amount || 0),
        status: item.status,
        created_at: item.created_at,

        payment_transaction_id:
          item.payment_transaction_id || null,

        paid_at:
          item.paid_at || null,

        withdrawal_method_id:
          item.withdrawal_method_id || null,

        withdrawal_method:
          Array.isArray(item.withdrawal_method)
            ? item.withdrawal_method[0] || null
            : item.withdrawal_method || null,
      }));

      // ==========================================
      // REFERRAL REWARDS
      // ==========================================

      const {
        data: rewardData,
        error: rewardError,
      } = await supabase
        .from("referral_rewards")
        .select(
          "id, user_id, reward_type, amount, description, status, created_at"
        )
        .order("created_at", {
          ascending: false,
        });

      if (rewardError) {
        console.error(rewardError);
      }

      // ==========================================
      // ADMIN NOTIFICATIONS
      // ==========================================

      const {
        data: notificationData,
        error: notificationError,
      } = await supabase
        .from("admin_notifications")
        .select(
          "id, type, title, message, reference_id, is_read, created_at"
        )
        .order("created_at", {
          ascending: false,
        })
        .limit(20);

      if (notificationError) {
        console.error(notificationError);
      }

      setDeposits(
        (depositData || []) as Deposit[]
      );

      setWithdrawals(
        formattedWithdrawals
      );

      setReferralRewards(
        (rewardData || []) as ReferralReward[]
      );

      setNotifications(
        (notificationData || []) as AdminNotification[]
      );
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  async function markNotificationRead(
    id: string
  ) {
    const { error } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((previous) =>
      previous.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              is_read: true,
            }
          : notification
      )
    );
  }

  async function markAllNotificationsRead() {
    const unreadIds = notifications
      .filter(
        (notification) =>
          !notification.is_read
      )
      .map(
        (notification) =>
          notification.id
      );

    if (unreadIds.length === 0) {
      return;
    }

    const { error } = await supabase
      .from("admin_notifications")
      .update({
        is_read: true,
      })
      .in("id", unreadIds);

    if (error) {
      console.error(error);
      return;
    }

    setNotifications((previous) =>
      previous.map((notification) => ({
        ...notification,
        is_read: true,
      }))
    );
  }

  async function approveDeposit(
    id: string
  ) {
    if (
      !window.confirm(
        "Approve this deposit?"
      )
    ) {
      return;
    }

    setProcessingDeposit(id);

    const { error } =
      await supabase.rpc(
        "approve_deposit",
        {
          p_deposit_id: id,
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Deposit approved successfully."
      );

      await loadAdmin();
    }

    setProcessingDeposit(null);
  }

  async function approveWithdrawal(
    id: string
  ) {
    if (
      !window.confirm(
        "Approve this withdrawal?"
      )
    ) {
      return;
    }

    setProcessingWithdrawal(id);

    const { error } =
      await supabase.rpc(
        "approve_withdrawal",
        {
          p_withdrawal_id: id,
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Withdrawal approved successfully."
      );

      await loadAdmin();
    }

    setProcessingWithdrawal(null);
  }

  async function rejectWithdrawal(
    id: string
  ) {
    if (
      !window.confirm(
        "Reject this withdrawal?"
      )
    ) {
      return;
    }

    setProcessingWithdrawal(id);

    const { error } =
      await supabase.rpc(
        "reject_withdrawal",
        {
          p_withdrawal_id: id,
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Withdrawal rejected."
      );

      await loadAdmin();
    }

    setProcessingWithdrawal(null);
  }

  async function markWithdrawalPaid(
    id: string
  ) {
    const transactionId = window.prompt(
      "Enter payment transaction/reference ID:"
    );

    if (!transactionId?.trim()) {
      setMessage(
        "Payment transaction ID is required."
      );
      return;
    }

    if (
      !window.confirm(
        "Have you actually sent the payment to the user's account?"
      )
    ) {
      return;
    }

    setProcessingWithdrawal(id);

    const { error } = await supabase
      .from("withdrawals")
      .update({
        status: "paid",
        payment_transaction_id:
          transactionId.trim(),
        paid_at: new Date().toISOString(),
      })
      .eq("id", id)
      .eq("status", "approved");

    if (error) {
      console.error(error);
      setMessage(error.message);
    } else {
      setMessage(
        "Withdrawal marked as paid successfully."
      );

      await loadAdmin();
    }

    setProcessingWithdrawal(null);
  }

  async function approveReward(
    id: string
  ) {
    const amount = Number(
      rewardAmounts[id] || 0
    );

    if (amount <= 0) {
      setMessage(
        "Enter reward amount first."
      );

      return;
    }

    if (
      !window.confirm(
        "Approve this promotional reward?"
      )
    ) {
      return;
    }

    setProcessingReward(id);

    const { error } =
      await supabase
        .from("referral_rewards")
        .update({
          amount: amount,
          status: "approved",
        })
        .eq("id", id)
        .eq("status", "pending");

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Referral reward approved."
      );

      await loadAdmin();
    }

    setProcessingReward(null);
  }

  async function rejectReward(
    id: string
  ) {
    if (
      !window.confirm(
        "Reject this promotional reward?"
      )
    ) {
      return;
    }

    setProcessingReward(id);

    const { error } =
      await supabase
        .from("referral_rewards")
        .update({
          status: "rejected",
        })
        .eq("id", id)
        .eq("status", "pending");

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Referral reward rejected."
      );

      await loadAdmin();
    }

    setProcessingReward(null);
  }

  async function creditReward(
    id: string
  ) {
    if (
      !window.confirm(
        "Credit this approved reward to user's wallet?"
      )
    ) {
      return;
    }

    setProcessingReward(id);

    const { error } =
      await supabase.rpc(
        "credit_referral_reward_to_wallet",
        {
          p_reward_id: id,
        }
      );

    if (error) {
      setMessage(error.message);
    } else {
      setMessage(
        "Referral reward credited to wallet successfully."
      );

      await loadAdmin();
    }

    setProcessingReward(null);
  }

  function statusColor(
    status: string
  ) {
    if (
      status === "approved" ||
      status === "paid"
    ) {
      return "text-green-400";
    }

    if (status === "rejected") {
      return "text-red-400";
    }

    return "text-yellow-400";
  }

  const unreadNotifications =
    notifications.filter(
      (notification) =>
        !notification.is_read
    ).length;

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">

      <div className="mx-auto max-w-6xl">

        <div className="mb-8">

          <h1 className="text-3xl font-bold">
            Bright{" "}
            <span className="text-cyan-400">
              Future
            </span>
          </h1>

          <h2 className="mt-2 text-xl font-bold">
            Admin Dashboard
          </h2>

          <button
            onClick={() => {
              window.location.href =
                "/admin/support";
            }}
            className="mt-5 w-full rounded-xl bg-cyan-500 p-4 font-bold text-slate-950"
          >
            💬 Support Messages
          </button>

        </div>

        {loading && (
          <div className="rounded-xl bg-white/5 p-5 text-center">
            Loading admin data...
          </div>
        )}

        {!loading && message && (
          <div className="mb-6 rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4 text-center text-cyan-300">
            {message}
          </div>
        )}

        {/* MEMBERS & PLANS OVERVIEW */}

        {!loading && (
          <section className="mb-10">

            <h2 className="mb-4 text-2xl font-bold">
              👥 Members & Plans
            </h2>

            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/10 p-4">
                <p className="text-sm text-slate-400">
                  Total Members
                </p>

                <p className="mt-1 text-3xl font-bold text-cyan-400">
                  {totalMembers}
                </p>
              </div>

              <div className="rounded-2xl border border-green-400/20 bg-green-400/10 p-4">
                <p className="text-sm text-slate-400">
                  Active Plans
                </p>

                <p className="mt-1 text-3xl font-bold text-green-400">
                  {activePlanMembers}
                </p>
              </div>

              <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
                <p className="text-sm text-slate-400">
                  Without Plan
                </p>

                <p className="mt-1 text-3xl font-bold text-yellow-400">
                  {withoutPlanMembers}
                </p>
              </div>

            </div>

            <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/5">

              {Object.entries(planCounts).map(
                ([plan, count]) => (
                  <div
                    key={plan}
                    className="flex items-center justify-between border-b border-white/10 p-4 last:border-b-0"
                  >

                    <span className="font-bold">
                      📋 {plan}
                    </span>

                    <span className="rounded-lg bg-cyan-400/10 px-4 py-2 font-bold text-cyan-400">
                      {count} Members
                    </span>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* ADMIN NOTIFICATIONS */}

        {!loading && (
          <section className="mb-10">

            <div className="mb-4 flex items-center justify-between gap-3">

              <h2 className="text-2xl font-bold">
                🔔 Notifications

                {unreadNotifications > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-1 text-xs">
                    {unreadNotifications}
                  </span>
                )}
              </h2>

              {unreadNotifications > 0 && (
                <button
                  type="button"
                  onClick={
                    markAllNotificationsRead
                  }
                  className="rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold"
                >
                  Mark all read
                </button>
              )}

            </div>

            {notifications.length === 0 ? (
              <div className="rounded-xl bg-white/5 p-5 text-slate-400">
                No notifications.
              </div>
            ) : (
              <div className="space-y-3">

                {notifications.map(
                  (notification) => (
                    <button
                      key={
                        notification.id
                      }
                      type="button"
                      onClick={() =>
                        markNotificationRead(
                          notification.id
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition ${
                        notification.is_read
                          ? "border-white/10 bg-white/5"
                          : "border-cyan-400/40 bg-cyan-400/10"
                      }`}
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">

                          <h3 className="font-bold">
                            {notification.title}
                          </h3>

                          <p className="mt-1 text-sm text-slate-300">
                            {notification.message}
                          </p>

                          <p className="mt-2 text-xs text-slate-500">
                            {new Date(
                              notification.created_at
                            ).toLocaleString()}
                          </p>

                        </div>

                        {!notification.is_read && (
                          <span className="shrink-0 rounded-full bg-cyan-400 px-2 py-1 text-xs font-bold text-slate-950">
                            New
                          </span>
                        )}

                      </div>

                    </button>
                  )
                )}

              </div>
            )}

          </section>
        )}

        {/* REFERRAL REWARDS */}

        <section className="mb-10">

          <h2 className="mb-4 text-2xl font-bold">
            🎁 Referral Reward Requests
          </h2>

          {referralRewards.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-5 text-slate-400">
              No referral reward requests.
            </div>
          ) : (
            <div className="space-y-4">

              {referralRewards.map(
                (reward) => (
                  <div
                    key={reward.id}
                    className="rounded-2xl border border-purple-400/20 bg-purple-400/5 p-5"
                  >

                    <p className="text-sm text-slate-400">
                      User ID
                    </p>

                    <p className="mb-3 break-all text-xs">
                      {reward.user_id}
                    </p>

                    <p>
                      <span className="text-slate-400">
                        Type:{" "}
                      </span>
                      {reward.reward_type}
                    </p>

                    <p className="mt-1">
                      <span className="text-slate-400">
                        Status:{" "}
                      </span>

                      <span
                        className={`font-bold ${statusColor(
                          reward.status
                        )}`}
                      >
                        {reward.status}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(
                        reward.created_at
                      ).toLocaleString()}
                    </p>

                    {reward.description && (
                      <p className="mt-3 rounded-lg bg-black/20 p-3 text-sm text-slate-300">
                        {reward.description}
                      </p>
                    )}

                    {reward.status ===
                      "pending" && (
                      <div className="mt-4">

                        <input
                          type="number"
                          min="1"
                          placeholder="Reward amount"
                          value={
                            rewardAmounts[
                              reward.id
                            ] || ""
                          }
                          onChange={(e) =>
                            setRewardAmounts({
                              ...rewardAmounts,
                              [reward.id]:
                                e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 outline-none"
                        />

                        <div className="mt-3 grid grid-cols-2 gap-3">

                          <button
                            onClick={() =>
                              approveReward(
                                reward.id
                              )
                            }
                            disabled={
                              processingReward ===
                              reward.id
                            }
                            className="rounded-xl bg-green-500 p-3 font-bold text-black disabled:opacity-50"
                          >
                            Approve
                          </button>

                          <button
                            onClick={() =>
                              rejectReward(
                                reward.id
                              )
                            }
                            disabled={
                              processingReward ===
                              reward.id
                            }
                            className="rounded-xl bg-red-500 p-3 font-bold disabled:opacity-50"
                          >
                            Reject
                          </button>

                        </div>

                      </div>
                    )}

                    {reward.status ===
                      "approved" && (
                      <div className="mt-4">

                        <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                          Approved: Rs.{" "}
                          {Number(
                            reward.amount
                          ).toLocaleString()}
                        </div>

                        <button
                          onClick={() =>
                            creditReward(
                              reward.id
                            )
                          }
                          disabled={
                            processingReward ===
                            reward.id
                          }
                          className="mt-3 w-full rounded-xl bg-cyan-400 p-3 font-bold text-black disabled:opacity-50"
                        >
                          {processingReward ===
                          reward.id
                            ? "Processing..."
                            : "Credit to Wallet"}
                        </button>

                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* DEPOSITS */}

        <section className="mb-10">

          <h2 className="mb-4 text-2xl font-bold">
            💰 Deposit Requests
          </h2>

          {deposits.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-5 text-slate-400">
              No deposit requests.
            </div>
          ) : (
            <div className="space-y-4">

              {deposits.map(
                (deposit) => (
                  <div
                    key={deposit.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5"
                  >

                    <p className="text-xs text-slate-400">
                      User ID
                    </p>

                    <p className="break-all text-xs">
                      {deposit.user_id}
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                      Rs.{" "}
                      {Number(
                        deposit.amount
                      ).toLocaleString()}
                    </p>

                    <p className="mt-1">
                      Status:{" "}
                      <span
                        className={`font-bold ${statusColor(
                          deposit.status
                        )}`}
                      >
                        {deposit.status}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(
                        deposit.created_at
                      ).toLocaleString()}
                    </p>

                    {deposit.status ===
                      "pending" && (
                      <button
                        onClick={() =>
                          approveDeposit(
                            deposit.id
                          )
                        }
                        disabled={
                          processingDeposit ===
                          deposit.id
                        }
                        className="mt-4 w-full rounded-xl bg-green-500 p-3 font-bold text-black disabled:opacity-50"
                      >
                        {processingDeposit ===
                        deposit.id
                          ? "Processing..."
                          : "Approve Deposit"}
                      </button>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </section>

        {/* WITHDRAWALS */}

        <section className="mb-10">

          <h2 className="mb-4 text-2xl font-bold">
            💸 Withdrawal Requests
          </h2>

          {withdrawals.length === 0 ? (
            <div className="rounded-xl bg-white/5 p-5 text-slate-400">
              No withdrawal requests.
            </div>
          ) : (
            <div className="space-y-4">

              {withdrawals.map(
                (withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5"
                  >

                    <p className="text-xs text-slate-400">
                      User ID
                    </p>

                    <p className="break-all text-xs">
                      {withdrawal.user_id}
                    </p>

                    <p className="mt-3 text-2xl font-bold">
                      Rs.{" "}
                      {Number(
                        withdrawal.amount
                      ).toLocaleString()}
                    </p>

                    <p className="mt-1">
                      Status:{" "}
                      <span
                        className={`font-bold ${statusColor(
                          withdrawal.status
                        )}`}
                      >
                        {withdrawal.status}
                      </span>
                    </p>

                    <p className="mt-1 text-sm text-slate-400">
                      {new Date(
                        withdrawal.created_at
                      ).toLocaleString()}
                    </p>

                    {withdrawal.withdrawal_method && (
                      <div className="mt-4 rounded-xl bg-black/20 p-4">

                        <p>
                          Method:{" "}
                          <b>
                            {
                              withdrawal
                                .withdrawal_method
                                .method
                            }
                          </b>
                        </p>

                        <p className="mt-1">
                          Name:{" "}
                          <b>
                            {
                              withdrawal
                                .withdrawal_method
                                .account_name
                            }
                          </b>
                        </p>

                        <p className="mt-1 break-all">
                          Account:{" "}
                          <b>
                            {
                              withdrawal
                                .withdrawal_method
                                .account_number
                            }
                          </b>
                        </p>

                      </div>
                    )}

                    {withdrawal.status ===
                      "pending" && (
                      <div className="mt-4 grid grid-cols-2 gap-3">

                        <button
                          onClick={() =>
                            approveWithdrawal(
                              withdrawal.id
                            )
                          }
                          disabled={
                            processingWithdrawal ===
                            withdrawal.id
                          }
                          className="rounded-xl bg-green-500 p-3 font-bold text-black disabled:opacity-50"
                        >
                          {processingWithdrawal ===
                          withdrawal.id
                            ? "Processing..."
                            : "Approve"}
                        </button>

                        <button
                          onClick={() =>
                            rejectWithdrawal(
                              withdrawal.id
                            )
                          }
                          disabled={
                            processingWithdrawal ===
                            withdrawal.id
                          }
                          className="rounded-xl bg-red-500 p-3 font-bold disabled:opacity-50"
                        >
                          Reject
                        </button>

                      </div>
                    )}

                    {withdrawal.status ===
                      "approved" && (
                      <button
                        onClick={() =>
                          markWithdrawalPaid(
                            withdrawal.id
                          )
                        }
                        disabled={
                          processingWithdrawal ===
                          withdrawal.id
                        }
                        className="mt-3 w-full rounded-xl bg-cyan-400 p-3 font-bold text-black disabled:opacity-50"
                      >
                        {processingWithdrawal ===
                        withdrawal.id
                          ? "Processing..."
                          : "Mark as Paid"}
                      </button>
                    )}

                    {withdrawal.payment_transaction_id && (
                      <div className="mt-3 rounded-xl bg-green-500/10 p-4 text-sm">

                        <p className="text-green-400">
                          Payment Transaction ID
                        </p>

                        <p className="mt-1 break-all font-bold">
                          {
                            withdrawal.payment_transaction_id
                          }
                        </p>

                        {withdrawal.paid_at && (
                          <p className="mt-2 text-xs text-slate-400">
                            Paid:{" "}
                            {new Date(
                              withdrawal.paid_at
                            ).toLocaleString()}
                          </p>
                        )}

                      </div>
                    )}

                  </div>
                )
              )}

            </div>
          )}

        </section>

        <button
          onClick={loadAdmin}
          className="mb-10 w-full rounded-xl border border-cyan-400 p-3 font-bold text-cyan-400"
        >
          🔄 Refresh
        </button>

      </div>

    </main>
  );
}