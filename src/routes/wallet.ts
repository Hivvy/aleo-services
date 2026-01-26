import express from "express";
import walletController from "@/http/controllers/wallet.controller";
import HeaderMiddleWare from "@/middleware/header.middleware";
const router = express.Router();

router.post(
    "/create-wallet",
    HeaderMiddleWare.check,
    walletController.createWallet
);
router.post(
    "/get-balance",
    HeaderMiddleWare.check,
    walletController.getBalance
);
router.post("/send-token", HeaderMiddleWare.check, walletController.sendToken);
export default router;
