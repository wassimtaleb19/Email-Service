// important to use getAurinkoURL server function inside the frontend section

import { getAurinkoURL } from "@/lib/aurinko";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serviceType } = body;

    if (serviceType !== "Google" && serviceType !== "Office365") {
      return NextResponse.json({ error: "Invalid serviceType" }, { status: 400 });
    }

    const url = await getAurinkoURL(serviceType);
    return NextResponse.json({ url });
  } catch (err) {
    console.error("[AURINKO LINK ERROR]", err);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


