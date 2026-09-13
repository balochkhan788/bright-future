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

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [availableBonus, setAvailableBonus] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    const code =
      "BF" +
      user.id.replace(/-/g, "").substring(0, 8).toUpperCase();

    setReferralCode(code);

    const { data: referrals } = await supabase
      .from("referrals")
      .select("id")
      .eq("referrer_id", user.id);

    setReferralCount(referrals?.length || 0);

    const { data: rewardData } = await supabase
      .from("referral_rewards")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const list = (rewardData || []) as Reward[];

    setRewards(list);

    const total = list
      .filter((item) => item.status === "approved")
      .reduce(
        (sum, item) => sum + Number(item.amount || 0),
        0
      );

    setAvailableBonus(total);
    setLoading(false);
  }

  function getReferralLink() {
    if (typeof window === "undefined") {
      return "";
    }

    const link =
      window.location.origin +
      "/signup?ref=" +
      referralCode;

    return link;
  }

  async function copyLink() {
    const link = getReferralLink();

    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);

      setTimeout(function () {
        setCopied(false);
      }, 2000);
    } catch {
      alert("Referral link copy nahi ho saka.");
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto space-y-4">

        <div className="bg-white rounded-2xl shadow p-5">
          <h1 className="text-2xl font-bold">
            Referral Center
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Apne referrals aur promotional rewards dekhein.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <p className="text-sm text-gray-500">
            Your Referral Code
          </p>

          <div className="flex gap-2 mt-2">
            <div className="flex-1 bg-gray-100 rounded-xl p-3 font-bold">
              {referralCode}
            </div>

            <button
              onClick={copyLink}
              className="bg-black text-white px-4 rounded-xl"
            >
              {copied ? "Copied" : "Copy"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-3 break-all">
            {getReferralLink()}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-gray-500">
              Total Referrals
            </p>

            <p className="text-3xl font-bold mt-2">
              {referralCount}
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow p-5">
            <p className="text-sm text-gray-500">
              Available Bonus
            </p>

            <p className="text-2xl font-bold mt-2">
              Rs {availableBonus.toLocaleString()}
            </p>
          </div>

        </div>

        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold mb-4">
            Reward History
          </h2>

          {rewards.length === 0 ? (
            <p className="text-sm text-gray-500">
              Abhi koi promotional reward nahi hai.
            </p>
          ) : (
            <div className="space-y-3">
              {rewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border rounded-xl p-3"
                >
                  <div className="flex justify-between">
                    <span className="font-semibold">
                      {reward.reward_type}
                    </span>

                    <span className="font-bold">
                      Rs {Number(reward.amount).toLocaleString()}
                    </span>
                  </div>

                  {reward.description && (
                    <p className="text-sm text-gray-500 mt-1">
                      {reward.description}
                    </p>
                  )}

                  <div className="flex justify-between text-xs mt-2">
                    <span>
                      {new Date(
                        reward.created_at
                      ).toLocaleDateString()}
                    </span>

                    <span>
                      {reward.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={() => {
            window.location.href = "/spin-wheel";
          }}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold"
        >
          🎡 Promotional Spin Wheel
        </button>

        <button
          onClick={() => {
            window.location.href = "/dashboard";
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold"
        >
          Back to Dashboard
        </button>

      </div>
    </main>
  );
}