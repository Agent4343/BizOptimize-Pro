"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/lib/supabase";

export default function SignUpPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    companyName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Check if Supabase is configured (check if URL is placeholder)
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      if (!supabaseUrl || supabaseUrl.includes('placeholder')) {
        setError("Database not configured. Please set up Supabase credentials in your environment variables.");
        setLoading(false);
        return;
      }

      // Sign up with Supabase
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            company_name: formData.companyName,
          },
        },
      });

      if (authError) {
        // Provide more specific error messages
        if (authError.message.includes('fetch')) {
          setError("Unable to connect to authentication service. Please check your internet connection.");
        } else if (authError.message.includes('already registered')) {
          setError("This email is already registered. Please sign in instead.");
        } else {
          setError(authError.message || "An error occurred during sign up.");
        }
        setLoading(false);
        return;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: authData.user.id,
            email: formData.email,
            full_name: formData.fullName,
            company_name: formData.companyName,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Continue anyway - profile can be created later
        }

        // Redirect to dashboard
        router.push("/dashboard?welcome=true");
      } else {
        setError("Account creation failed. Please try again.");
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      if (err.message?.includes('fetch') || err.message?.includes('network')) {
        setError("Network error. Please check your internet connection and try again.");
      } else {
        setError(err.message || "An error occurred. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-blue-600 to-green-600 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl">🚀</span>
          </div>
          <CardTitle className="text-2xl">Create Account</CardTitle>
          <CardDescription>
            Start optimizing your business today
          </CardDescription>
        </CardHeader>
        <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4" suppressHydrationWarning>
                <div suppressHydrationWarning className="relative">
                  <label htmlFor="fullName" className="text-sm font-medium mb-2 block">Full Name</label>
                  <div suppressHydrationWarning className="relative">
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="John Doe"
                      value={formData.fullName}
                      onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      required
                      className="border-2"
                      autoComplete="name"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div suppressHydrationWarning className="relative">
                  <label htmlFor="companyName" className="text-sm font-medium mb-2 block">Company Name</label>
                  <div suppressHydrationWarning className="relative">
                    <Input
                      id="companyName"
                      name="companyName"
                      type="text"
                      placeholder="Acme Inc."
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="border-2"
                      autoComplete="organization"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div suppressHydrationWarning className="relative">
                  <label htmlFor="signup-email" className="text-sm font-medium mb-2 block">Email</label>
                  <div suppressHydrationWarning className="relative">
                    <Input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="border-2"
                      autoComplete="email"
                      suppressHydrationWarning
                    />
                  </div>
                </div>
                <div suppressHydrationWarning className="relative">
                  <label htmlFor="signup-password" className="text-sm font-medium mb-2 block">Password</label>
                  <div suppressHydrationWarning className="relative">
                    <Input
                      id="signup-password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      className="border-2"
                      autoComplete="new-password"
                      suppressHydrationWarning
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                </div>
                <div suppressHydrationWarning className="relative">
                  <label htmlFor="confirmPassword" className="text-sm font-medium mb-2 block">Confirm Password</label>
                  <div suppressHydrationWarning className="relative">
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                      required
                      className="border-2"
                      autoComplete="new-password"
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
              disabled={loading}
            >
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/signin" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

