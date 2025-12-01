'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, XCircle, Database, RefreshCw } from 'lucide-react';

export default function MigratePage() {
  const [migrating, setMigrating] = useState(false);
  const [status, setStatus] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/migrate');
      const data = await response.json();
      setStatus(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const runMigration = async () => {
    setMigrating(true);
    setError(null);
    setStatus(null);

    try {
      const response = await fetch('/api/migrate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setStatus(data);
        // Refresh the page after 2 seconds to show the migrated data
        setTimeout(() => {
          window.location.href = '/';
        }, 2000);
      } else {
        setError(data.error || 'Migration failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to run migration');
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Database className="h-6 w-6" />
              Data Migration Tool
            </CardTitle>
            <CardDescription className="text-base">
              Migrate your data from Supabase to Firebase Firestore
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="flex gap-4">
              <Button
                onClick={checkStatus}
                variant="outline"
                className="gap-2"
                disabled={migrating}
              >
                <RefreshCw className="h-4 w-4" />
                Check Status
              </Button>
              <Button
                onClick={runMigration}
                disabled={migrating}
                className="gap-2 gradient-primary hover:opacity-90 shadow-lg"
              >
                {migrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Migrating...
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Start Migration
                  </>
                )}
              </Button>
            </div>

            {error && (
              <Card className="border-2 border-destructive bg-destructive/10">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-2 text-destructive">
                    <XCircle className="h-5 w-5" />
                    <span className="font-semibold">Error: {error}</span>
                  </div>
                </CardContent>
              </Card>
            )}

            {status && (
              <Card className="border-2 border-primary/20">
                <CardContent className="pt-6">
                  {status.success ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-success">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="font-semibold text-lg">{status.message}</span>
                      </div>
                      
                      {status.results && (
                        <div className="space-y-2">
                          <h4 className="font-semibold">Migration Results:</h4>
                          <div className="grid grid-cols-2 gap-4">
                            {Object.entries(status.results).map(([key, value]: [string, any]) => (
                              <div key={key} className="p-3 bg-secondary/50 rounded-lg">
                                <div className="font-medium capitalize">{key.replace('_', ' ')}</div>
                                <div className="text-sm text-muted-foreground">
                                  Migrated: {value.migrated || 0} / Total: {value.total || 0}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm">
                          ✅ Migration complete! Redirecting to home page...
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Migration Status:</h4>
                      {status.status && (
                        <div className="space-y-2">
                          <div>
                            <span className="font-medium">Supabase:</span> {status.status.supabase?.clients || 0} clients
                          </div>
                          <div>
                            <span className="font-medium">Firebase:</span> {status.status.firebase?.clients || 0} clients
                          </div>
                          {status.needsMigration && (
                            <div className="mt-4 p-3 bg-warning/10 border border-warning rounded-lg">
                              <p className="text-sm text-warning">
                                ⚠️ Migration needed! Click "Start Migration" to migrate your data.
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
              <h4 className="font-semibold mb-2">Instructions:</h4>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>Click "Check Status" to see current data counts</li>
                <li>Click "Start Migration" to migrate all data from Supabase to Firebase</li>
                <li>Wait for the migration to complete</li>
                <li>You'll be redirected to the home page automatically</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

