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

export default function AdminDashboard() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [referralRewards, setReferralRewards] = useState<ReferralReward[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [processingDeposit, setProcessingDeposit] = useState<string | null>(
    null
  );

  const [processingWithdrawal, setProcessingWithdrawal] = useState<
    string | null
  >(null);

  const [processingReward, setProcessingReward] = useState<string | null>(
    null
  );

  const [rewardAmounts, setRewardAmounts] = useState<
    Record<string, string>
  >({});

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

      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError || !admin) {
        setMessage("Access denied. Admin only.");
        return;
      }

      const { data: depositData, error: depositError } = await supabase
        .from("deposits")
        .select("id, user_id, amount, status, created_at")
        .order("created_at", { ascending: false });

      if (depositError) {
        console.error(depositError);
      }

      const { data: withdrawalData, error: withdrawalError } =
        await supabase
          .from("withdrawals")
          .select(
            `
            id,
            user_id,
            amount,
            status,
            created_at,
            withdrawal_method_id,
            withdrawal_method:withdrawal_methods (
              method,
              account_name,
              account_number
            )
          `
          )
          .order("created_at", { ascending: false });

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
        withdrawal_method_id: item.withdrawal_method_id,
        withdrawal_method: Array.isArray(item.withdrawal_method)
          ? item.withdrawal_method[0] || null
          : item.withdrawal_method || null,
      }));

      const { data: rewardData, error: rewardError } = await supabase
        .from("referral_rewards")
        .select(
          "id, user_id, reward_type, amount, description, status, created_at"
        )
        .order("created_at", { ascending: false });

      if (rewardError) {
        console.error(rewardError);
      }

      setDeposits((depositData || []) as Deposit[]);
      setWithdrawals(formattedWithdrawals);
      setReferralRewards((rewardData || []) as ReferralReward[]);
    } catch (error) {
      console.error(error);
      setMessage("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  async function approveDeposit(id: string) {
    if (!window.confirm("Approve this deposit?")) return;

    setProcessingDeposit(id);

    const { error } = await supabase.rpc("approve_deposit", {
      p_deposit_id: id,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Deposit approved successfully.");
      await loadAdmin();
    }

    setProcessingDeposit(null);
  }

  async function approveWithdrawal(id: string) {
    if (!window.confirm("Approve this withdrawal?")) return;

    setProcessingWithdrawal(id);

    const { error } = await supabase.rpc("approve_withdrawal", {
      p_withdrawal_id: id,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Withdrawal approved successfully.");
      await loadAdmin();
    }

    setProcessingWithdrawal(null);
  }

  async function rejectWithdrawal(id: string) {
    if (!window.confirm("Reject this withdrawal?")) return;

    setProcessingWithdrawal(id);

    const { error } = await supabase.rpc("reject_withdrawal", {
      p_withdrawal_id: id,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Withdrawal rejected.");
      await loadAdmin();
    }

    setProcessingWithdrawal(null);
  }

  async function approveReward(id: string) {
    const amount = Number(rewardAmounts[id] || 0);

    if (amount <= 0) {
      setMessage("Enter reward amount first.");
      return;
    }

    if (!window.confirm("Approve this promotional reward?")) return;

    setProcessingReward(id);

    const { error } = await supabase
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
      setMessage("Referral reward approved.");
      await loadAdmin();
    }

    setProcessingReward(null);
  }

  async function rejectReward(id: string) {
    if (!window.confirm("Reject this promotional reward?")) return;

    setProcessingReward(id);

    const { error } = await supabase
      .from("referral_rewards")
      .update({
        status: "rejected",
      })
      .eq("id", id)
      .eq("status", "pending");

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Referral reward rejected.");
      await loadAdmin();
    }

    setProcessingReward(null);
  }

  async function creditReward(id: string) {
    if (
      !window.confirm(
        "Credit this approved reward to user's wallet?"
      )
    ) {
      return;
    }

    setProcessingReward(id);

    const { error } = await supabase.rpc(
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

  function statusColor(status: string) {
    if (status === "approved") return "text-green-400";
    if (status === "rejected") return "text-red-400";
    return "text-yellow-400";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-5 text-white">
      <div className="mx-auto max-w-6xl">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Bright <span className="text-cyan-400">Future</span>
          </h1>

          <h2 className="mt-2 text-xl font-bold">
            Admin Dashboard
          </h2>

          <button
            onClick={() => {
              window.location.href = "/admin/support";
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
              {referralRewards.map((reward) => (
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

                  {reward.status === "pending" && (
                    <div className="mt-4">

                      <input
                        type="number"
                        min="1"
                        placeholder="Reward amount"
                        value={rewardAmounts[reward.id] || ""}
                        onChange={(e) =>
                          setRewardAmounts({
                            ...rewardAmounts,
                            [reward.id]: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-white/10 bg-slate-900 p-3 outline-none"
                      />

                      <div className="mt-3 grid grid-cols-2 gap-3">

                        <button
                          onClick={() =>
                            approveReward(reward.id)
                          }
                          disabled={
                            processingReward === reward.id
                          }
                          className="rounded-xl bg-green-500 p-3 font-bold text-black disabled:opacity-50"
                        >
                          Approve
                        </button>

                        <button
                          onClick={() =>
                            rejectReward(reward.id)
                          }
                          disabled={
                            processingReward === reward.id
                          }
                          className="rounded-xl bg-red-500 p-3 font-bold disabled:opacity-50"
                        >
                          Reject
                        </button>

                      </div>
                    </div>
                  )}

                  {reward.status === "approved" && (
                    <div className="mt-4">

                      <div className="rounded-xl bg-green-500/10 p-3 text-green-400">
                        Approved: Rs.{" "}
                        {Number(
                          reward.amount
                        ).toLocaleString()}
                      </div>

                      <button
                        onClick={() =>
                          creditReward(reward.id)
                        }
                        disabled={
                          processingReward === reward.id
                        }
                        className="mt-3 w-full rounded-xl bg-cyan-400 p-3 font-bold text-black disabled:opacity-50"
                      >
                        {processingReward === reward.id
                          ? "Processing..."
                          : "Credit to Wallet"}
                      </button>

                    </div>
                  )}
                </div>
              ))}
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
              {deposits.map((deposit) => (
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

                  {deposit.status === "pending" && (
                    <button
                      onClick={() =>
                        approveDeposit(deposit.id)
                      }
                      disabled={
                        processingDeposit === deposit.id
                      }
                      className="mt-4 w-full rounded-xl bg-green-500 p-3 font-bold text-black disabled:opacity-50"
                    >
                      {processingDeposit === deposit.id
                        ? "Processing..."
                        : "Approve Deposit"}
                    </button>
                  )}
                </div>
              ))}
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
              {withdrawals.map((withdrawal) => (
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
                            withdrawal.withdrawal_method
                              .method
                          }
                        </b>
                      </p>

                      <p className="mt-1">
                        Name:{" "}
                        <b>
                          {
                            withdrawal.withdrawal_method
                              .account_name
                          }
                        </b>
                      </p>

                      <p className="mt-1 break-all">
                        Account:{" "}
                        <b>
                          {
                            withdrawal.withdrawal_method
                              .account_number
                          }
                        </b>
                      </p>

                    </div>
                  )}

                  {withdrawal.status === "pending" && (
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
                        Approve
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
                </div>
              ))}
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