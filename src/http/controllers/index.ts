import { Response } from "express";

interface ControllerInterface {
    handleResponse(
        res: Response,
        message: string,
        data: any[],
        status: number
    ): Response;

    handleErrorResponse(
        res: Response,
        message: string,
        status: number
    ): Response;
}

class Controller implements ControllerInterface {
    handleResponse(
        res: Response,
        message: string = "",
        data: {} | any[] | null = null,
        status = 200
    ) {
        return res.status(status).send({
            message,
            data,
        });
    }

    handleErrorResponse(res: Response, message: string = "", status = 400) {
        return res.status(status).send({ message, data: null });
    }
}

export default Controller;
