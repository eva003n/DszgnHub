import type { Request } from "express";
import type { UserInterface } from "./model.interface.js";

interface ProtectedRequest extends Request {
  user: UserInterface;
  // accessToken: string;
  cookies: {
    AccessToken: string;
    RefreshToken: string;
  }
}
export type { ProtectedRequest };
