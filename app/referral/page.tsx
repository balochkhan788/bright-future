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
  const [levelCounts, setLevelCounts] = useState<number[]>(
    [0, 0, 0, 0, 0, 0, 0]
  );
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        console.log("User error:", userError);
      }

      if (!user) {
        setLoading(false);
        return;
      }

      const code =
        "BF" +
        user.id.replace(/-/g, "").substring(0, 8).toUpperCase();

      setReferralCode(code);

      // Total referrals
      const {
        count,
        error: referralError,
      } = await supabase
        .from("referrals")
        .select("id", {
          count: "exact",
          head: true,
        })
        .eq("referrer_id", user.id);

      if (referralError) {
        console.log(
          "Referral count error:",
          referralError
        );
      }

      setReferralCount(count || 0);

      // G-1 to G-7 counts
      const {
        data: levelData,
        error: levelError,
      } = await supabase
        .from("referrals")
        .select("level")
        .eq("referrer_id", user.id);

      if (levelError) {
        console.log(
          "Referral level error:",
          levelError
        );
      }

      const counts = [0, 0, 0, 0, 0, 0, 0];

      if (levelData) {
        levelData.forEach((item) => {
          const level = Number(item.level);

          if (level >= 1 && level <= 7) {
            counts[level - 1] += 1;
          }
        });
      }

      setLevelCounts(counts);

      // Referral rewards
      const {
        data: rewardData,
        error: rewardError,
      } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (rewardError) {
        console.log(
          "Referral rewards error:",
          rewardError
        );
      }

      const list = (rewardData || []) as Reward[];

      setRewards(list);

      const total = list
        .filter(
          (item) => item.status === "approved"
        )
        .reduce(
          (sum, item) =>
            sum + Number(item.amount || 0),
          0
        );

      setAvailableBonus(total);
    } catch (error) {
      console.error(
        "Referral page error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  function getReferralLink() {
    if (typeof window === "undefined") {
      return "";
    }

    return (
      window.location.origin +
      "/signup?ref=" +
      referralCode
    );
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

        {/* Header */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h1 className="text-2xl font-bold">
            Referral Center
          </h1>

          <p className="text-sm text-gray-500 mt-1">
            Apne referral network aur promotional rewards dekhein.
          </p>
        </div>

        {/* Referral Code */}
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

        {/* Main Stats */}
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

        {/* Referral Levels */}
        <div className="bg-white rounded-2xl shadow p-5">
          <h2 className="text-lg font-bold mb-4">
            Referral Levels
          </h2>

          <div className="grid grid-cols-2 gap-3">

            {levelCounts.map((total, index) => (
              <div
                key={index}
                className="border rounded-xl p-4 bg-gray-50"
              >
                <p className="text-sm text-gray-500">
                  G-{index + 1}
                </p>

                <p className="text-2xl font-bold mt-1">
                  {total}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  Referrals
                </p>
              </div>
            ))}

          </div>
        </div>

        {/* Reward History */}
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
                      Rs{" "}
                      {Number(
                        reward.amount
                      ).toLocaleString()}
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

        {/* Spin Wheel */}
        <button
          onClick={() => {
            window.location.href =
              "/spin-wheel";
          }}
          className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold"
        >
          🎡 Promotional Spin Wheel
        </button>

        {/* Dashboard */}
        <button
          onClick={() => {
            window.location.href =
              "/dashboard";
          }}
          className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold"
        >
          Back to Dashboard
        </button>

      </div>
    </main>
  );
}