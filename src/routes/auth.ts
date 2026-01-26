import AuthController from "@/http/controllers/auth.controller";
import LoginRequest from "@/http/request/auth/login.request";
import OtpRequest from "@/http/request/auth/otp.request";
import RegisterRequest from "@/http/request/auth/register.request";
import VerifyOtpRequest from "@/http/request/auth/verify.request";
import express from "express";
const router = express.Router();

router.post("/login", LoginRequest.validate, AuthController.login);
router.post("/register", RegisterRequest.validate, AuthController.register);
router.post("/otp/send", OtpRequest.validate, AuthController.resendOtp);
router.post("/otp/verify", VerifyOtpRequest.validate, AuthController.verifyOtp);



export default router;
