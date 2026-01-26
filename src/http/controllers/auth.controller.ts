import { Request, Response } from "express";
import Controller from ".";
import AuthRepository, { AuthRepositoryInterface } from "../repository/auth";

class AuthContoller extends Controller {
    private authRepository: AuthRepositoryInterface;
    constructor() {
        super();
        this.authRepository = AuthRepository;
        this.login = this.login.bind(this);
        this.register = this.register.bind(this);
        this.resendOtp = this.resendOtp.bind(this);
        this.verifyOtp = this.verifyOtp.bind(this);
    }

    async login(req: Request, res: Response) {
        try {
            const response = await this.authRepository.login(req.body);
            return this.handleResponse(res, "Sucessfully login", response);
        } catch (error: any) {
            return this.handleErrorResponse(res, error.message);
        }
    }

    async register(req: Request, res: Response) {
        try {
            const response = await this.authRepository.register(req.body);
            return this.handleResponse(res, "Sucessfully registered", response);
        } catch (error: any) {
            return this.handleErrorResponse(res, error.message);
        }
    }

    async resendOtp(req: Request, res: Response) {
        try {
            await this.authRepository.sendOtp(req.body);
            return this.handleResponse(res, "Sucessfully resent otp");
        } catch (error: any) {
            return this.handleErrorResponse(res, error.message);
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            await this.authRepository.verifyOtp(req.body);
            return this.handleResponse(res, "Sucessfully verified otp");
        } catch (error: any) {
            return this.handleErrorResponse(res, error.message);
        }
    }
}

export default new AuthContoller();
