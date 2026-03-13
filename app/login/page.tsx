"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/auth-provider";
import { LoginScreen } from "@/components/auth/login-screen";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const { loading, user } = useAuth();
  const router = useRouter();

  // Already logged in — redirect to home
  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [loading, user, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (user) return null; // redirect in progress

  return <LoginScreen />;
}
