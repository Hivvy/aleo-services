import mongoose, { Schema, Model, ObjectId } from "mongoose";
import dayjs from "dayjs";
import { generateRandomCode } from "../helpers";
import Mail from "@/config/mail";

export interface IOtpDocument extends Document {
    id: string;
    user: ObjectId;
    code: string;
    expiredAt: Date;
    usedAt: string;
}
export interface IOtp extends IOtpDocument {}

interface IOtpModel extends Model<IOtp> {
    validateOtp(user: ObjectId, code: string): Promise<boolean>;
    createOtp(user: ObjectId): Promise<IOtp>;
}

const OtpSchema = new Schema<IOtp, IOtpModel>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "users",
        },
        code: {
            type: String,
        },
        usedAt: {
            type: String,
        },
        expiredAt: {
            type: Date,
        },
    },
    {
        timestamps: true,
    }
);

OtpSchema.static(
    "validateOtp",
    async function (user: ObjectId, code: string): Promise<boolean> {
        const otp = await this.findOne({ user }).sort({ createdAt: -1 }).exec();

        if (otp && dayjs(otp.expiredAt) > dayjs() && code === otp.code) {
            otp.usedAt = dayjs().format();
            return true;
        }
        throw new Error("Otp is expired or invaild");
    }
);

OtpSchema.static("createOtp", async function (user: ObjectId): Promise<IOtp> {
    const code = generateRandomCode();
    const expiredAt = dayjs().add(5, "minute");
    const otp = new this({ user, code, expiredAt });
    await otp.save();

    return otp;
});

export default mongoose.model<IOtp, IOtpModel>("Otps", OtpSchema);
