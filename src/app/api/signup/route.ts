// src/app/api/signup/route.ts

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";
import { generateVerificationCode, getCodeExpiry } from "@/lib/utils/verification";
import { validatePasswordStrength } from "@/lib/utils/password";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validation
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.errors[0] },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    if (existingUser.length > 0) {
      // If user exists but not verified, allow resending verification
      if (!existingUser[0].isVerified) {
        const verificationCode = generateVerificationCode();
        const codeExpiry = getCodeExpiry();

        // Update verification code
        await db
          .update(users)
          .set({
            verificationCode,
            verificationCodeExpiry: codeExpiry,
            updatedAt: new Date(),
          })
          .where(eq(users.email, email.toLowerCase()));

        // Send verification email
        const emailResult = await sendVerificationEmail(
          email,
          verificationCode,
          existingUser[0].name
        );

        if (!emailResult.success) {
          console.error("Email sending error:", emailResult.error);
          return NextResponse.json(
            { error: "Failed to send verification email" },
            { status: 500 }
          );
        }

        return NextResponse.json(
          { 
            message: "Verification code resent",
            email: email.toLowerCase(),
            requiresVerification: true
          },
          { status: 200 }
        );
      }

      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const codeExpiry = getCodeExpiry();

    // Create user (not verified yet)
    const newUser = await db
      .insert(users)
      .values({
        email: email.toLowerCase(),
        password: hashedPassword,
        name,
        isVerified: false,
        verificationCode,
        verificationCodeExpiry: codeExpiry,
      })
      .returning();

    // Send verification email
    const emailResult = await sendVerificationEmail(
      email,
      verificationCode,
      name
    );

    if (!emailResult.success) {
      console.error("Email sending error:", emailResult.error);
      // Delete the user if email fails
      await db.delete(users).where(eq(users.id, newUser[0].id));
      
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: "Verification code sent to your email",
        email: email.toLowerCase(),
        requiresVerification: true
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "An error occurred during signup" },
      { status: 500 }
    );
  }
}