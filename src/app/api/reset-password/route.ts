// src/app/api/reset-password/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { isCodeExpired } from "@/lib/utils/verification";
import { validatePasswordStrength } from "@/lib/utils/password";
import { sendResetSuccessEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, code, newPassword } = body;

    if (!email || !code || !newPassword) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
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
        { error: "No reset code found" },
        { status: 400 }
      );
    }

    if (isCodeExpired(user[0].resetPasswordCodeExpiry)) {
      return NextResponse.json(
        { error: "Reset code has expired" },
        { status: 400 }
      );
    }

    if (user[0].resetPasswordCode !== code) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);

    // Update password and clear reset code
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordCodeExpiry: null,
        updatedAt: new Date(),
      })
      .where(eq(users.email, email.toLowerCase()));

    // Send success email (don't block response if it fails)
    sendResetSuccessEmail(email).catch((error) => {
      console.error("Failed to send reset success email:", error);
    });

    return NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "An error occurred" },
      { status: 500 }
    );
  }
}