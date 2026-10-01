import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "admin" | "editor";

/** Current Supabase session, kept in sync with sign-in/sign-out. `undefined` while loading. */
export function useSession(): Session | null | undefined {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  return session;
}

/** Roles held by the signed-in user (admin implies every role). */
export function useRoles(userId: string | undefined) {
  return useQuery({
    queryKey: ["require-auth-roles", userId],
    enabled: !!userId,
    staleTime: 60_000,
    queryFn: async () => {
      const [admin, editor] = await Promise.all([
        supabase.rpc("has_role", { _user_id: userId!, _role: "admin" }),
        supabase.rpc("has_role", { _user_id: userId!, _role: "editor" }),
      ]);
      return { admin: admin.data === true, editor: editor.data === true };
    },
  });
}
