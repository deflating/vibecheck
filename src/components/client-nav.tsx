"use client";

import { useSession } from "next-auth/react";
import { Nav } from "./nav";

export function ClientNav() {
  const { data: session } = useSession();
  const user = session?.user
    ? {
        name: session.user.name || "",
        avatar_url: session.user.image || null,
        role: (session.user as { role?: string }).role,
      }
    : null;

  return <Nav user={user} />;
}
