"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
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
        body: JSON.stringify({ identifier: email.trim(), password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Unable to sign in with those credentials.");
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/40 to-purple-50/30 px-4 py-10 sm:px-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-purple-100" />
      <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-cyan-500/10 blur-3xl" />
      <div className="absolute -right-24 bottom-0 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl" />

      <div className="relative grid w-full max-w-xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl shadow-slate-900/10 lg:min-h-[620px]">
        <section className="flex items-center justify-center px-6 py-12 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9 lg:hidden">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-700">
                <ShieldCheck size={25} aria-hidden="true" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-700">
                Infinitech Admin
              </p>
            </div>

            <div className="mb-4">
              <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Sign in to your account
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-500">
                Use the email address and password associated with your admin
                account.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <label
                  htmlFor="email"
                  className="text-sm font-semibold text-slate-700"
                >
                  Email address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  autoComplete="username"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  disabled={loading}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="password"
                    className="text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  disabled={loading}
                  required
                  className="h-12 rounded-xl border-slate-200 bg-white px-4 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600"
                />
              </div>

              <Button
                type="submit"
                className="h-12 w-full rounded-xl bg-blue-700 text-base font-semibold text-white shadow-lg shadow-blue-900/15 transition hover:bg-blue-800"
                disabled={loading || !email.trim() || !password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {success ? "Opening your workspace..." : "Signing in..."}
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-8 text-center text-xs leading-5 text-slate-400">
              Access is limited to accounts authorized by your administrator.
            </p>
          </div>
        </section>
      </div>
    </main>
  );

  /*
   * Previous login design retained for easy restoration:
   *
   * return (
   *   <div className="min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-4">
   *     <Card className="w-full max-w-md">
   *       <CardHeader>
   *         <CardTitle className="text-2xl">Admin Login</CardTitle>
   *         <CardDescription>
   *           {loginMode === "superadmin"
   *             ? "Sign in with the administrator password."
   *             : "Sign in with the account credentials provided by your administrator."}
   *         </CardDescription>
   *       </CardHeader>
   *       <CardContent>
   *         <form onSubmit={handleLogin} className="space-y-4">
   *           {error && (
   *             <Alert variant="destructive">
   *               <AlertDescription>{error}</AlertDescription>
   *             </Alert>
   *           )}
   *           {loginMode === "personnel" && (
   *             <div className="space-y-2">
   *               <label htmlFor="identifier" className="text-sm font-medium">
   *                 Employee email
   *               </label>
   *               <Input
   *                 id="identifier"
   *                 type="email"
   *                 inputMode="email"
   *                 autoComplete="username"
   *                 value={identifier}
   *                 onChange={(event) => setIdentifier(event.target.value)}
   *                 disabled={loading}
   *                 required
   *                 className="bg-background"
   *               />
   *             </div>
   *           )}
   *           <div className="space-y-2">
   *             <label htmlFor="password" className="text-sm font-medium">
   *               Password
   *             </label>
   *             <Input
   *               id="password"
   *               type="password"
   *               autoComplete="current-password"
   *               value={password}
   *               onChange={(event) => setPassword(event.target.value)}
   *               disabled={loading}
   *               className="bg-background"
   *             />
   *           </div>
   *           <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={loading}>
   *             {loading ? (success ? "Redirecting..." : "Logging in...") : "Login"}
   *           </Button>
   *           <button
   *             type="button"
   *             className="w-full text-sm text-primary underline-offset-4 hover:underline disabled:opacity-50"
   *             disabled={loading}
   *             onClick={() => {
   *               setLoginMode((mode) => mode === "superadmin" ? "personnel" : "superadmin");
   *               setIdentifier("");
   *               setPassword("");
   *               setError("");
   *             }}
   *           >
   *             {loginMode === "superadmin" ? "Restricted personnel login" : "Superadmin login"}
   *           </button>
   *         </form>
   *       </CardContent>
   *     </Card>
   *   </div>
   * );
   */
}
