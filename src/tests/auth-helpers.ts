import jwt from "jsonwebtoken";

export function generateUserToken() {
    return jwt.sign(
        { userId: 2, email: "foo@bar", username: "foo" },
        process.env.JWT_SECRET || "",
        { expiresIn: "1h" }
    );
}
