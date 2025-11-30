import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  walletAddress: string;
  name: string;
  createdAt: Date;

  // 🔥 Photon fields
  photonUserId?: string;
  photonAccessToken?: string;
  photonRefreshToken?: string;

  // Rewards history
  rewards?: {
    eventType: string;
    timestamp: Date;
    reward: any;
  }[];
}

const UserSchema: Schema<IUser> = new Schema({
  walletAddress: { type: String, required: true, unique: true },
  name: { type: String, required: true },

  // 🔥 Added Photon fields
  photonUserId: { type: String },
  photonAccessToken: { type: String },
  photonRefreshToken: { type: String },

  // Rewards
  rewards: [
    {
      eventType: { type: String },
      timestamp: { type: Date, default: Date.now },
      reward: { type: Schema.Types.Mixed },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

// Avoid recompile
export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
