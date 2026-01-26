export interface LoginPayload {
    email: string;
    password: string;
}

export interface RegisterPayload {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
}

export interface OtpPayload {
    email: string;
}

export interface VerifyOtpPayload {
    email: string;
    code: string;
}
