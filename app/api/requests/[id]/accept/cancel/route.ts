// app/api/requests/[id]/cancel/route.ts
import { NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongodb";
import Request from "@/Models/Request";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    await connectMongoose();
    const id = params.id;
    const r = await Request.findOne({ requestId: id });
    if (!r) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

    r.status = "cancelled";
    await r.save();
    return NextResponse.json({ success: true, request: r });
  } catch (err) {
    console.error("Cancel request error:", err);
    return NextResponse.json({ success: false, error: "Internal" }, { status: 500 });
  }
}
