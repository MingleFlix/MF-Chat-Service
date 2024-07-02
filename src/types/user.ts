import { z } from "zod";

export const UserSchema = z.object({
    userId: z.string().or(z.number()),
    email: z.string(),
    username: z.string(),
});

export type User = z.infer<typeof UserSchema>;
