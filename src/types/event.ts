import { z } from "zod";

/*
 * Author: Pham Van Nguyen
 * Matrikelnummer: 2507925
 */

export const MessageEventSchema = z.object({
    type: z.literal("message"),
    message: z.string(),
});

export type MessageEvent = z.infer<typeof MessageEventSchema>;

export const PingEventSchema = z.object({
    type: z.literal("ping"),
});

export type PingEvent = z.infer<typeof PingEventSchema>;

export const BroadcastMessageEventSchema = z.object({
    type: z.literal("broadcast"),
    timestamp: z.string().datetime(),
    name: z.string(),
    userId: z.string().or(z.number()),
    email: z.string(),
    message: z.string(),
});

export type BroadcastMessageEvent = z.infer<typeof BroadcastMessageEventSchema>;

export const EventSchema = z.discriminatedUnion("type", [
    MessageEventSchema,
    PingEventSchema,
    BroadcastMessageEventSchema,
]);

export type Event = z.infer<typeof EventSchema>;
