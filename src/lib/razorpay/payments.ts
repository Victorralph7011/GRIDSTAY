/**
 * Razorpay Integration — GridStay
 *
 * Handles:
 * 1. Provider onboarding fee collection
 * 2. Automated rent split-payments via Razorpay Route
 *    - Tenant pays → Platform commission deducted →
 *      Remainder split between owner, utilities, laundry
 */

export interface PaymentOrder {
  orderId: string;
  amount: number; // in paise
  currency: string;
  receipt: string;
}

export interface SplitConfig {
  ownerShare: number;       // percentage
  platformCommission: number;
  utilitySplit: number;
  laundrySplit: number;
}

/**
 * Create a Razorpay order for onboarding fee.
 */
export async function createOnboardingOrder(
  providerId: string,
  amountINR: number
): Promise<PaymentOrder | null> {
  // TODO: Call backend API to create Razorpay order
  console.log(`[GridStay] Creating onboarding order: ₹${amountINR} for ${providerId}`);
  return null;
}

/**
 * Create a rent collection order with automated splits.
 */
export async function createRentOrder(
  tenantId: string,
  propertyId: string,
  amountINR: number,
  splits: SplitConfig
): Promise<PaymentOrder | null> {
  // TODO: Implement Razorpay Route split payment
  console.log(`[GridStay] Creating rent order: ₹${amountINR} with splits`, splits);
  return null;
}
