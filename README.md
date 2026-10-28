# Vehicle Telemetry Dashboard

A connected-vehicle backend and live dashboard. A simulator generates vehicle sensor data every second;
the server stores it in MongoDB, checks alert rules, and streams it to the browser over WebSockets.
Access is protected with JWT login.

**Stack:** Node.js, Express, MongoDB (Mongoose), WebSockets (ws), JWT, bcrypt, Chart.js

## Folder structure

```
vehicle-telemetry/
├── server.js                  Entry point: connects DB, starts HTTP + WebSocket server
├── package.json
├── .env.example               Template for your secrets (copy to .env)
├── scripts/
│   └── api-test.ps1           PowerShell script that checks every API route
├── src/
│   ├── app.js                 Express app: middleware and routes
│   ├── config/                env.js (loads and validates .env), db.js (MongoDB connection)
│   ├── models/                User, Reading, Alert, Fault (Mongoose schemas)
│   ├── controllers/           Request handling logic for each resource
│   ├── routes/                URL definitions that map to controllers
│   ├── middleware/            auth (JWT check), asyncHandler, errorHandler
│   ├── services/              simulator, alertService, telemetryLoop (the 1-second loop)
│   ├── websocket/             WebSocket server with token check
│   ├── data/                  faultCodes.js (diagnostic trouble codes)
│   └── utils/                 token.js (sign and verify JWT)
└── public/                    Frontend served by Express
    ├── index.html, login.html
    ├── css/                   dashboard.css, login.css
    └── js/                    dashboard.js, login.js
```

## Run locally

1. Install Node.js 18 or newer.
2. Install packages: `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI`: your MongoDB Atlas connection string (with a database name, e.g. `/telemetry`)
   - `JWT_SECRET`: generate one with `node -p "require('crypto').randomBytes(32).toString('hex')"`
4. Start: `npm start` (or `npm run dev` to restart on file changes)
5. Open http://localhost:3000/login.html and create an account.

## API

| Method | Route | Auth | Description |
|---|---|---|---|
| GET | `/api/health` | no | Health check |
| POST | `/api/auth/register` | no | Create account, returns token |
| POST | `/api/auth/login` | no | Log in, returns token |
| GET | `/api/diagnostics/:code` | no | Look up a fault code |
| GET | `/api/readings?limit=20` | yes | Recent readings (max 100) |
| GET | `/api/readings/latest` | yes | Latest reading |
| GET | `/api/stats` | yes | Average speed, max speed, max temperature, count |
| GET | `/api/alerts` | yes | Recent alerts |
| POST | `/api/faults` | yes | Log a fault `{ "vehicleId", "code" }` |
| GET | `/api/faults/:vehicleId` | yes | Fault history for a vehicle |

Protected routes need the header `Authorization: Bearer <token>`.
The live stream is at `ws://host/?token=<token>`.

To test everything at once, start the server and run `.\scripts\api-test.ps1` in PowerShell.

## Alert rules

| Alert | Condition |
|---|---|
| Overspeed | speed above 90 km/h |
| Overheat | engine temperature above 105 °C |
| Low battery | battery below 20% |

The same alert type is not repeated within 10 seconds.

## Deploy on Render

1. Push this folder to GitHub (`.env` is git-ignored, so your secrets stay local).
2. In MongoDB Atlas, allow network access from `0.0.0.0/0` (Render's IPs change).
3. On render.com create a **Web Service** from the repo: build command `npm install`, start command `npm start`.
4. Add environment variables `MONGO_URI` and `JWT_SECRET`. Do not set `PORT`.

## Design notes

- Passwords are hashed with bcrypt; sessions use signed JWTs that expire after 2 hours.
- Readings expire after 1 hour and alerts after 24 hours (MongoDB TTL indexes), so the free database does not fill up.
- Login input is type-checked to block NoSQL injection payloads.
- Known limits: the token is stored in `localStorage` (httpOnly cookies would be safer in production), and there is no rate limiting on login.
