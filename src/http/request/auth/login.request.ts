import Joi from "joi";
import ValidationClass from "..";

class LoginRequest extends ValidationClass<{
    email: string;
    password: string;
}> {
    constructor() {
        const schema: Joi.ObjectSchema<{
            email: string;
            password: string;
        }> = Joi.object().keys({
            email: Joi.string().email().required(),
            password: Joi.string().min(8).required(),
        });
        super(schema);
    }
}

export default new LoginRequest();
