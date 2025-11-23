"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error || "An error occurred during sign in");
        setLoading(false);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Sign in failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err?.message || "An error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl">📊</span>
          </div>
          <CardTitle className="text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your BizOptimize Pro account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
            <div suppressHydrationWarning className="relative">
              <label htmlFor="email" className="text-sm font-medium mb-2 block">Email</label>
              <div suppressHydrationWarning className="relative">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-2"
                  autoComplete="email"
                  suppressHydrationWarning
                />
              </div>
            </div>
            <div suppressHydrationWarning className="relative">
              <label htmlFor="password" className="text-sm font-medium mb-2 block">Password</label>
              <div suppressHydrationWarning className="relative">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-2"
                  autoComplete="current-password"
                  suppressHydrationWarning
                />
              </div>
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={loading || !email || !password}
            >
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Don't have an account? </span>
            <Link href="/auth/signup" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>
          {/* Forgot password functionality can be added later */}
          {/* <div className="mt-2 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-gray-500 hover:underline">
              Forgot password?
            </Link>
          </div> */}
        </CardContent>
      </Card>
    </div>
  );
}

