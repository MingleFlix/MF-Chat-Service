import dotenv from "dotenv";
import { Server } from "http";
import WebSocket from "ws";
import { startServer } from "./server";
import { generateUserToken } from "./tests/auth-helpers";
import { EventSchema, MessageEvent } from "./types/event";

/*
 * Author: Pham Van Nguyen
 * Matrikelnummer: 2507925
 */

dotenv.config();

const ROOM_ID = "RAOUM1";
const USER_TOKEN = generateUserToken();

let app: Server;

beforeAll((done) => {
    app = startServer();
    done();
});

afterAll((done) => {
    app.close();
    done();
});

describe("chat service", () => {
    let ws: WebSocket;

    // Prepare a websocket connection for every test in this group.
    beforeEach((done) => {
        ws = new WebSocket(
            `ws://localhost:${process.env.PORT}?roomID=${ROOM_ID}&token=${USER_TOKEN}`
        );

        ws.on("open", () => {
            done();
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
            done(error);
        });
    });

    // Close the websocket connection after each test, if it isn't already.
    afterEach(() => {
        if (ws.readyState !== WebSocket.CLOSED) {
            ws.close();
        }
    });

    test("broadcast one message with no subscribers (just self)", (done) => {
        ws.send(
            JSON.stringify({
                type: "message",
                message: "hello world!",
            })
        );

        ws.on("message", (message) => {
            const parsed = EventSchema.safeParse(
                JSON.parse(message.toString())
            );
            expect(parsed.success).toBeTruthy();
            expect(parsed.error).toBeFalsy();
            expect(parsed.data).toBeDefined();

            if (!parsed.data) {
                throw new Error("invalid state");
            }

            expect(parsed.data?.type).toEqual("broadcast");
            expect((parsed.data as MessageEvent).message).toEqual(
                "hello world!"
            );

            done();
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
            done(error);
        });
    });

    test("broadcast two message with no subscribers (just self)", (done) => {
        ws.send(
            JSON.stringify({
                type: "message",
                message: "hello world!",
            })
        );

        ws.send(
            JSON.stringify({
                type: "message",
                message: "test!",
            })
        );

        let messageIdx = 0;

        ws.on("message", (message) => {
            const parsed = EventSchema.safeParse(
                JSON.parse(message.toString())
            );
            expect(parsed.success).toBeTruthy();
            expect(parsed.error).toBeFalsy();
            expect(parsed.data).toBeDefined();

            if (!parsed.data) {
                throw new Error("invalid state");
            }

            expect(parsed.data?.type).toEqual("broadcast");

            if (messageIdx === 0) {
                expect((parsed.data as MessageEvent).message).toEqual(
                    "hello world!"
                );
                messageIdx += 1;
            } else if (messageIdx === 1) {
                expect((parsed.data as MessageEvent).message).toEqual("test!");
                done();
            }
        });

        ws.on("error", (error) => {
            console.error("WebSocket error:", error);
            done(error);
        });
    });

    describe("two subscribers", () => {
        let otherWs: WebSocket;

        // Prepare another websocket connection (this is the other subscriber)
        beforeAll((done) => {
            otherWs = new WebSocket(
                `ws://localhost:${process.env.PORT}?roomID=${ROOM_ID}&token=${USER_TOKEN}`
            );

            otherWs.on("open", () => {
                done();
            });

            otherWs.on("error", (error) => {
                console.error("WebSocket error:", error);
                done(error);
            });
        });

        // Close the other websocket connection after each test, if it isn't already.
        afterAll(() => {
            if (otherWs.readyState !== WebSocket.CLOSED) {
                otherWs.close();
            }
        });

        test("broadcast message with one/two subscriber (self and other)", (done) => {
            ws.send(
                JSON.stringify({
                    type: "message",
                    message: "hello world!",
                })
            );

            let messageReceived = 0;

            ws.on("message", (message) => {
                const parsed = EventSchema.safeParse(
                    JSON.parse(message.toString())
                );
                expect(parsed.success).toBeTruthy();
                expect(parsed.error).toBeFalsy();
                expect(parsed.data).toBeDefined();

                if (!parsed.data) {
                    throw new Error("invalid state");
                }

                expect(parsed.data?.type).toEqual("broadcast");
                expect((parsed.data as MessageEvent).message).toEqual(
                    "hello world!"
                );

                messageReceived += 1;
                if (messageReceived === 2) {
                    done();
                }
            });

            otherWs!.on("message", (message) => {
                const parsed = EventSchema.safeParse(
                    JSON.parse(message.toString())
                );
                expect(parsed.success).toBeTruthy();
                expect(parsed.error).toBeFalsy();
                expect(parsed.data).toBeDefined();

                if (!parsed.data) {
                    throw new Error("invalid state");
                }

                expect(parsed.data?.type).toEqual("broadcast");
                expect((parsed.data as MessageEvent).message).toEqual(
                    "hello world!"
                );

                messageReceived += 1;
                if (messageReceived === 2) {
                    done();
                }
            });

            ws.on("error", (error) => {
                console.error("WebSocket error:", error);
                done(error);
            });
        });
    });
});
