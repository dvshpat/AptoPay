"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface Reward {
    eventType: string;
    timestamp: string;
    reward: {
        data: {
            token_amount: number;
            token_symbol: string;
        };
    };
}

export default function RewardsView({ userAddress }: { userAddress: string }) {
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewards = async () => {
            if (!userAddress) return;
            try {
                const res = await fetch(
                    `/api/rewards?walletAddress=${userAddress}`
                );
                const data = await res.json();
                if (data.success) {
                    setRewards(data.rewards);
                }
            } catch (err) {
                console.error("Failed to fetch rewards:", err);
            } finally {
                setLoading(false);
            }
        };

        if (userAddress) {
            fetchRewards();
        } else {
            setLoading(false);
        }
    }, [userAddress]);

    const totalPoints = rewards.reduce((sum, r) => sum + (r.reward.data.token_amount || 0), 0);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-emerald-900">My Rewards</h1>
            </div>

            {/* Total Points Card */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-500 rounded-2xl p-8 shadow-lg mb-8 text-white flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-semibold opacity-90">Total Earned</h2>
                    <div className="text-5xl font-bold mt-2">{totalPoints}</div>
                    <p className="text-sm opacity-80 mt-1">Lifetime Points</p>
                </div>
                <div className="text-6xl opacity-20">🏆</div>
            </div>

            {!userAddress ? (
                <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                    <p className="text-emerald-800 text-lg">
                        Please connect your wallet to view rewards.
                    </p>
                </div>
            ) : loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-emerald-600">Loading rewards...</p>
                </div>
            ) : rewards.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 shadow-lg text-center">
                    <div className="text-6xl mb-4">🎁</div>
                    <h3 className="text-2xl font-bold text-emerald-900 mb-2">
                        No Rewards Yet
                    </h3>
                    <p className="text-emerald-600 mb-6">
                        Make payments to earn exciting rewards!
                    </p>
                    {/* We don't need a link to pay here since we are already in the dashboard context, 
                        but maybe we can switch tabs? For now, just text is fine or a button that does nothing/alerts. 
                        Actually, since this is a component inside the dashboard, we might want to let the parent handle navigation, 
                        but for simplicity I'll remove the button or make it just a visual call to action. 
                    */}
                </div>
            ) : (
                <div className="grid gap-4">
                    {rewards.map((reward, idx) => (
                        <div
                            key={idx}
                            className="bg-white rounded-xl p-6 shadow-md flex items-center justify-between border border-emerald-100 hover:shadow-lg transition"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-2xl">
                                    🎉
                                </div>
                                <div>
                                    <h4 className="font-bold text-emerald-900 text-lg">
                                        {reward.eventType.replace(/_/g, " ")}
                                    </h4>
                                    <p className="text-sm text-emerald-600">
                                        {new Date(reward.timestamp).toLocaleDateString()} at{" "}
                                        {new Date(reward.timestamp).toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-emerald-600">
                                    +{reward.reward.data.token_amount}{" "}
                                    {reward.reward.data.token_symbol}
                                </div>
                                <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">
                                    Earned
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
