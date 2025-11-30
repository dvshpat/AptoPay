"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PayPage from "@/components/paySection/PayUsers";
import ReceivePage from "@/components/recieveSection/ReceiveUser";
import PaymentHistory from "@/components/paymentHistory/PaymentHistory";
import RewardsView from "@/components/Rewards/RewardsView";
import RequestPaymentForm from "@/components/requestAPT/RequestPaymentForm";
import IncomingRequestsList from "@/components/requestAPT/IncomingRequestsList";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

export default function Page() {
  const [activeTab, setActiveTab] = useState<"pay" | "receive" | "request" | "history" | "rewards">("pay");
  const [requestSubTab, setRequestSubTab] = useState<"requestMoney" | "incoming">("requestMoney");

  const { account } = useWallet();
  const userAddress = account?.address?.toString() || "";

  const tabVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.3, ease: "easeOut" }
    },
    exit: { 
      opacity: 0, 
      x: -20,
      transition: { duration: 0.2 }
    }
  };

  const sidebarVariants = {
    hidden: { x: -50, opacity: 0 },
    visible: { 
      x: 0, 
      opacity: 1,
      transition: { duration: 0.4, ease: "easeOut" }
    }
  };

  const tabButtons = [
    { id: "pay", label: "Pay", gradient: "from-green-500 to-emerald-600", icon: "💸" },
    { id: "receive", label: "Receive", gradient: "from-emerald-500 to-green-600", icon: "📥" },
    { id: "request", label: "Request", gradient: "from-green-500 to-emerald-600", icon: "📋" },
    { id: "history", label: "History", gradient: "from-amber-500 to-orange-500", icon: "📊" },
    { id: "rewards", label: "Rewards", gradient: "from-purple-500 to-indigo-500", icon: "🎁" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 flex">
      {/* SIDEBAR */}
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={sidebarVariants}
        className="w-80 bg-white/90 backdrop-blur-xl border-r border-emerald-200/50 shadow-2xl"
      >
        <div className="p-8">
          

          {/* NAVIGATION */}
          <div className="space-y-3">
            {tabButtons.map((tab, index) => (
              <motion.button
                key={tab.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.1 }}
                onClick={() => setActiveTab(tab.id as any)}
                className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl text-left font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                  activeTab === tab.id
                    ? `bg-gradient-to-r ${tab.gradient} text-white shadow-lg`
                    : "text-emerald-700 hover:bg-emerald-50/80 hover:text-emerald-900 border border-transparent hover:border-emerald-200"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="text-xl">{tab.icon}</span>
                <span className="text-lg">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="activeTab"
                    className="w-2 h-2 bg-white rounded-full ml-auto"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* MAIN CONTENT */}
      <div className="flex-1 p-8 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="h-full"
          >
            {activeTab === "pay" && <PayPage />}
            {activeTab === "receive" && <ReceivePage />}

            {/* REQUEST SECTION */}
            {activeTab === "request" && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                {/* SUB TABS */}
                <motion.div 
                  className="flex space-x-4 border-b border-emerald-200/50 pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  <button
                    onClick={() => setRequestSubTab("requestMoney")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      requestSubTab === "requestMoney"
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                        : "text-emerald-700 hover:bg-emerald-50/80 border border-emerald-200"
                    }`}
                  >
                    Request Money
                  </button>

                  <button
                    onClick={() => setRequestSubTab("incoming")}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                      requestSubTab === "incoming"
                        ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg"
                        : "text-emerald-700 hover:bg-emerald-50/80 border border-emerald-200"
                    }`}
                  >
                    Incoming Requests
                  </button>
                </motion.div>

                {/* SUB TAB CONTENT */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={requestSubTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    {requestSubTab === "requestMoney" && (
                      <RequestPaymentForm currentUser={{ walletAddress: userAddress }} />
                    )}

                    {requestSubTab === "incoming" && <IncomingRequestsList />}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {activeTab === "history" && <PaymentHistory userAddress={userAddress} />}
            {activeTab === "rewards" && <RewardsView userAddress={userAddress} />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
