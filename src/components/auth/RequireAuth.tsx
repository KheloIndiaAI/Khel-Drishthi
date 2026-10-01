import type { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";
import { useRoles, useSession, type AppRole } from "@/hooks/useAuthSession";
import DashboardLayout from "@/components/layout/DashboardLayout";
import PageLoader from "@/components/ui/PageLoader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RequireAuthProps {
  children: ReactNode;
  /** Any one of these roles grants access. Omit to require only a signed-in user. */
  roles?: AppRole[];
  /** Shown on the sign-in prompt, e.g. "STC assessment data". */
  resource?: string;
}

/**
 * Route guard. UX only: the database (RLS) is the real security boundary, so a
 * user who bypasses this still cannot read or write data they are not allowed to.
 */
export function RequireAuth({ children, roles, resource = "this page" }: RequireAuthProps) {
  const navigate = useNavigate();
  const session = useSession();
  const { data: held, isLoading: rolesLoading } = useRoles(roles?.length ? session?.user.id : undefined);

  if (session === undefined || (roles?.length && session && rolesLoading)) return <PageLoader />;

  if (!session) {
    return (
      <GuardCard title="Sign-in required">
        <p className="text-muted-foreground mb-4">Please sign in to view {resource}.</p>
        <Button onClick={() => navigate("/auth")}>Go to login</Button>
      </GuardCard>
    );
  }

  const allowed = !roles?.length || held?.admin || roles.some((r) => held?.[r]);
  if (!allowed) {
    return (
      <GuardCard title="Access denied" destructive>
        <p className="text-muted-foreground">
          {roles!.includes("editor") ? "Editor or admin" : "Admin"} access is required for {resource}. Contact an
          administrator if you need access.
        </p>
      </GuardCard>
    );
  }

  return <>{children}</>;
}

function GuardCard({ title, destructive, children }: { title: string; destructive?: boolean; children: ReactNode }) {
  return (
    <DashboardLayout>
      <Card className="max-w-md mx-auto mt-12">
        <CardHeader>
          <CardTitle className={`flex items-center gap-2 ${destructive ? "text-destructive" : ""}`}>
            <Lock className="h-5 w-5" aria-hidden="true" /> {title}
          </CardTitle>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </DashboardLayout>
  );
}
