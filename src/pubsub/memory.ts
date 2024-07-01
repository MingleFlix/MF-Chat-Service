import { PubSub, Subscriber } from ".";

import { randomUUID } from "node:crypto";

type Sub = (message: string) => void;

type Channel = {
    subscribers: Partial<Record<string, Sub>>;
};

// An in-memory implementation of a PubSub.
export class InMemoryPubSub implements PubSub {
    private channels: Partial<Record<string, Channel>> = {};

    constructor() {}

    async publish(channelId: string, message: string): Promise<void> {
        const channel = this.channels[channelId];
        if (!channel) {
            return;
        }

        for (const sub of Object.values(channel.subscribers)) {
            if (!sub) {
                continue;
            }
            sub(message);
        }
    }

    subscribe(
        channelId: string,
        callback: (message: string) => void
    ): Subscriber {
        let channel = this.channels[channelId];
        if (!channel) {
            channel = {
                subscribers: {},
            };
            this.channels[channelId] = channel;
        }

        const subId = randomUUID();
        channel.subscribers[subId] = callback;

        return {
            async dispose() {
                delete channel.subscribers[subId];
            },
        };
    }
}
