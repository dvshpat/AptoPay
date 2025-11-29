// app/api/requests/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    await connectMongoose();
    const body = await req.json();

    const {
      requesterAddress,
      requesterName,
      payerAddress,
      payerName,
      amount, // human amount like "0.01"
      amountOctas, // optional: u64 string in octas
      memo,
    } = body;

    if (!requesterAddress || (!payerAddress && !payerName) || !amount) {
      return NextResponse.json({ success: false, error: "Missing params" }, { status: 400 });
    }

    const amountInHuman = amount;
    const amountOct = amountOctas ?? Math.floor(Number(amount) * 1e8).toString();

    const request = await Request.create({
      requestId: uuidv4(),
      requesterAddress: requesterAddress.toLowerCase(),
      requesterName,
      payerAddress: payerAddress?.toLowerCase(),
      payerName,
      amount: amountOct,
      amountInHuman,
      memo,
      status: "pending",
    });

    return NextResponse.json({ success: true, request });
  } catch (err) {
    console.error("Create request error:", err);
    return NextResponse.json({ success: false, error: "Internal" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    await connectMongoose();
    const url = new URL(req.url);
    // filter by either requester or payer, pass ?address=
    const address = url.searchParams.get("address");
    const role = url.searchParams.get("role"); // "incoming" or "outgoing"
    let query = {};

    if (address) {
      const a = address.toLowerCase();
      if (role === "incoming") {
        // requests where connected address is payer
        query = { payerAddress: a, status: "pending" };
      } else if (role === "outgoing") {
        query = { requesterAddress: a };
      } else {
        // both
        query = { $or: [{ requesterAddress: a }, { payerAddress: a }] };
      }
    }

    const requests = await Request.find(query).sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, requests });
  } catch (err) {
    console.error("List requests error:", err);
    return NextResponse.json({ success: false, error: "Internal" }, { status: 500 });
  }
}
