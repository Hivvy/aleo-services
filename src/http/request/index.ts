import Joi from "joi";
import { Request, Response, NextFunction } from "express";

class ValidationClass<T> {
    private schema: Joi.ObjectSchema<T>;

    constructor(schema: Joi.ObjectSchema<T>) {
        this.schema = schema;
        this.validate = this.validate.bind(this);
    }

    validate(req: Request, res: Response, next: NextFunction): void {
        const data: T = req.body;
        const result: Joi.ValidationResult<T> = this.schema.validate(data);

        if (result.error) {
            res.status(400).send({
                message: result.error.details
                    .map((err) => err.message)
                    .join(", "),
            });
        } else {
            next();
        }
    }
}

export default ValidationClass;
