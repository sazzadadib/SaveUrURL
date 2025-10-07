// src/app/api/verify-email/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, verificationAttempts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isCodeExpired, canAttemptVerification } from "@/lib/utils/verification";
import { sendVerificationEmail, sendWelcomeEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code } = body;

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and verification code are required" },
        { status: 400 }
      );
    }

    // Check rate limiting
    const attempts = await db
      .select()
      .from(verificationAttempts)
      .where(eq(verificationAttempts.email, email.toLowerCase()))
      .limit(1);

    if (attempts.length > 0) {
      const canAttempt = canAttemptVerification(
        attempts[0].attemptCount,
        attempts[0].blockedUntil
      );

      if (!canAttempt.allowed) {
        return NextResponse.json(
          { error: canAttempt.message },
          { status: 429 }
        );
      }
    }

    // Find user
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (!user || user.length === 0) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Check if already verified
    if (user[0].isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    // Check if code expired
    if (isCodeExpired(user[0].verificationCodeExpiry)) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Verify code
    if (user[0].verificationCode !== code) {
      // Increment attempt count
      if (attempts.length > 0) {
        const newCount = attempts[0].attemptCount + 1;
        const blockedUntil = newCount >= 5 
          ? new Date(Date.now() + 30 * 60 * 1000) // Block for 30 minutes
          : null;

        await db
          .update(verificationAttempts)
          .set({
            attemptCount: newCount,
            lastAttempt: new Date(),
            blockedUntil,
          })
          .where(eq(verificationAttempts.email, email.toLowerCase()));
      } else {
        await db.insert(verificationAttempts).values({
          email: email.toLowerCase(),
          attemptCount: 1,
          lastAttempt: new Date(),
        });
      }

      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Code is correct - verify user
    await db
      .update(users)
      .set({
        isVerified: true,
        verificationCode: null,
        verificationCodeExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email.toLowerCase()));

    // Clear verification attempts
    if (attempts.length > 0) {
      await db
        .delete(verificationAttempts)
        .where(eq(verificationAttempts.email, email.toLowerCase()));
    }

    // Send welcome email (don't block the response if it fails)
    sendWelcomeEmail(email, user[0].name).catch((error) => {
      console.error("Failed to send welcome email:", error);
    });

    return NextResponse.json(
      { message: "Email verified successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "An error occurred during verification" },
      { status: 500 }
    );
  }
}

// Resend verification code endpoint
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
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
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user[0].isVerified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 }
      );
    }

    const { generateVerificationCode, getCodeExpiry } = await import("@/lib/utils/verification");

    const verificationCode = generateVerificationCode();
    const codeExpiry = getCodeExpiry();

    await db
      .update(users)
      .set({
        verificationCode,
        verificationCodeExpiry: codeExpiry,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email.toLowerCase()));

    const emailResult = await sendVerificationEmail(
      email,
      verificationCode,
      user[0].name
    );

    if (!emailResult.success) {
      return NextResponse.json(
        { error: "Failed to send verification email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "New verification code sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}