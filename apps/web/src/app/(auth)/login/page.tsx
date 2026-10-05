import { Metadata } from "next";
import { LoginForm } from "@/components/forms/login-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Iniciar sesión | Red FaCyT",
  description: "Accede a Red FaCyT para publicar y consultar información de la facultad.",
};

/**
 * Login page (public auth route group).
 *
 * @returns The login page section.
 */
export default function LoginPage() {
  return (
    <AuthGuard>
      <LoginForm />
    </AuthGuard>
  );
}