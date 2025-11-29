import mongoose from "mongoose";

const PaymentSchema = new mongoose.Schema(
  {
    senderAddress: String,
    senderName: String,
    receiverAddress: String,
    receiverName: String,
    amount: String,
    amountInEth: String,
    transactionHash: String,
    status: String,
  },
  { timestamps: true }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
