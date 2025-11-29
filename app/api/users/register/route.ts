/** Enable Node.js for jsonwebtoken */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import { User } from "@/Models/UserModel";
import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectMongoose();

    const { walletAddress, name } = await req.json();

    if (!walletAddress || !name) {
      return NextResponse.json(
        { success: false, error: "Missing wallet or name" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existing = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: "User already registered" },
        { status: 400 }
      );
    }

    // --------------------------------------
    // FIX 1: JWT payload must include "sub"
    // --------------------------------------
    const photonJWT = jwt.sign(
      {
        sub: walletAddress, // Photon requires "sub" as the unique ID
      },
      process.env.PHOTON_JWT_SECRET!,
      { expiresIn: "7d" }
    );

    console.log("Generated JWT:", photonJWT);

    // --------------------------------------
    // FIX 2: Correct Photon Register API
    // --------------------------------------
    const body = {
      provider: "jwt",
      data: {
        token: photonJWT,
        client_user_id: walletAddress,  // same ID mapped in Photon
        name: name,                     // Photon requires this here
      },
    };

    const photonRes = await fetch(
      "https://stage-api.getstan.app/identity-service/api/v1/identity/register",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.PHOTON_API_KEY!,
        },
        body: JSON.stringify(body),
      }
    );

    const photonUser = await photonRes.json();
    console.log("Photon Response:", photonUser);

    if (!photonRes.ok) {
      console.error("Photon error:", photonUser);
      return NextResponse.json(
        { success: false, error: photonUser.error || "Photon registration failed" },
        { status: 500 }
      );
    }

    // --------------------------------------
    // FIX 3: Photon returns "id" not "user_id"
    // --------------------------------------
    const newUser = await User.create({
      walletAddress: walletAddress.toLowerCase(),
      name,
      photonUserId: photonUser.id,
      photonAccessToken: photonUser.access_token,
      photonRefreshToken: photonUser.refresh_token,
    });

    return NextResponse.json({
      success: true,
      user: newUser,
    });

  } catch (err) {
    console.error("User registration error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
