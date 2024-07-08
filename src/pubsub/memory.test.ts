import { InMemoryPubSub } from "./memory";

describe("Memory PubSub", () => {
    test("publish messages to unsubscribed channel", async () => {
        const pubsub = new InMemoryPubSub();

        expect(pubsub.publish("channel1", "test1")).resolves.toBeUndefined();
        expect(pubsub.publish("channel1", "test2")).resolves.toBeUndefined();

        expect(pubsub.publish("channel2", "test1")).resolves.toBeUndefined();
        expect(pubsub.publish("channel2", "test2")).resolves.toBeUndefined();
    });

    test("publish messages to subscribed channel", async () => {
        const pubsub = new InMemoryPubSub();

        const sub1Received: string[] = [];
        const sub2Received: string[] = [];

        const sub1 = pubsub.subscribe("channel1", (message) => {
            sub1Received.push(message);
        });
        expect("dispose" in sub1).toBeTruthy();

        const sub2 = pubsub.subscribe("channel2", (message) => {
            sub2Received.push(message);
        });
        expect("dispose" in sub2).toBeTruthy();

        expect(pubsub.publish("channel1", "test1")).resolves.toBeUndefined();
        expect(pubsub.publish("channel2", "test2")).resolves.toBeUndefined();

        expect(sub1Received).toEqual(["test1"]);
        expect(sub2Received).toEqual(["test2"]);
    });

    test("publish messages to subscribed channel", async () => {
        const pubsub = new InMemoryPubSub();

        const sub1Received: string[] = [];

        const sub1 = pubsub.subscribe("channel1", (message) => {
            sub1Received.push(message);
        });
        expect("dispose" in sub1).toBeTruthy();

        expect(sub1.dispose()).resolves.toBeUndefined();

        expect(pubsub.publish("channel1", "test2")).resolves.toBeUndefined();

        expect(sub1Received).toEqual([]);
    });
});
