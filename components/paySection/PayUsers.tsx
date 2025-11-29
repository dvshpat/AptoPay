"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/models";
import { toast } from "react-toastify";

import MakePaymentForm from "@/components/MakePaymentForm";
import PaymentHistory from "@/components/paymentHistory/PaymentHistory";
import UserRegistrationModal from "@/components/UserRegistrationModal";

import {
  useWallet,
  InputTransactionData,
} from "@aptos-labs/wallet-adapter-react";

import { aptos } from "@/lib/aptos";

export default function PayPage() {
  const [activeTab, setActiveTab] = useState<"make" | "view">("make");
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);
  const [hasCheckedUser, setHasCheckedUser] = useState(false);

  const { account, signAndSubmitTransaction, connected } = useWallet();

  const fetchCurrentUser = async () => {
    if (!account?.address || !connected || hasCheckedUser) return;
    setCheckingUser(true);

    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        const user = data.users.find(
          (u: any) =>
            u.walletAddress.toLowerCase() === account.address.toString()
        );
        setCurrentUser(user);
        setHasCheckedUser(true);

        if (!user) {
          setShowRegistrationModal(true);
        } else {
          setShowRegistrationModal(false);
        }
      }
    } catch (error) {
      console.error("User fetch error:", error);
    } finally {
      setCheckingUser(false);
    }
  };

  useEffect(() => {
    if (connected && account?.address) {
      fetchCurrentUser();
    }
  }, [connected, account?.address]);

  if (!connected || !account?.address) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <div className="text-center">
          <h2 className="text-3xl font-bold">SecurePay</h2>
          <p className="mt-4 text-slate-300">
            Please connect your wallet using the navbar
          </p>
        </div>
      </div>
    );
  }

  if (checkingUser) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-300">
        Checking user...
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "make" ? (
          <MakePaymentForm
            onPaymentComplete={async (recipient: User, amount: string) => {
              if (!account || !signAndSubmitTransaction)
                throw new Error("Wallet not connected");

              const txAmount = Math.floor(Number(amount) * 1e8); // APT → Octas

              const transaction: InputTransactionData = {
                data: {
                  function: "0x1::coin::transfer",
                  typeArguments: ["0x1::aptos_coin::AptosCoin"],
                  functionArguments: [recipient.walletAddress, txAmount],
                },
              };

              try {
                const tx = await signAndSubmitTransaction(transaction);
                await aptos.waitForTransaction({ transactionHash: tx.hash });

                // Save to DB
                await fetch("/api/payments", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    senderAddress: account.address,
                    senderName: currentUser?.name,
                    receiverAddress: recipient.walletAddress,
                    receiverName: recipient.name,
                    amount: txAmount.toString(),
                    amountInEth: amount,
                    transactionHash: tx.hash,
                  }),
                });

                toast.success("Payment sent successfully!");
              } catch (err) {
                console.error("Payment failed:", err);
                toast.error("Payment failed.");
              }
            }}
          />
        ) : (
          <PaymentHistory userAddress={account?.address.toString()} />
        )}
      </div>

      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={() => {
          setHasCheckedUser(false);
          fetchCurrentUser();
        }}
        walletAddress={account?.address.toString()}
      />
    </div>
  );
}
