// src/app/api/reset-password/verify/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isCodeExpired } from "@/lib/utils/verification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "Invalid request" },
        { status: 400 }
      );
    }

    if (!user[0].resetPasswordCode) {
      return NextResponse.json(
        { error: "No reset code found. Please request a new one." },
        { status: 400 }
      );
    }

    if (isCodeExpired(user[0].resetPasswordCodeExpiry)) {
      return NextResponse.json(
        { error: "Reset code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (user[0].resetPasswordCode !== code) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Code verified successfully", verified: true },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verify reset code error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}