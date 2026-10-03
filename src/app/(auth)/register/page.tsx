import { Metadata } from "next";
import { RegisterForm } from "@/components/forms/register-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export const metadata: Metadata = {
  title: "Crear cuenta | Red FaCyT",
  description: "Regístrate para publicar y consultar información de la facultad.",
};

/**
 * Register page (public auth route group).
 *
 * @returns The register page section.
 */
export default function RegisterPage() {
  return (
    <AuthGuard>
      <RegisterForm />
    </AuthGuard>
  );
}