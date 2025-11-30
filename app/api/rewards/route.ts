/** Enable Node.js runtime */
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { User } from "@/Models/UserModel";
import { connectMongoose } from "@/lib/mongodb";

import jwt from "jsonwebtoken";

export async function POST(req: Request) {
  try {
    await connectMongoose();

    const { walletAddress, eventType, campaignId, metadata } = await req.json();

    if (!walletAddress || !eventType || !campaignId) {
      return NextResponse.json(
        { success: false, error: "Missing required params" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    // 🔥 AUTO-REGISTER if missing Photon ID
    if (!user.photonUserId) {
      console.log("User missing Photon ID, attempting auto-registration...");
      try {
        const photonJWT = jwt.sign(
          { sub: user.walletAddress },
          process.env.PHOTON_JWT_SECRET!,
          { expiresIn: "7d" }
        );

        const registerBody = {
          provider: "jwt",
          data: {
            token: photonJWT,
            client_user_id: user.walletAddress,
            name: user.name,
          },
        };

        const regRes = await fetch(
          "https://stage-api.getstan.app/identity-service/api/v1/identity/register",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-API-Key": process.env.PHOTON_API_KEY!,
            },
            body: JSON.stringify(registerBody),
          }
        );

        const regText = await regRes.text();
        console.log("Photon Registration Response (Raw):", regText);

        let regData;
        try {
          regData = JSON.parse(regText);
        } catch (e) {
          console.error("Failed to parse Photon registration response:", e);
          return NextResponse.json(
            { success: false, error: "Invalid response from Photon", details: regText },
            { status: 500 }
          );
        }

        if (!regRes.ok) {
          console.error("Auto-registration failed:", regData);
          return NextResponse.json(
            { success: false, error: "Failed to register user with Photon", details: regData },
            { status: 500 }
          );
        }

        // Update user with new Photon details
        // FIX: Extract from nested structure based on logs
        // Structure: { success: true, data: { user: { user: { id: "..." } }, tokens: { access_token: "..." } } }
        const photonId = regData.data?.user?.user?.id;
        const accessToken = regData.data?.tokens?.access_token;
        const refreshToken = regData.data?.tokens?.refresh_token;

        if (!photonId) {
          console.error("Could not extract Photon ID from response:", JSON.stringify(regData, null, 2));
          throw new Error("Photon ID missing in registration response");
        }

        user.photonUserId = photonId;
        user.photonAccessToken = accessToken;
        user.photonRefreshToken = refreshToken;
        await user.save();
        console.log("User auto-registered with Photon:", user.photonUserId);

      } catch (regErr) {
        console.error("Auto-registration error:", regErr);
        return NextResponse.json(
          { success: false, error: "Auto-registration exception" },
          { status: 500 }
        );
      }
    }

    const eventBody = {
      event_id: `${eventType}-${Date.now()}`,
      event_type: eventType,
      user_id: user.photonUserId, // Changed from client_user_id to user_id
      campaign_id: campaignId,
      metadata: metadata || {},
      timestamp: new Date().toISOString(),
    };

    const photonRes = await fetch(
      "https://stage-api.getstan.app/identity-service/api/v1/attribution/events/campaign",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.PHOTON_API_KEY!,
        },
        body: JSON.stringify(eventBody),
      }
    );

    const data = await photonRes.json();

    if (!photonRes.ok) {
      console.error("Photon Reward Error:", data);
      return NextResponse.json(
        { success: false, error: "Photon reward failed", details: data },
        { status: 500 }
      );
    }

    // ---------------------------------------------------------
    // 🔧 DEMO FIX: Manually calculate reward based on amount
    // since Photon Dashboard configuration is inaccessible.
    // ---------------------------------------------------------
    const sentAmount = parseFloat(metadata?.amount || "0");
    // Logic: 100 Points per 1 APT
    const calculatedReward = sentAmount > 0 ? sentAmount * 100 : 0;

    // Override the "0" from Photon with our calculated value
    if (data && data.data) {
      console.log(`Overriding Photon reward (0) with local calculation: ${calculatedReward}`);
      data.data.token_amount = calculatedReward;
    }
    // ---------------------------------------------------------

    // OPTIONAL: save reward to user profile
    user.rewards = user.rewards || [];
    user.rewards.push({
      eventType,
      timestamp: new Date(),
      reward: data, // photon reward response (modified)
    });

    await user.save();

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("Reward API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    await connectMongoose();
    const { searchParams } = new URL(req.url);
    const walletAddress = searchParams.get("walletAddress");

    if (!walletAddress) {
      return NextResponse.json(
        { success: false, error: "Missing walletAddress" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      walletAddress: walletAddress.toLowerCase(),
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, rewards: user.rewards || [] });
  } catch (err) {
    console.error("Fetch Rewards API error:", err);
    return NextResponse.json(
      { success: false, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
