import 'dotenv/config' // To read CLERK_SECRET_KEY and CLERK_PUBLISHABLE_KEY
import express, { Express, Request, Response, NextFunction } from "express";
import { clerkMiddleware, ExpressRequestWithAuth, getAuth } from '@clerk/express';
import cors from 'cors'
import requireAuth from "./middleware/requireAuth";
import { sign } from "jsonwebtoken";

const port = process.env.PORT || 3000

const app: Express = express()

// const corsOptions: cors.CorsOptions = {
//     origin: ["http://localhost:5173", "http://localhost:3000"], // Replace with your frontend origin
//     allowedHeaders: ["Origin", "X-Requested-With", "Accept", "Content-Type", "Authorization"]
// };

app.use(cors())
app.use(clerkMiddleware())

console.log(process.env.APPLE_DEV_TOKEN);

app.get('/auth-state', (req: ExpressRequestWithAuth, res: Response) => {
    const authState = req.auth
    res.json(authState)
});

const apple_token = sign({}, process.env.APPLE_DEV_TOKEN!, {
    algorithm: 'ES256',
    expiresIn: '180d',
    issuer: process.env.APPLE_TEAM_ID,
    header: {
        alg: 'ES256',
        kid: process.env.APPLE_KEY_ID
    }
});

app.get('/apple-token', requireAuth, (req: ExpressRequestWithAuth, res: Response) => {
    res.json({token: apple_token});
})

// // Use the strict middleware that throws when unauthenticated
// app.get('/protected-auth-required', ClerkExpressRequireAuth(), (req, res) => {
//     res.json(req.auth)
// })
//
// // Use the lax middleware that returns an empty auth object when unauthenticated
// app.get('/protected-auth-optional', ClerkExpressWithAuth(), (req, res) => {
//     res.json(req.auth)
// })
//
// // Error handling middleware function
// app.use((err, req, res, next) => {
//     console.error(err.stack)
//     res.status(401).send('Unauthenticated!')
// })

// Route not utilizing any authentication
app.get('/', function (req, res) {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})