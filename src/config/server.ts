import express from "express";
import cors from "@/config/cors";
import MongoDB from "@/config/mongodb";
import dotenv from "dotenv";
import router from "@/routes";
import logger from "@/config/logger";
import morgan from "morgan";
import WebSocketListener from "@/services/websocket";

dotenv.config();

class Server {
    public database;
    public cors;
    public app;
    public port;

    constructor() {
        this.database = new MongoDB();
        this.cors = cors;
        this.app = express();
        this.port = process.env.PORT || 8800;
    }

    public async start(): Promise<void> {
        try {
            // await this.database.connect();
            this.app.use(this.cors);
            this.app.use(morgan("tiny"));
            this.app.use(express.urlencoded({ extended: true }));
            this.app.use(express.json());
            this.app.get("/v1", (req, res) => {
                return res.status(200).send({
                    message: "Base succesfully ping",
                });
            });
            this.app.use("/v1", router);

            this.app.listen(this.port, () => {
                logger.info("Server Start");
            });

            // const listener = new WebSocketListener(
            //     process.env.WS_BASE_BASEURL ?? "",
            //     "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
            // );
            // listener.connect().catch((error: any) => {
            //     console.error("Error connecting to WebSocket:", error);
            // });
        } catch (error) {
            console.log(error);
        }
    }
}

export default new Server();
