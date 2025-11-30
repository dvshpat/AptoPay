"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

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

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100
            }
        }
    };

    const cardHoverVariants = {
        hover: {
            scale: 1.02,
            y: -5,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 25
            }
        }
    };

    return (
        <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="max-w-4xl mx-auto"
        >
            <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                    My Rewards
                </h1>
            </motion.div>

            {/* Total Points Card */}
            <motion.div 
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className="relative bg-gradient-to-br from-emerald-500 via-green-500 to-emerald-600 rounded-3xl p-8 shadow-2xl mb-8 text-white overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                <div className="relative z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-semibold opacity-90">Total Earned</h2>
                        <motion.div 
                            className="text-6xl font-bold mt-2"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring" }}
                        >
                            {totalPoints}
                        </motion.div>
                        <p className="text-sm opacity-80 mt-1">Lifetime Points</p>
                    </div>
                    <motion.div 
                        className="text-8xl opacity-20"
                        animate={{ 
                            rotate: [0, 5, -5, 0],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{ 
                            duration: 4,
                            repeat: Infinity,
                            repeatType: "reverse"
                        }}
                    >
                        🏆
                    </motion.div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-yellow-400 to-amber-500" />
            </motion.div>

            <AnimatePresence mode="wait">
                {!userAddress ? (
                    <motion.div
                        key="no-wallet"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-12 shadow-xl text-center border border-emerald-100/50"
                    >
                        <motion.div
                            animate={{ 
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-6xl mb-6"
                        >
                            🔒
                        </motion.div>
                        <h3 className="text-2xl font-bold text-emerald-900 mb-4">
                            Connect Your Wallet
                        </h3>
                        <p className="text-emerald-600 text-lg">
                            Please connect your wallet to view rewards.
                        </p>
                    </motion.div>
                ) : loading ? (
                    <motion.div
                        key="loading"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center py-16"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                            className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-6"
                        />
                        <p className="text-emerald-600 text-lg font-medium">Loading rewards...</p>
                    </motion.div>
                ) : rewards.length === 0 ? (
                    <motion.div
                        key="no-rewards"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white/80 backdrop-blur-sm rounded-3xl p-16 shadow-xl text-center border border-emerald-100/50"
                    >
                        <motion.div
                            animate={{ 
                                y: [0, -10, 0],
                                scale: [1, 1.1, 1]
                            }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-8xl mb-8"
                        >
                            🎁
                        </motion.div>
                        <h3 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent mb-4">
                            No Rewards Yet
                        </h3>
                        <p className="text-emerald-600 text-lg mb-2">
                            Make payments to earn exciting rewards!
                        </p>
                        <p className="text-emerald-400 text-sm">
                            Every transaction brings you closer to amazing benefits
                        </p>
                    </motion.div>
                ) : (
                    <motion.div
                        key="rewards-list"
                        variants={containerVariants}
                        className="grid gap-6"
                    >
                        {rewards.map((reward, idx) => (
                            <motion.div
                                key={idx}
                                variants={itemVariants}
                                whileHover="hover"
                                variants={cardHoverVariants}
                                className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-emerald-100/50 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                <div className="relative z-10 flex items-center justify-between">
                                    <div className="flex items-center gap-6">
                                        <motion.div 
                                            className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl flex items-center justify-center text-2xl shadow-lg group-hover:shadow-xl transition-all"
                                            whileHover={{ scale: 1.1, rotate: 5 }}
                                        >
                                            🎉
                                        </motion.div>
                                        <div>
                                            <h4 className="font-bold text-emerald-900 text-xl capitalize">
                                                {reward.eventType.replace(/_/g, " ")}
                                            </h4>
                                            <p className="text-sm text-emerald-600 mt-1">
                                                {new Date(reward.timestamp).toLocaleDateString()} at{" "}
                                                {new Date(reward.timestamp).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <motion.div 
                                            className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: 0.5 + idx * 0.1, type: "spring" }}
                                        >
                                            +{reward.reward.data.token_amount}{" "}
                                            {reward.reward.data.token_symbol}
                                        </motion.div>
                                        <div className="text-xs text-emerald-400 font-semibold uppercase tracking-wider mt-1">
                                            Earned
                                        </div>
                                    </div>
                                </div>
                                <motion.div 
                                    className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-green-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                                    initial={{ scaleX: 0 }}
                                    whileInView={{ scaleX: 1 }}
                                    transition={{ delay: 0.2 + idx * 0.05 }}
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
