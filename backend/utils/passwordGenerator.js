import crypto from "crypto";

export function generateTemporaryPassword() {
  return crypto.randomBytes(6).toString("base64url");
}