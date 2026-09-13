"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Reward = {
  id: string;
  reward_type: string;
  amount: number;
  description: string | null;
  status: string;
  created_at: string;
};

export default function ReferralRewardsPage() {
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRewards();
  }, []);

  async function loadRewards() {
    try {
      const result = await supabase
        .from("referral_rewards")
        .select("*")
        .order("created_at", { ascending: false });

      if (result.error) {
        console.error(result.error);
        setLoading(false);
        return;
      }

      setRewards((result.data || []) as Reward[]);
    } catch (error) {
      console.error(error);
    }

    setLoading(false);
  }

  let pendingAmount = 0;
  let approvedAmount = 0;
  let rejectedAmount = 0;

  let pendingCount = 0;
  let approvedCount = 0;
  let rejectedCount = 0;

  rewards.forEach(function (reward) {
    const amount = Number(reward.amount || 0);

    if (reward.status === "pending") {
      pendingAmount += amount;
      pendingCount++;
    }

    if (reward.status === "approved") {
      approvedAmount += amount;
      approvedCount++;
    }

    if (reward.status === "rejected") {
      rejectedAmount += amount;
      rejectedCount++;
    }
  });

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">

      <div className="max-w-md mx-auto">

        <div className="bg-white rounded-2xl shadow p-5 mb-4">
          <h1 className="text-2xl font-bold">
            Referral Rewards
          </h1>

          <p className="text-sm text-gray-500 mt-2">
            Promotional rewards history
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">
              Pending
            </p>

            <p className="text-2xl font-bold mt-2">
              Rs {pendingAmount.toLocaleString()}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {pendingCount} Rewards
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">
              Approved
            </p>

            <p className="text-2xl font-bold text-green-600 mt-2">
              Rs {approvedAmount.toLocaleString()}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {approvedCount} Rewards
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">
              Rejected
            </p>

            <p className="text-2xl font-bold text-red-600 mt-2">
              Rs {rejectedAmount.toLocaleString()}
            </p>

            <p className="text-xs text-gray-500 mt-1">
              {rejectedCount} Rewards
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-4">
            <p className="text-sm text-gray-500">
              Total Approved
            </p>

            <p className="text-2xl font-bold text-purple-600 mt-2">
              Rs {approvedAmount.toLocaleString()}
            </p>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-5">

          <h2 className="text-lg font-bold mb-4">
            Rewards History
          </h2>

          {rewards.length === 0 ? (
            <p className="text-gray-500 text-sm">
              Abhi koi reward nahi hai.
            </p>
          ) : (
            <div className="space-y-3">

              {rewards.map(function (reward) {
                return (
                  <div
                    key={reward.id}
                    className="border rounded-xl p-4"
                  >

                    <div className="flex justify-between">

                      <p className="font-semibold">
                        {reward.reward_type}
                      </p>

                      <p className="font-bold">
                        Rs {Number(reward.amount || 0).toLocaleString()}
                      </p>

                    </div>

                    {reward.description ? (
                      <p className="text-sm text-gray-500 mt-2">
                        {reward.description}
                      </p>
                    ) : null}

                    <div className="flex justify-between mt-3">

                      <p className="text-xs text-gray-500">
                        {new Date(
                          reward.created_at
                        ).toLocaleDateString()}
                      </p>

                      <p className="text-xs font-bold">
                        {reward.status}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>
          )}

        </div>

        <button
          onClick={function () {
            window.location.href = "/dashboard";
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold mt-4"
        >
          Back to Dashboard
        </button>

      </div>

    </main>
  );
}