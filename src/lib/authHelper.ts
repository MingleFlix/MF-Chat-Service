import jwt from "jsonwebtoken";

/*
 * Author: Pham Van Nguyen
 * Matrikelnummer: 2507925
 */

export interface JWTPayload {
  userId: string;
  email: string;
  username: string;
}

export function authenticateJWT(token: string): JWTPayload {
  const secretKey = process.env.JWT_SECRET;
  if (!secretKey) {
    throw new Error("No secret key");
  }
  const decoded = jwt.verify(token, secretKey);
  return decoded as JWTPayload;
}
