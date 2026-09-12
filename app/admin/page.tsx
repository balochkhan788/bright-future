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

type Withdrawal = {
  id: string;
  user_id: string;
  amount: number;
  status: string;
  created_at: string;
  withdrawal_method_id: string | null;
  withdrawal_method?: {
    method: string;
    account_name: string;
    account_number: string;
  } | null;
};

export default function AdminDashboard() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);

  const [loading, setLoading] = useState(true);

  const [approvingDepositId, setApprovingDepositId] =
    useState<string | null>(null);

  const [processingWithdrawalId, setProcessingWithdrawalId] =
    useState<string | null>(null);

  const [message, setMessage] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, []);

  async function checkAdminAndLoad() {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        window.location.href = "/login";
        return;
      }

      // Check admin access
      const { data: admin, error: adminError } = await supabase
        .from("admin_users")
        .select("user_id")
        .eq("user_id", user.id)
        .maybeSingle();

      if (adminError) {
        console.error("Admin check error:", adminError);
        setMessage("Unable to verify admin access.");
        setLoading(false);
        return;
      }

      if (!admin) {
        setMessage("Access denied. Admin only.");
        setLoading(false);
        return;
      }

      // Load deposits
      const { data: depositData, error: depositError } =
        await supabase
          .from("deposits")
          .select("id, user_id, amount, status, created_at")
          .order("created_at", { ascending: false });

      if (depositError) {
        console.error("Deposit error:", depositError);
        setMessage("Unable to load deposits.");
        setLoading(false);
        return;
      }

      // Load withdrawals
      const { data: withdrawalData, error: withdrawalError } =
        await supabase
          .from("withdrawals")
          .select(`
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
          `)
          .order("created_at", { ascending: false });

      if (withdrawalError) {
        console.error(
          "Withdrawal error:",
          withdrawalError
        );

        setMessage("Unable to load withdrawals.");
        setLoading(false);
        return;
      }

      setDeposits(depositData || []);
      setWithdrawals(
        (withdrawalData || []) as Withdrawal[]
      );
    } catch (error) {
      console.error("Admin dashboard error:", error);
      setMessage("Something went wrong.");
    }

    setLoading(false);
  }

  async function approveDeposit(depositId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this deposit?"
    );

    if (!confirmed) {
      return;
    }

    setApprovingDepositId(depositId);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "approve_deposit",
        {
          p_deposit_id: depositId,
        }
      );

      if (error) {
        console.error("Approval error:", error);

        setMessage(
          "Deposit approval failed. Please try again."
        );

        setApprovingDepositId(null);
        return;
      }

      console.log("Deposit approval result:", data);

      setMessage(
        "Deposit approved successfully. Wallet balance updated."
      );

      await checkAdminAndLoad();
    } catch (error) {
      console.error("Approval error:", error);

      setMessage(
        "Something went wrong while approving the deposit."
      );
    }

    setApprovingDepositId(null);
  }

  async function approveWithdrawal(withdrawalId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to approve this withdrawal?"
    );

    if (!confirmed) {
      return;
    }

    setProcessingWithdrawalId(withdrawalId);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "approve_withdrawal",
        {
          p_withdrawal_id: withdrawalId,
        }
      );

      if (error) {
        console.error(
          "Withdrawal approval error:",
          error
        );

        setMessage(
          error.message ||
            "Withdrawal approval failed."
        );

        setProcessingWithdrawalId(null);
        return;
      }

      console.log(
        "Withdrawal approval result:",
        data
      );

      setMessage(
        "Withdrawal approved successfully."
      );

      await checkAdminAndLoad();
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while approving withdrawal."
      );
    }

    setProcessingWithdrawalId(null);
  }

  async function rejectWithdrawal(withdrawalId: string) {
    const confirmed = window.confirm(
      "Are you sure you want to reject this withdrawal? The amount will be returned to the user's available balance."
    );

    if (!confirmed) {
      return;
    }

    setProcessingWithdrawalId(withdrawalId);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "reject_withdrawal",
        {
          p_withdrawal_id: withdrawalId,
        }
      );

      if (error) {
        console.error(
          "Withdrawal rejection error:",
          error
        );

        setMessage(
          error.message ||
            "Withdrawal rejection failed."
        );

        setProcessingWithdrawalId(null);
        return;
      }

      console.log(
        "Withdrawal rejection result:",
        data
      );

      setMessage(
        "Withdrawal rejected. Amount returned to wallet."
      );

      await checkAdminAndLoad();
    } catch (error) {
      console.error(error);

      setMessage(
        "Something went wrong while rejecting withdrawal."
      );
    }

    setProcessingWithdrawalId(null);
  }

  function getStatusClass(status: string) {
    if (status === "approved") {
      return "text-green-400";
    }

    if (status === "rejected") {
      return "text-red-400";
    }

    return "text-yellow-400";
  }

  function getMethodName(method?: string) {
    if (method === "easypaisa") {
      return "Easypaisa";
    }

    if (method === "jazzcash") {
      return "JazzCash";
    }

    if (method === "bank") {
      return "Bank Account";
    }

    return method || "Not available";
  }

  return (
    <main className="min-h-screen bg-slate-950 p-6 text-white">
      <div className="mx-auto max-w-6xl">

        <h1 className="text-4xl font-bold">
          Bright{" "}
          <span className="text-cyan-400">
            Future
          </span>
        </h1>

        <h2 className="mt-3 text-2xl font-bold">
          Admin Dashboard
        </h2>

        {loading && (
          <p className="mt-8 text-center text-slate-400">
            Checking admin access...
          </p>
        )}

        {!loading && message && (
          <div className="mt-8 rounded-xl border border-cyan-400/20 bg-cyan-400/10 p-5 text-center">
            <p className="font-bold text-cyan-400">
              {message}
            </p>
          </div>
        )}

        {/* ========================= */}
        {/* DEPOSIT REQUESTS */}
        {/* ========================= */}

        <section className="mt-10">

          <h3 className="text-2xl font-bold">
            Deposit Requests
          </h3>

          {!loading && deposits.length === 0 && (
            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
              <p className="text-slate-400">
                No deposit requests found.
              </p>
            </div>
          )}

          {!loading && deposits.length > 0 && (
            <div className="mt-5 space-y-4">

              {deposits.map((deposit) => (
                <div
                  key={deposit.id}
                  className="rounded-2xl border border-white/10 bg-white/5 p-6"
                >

                  <div className="grid gap-4 md:grid-cols-4">

                    <div>
                      <p className="text-sm text-slate-400">
                        User ID
                      </p>

                      <p className="mt-1 break-all text-sm">
                        {deposit.user_id}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Amount
                      </p>

                      <p className="mt-1 text-2xl font-bold">
                        Rs.{" "}
                        {Number(
                          deposit.amount
                        ).toLocaleString()}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Status
                      </p>

                      <p
                        className={`mt-1 font-bold uppercase ${getStatusClass(
                          deposit.status
                        )}`}
                      >
                        {deposit.status}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-slate-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm">
                        {new Date(
                          deposit.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                  </div>

                  {deposit.status === "pending" && (
                    <button
                      onClick={() =>
                        approveDeposit(
                          deposit.id
                        )
                      }
                      disabled={
                        approvingDepositId ===
                        deposit.id
                      }
                      className="mt-6 w-full rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {approvingDepositId ===
                      deposit.id
                        ? "Approving..."
                        : "Approve Deposit"}
                    </button>
                  )}

                  {deposit.status === "approved" && (
                    <div className="mt-6 rounded-xl bg-green-500/10 p-3 text-center">
                      <p className="font-bold text-green-400">
                        ✓ Deposit Approved
                      </p>
                    </div>
                  )}

                </div>
              ))}

            </div>
          )}

        </section>

        {/* ========================= */}
        {/* WITHDRAWAL REQUESTS */}
        {/* ========================= */}

        <section className="mt-12">

          <h3 className="text-2xl font-bold">
            Withdrawal Requests
          </h3>

          {!loading &&
            withdrawals.length === 0 && (
              <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-6 text-center">
                <p className="text-slate-400">
                  No withdrawal requests found.
                </p>
              </div>
            )}

          {!loading &&
            withdrawals.length > 0 && (
              <div className="mt-5 space-y-4">

                {withdrawals.map(
                  (withdrawal) => (
                    <div
                      key={withdrawal.id}
                      className="rounded-2xl border border-white/10 bg-white/5 p-6"
                    >

                      <div className="grid gap-4 md:grid-cols-4">

                        <div>
                          <p className="text-sm text-slate-400">
                            User ID
                          </p>

                          <p className="mt-1 break-all text-sm">
                            {withdrawal.user_id}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Amount
                          </p>

                          <p className="mt-1 text-2xl font-bold">
                            Rs.{" "}
                            {Number(
                              withdrawal.amount
                            ).toLocaleString()}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Status
                          </p>

                          <p
                            className={`mt-1 font-bold uppercase ${getStatusClass(
                              withdrawal.status
                            )}`}
                          >
                            {withdrawal.status}
                          </p>
                        </div>

                        <div>
                          <p className="text-sm text-slate-400">
                            Date
                          </p>

                          <p className="mt-1 text-sm">
                            {new Date(
                              withdrawal.created_at
                            ).toLocaleString()}
                          </p>
                        </div>

                      </div>

                      {/* PAYMENT DETAILS */}

                      <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5">

                        <h4 className="text-lg font-bold text-cyan-400">
                          Payment Details
                        </h4>

                        <div className="mt-4 grid gap-4 md:grid-cols-3">

                          <div>
                            <p className="text-sm text-slate-400">
                              Withdrawal Method
                            </p>

                            <p className="mt-1 font-bold">
                              {getMethodName(
                                withdrawal
                                  .withdrawal_method
                                  ?.method
                              )}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400">
                              Account Holder
                            </p>

                            <p className="mt-1 font-bold">
                              {withdrawal
                                .withdrawal_method
                                ?.account_name ||
                                "Not available"}
                            </p>
                          </div>

                          <div>
                            <p className="text-sm text-slate-400">
                              Account Number
                            </p>

                            <p className="mt-1 break-all font-bold">
                              {withdrawal
                                .withdrawal_method
                                ?.account_number ||
                                "Not available"}
                            </p>
                          </div>

                        </div>

                      </div>

                      {/* APPROVE / REJECT */}

                      {withdrawal.status ===
                        "pending" && (
                        <div className="mt-6 grid gap-3 md:grid-cols-2">

                          <button
                            onClick={() =>
                              approveWithdrawal(
                                withdrawal.id
                              )
                            }
                            disabled={
                              processingWithdrawalId ===
                              withdrawal.id
                            }
                            className="rounded-xl bg-green-500 px-6 py-3 font-bold text-slate-950 transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingWithdrawalId ===
                            withdrawal.id
                              ? "Processing..."
                              : "Approve Withdrawal"}
                          </button>

                          <button
                            onClick={() =>
                              rejectWithdrawal(
                                withdrawal.id
                              )
                            }
                            disabled={
                              processingWithdrawalId ===
                              withdrawal.id
                            }
                            className="rounded-xl bg-red-500 px-6 py-3 font-bold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {processingWithdrawalId ===
                            withdrawal.id
                              ? "Processing..."
                              : "Reject Withdrawal"}
                          </button>

                        </div>
                      )}

                      {withdrawal.status ===
                        "approved" && (
                        <div className="mt-6 rounded-xl bg-green-500/10 p-3 text-center">
                          <p className="font-bold text-green-400">
                            ✓ Withdrawal Approved
                          </p>
                        </div>
                      )}

                      {withdrawal.status ===
                        "rejected" && (
                        <div className="mt-6 rounded-xl bg-red-500/10 p-3 text-center">
                          <p className="font-bold text-red-400">
                            ✕ Withdrawal Rejected
                          </p>
                        </div>
                      )}

                    </div>
                  )
                )}

              </div>
            )}

        </section>

        <a
          href="/dashboard"
          className="mt-10 block text-center text-cyan-400"
        >
          Back to Dashboard
        </a>

      </div>
    </main>
  );
}