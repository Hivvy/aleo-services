import Mail from "@/config/mail";
import Mailable from "./index";

class OtpMail extends Mailable {
    private mail: Mail;
    private email: string;

    constructor(email: string, otp: string) {
        super();
        this.mail = new Mail();
        this.email = email;

        // Render the email template
        this.render("otp", { otp })
            .then((htmlContent) => {
                this.mail.send({
                    from: "sender@example.com",
                    to: this.email,
                    subject: "Verify your Otp",
                    html: htmlContent,
                });
            })
            .catch((error) => {
                console.error("Error rendering email template:", error);
            });
    }
}

export default OtpMail;
