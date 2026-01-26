import { NextFunction, Request, Response } from "express";

type Environment = "production" | "sandbox";

class HeaderMiddleware {
    constructor() {}

    async check(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const appIdHeader = req.headers["x-hivvy-app-id"];
            const appIdEnv = process.env.HIVVY_APP_ID;
            const environmentHeader = req.headers[
                "x-environment"
            ] as Environment;

            if (!appIdHeader) {
                throw new Error("x-hivvy-app-id header is missing");
            }

            if (appIdHeader !== appIdEnv) {
                throw new Error("Invalid x-hivvy-app-id");
            }

            if (!environmentHeader) {
                throw new Error("x-environment header is missing");
            }

            if (
                environmentHeader !== "production" &&
                environmentHeader !== "sandbox"
            ) {
                throw new Error(
                    "Invalid x-environment. Must be 'production' or 'sandbox'"
                );
            }

            // Attach environment to request for use in controllers
            (req as any).environment = environmentHeader;

            next();
        } catch (error: any) {
            res.status(401).send({
                message: error?.message,
            });
        }
    }
}

export default new HeaderMiddleware();
