import Joi from "joi";
import ValidationClass from "..";

class OtpRequest extends ValidationClass<{
    email: string;
}> {
    constructor() {
        const schema: Joi.ObjectSchema<{
            email: string;
        }> = Joi.object().keys({
            email: Joi.string().email().required(),
        });

        super(schema);
    }
}

export default new OtpRequest();
