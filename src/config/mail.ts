import nodemailer from "nodemailer";

interface TransportOptions {
    host: string;
    port: number;
    secure: boolean;
    auth: {
        user: string;
        pass: string;
    };
}

class Mail {
    private transport: nodemailer.Transporter;

    constructor() {
        const transportOptions: TransportOptions = {
            host: process.env.MAIL_HOST ?? "",
            port: parseInt(process.env.MAIL_PORT ?? "", 10),
            secure: process.env.MAIL_SECURE === "true", // Make secure option configurable
            auth: {
                user: process.env.MAIL_USERNAME ?? "",
                pass: process.env.MAIL_PASSWORD ?? "",
            },
        };

        this.transport = nodemailer.createTransport(transportOptions);
    }

    async send(options: nodemailer.SendMailOptions): Promise<void> {
        if (!this.transport) {
            throw new Error("Mail transport not initialized");
        }

        try {
            await this.transport.sendMail(options);
        } catch (error) {
            console.error("Error sending mail:", error);
            throw error;
        }
    }
}

export default Mail;
