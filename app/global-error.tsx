'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
          <Card className="w-full max-w-md border-2 shadow-2xl">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full"></div>
                  <div className="relative rounded-full bg-destructive/10 p-4">
                    <AlertTriangle className="h-8 w-8 text-destructive" />
                  </div>
                </div>
              </div>
              <CardTitle className="text-2xl">Critical Error</CardTitle>
              <CardDescription className="text-base mt-2">
                A critical error occurred. Please refresh the page.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error.message && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm text-destructive font-mono">{error.message}</p>
                </div>
              )}
              <div className="flex gap-3">
                <Button
                  onClick={reset}
                  className="flex-1 gap-2"
                  variant="outline"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again
                </Button>
                <Button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 gap-2 gradient-primary hover:opacity-90"
                >
                  <Home className="h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </body>
    </html>
  );
}

