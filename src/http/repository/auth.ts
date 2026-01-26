import { stringToHash } from "../helpers";
import User, { IUser, IUserModel } from "../models/user";
import {
    LoginPayload,
    OtpPayload,
    RegisterPayload,
    VerifyOtpPayload,
} from "./interface/auth.interface";

export interface AuthRepositoryInterface {
    login(request: LoginPayload): Promise<{ user: IUser; token: string }>;
    register(request: RegisterPayload): Promise<IUser>;
    sendOtp(request: OtpPayload): Promise<void>;
    verifyOtp(request: VerifyOtpPayload): Promise<void>;
    resetPassword(request: { email: string }): void;
    changePassword(request: { email: string; token: string }): void;
}

class AuthRepository implements AuthRepositoryInterface {
    public user: IUserModel;

    constructor() {
        this.user = User;
    }

    async login(
        request: LoginPayload
    ): Promise<{ user: IUser; token: string }> {
        const user = await this.user.findOne({ email: request.email });
        if (user?.validatePassword(request.password)) {
            const token = await user?.createToken();
            return {
                user,
                token,
            };
        }

        throw new Error("These credentails do not match any records");
    }

    async register(request: RegisterPayload): Promise<IUser> {
        if (await this.user.isEmailTaken({ email: request.email })) {
            throw new Error("Email already exist");
        }

        const user = await this.user.create({
            ...request,
            password: stringToHash(request.password),
        });

        await user.createOtp();

        return user;
    }

    async sendOtp(request: OtpPayload): Promise<void> {
        const user = await this.user.findOne({
            email: request.email,
        });

        if (!user) {
            throw new Error("This email do not match any records");
        }

        await user.createOtp();
    }

    async verifyOtp(request: VerifyOtpPayload): Promise<void> {
        const user = await this.user.findOne({
            email: request.email,
        });


        if (!user) {
            throw new Error("This email do not match any records");
        }

        await user.validateOtp(request.code);
    }

    async resetPassword(request: { email: string }) {}
    async changePassword(request: { email: string; token: string }) {}
}

export default new AuthRepository();
