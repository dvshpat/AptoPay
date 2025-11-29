// app/api/requests/[id]/accept/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const body = await req.json();
    const { txHash, payerAddress } = body;
    const id = params.id;

    if (!txHash) {
      return NextResponse.json({ success: false, error: "Missing txHash" }, { status: 400 });
    }

    const r = await Request.findOne({ requestId: id });
    if (!r) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    r.status = "paid";
    r.txHash = txHash;
    if (payerAddress) r.payerAddress = payerAddress.toLowerCase();
    await r.save();

    // TODO: Notify requester via push / email / websocket / webhook
    // Example: call external webhook if configured
    if (process.env.REQUEST_NOTIFICATION_WEBHOOK) {
      try {
        await fetch(process.env.REQUEST_NOTIFICATION_WEBHOOK, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: r.requestId, status: r.status, txHash }),
        });
      } catch (e) {
        console.warn("Webhook notify failed", e);
      }
    }

    return NextResponse.json({ success: true, request: r });
  } catch (err) {
    console.error("Accept request error:", err);
    return NextResponse.json({ success: false, error: "Internal" }, { status: 500 });
  }
}
