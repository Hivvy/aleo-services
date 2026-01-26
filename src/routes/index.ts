import express from "express";
import auth from "@/routes/auth";
import wallet from "@/routes/wallet";

const router = express.Router();

const defaultIRoute = [
    {
        path: "/wallet",
        route: wallet,
    },
];

defaultIRoute.forEach((route) => {
    router.use(route.path, route.route);
});

export default router;
