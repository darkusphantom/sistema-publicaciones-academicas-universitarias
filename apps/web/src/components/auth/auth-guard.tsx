"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { StaticAuthGateway } from "@/lib/auth/auth-gateway.static";

const gateway = new StaticAuthGateway();

/**
 * Client-side guard for public auth pages.
 * If a session exists, it replaces the history entry and redirects to /feed.
 * 
 * Note: Once the backend is implemented, this should be handled by Middleware 
 * to avoid client-side redirect flashes.
 */
export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    gateway.getSession().then((session) => {
      if (session) {
        router.replace("/feed");
      } else {
        setIsChecking(false);
      }
    });
  }, [router]);

  if (isChecking) {
    return null; // Or a subtle loader, but null prevents flash of form
  }

  return <>{children}</>;
}
