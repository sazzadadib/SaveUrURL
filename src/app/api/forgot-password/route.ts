// src/app/api/forgot-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendPasswordResetEmail } from "@/lib/email";
import { generateVerificationCode, getCodeExpiry } from "@/lib/utils/verification";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!user || user.length === 0) {
      return NextResponse.json(
        { message: "If an account exists, a reset code has been sent" },
        { status: 200 }
      );
    }

    // Check if user is verified
    if (!user[0].isVerified) {
      return NextResponse.json(
        { error: "Please verify your email first" },
        { status: 400 }
      );
    }

    // Generate reset code
    const resetCode = generateVerificationCode();
    const codeExpiry = getCodeExpiry();

    // Save reset code
    await db
      .update(users)
      .set({
        resetPasswordCode: resetCode,
        resetPasswordCodeExpiry: codeExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email.toLowerCase()));

    // Send reset email
    const emailResult = await sendPasswordResetEmail(
      email,
      resetCode,
      user[0].name
    );

    if (!emailResult.success) {
      console.error("Email sending error:", emailResult.error);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Reset code sent to your email" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}