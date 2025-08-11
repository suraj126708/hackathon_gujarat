// config/razorpay.js
import Razorpay from "razorpay";
import crypto from "crypto";

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create order
export const createOrder = async (amount, currency = "INR", receipt = null) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return {
      success: true,
      data: order,
    };
  } catch (error) {
    console.error("❌ [RAZORPAY] Error creating order:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Verify payment signature
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest("hex");

    return expectedSignature === signature;
  } catch (error) {
    console.error("❌ [RAZORPAY] Error verifying signature:", error);
    return false;
  }
};

// Capture payment
export const capturePayment = async (paymentId, amount) => {
  try {
    const payment = await razorpay.payments.capture(
      paymentId,
      Math.round(amount * 100),
      "INR"
    );
    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("❌ [RAZORPAY] Error capturing payment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get payment details
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return {
      success: true,
      data: payment,
    };
  } catch (error) {
    console.error("❌ [RAZORPAY] Error fetching payment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Refund payment
export const refundPayment = async (paymentId, amount, notes = {}) => {
  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: Math.round(amount * 100),
      notes,
    });
    return {
      success: true,
      data: refund,
    };
  } catch (error) {
    console.error("❌ [RAZORPAY] Error refunding payment:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

export default razorpay;
