import { AuthResult, Session } from "@/lib/types";

/**
 * Interface representing the operations supported by the authentication layer.
 * Implements the Repository Pattern to decouple the frontend from the specific auth provider.
 */
export interface AuthGateway {
  /** Attempts to sign in a user using the provided form data. */
  signIn(credentials: FormData): Promise<AuthResult>;
  /** Attempts to register a new user using the provided form data. */
  signUp(credentials: FormData): Promise<AuthResult>;
  /** Retrieves the active user session, if any. */
  getSession(): Promise<Session | null>;
  /** Ends the active user session. */
  signOut(): Promise<void>;
}
