"use client";

import { useState, useEffect } from "react";
import { User } from "@/types/models";
import { toast } from "react-toastify";

import MakePaymentForm from "@/components/MakePaymentForm";
import UserRegistrationModal from "@/components/UserRegistrationModal";

import { useWallet, InputTransactionData } from "@aptos-labs/wallet-adapter-react";
import { aptos } from "@/lib/aptos";

export default function PayPage() {
  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [checkingUser, setCheckingUser] = useState(false);

  const { account, connected, signAndSubmitTransaction } = useWallet();

  // ------------------------------
  // Fetch user from DB
  // ------------------------------
  const fetchCurrentUser = async () => {
    if (!connected || !account?.address) return;

    setCheckingUser(true);
    try {
      const res = await fetch("/api/users");
      const data = await res.json();

      if (data.success) {
        const user = data.users.find(
          (u: any) =>
            u.walletAddress.toLowerCase() ===
            account.address.toString().toLowerCase()
        );

        setCurrentUser(user);
        setShowRegistrationModal(!user);
      }
    } catch (err) {
      console.error("User fetch error:", err);
    } finally {
      setCheckingUser(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, [account?.address, connected]);

  // ------------------------------
  // Wallet not connected
  // ------------------------------
  if (!connected || !account?.address) {
    return (
      <div className="flex items-center justify-center min-h-screen text-white">
        <h2 className="text-xl">Please connect your wallet</h2>
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

  // ------------------------------
  // SEND PAYMENT
  // ------------------------------
  async function handleSend(recipient: User, amount: string) {
    if (!recipient || !recipient.walletAddress) {
      toast.error("Recipient not valid");
      return;
    }

    if (!signAndSubmitTransaction) {
      toast.error("Wallet not connected");
      return;
    }

    const octas = Math.floor(Number(amount) * 1e8);
    let txHash: string | null = null;

    try {
      // Format address correctly
      const receiverAddress =
        recipient.walletAddress.startsWith("0x")
          ? recipient.walletAddress
          : "0x" + recipient.walletAddress;

      // ------------------------------
      // CORRECT APTOS PAYLOAD (FIXED)
      // ------------------------------
      const payload: InputTransactionData = {
        data: {
          type: "entry_function_payload",
          function: "0x1::coin::transfer",
          typeArguments: ["0x1::aptos_coin::AptosCoin"],
          functionArguments: [receiverAddress, octas],
        },
      };

      // Send TX
      const submitted = await signAndSubmitTransaction(payload);
      txHash = submitted.hash;

      await aptos.waitForTransaction({ transactionHash: txHash });

      // Save SUCCESS
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: account.address.toString(),
          senderName: currentUser?.name || "Unknown",
          receiverAddress: receiverAddress,
          receiverName: recipient.name,
          amount: octas.toString(),
          amountInEth: amount,
          transactionHash: txHash,
          status: "success",
        }),
      });

      toast.success("Payment sent successfully!");
    } catch (err) {
      console.error("Payment failed:", err);

      // Save FAIL in MongoDB
      await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderAddress: account.address.toString(),
          senderName: currentUser?.name || "Unknown",
          receiverAddress: recipient.walletAddress,
          receiverName: recipient.name,
          amount: octas.toString(),
          amountInEth: amount,
          transactionHash: txHash ?? "NO_HASH",
          status: "failed",
        }),
      });

      toast.error("Payment failed!");
    }
  }

  // ------------------------------
  // MAIN PAGE
  // ------------------------------
  return (
    <div className="flex h-[calc(100vh-80px)] overflow-hidden">
      <div className="flex-1 p-4 overflow-y-auto">
        <MakePaymentForm onPaymentComplete={handleSend} />
      </div>

      {/* Registration Modal */}
      <UserRegistrationModal
        isOpen={showRegistrationModal}
        onClose={() => setShowRegistrationModal(false)}
        onComplete={fetchCurrentUser}
        walletAddress={account.address.toString()}
      />
    </div>
  );
}
