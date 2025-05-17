// this file is the file where i insert an account into the database :)

import { waitUntil } from "@vercel/functions";
import { exchangeCodeForAccessToken, getAccountDetails } from "@/lib/aurinko";
import { auth, EmailAddress } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/server/db";
import axios from "axios";

export const GET = async (req: NextRequest) => {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const params = req.nextUrl.searchParams;
  const status = params.get("status");
  if (status != "success") {
    return NextResponse.json(
      { message: "Failed to link account" },
      { status: 400 },
    );
  }
  // get the code to exchange it for the access token
  const code = params.get("code");
  if (!code) {
    return NextResponse.json({ message: "No code provider" }, { status: 400 });
  }

  const token = await exchangeCodeForAccessToken(code);
  if (!token) {
    console.error("[TOKEN IS NULL - CODE]", code);
    return NextResponse.json(
      { message: "Failed to exchange code for access token" },
      { status: 400 },
    );
  }

  const accountDetails = await getAccountDetails(token.accessToken);

  const existingAccount = await db.account.findUnique({
    where: { emailAddress: accountDetails.email },
  });

  if (existingAccount) {
    // ✅ Email exists, update token
    await db.account.update({
      where: { emailAddress: accountDetails.email },
      data: {
        accessToken: token.accessToken,
      },
    });
  } else {
    // ✅ New email, create record
    await db.account.create({
      data: {
        id: token.accountId.toString(),
        userId,
        emailAddress: accountDetails.email,
        name: accountDetails.name,
        accessToken: token.accessToken,
      },
    });
  }

  // trigger initial sync endpoint
  waitUntil(
    axios
      .post(`${process.env.NEXT_PUBLIC_URL}/api/initial-sync`, {
        accountId: token.accountId.toString(),
        userId,
      })
      .then((response) => {
        console.log("Initial sync triggered", response.data);
      })
      .catch((error) => {
        console.error("failed to trigger initial sync", error);
      }),
  );

  return NextResponse.redirect(new URL("/mail", req.url));
};
