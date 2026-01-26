import CryptoJS from "crypto-js";
import dotenv from "dotenv";
dotenv.config();
const $key = process.env.SECRET_KEY;

export const encrypt = (data: any) => {
    return CryptoJS.AES.encrypt(data, $key ?? "").toString();
};

export const decrypt = (data: any) => {
    if (data) {
        var bytes = CryptoJS.AES.decrypt(data, $key ?? "");
        return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    }
    return null;
};
