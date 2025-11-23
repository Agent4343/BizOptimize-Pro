"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const errorMessages: Record<string, string> = {
    Configuration: "There is a problem with the server configuration.",
    AccessDenied: "You do not have permission to sign in.",
    Verification: "The verification token has expired or has already been used.",
    Default: "An error occurred during authentication.",
  };

  const errorMessage = errorMessages[error || ''] || errorMessages.Default;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-2 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto h-16 w-16 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg mb-4">
            <span className="text-white text-3xl">⚠️</span>
          </div>
          <CardTitle className="text-2xl">Authentication Error</CardTitle>
          <CardDescription>
            {errorMessage}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded border">
              <strong>Error Code:</strong> {error}
            </div>
          )}
          <div className="space-y-2">
            <Link href="/auth/signin">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700">
                Try Again
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" className="w-full">
                Go Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-2 shadow-xl">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  );
}

