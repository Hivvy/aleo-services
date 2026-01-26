import ejs from "ejs";
import path from "path";
import fs from "fs";

class Mailable {
    private templatePath: string;

    constructor() {
        this.templatePath = path.join(__dirname, "../views/mails");
    }

    public async render(templateName: string, data: object): Promise<string> {
        const filePath = path.join(this.templatePath, `${templateName}.ejs`);

        // Check if the template file exists
        if (!fs.existsSync(filePath)) {
            throw new Error(
                `Template ${templateName} not found in ${this.templatePath}`
            );
        }

        // Read and render the EJS template
        const template = fs.readFileSync(filePath, "utf-8");
        return ejs.render(template, data);
    }
}

export default Mailable;
