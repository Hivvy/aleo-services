import { NextFunction, Request, Response } from "express";
import { generatePayloadFromToken } from "../helpers";
import User, { IUser, IUserModel } from "../models/user";

interface RequestWithUser extends Request {
    user?: IUser; // Adjust the type according to your User model
}

class AuthMiddleWare {
    private user: IUserModel;
    constructor() {
        this.user = User;
    }

    async check(
        req: RequestWithUser,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (
                !req.headers.authorization ||
                !req.headers.authorization.startsWith("Bearer")
            )
                throw new Error(
                    "You need to Login first To access this route//401"
                );

            const token = req.headers.authorization.split(" ")[1];
            if (!token) throw new Error("Not authorized to access this route");

            const generatePayload = generatePayloadFromToken(token);

            const user = await this.user.findOne({
                id: generatePayload.id,
            });

            if (!user) {
                throw new Error("Token not found --//401");
            }

            req.user = user;

            next();
        } catch (error: any) {
            res.status(401).send({
                message: error.message,
            });
        }
    }
}

export default new AuthMiddleWare();
