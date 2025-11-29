import { useState, useEffect } from "react";
import { User } from "@/types/models";
import RecipientSelector from "./RecipientSelector";
import AmountInput from "./AmountInput";
import PaymentModal from "./PaymentModal";
import ScanQR from "./ScanQR";
import { useWallet } from "@aptos-labs/wallet-adapter-react";

interface MakePaymentFormProps {
  users?: User[];
  onPaymentComplete: (recipient: User, amount: string) => Promise<void>;
  preselectedRecipient?: User | null;
}

export default function MakePaymentForm({
  users,
  onPaymentComplete,
  preselectedRecipient,
}: MakePaymentFormProps) {
  const [selectedRecipient, setSelectedRecipient] = useState<User | null>(null);
  const [amount, setAmount] = useState("");
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { account } = useWallet();

  // -------------------

  const [scannedData, setScannedData] = useState<{
    username: string;
    walletAddress: string;
  } | null>(null);

  const [showScanner, setShowScanner] = useState(false);

  const handleQRScanned = (data: { username: string; walletAddress: string }) => {
    console.log("📌 Scanned Data:", data); // <-- Console log
    setScannedData(data); // Display on screen
    setShowScanner(false); // Close scanner after success
  };

  // -------------------

  const handleMakePayment = () => {
    if (!selectedRecipient || !amount) return;
    setShowPaymentModal(true);
  };

  const confirmPayment = async () => {
    if (!selectedRecipient || !amount) return;
    setIsLoading(true);

    try {
      await onPaymentComplete(selectedRecipient, amount);
      setSelectedRecipient(null);
      setAmount("");
      setShowPaymentModal(false);
    } catch (error) {
      console.error("Payment failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (preselectedRecipient) {
      setSelectedRecipient(preselectedRecipient);
    }
  }, [preselectedRecipient]);

  return (
    <>
      <div className="w-full max-w-3xl mx-auto">
        <div className="bg-white/90 rounded-2xl p-8 shadow">
          <h2 className="text-3xl font-bold text-emerald-900 text-center mb-6">
            Send Payment
          </h2>

          <div className="space-y-6">
            <RecipientSelector
              users={users || []}
              currentUserAddress={account?.address?.toString()}
              onRecipientSelect={setSelectedRecipient}
              selectedRecipient={selectedRecipient}
            />

            <AmountInput amount={amount} onAmountChange={setAmount} />

            <button
              onClick={handleMakePayment}
              disabled={!selectedRecipient || !amount}
              className="w-full py-4 bg-emerald-600 text-white rounded-xl text-lg font-semibold hover:bg-emerald-700 disabled:opacity-50"
            >
              Continue to Payment
            </button>
          </div>
        </div>
      </div>
      
{!showScanner && (
        <button
          onClick={() => setShowScanner(true)}
          className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
        >
          Scan QR Code
        </button>
      )}

      {/* Show QR Scanner */}
      {showScanner && (
        <ScanQR
          onQRScanned={handleQRScanned}
          onCancel={() => setShowScanner(false)}
        />
      )}

      {/* Show Scanned Data */}
      {scannedData && (
        <div className="mt-6 p-4 bg-white shadow rounded-xl w-full max-w-md text-center">
          <h3 className="text-xl font-bold text-emerald-900">Scanned Data</h3>
          <p className="mt-2 text-gray-700">
            <span className="font-semibold">Username:</span> {scannedData.username}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Wallet Address:</span> {scannedData.walletAddress}
          </p>
        </div>
      )}
      {showPaymentModal && selectedRecipient && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          recipient={selectedRecipient}
          amount={amount}
          isLoading={isLoading}
          onConfirm={confirmPayment}
        />
      )}
    </>
  );
}
