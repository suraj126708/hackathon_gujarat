// Authentication Pages
export { default as Login } from "./Login";
export { default as Register } from "./Register";
export { default as OTPVerification } from "./OTPVerification";
export { default as ResetPassword } from "./ResetPassword";

// Auth page components
export const authPages = {
  Login,
  Register,
  OTPVerification,
  ResetPassword,
};
