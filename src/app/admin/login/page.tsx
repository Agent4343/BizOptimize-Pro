"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginAdmin, isAdminAuthenticated, isDeveloper } from "@/lib/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Redirect if already authenticated
    if (isAdminAuthenticated()) {
      router.push("/admin");
      return;
    }

    // Pre-fill email if signed in
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [router, session]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Pre-fill email if not set
    const emailToUse = email || session?.user?.email || '';
    
    if (loginAdmin(emailToUse, password)) {
      router.push("/admin");
    } else {
      setError("Access denied. Developer credentials required.");
      setLoading(false);
    }
  };

  // If not signed in, require NextAuth sign in first
  if (!session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-blue-500 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg mb-4">
              <span className="text-white text-3xl">🔐</span>
            </div>
            <CardTitle className="text-2xl">Developer Access</CardTitle>
            <CardDescription>
              Please sign in with your account first
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/auth/signin?callbackUrl=/admin/login')}
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
            >
              Sign In First
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if user is the developer
  if (!isDeveloper(session.user.email)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 border-red-500 shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg mb-4">
              <span className="text-white text-3xl">🚫</span>
            </div>
            <CardTitle className="text-2xl">Access Denied</CardTitle>
            <CardDescription>
              Developer access is restricted to authorized personnel only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => router.push('/dashboard')}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 border-blue-500 shadow-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl">🔐</span>
          </div>
          <CardTitle className="text-2xl">Developer Access</CardTitle>
          <CardDescription>
            Verify your developer credentials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email || session.user.email || ''}
                onChange={(e) => setEmail(e.target.value)}
                className="border-2"
                disabled={!!session.user.email}
                autoFocus={!session.user.email}
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-2"
              />
            </div>
            {error && (
              <div className="text-sm text-red-500 bg-red-50 p-2 rounded border border-red-200">
                {error}
              </div>
            )}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
              disabled={loading || !password}
            >
              {loading ? "Authenticating..." : "Verify & Access"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

