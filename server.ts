import 'dotenv/config'
import express, { Express, Response } from "express";
import { clerkMiddleware, ExpressRequestWithAuth } from '@clerk/express';
import cors from 'cors'
import requireAuth from "./middleware/requireAuth";
import jsonwebtoken from "jsonwebtoken";
import * as querystring from "node:querystring";
import axios from "axios";
const { sign } = jsonwebtoken;

const port = process.env.PORT || 3000

const app: Express = express()
const corsOptions: cors.CorsOptions = {
    origin: ["http://localhost:5173", "http://localhost:3000"], // Replace with your frontend origin
    allowedHeaders: ["Origin", "X-Requested-With", "Accept", "Content-Type", "Authorization"]
};

app.use(cors(corsOptions))
app.use(clerkMiddleware())

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
});

app.get('/spotify-login', requireAuth, (req: ExpressRequestWithAuth, res: Response) => {
    res.redirect("https://accounts.spotify.com/authorize?") + querystring.stringify({
            response_type: 'code',
            client_id: process.env.SPOTIFY_CLIENT_ID!,
            scope: "user-read-private user-read-email user-library-read playlist-read-private",
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!
        })
});

app.get("/spotify-callback", requireAuth, (req: ExpressRequestWithAuth, res: Response) => {
    const code = req.query.code || null;
    const authOptions = {
        form: {
            code: code,
            redirect_uri: process.env.SPOTIFY_REDIRECT_URI!,
            grant_type: "authorization_code",
        },
        headers: {
            "Authorization": "Basic" + (Buffer.from(`${process.env.SPOTIFY_CLIENT_ID!}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString("base64")),
        },
        json: true,
    }
    axios.post("https://accounts.spotify.com/api/token", authOptions)
        .then((response) => {
            const accessToken = response.data.access_token;
            res.redirect(process.env.FRONTEND_URI + "?access_token=" + accessToken);
        })
});

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