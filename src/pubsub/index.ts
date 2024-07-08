/*
 * Author: Pham Van Nguyen
 * Matrikelnummer: 2507925
 */

export interface Subscriber {
    dispose(): Promise<void>;
}

// Abstraction for general pub-sub operations.
export interface PubSub {
    publish(channelId: string, message: string): Promise<void>;

    subscribe(
        channelId: string,
        callback: (message: string) => void
    ): Subscriber;
}
