import jwt from "jsonwebtoken";

/*
 * Author: Pham Van Nguyen
 * Matrikelnummer: 2507925
 */

export function generateUserToken() {
    return jwt.sign(
        { userId: 2, email: "foo@bar", username: "foo" },
        process.env.JWT_SECRET || "",
        { expiresIn: "1h" }
    );
}
