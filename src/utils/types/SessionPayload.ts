import { JWTPayload } from "jose";

export interface SessionPayload extends JWTPayload{
    id: string,
    email: string,
}