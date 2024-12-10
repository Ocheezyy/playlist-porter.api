import {NextFunction, Request, Response} from "express";
import {ExpressRequestWithAuth} from "@clerk/express";

const requireAuth = (req: ExpressRequestWithAuth, res: Response, next: NextFunction) => {
    if (!req.auth.userId) {
        res.status(401).json({error: 'Unauthorized'});
    }
    next()
};

export default requireAuth;