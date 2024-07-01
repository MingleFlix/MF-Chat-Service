import request from "supertest";
import WebSocket from "ws";
import dotenv from "dotenv";
import app from "../src/index"; // Adjust the path to your app

dotenv.config();

afterAll((done) => {
  app.close();
  done();
});

describe("HTTP Endpoint", () => {
  it("should return a welcome message", async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("Chat Service");
  });
});

describe("WebSocket Unauthorized", () => {
  let ws: WebSocket;

  beforeEach((done) => {
    ws = new WebSocket(
      `ws://localhost:${process.env.PORT}?roomID=test`
    );
    ws.on("open", done);
  });

  afterEach(() => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.close();
    }
  });

  it("should not connect to WebSocket server", (done) => {
    ws.on("close", () => done());
  });
});
