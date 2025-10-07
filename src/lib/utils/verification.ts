// lib/utils/verification.ts

import crypto from 'crypto';

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function getCodeExpiry(): Date {
  return new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
}

export function isCodeExpired(expiry: Date | null): boolean {
  if (!expiry) return true;
  return new Date() > expiry;
}

// Rate limiting helper
export function canAttemptVerification(
  attemptCount: number,
  blockedUntil: Date | null
): { allowed: boolean; message?: string } {
  if (blockedUntil && new Date() < blockedUntil) {
    const minutesLeft = Math.ceil((blockedUntil.getTime() - Date.now()) / 60000);
    return {
      allowed: false,
      message: `Too many attempts. Please try again in ${minutesLeft} minutes.`
    };
  }

  if (attemptCount >= 5) {
    return {
      allowed: false,
      message: 'Maximum attempts exceeded. Please request a new code.'
    };
  }

  return { allowed: true };
}
