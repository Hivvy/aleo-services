import Joi from "joi";
import ValidationClass from "..";

class VerifyOtpRequest extends ValidationClass<{
    email: string;
    code: string;
}> {
    constructor() {
        const schema: Joi.ObjectSchema<{
            email: string;
            code: string;
        }> = Joi.object().keys({
            email: Joi.string().email().required(),
            code: Joi.string().required(),
        });

        super(schema);
    }
}

export default new VerifyOtpRequest();
