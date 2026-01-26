import mongoose, { Model, ObjectId, Schema } from "mongoose";
import { compareBcryptPassword, generateTokenFromPayload } from "../helpers";
import Otp from "./otp";
import OtpMail from "@/mails/otp.mail";
import dayjs from "dayjs";

interface IUserDocument extends Document {
    id: ObjectId;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    role: "USER" | "ADMIN";
    email_verified_at: string | null;
    phone_verified_at: string | null;
    passwordReset: string | null;
    createdAt: Date;
    updatedAt: Date;
}
export interface IUser extends IUserDocument {
    createToken(): Promise<string>;
    createOtp(): Promise<void>;
    validatePassword(password: string): boolean;
    validateOtp(code: string): Promise<void>;
}
export interface IUserModel extends Model<IUser> {
    isEmailTaken(payload: { email: string }): Promise<boolean>;
}

const userSchema = new Schema(
    {
        first_name: {
            type: String,
        },
        last_name: {
            type: String,
        },
        email: {
            type: String,
            unique: true,
            required: true,
        },
        phone: {
            type: String,
        },
        password: {
            type: String,
            required: true,
        },
        role: {
            type: String,
            enum: ["USER", "ADMIN"],
            default: "USER",
            required: true,
        },
        email_verified_at: {
            type: String,
            default: null,
        },
        phone_verified_at: {
            type: String,
            default: null,
        },
        password_reset: {
            type: String,
            required: false,
        },
    },
    {
        toJSON: {
            virtuals: true,
            transform: function (doc, ret) {
                delete (ret as any)._id;
                delete (ret as any).__v;
                delete (ret as any).password_reset;
                delete (ret as any).password;
                return ret;
            },
        },
        timestamps: true,
    }
);

userSchema.static("isEmailTaken", async function (payload) {
    const user = await this.findOne(payload);
    return !!user;
});

userSchema.method(
    "validatePassword",
    function (this: IUser, password: string): boolean {
        const hashedPassword = this.password;
        return compareBcryptPassword(password, hashedPassword);
    }
);

userSchema.method("createOtp", async function (this: IUser): Promise<void> {
    const otp = await Otp.createOtp(this.id);
    new OtpMail(this.email, otp.code);
});

userSchema.method("createToken", async function (this: IUser): Promise<string> {
    const payload = {
        id: this.id,
    };
    return generateTokenFromPayload(payload);
});

userSchema.method(
    "validateOtp",
    async function (this: IUser, code: string): Promise<void> {
        // Validate the OTP
        await Otp.validateOtp(this.id, code);

        // Check if the email is not verified yet
        if (!this.email_verified_at) {
            // Update the emailVerifiedAt field using updateOne
            await User.updateOne(
                { _id: this.id },
                { email_verified_at: dayjs().format() }
            );
        }
    }
);
const User = mongoose.model<IUser, IUserModel>("users", userSchema);

export default User;
