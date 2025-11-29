"use client";

import { useEffect, useState } from "react";
import { TOKEN_SYMBOL } from "@/config";

interface Payment {
  _id: string;
  senderName?: string;
  senderAddress: string;
  receiverName?: string;
  receiverAddress: string;
  amountInEth: string;
  transactionHash: string;
  createdAt: string;
  status: "success" | "failed";
}

export default function PaymentHistory({ userAddress }: { userAddress: string }) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);

  const loadPayments = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/payments?address=${userAddress}`);
      const data = await res.json();

      if (data.success) setPayments(data.payments);
    } catch (err) {
      console.error("Fetch error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    if (userAddress) loadPayments();
  }, [userAddress]);

  const getStatusColor = (s: string) =>
    s === "success"
      ? "bg-green-500/20 text-green-400"
      : "bg-red-500/20 text-red-400";

  if (loading) {
    return (
      <div className="text-center mt-20 text-slate-300">
        Loading history...
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="text-center mt-20 text-slate-400">
        No transactions found.
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pt-10 space-y-4">
      <h2 className="text-3xl font-bold text-white mb-6">Transaction History</h2>

      {payments.map((p) => (
        <div
          key={p._id}
          className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-xl"
        >
          <div className="flex items-center justify-between">

            {/* LEFT */}
            <div>
              <h3 className="text-white font-semibold text-lg">
               {p.senderAddress.toLowerCase() === userAddress.toLowerCase()
                ? "Sent To:" : "Received From:"}
                {" "}
                {p.receiverName ?? p.senderName}
              </h3>

              <p className="text-slate-400 font-mono text-sm">
                {p.receiverAddress}
              </p>

              <p className="text-slate-500 text-sm mt-1">
                {new Date(p.createdAt).toLocaleString()}
              </p>

              {p.transactionHash && (
                <p className="text-xs text-slate-400 font-mono break-all mt-2">
                  TX: {p.transactionHash}
                </p>
              )}
            </div>

            {/* RIGHT */}
            <div className="text-right">
              <p className="text-2xl font-bold text-white">
                {p.amountInEth} {TOKEN_SYMBOL}
              </p>

              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                  p.status
                )}`}
              >
                {p.status.toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
