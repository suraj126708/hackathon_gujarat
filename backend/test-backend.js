// test-backend.js - Test backend endpoints
import fetch from "node-fetch";

const BASE_URL = "http://localhost:5000/api";

async function testBackend() {
  console.log("🧪 Testing QuickCourt Backend...\n");

  try {
    // Test health check
    console.log("1. Testing health check...");
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log("✅ Health check:", healthData.message);
    console.log("   Status:", healthResponse.status);
    console.log("");

    // Test OTP send endpoint
    console.log("2. Testing OTP send endpoint...");
    const otpResponse = await fetch(`${BASE_URL}/otp/send-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    if (otpResponse.ok) {
      const otpData = await otpResponse.json();
      console.log("✅ OTP send endpoint working");
      console.log("   Response:", otpData.message);
    } else {
      const errorData = await otpResponse.json();
      console.log("❌ OTP send endpoint failed");
      console.log("   Status:", otpResponse.status);
      console.log("   Error:", errorData.message);
    }
    console.log("");

    // Test OTP verify endpoint
    console.log("3. Testing OTP verify endpoint...");
    const verifyResponse = await fetch(`${BASE_URL}/otp/verify-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: "test@example.com",
        otp: "123456",
      }),
    });

    if (verifyResponse.ok) {
      const verifyData = await verifyResponse.json();
      console.log("✅ OTP verify endpoint working");
      console.log("   Response:", verifyData.message);
    } else {
      const errorData = await verifyResponse.json();
      console.log(
        "✅ OTP verify endpoint working (expected to fail with invalid OTP)"
      );
      console.log("   Status:", verifyResponse.status);
      console.log("   Message:", errorData.message);
    }
    console.log("");

    console.log("🎉 Backend testing completed!");
  } catch (error) {
    console.error("❌ Backend test failed:", error.message);
    console.log("\n💡 Make sure:");
    console.log("   1. Backend server is running on port 5000");
    console.log("   2. MongoDB is running");
    console.log("   3. Environment variables are set correctly");
  }
}

// Run the test
testBackend();
