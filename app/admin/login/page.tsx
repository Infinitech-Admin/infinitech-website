"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const [loginMode, setLoginMode] = useState<"superadmin" | "personnel">("superadmin");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          loginMode === "superadmin" ? { password } : { identifier, password },
        ),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid password");
        setLoading(false);
        return;
      }

      localStorage.setItem("adminSessionActive", "1");
      setSuccess(true);
      router.push("/admin/dashboard");
    } catch {
      setError("Login failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Admin Login</CardTitle>
          <CardDescription>
            {loginMode === "superadmin"
              ? "Sign in with the administrator password."
              : "Sign in with the account credentials provided by your administrator."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {loginMode === "personnel" && (
              <div className="space-y-2">
                <label htmlFor="identifier" className="text-sm font-medium">
                  Employee email
                </label>
                <Input
                  id="identifier"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  disabled={loading}
                  required
                  className="bg-background"
                />
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                className="bg-background"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {success ? "Redirecting..." : "Logging in..."}
                </>
              ) : (
                "Login"
              )}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-primary underline-offset-4 hover:underline disabled:opacity-50"
              disabled={loading}
              onClick={() => {
                setLoginMode((mode) =>
                  mode === "superadmin" ? "personnel" : "superadmin",
                );
                setIdentifier("");
                setPassword("");
                setError("");
              }}
            >
              {loginMode === "superadmin"
                ? "Restricted personnel login"
                : "Superadmin login"}
            </button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
