"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/session/session-provider";

/**
 * Fallback route page for `/profile`.
 *
 * Redirects authenticated visitors to `/profile/[username]` using their active
 * session username.
 *
 * @returns Loading indicator until redirection takes place.
 */
export default function ProfileRedirectPage() {
  const router = useRouter();
  const { session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated" && session?.user.username) {
      router.replace(`/profile/${session.user.username}`);
    } else if (status === "anonymous") {
      router.replace("/login");
    }
  }, [session, status, router]);

  return (
    <div
      aria-busy="true"
      className="min-h-96 flex items-center justify-center"
      aria-label="Cargando perfil"
    />
  );
}
