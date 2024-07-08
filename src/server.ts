import cookieParser from "cookie-parser";
import express from "express";
import WebSocket from "ws";
import { authenticateJWT } from "./lib/authHelper";
import { InMemoryPubSub } from "./pubsub/memory";
import {
    BroadcastMessageEvent,
    EventSchema,
    MessageEvent,
} from "./types/event";
import { User, UserSchema } from "./types/user";
import { Server } from "http";

export function startServer(): Server {
    const app = express();
    const port = process.env.PORT || 3003;

    // Middleware
    app.use(cookieParser());
    app.use(express.json());

    app.get("/", (_req, res) => {
        res.send("Chat Service");
    });

    const server = app.listen(port, () => {
        console.log(`Chat Service is running on http://localhost:${port}`);
    });

    // Websocket server
    const wss = new WebSocket.Server({ server: server });

    // PubSub
    const pubsub = new InMemoryPubSub();

    wss.on("connection", async (ws, req) => {
        console.log("New WebSocket connection");

        // Parse Url
        const params = new URLSearchParams(req.url?.substring(1));
        const roomID = params.get("roomID");
        const token = params.get("token");

        if (!token) {
            console.error("No token provided!");
            ws.close();
            return;
        }

        // Authenticate user via JWT
        let user: User | undefined;
        try {
            user = UserSchema.parse(authenticateJWT(token));
        } catch (error) {
            console.error("Error authenticating user:", error);
        }

        // Close connection if user room id is missing or user not found
        if (!user || !roomID) {
            ws.close();
            return;
        }

        console.log("Client connected to room", roomID);

        const subscriber = pubsub.subscribe(roomID, (message: string) => {
            ws.send(message);
        });

        ws.on("message", async (rawData) => {
            const data =
                typeof rawData !== "string" ? rawData.toString() : rawData;

            const parseResult = EventSchema.safeParse(JSON.parse(data));
            if (!parseResult.success) {
                console.error("invalid message");
                return;
            }

            const event = parseResult.data;

            switch (event.type) {
                case "message":
                    handleMessageEvent(user, event, roomID);
                    break;
                case "ping":
                    break;
                default:
                    break;
            }
        });

        ws.on("close", () => {
            subscriber.dispose();
            console.log("Closed websocket");
        });

        // Send ping messages every 30 seconds (keep the connection alive)
        const pingInterval = setInterval(() => {
            if (ws.readyState === ws.OPEN) {
                ws.ping();
            } else {
                clearInterval(pingInterval);
            }
        }, 30000);

        ws.on("pong", () => {
            console.log("Pong received");
        });
    });

    // Event Handlers

    function handleMessageEvent(
        user: User,
        event: MessageEvent,
        roomId: string
    ) {
        const data = JSON.stringify({
            type: "broadcast",
            timestamp: new Date().toISOString(),
            email: user.email,
            userId: user.userId,
            name: user.username,
            message: event.message,
        } satisfies BroadcastMessageEvent);

        pubsub.publish(roomId, data);
    }

    return server;
}
