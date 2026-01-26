import mongoose from "mongoose";
import logger from "@/config/logger";

class MongoDB {
    public url: string;

    constructor() {
        this.url = process.env.DB_CONNECTION ?? "";
    }

    public async connect(): Promise<void> {
        try {
            await mongoose.connect(this.url);
            logger.info("Database connection successful");
            console.log("Connected to MongoDB");
        } catch (error) {
            console.error("Connection to MongoDB failed:", error);
            throw new Error("Connection to MongoDB failed");
        }
    }
}

export default MongoDB;
