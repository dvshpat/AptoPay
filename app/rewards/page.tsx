"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@aptos-labs/wallet-adapter-react";
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

export default function RewardsPage() {
    const { account, connected } = useWallet();
    const [rewards, setRewards] = useState<Reward[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRewards = async () => {
            if (!account?.address) return;
            try {
                const res = await fetch(
                    `/api/rewards?walletAddress=${account.address.toString()}`
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

        if (connected) {
            fetchRewards();
        } else {
            setLoading(false);
        }
    }, [account, connected]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-emerald-900">My Rewards</h1>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-white text-emerald-700 rounded-lg shadow hover:bg-emerald-50 transition"
                    >
                        ← Back to Dashboard
                    </Link>
                </div>

                {!connected ? (
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
                        <Link
                            href="/pay"
                            className="inline-block px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                        >
                            Make a Payment
                        </Link>
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
        </div>
    );
}
