/**
 * OTP Generation and Validation Utilities
 */

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Calculate OTP expiration time (10 minutes from now)
 */
export function getOTPExpiration(): Date {
  const expiration = new Date();
  expiration.setMinutes(expiration.getMinutes() + 10);
  return expiration;
}

/**
 * Check if OTP is expired
 */
export function isOTPExpired(expiresAt: Date): boolean {
  return new Date() > expiresAt;
}

/**
 * Validate OTP format
 */
export function isValidOTPFormat(otp: string): boolean {
  return /^\d{6}$/.test(otp);
}
