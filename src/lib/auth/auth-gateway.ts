import { AuthResult, Session } from "@/lib/types";

export interface AuthGateway {
  signIn(credentials: FormData): Promise<AuthResult>;
  signUp(credentials: FormData): Promise<AuthResult>;
  getSession(): Promise<Session | null>;
  signOut(): Promise<void>;
}
