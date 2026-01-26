import { WebSocketProvider, Contract, formatUnits } from "ethers";
import USDCAbi from "../usdc.json";
import crypto from "crypto";
import axios from "axios";

class WebSocketListener {
    private providerUrl: string;
    private contractAddress: string;
    private abi: any;
    private provider: WebSocketProvider | null;
    private contract: Contract | null;
    private secretKey: string;
    private webhookUrl: string;

    constructor(providerUrl: string, contractAddress: string) {
        this.providerUrl = providerUrl;
        this.contractAddress = contractAddress;
        this.abi = USDCAbi;
        this.provider = null;
        this.contract = null;
        this.secretKey = process.env.SECRET_KEY ?? "";
        this.webhookUrl = process.env.WEBHOOK_URL ?? "";
    }

    async connect() {
        if (!this.secretKey || !this.webhookUrl)
            throw new Error(
                "Missing SECRET_KEY or WEBHOOK_URL in environment variables"
            );

        // Clean up old connection
        if (this.provider) {
            try {
                this.provider.removeAllListeners();
                (this.provider as any)._websocket?.close();
            } catch (err) {
                console.warn("Cleanup error:", err);
            }
        }

        // Create new provider
        this.provider = new WebSocketProvider(this.providerUrl);
        this.contract = new Contract(
            this.contractAddress,
            USDCAbi,
            this.provider
        );

        // Access internal WebSocket
        const ws = this.provider?.websocket as WebSocket;
        // ws.onopen = () => console.log("✅ WebSocket connected");
        // ws.onclose = async (code: number, reason: string) => {
        //     console.log("⚠️ WebSocket closed:", code, reason);
        //     await this.reconnect();
        // };
        // ws.onerror = (error: any) => console.error("❌ WebSocket error:", error.message);

        // Optional heartbeat to prevent idle timeouts
        setInterval(() => {
            try {
                ws.send("ping");
            } catch {}
        }, 30000);

        await this.listenToEvents();
        console.log("🚀 Started listening to Transfer events");
    }

    async reconnect() {
        console.log("🔄 Attempting to reconnect...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.connect();
    }

    async listenToEvents() {
        const decimals = await this.contract?.decimals();

        this.contract?.on("Transfer", async (from, to, value, event) => {
            const amount = formatUnits(value, decimals);
            const transaction = {
                hash: event.log.transactionHash,
                from,
                recipient: to,
                amount,
            };

            const payloadString = JSON.stringify(transaction);
            const hash = crypto
                .createHmac("sha256", this.secretKey)
                .update(payloadString)
                .digest("hex");

            try {
                await axios.post(this.webhookUrl, transaction, {
                    headers: { "X-Secret": hash },
                });
            } catch (error: any) {
                console.error(
                    "❌ Error sending webhook:",
                    error?.message || error
                );
            }
        });
    }
}

export default WebSocketListener;
