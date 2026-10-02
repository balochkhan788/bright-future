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

type ActiveReferral = {
  user_id: string;
  plan_name: string;
  amount: number;
};

export default function ReferralPage() {
  const [referralCode, setReferralCode] = useState("");
  const [referralCount, setReferralCount] = useState(0);
  const [availableBonus, setAvailableBonus] = useState(0);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [levelCounts, setLevelCounts] = useState<number[]>(
    [0, 0, 0, 0, 0, 0, 0]
  );
  const [activeReferrals, setActiveReferrals] = useState<ActiveReferral[]>(
    []
  );

  const [loading, setLoading] = useState(true);
  const [requestingReward, setRequestingReward] = useState(false);
  const [message, setMessage] = useState("");
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

      /*
       * Get referred users.
       */
      const {
        data: referralUsers,
        error: referralUsersError,
      } = await supabase
        .from("referrals")
        .select("referred_user_id")
        .eq("referrer_id", user.id);

      if (referralUsersError) {
        console.log("Referral users error:", referralUsersError);
      }

      const referredUserIds = (referralUsers || [])
  .map((item) => item.referred_user_id)
  .filter(Boolean);

console.log("REFERRAL USERS:", referralUsers);
console.log("REFERRAL USER IDS:", referredUserIds);

let activeList: ActiveReferral[] = [];

      if (referredUserIds.length > 0) {
        const { data: planData, error: planError } = await supabase
          .from("user_plans")
          .select("user_id, plan_name, amount")
          .in("user_id", referredUserIds);
console.log("Referral IDs:", referredUserIds);
console.log("Active Plans:", planData);
console.log("Plan Error:", planError);
        if (planError) {
          console.log("Referral active plans error:", planError);
        }

        activeList = (planData || []).map((item) => ({
          user_id: item.user_id,
          plan_name: item.plan_name,
          amount: Number(item.amount || 0),
        }));
      }

      setActiveReferrals(activeList);

      /*
       * Count active members according to their active plan.
       */
      const counts = [0, 0, 0, 0, 0, 0, 0];

      activeList.forEach((item) => {
        const match = String(item.plan_name || "")
          .trim()
          .match(/^G-([1-7])$/i);

        if (match) {
          const level = Number(match[1]);

          if (level >= 1 && level <= 7) {
            counts[level - 1] += 1;
          }
        }
      });

      setLevelCounts(counts);

      // Total Active Referrals
      setReferralCount(activeList.length);

      const { data: rewardData, error: rewardError } = await supabase
        .from("referral_rewards")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", {
          ascending: false,
        });

      if (rewardError) {
        console.log("Referral rewards error:", rewardError);
      }

      const list = (rewardData || []) as Reward[];

      setRewards(list);

      const total = list
        .filter((item) => item.status === "approved")
        .reduce(
          (sum, item) => sum + Number(item.amount || 0),
          0
        );

      setAvailableBonus(total);
    } catch (error) {
      console.error("Referral page error:", error);
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

  async function requestPromotionalReward() {
    if (requestingReward) return;

    setRequestingReward(true);
    setMessage("");

    try {
      const { data, error } = await supabase.rpc(
        "create_referral_reward_request",
        {
          p_reward_type: "Promotional Reward",
          p_description:
            "Promotional reward request submitted by user.",
        }
      );

      if (error) {
        console.error(error);
        setMessage(error.message);
        return;
      }

      if (data) {
        setMessage(
          "Reward request submit ho gayi hai. Admin approval ke baad amount show hoga."
        );

        await loadData();
      }
    } catch (error) {
      console.error(error);
      setMessage("Reward request submit nahi ho saki.");
    } finally {
      setRequestingReward(false);
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
            Apne referral network aur promotional rewards dekhein.
          </p>
        </div>

        {message && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded-2xl p-4 text-sm">
            {message}
          </div>
        )}

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
              Total Active Referrals
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

          <h2 className="text-lg font-bold mb-3">
            Promotional Reward
          </h2>

          <p className="text-sm text-gray-500 mb-4">
            Reward request Admin approval ke liye submit karein.
          </p>

          <button
            onClick={requestPromotionalReward}
            disabled={requestingReward}
            className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold disabled:opacity-50"
          >
            {requestingReward
              ? "Submitting..."
              : "Request Promotional Reward"}
          </button>

        </div>

        {/* Referral Levels + Members */}

        <div className="bg-white rounded-2xl shadow p-5">

          <h2 className="text-lg font-bold mb-4">
            Referral Levels
          </h2>

          <div className="space-y-4">

            {levelCounts.map((total, index) => {
              const planName = `G-${index + 1}`;

              const members = activeReferrals.filter(
                (member) =>
                  String(member.plan_name || "")
                    .trim()
                    .toUpperCase() === planName
              );

              return (
                <div
                  key={planName}
                  className="border rounded-2xl overflow-hidden"
                >

                  <div className="bg-gray-50 p-4 flex justify-between items-center">

                    <div>
                      <p className="font-bold text-lg">
                        {planName}
                      </p>

                      <p className="text-xs text-gray-500">
                        Active Members
                      </p>
                    </div>

                    <div className="bg-black text-white rounded-xl px-4 py-2 font-bold">
                      {total}
                    </div>

                  </div>

                  {members.length > 0 && (
                    <div className="p-3 space-y-2">

                      {members.map((member, memberIndex) => (
                        <div
                          key={`${member.user_id}-${memberIndex}`}
                          className="border rounded-xl p-3 bg-white"
                        >

                          <div className="flex justify-between items-center">
                            <span className="font-semibold">
                              Member {memberIndex + 1}
                            </span>

                            <span className="font-bold">
                              {member.plan_name}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500 mt-2 break-all">
                            User ID: {member.user_id}
                          </p>

                          <div className="flex justify-between text-sm mt-2">
                            <span className="text-gray-500">
                              Plan Amount
                            </span>

                            <span className="font-semibold">
                              Rs{" "}
                              {Number(
                                member.amount || 0
                              ).toLocaleString()}
                            </span>
                          </div>

                        </div>
                      ))}

                    </div>
                  )}

                  {members.length === 0 && (
                    <div className="p-4">
                      <p className="text-xs text-gray-400">
                        Is plan ka koi active referred member nahi hai.
                      </p>
                    </div>
                  )}

                </div>
              );
            })}

          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-5">

          <h2 className="text-lg font-bold mb-4">
            Active Referral Members
          </h2>

          {activeReferrals.length === 0 ? (
            <p className="text-sm text-gray-500">
              Abhi kisi referred member ne plan active nahi kiya.
            </p>
          ) : (
            <div className="space-y-3">

              {activeReferrals.map((member, index) => (
                <div
                  key={`${member.user_id}-${index}`}
                  className="border rounded-xl p-4 bg-gray-50"
                >

                  <div className="flex justify-between items-center">
                    <span className="font-semibold">
                      Member {index + 1}
                    </span>

                    <span className="font-bold">
                      {member.plan_name}
                    </span>
                  </div>

                  <p className="text-xs text-gray-500 mt-2 break-all">
                    User ID: {member.user_id}
                  </p>

                  <div className="flex justify-between text-sm mt-2">
                    <span className="text-gray-500">
                      Active Plan
                    </span>

                    <span className="font-semibold">
                      {member.plan_name}
                    </span>
                  </div>

                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-500">
                      Plan Amount
                    </span>

                    <span className="font-semibold">
                      Rs{" "}
                      {Number(
                        member.amount || 0
                      ).toLocaleString()}
                    </span>
                  </div>

                </div>
              ))}

            </div>
          )}

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