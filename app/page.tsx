'use client';

import { useEffect, useState } from 'react';
import { Client } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Sparkles, TrendingUp, MoreVertical, Trash2, FileText, Play, Database, LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, COLLECTIONS, docToData } from '@/lib/firebase';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AuthGuard } from '@/components/AuthGuard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface ClientWithStats extends Client {
  scenarioCount?: number;
  simulationCount?: number;
}

export default function Home() {
  const [clients, setClients] = useState<ClientWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteClientId, setDeleteClientId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const { user, logout } = useAuth();

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      console.log('[DEBUG] Fetching clients from Firebase...');
      const clientsRef = collection(db, COLLECTIONS.CLIENTS);
      const q = query(clientsRef, orderBy('created_at', 'desc'));
      const snapshot = await getDocs(q);
      const clientsData = snapshot.docs.map(doc => docToData(doc));

      console.log('[DEBUG] Clients response:', { data: clientsData });

      if (!clientsData || clientsData.length === 0) {
        console.log('[DEBUG] No clients found');
        setClients([]);
        return;
      }

      console.log(`[DEBUG] Fetching stats for ${clientsData.length} clients`);

      const clientsWithStats: ClientWithStats[] = await Promise.all(
        (clientsData || []).map(async (client: Client) => {
          const [scenariosSnapshot, simulationsSnapshot] = await Promise.all([
            getDocs(query(collection(db, COLLECTIONS.SCENARIOS), where('client_id', '==', client.id))),
            getDocs(query(collection(db, COLLECTIONS.SIMULATION_RUNS), where('client_id', '==', client.id)))
          ]);

          return {
            ...client,
            scenarioCount: scenariosSnapshot.size || 0,
            simulationCount: simulationsSnapshot.size || 0
          } as ClientWithStats;
        })
      );

      console.log('[DEBUG] Final clients with stats:', clientsWithStats);
      setClients(clientsWithStats);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      setClients([]);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    setNewClientName('');
    setShowCreateDialog(true);
  };

  const createNewClient = async () => {
    if (!newClientName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a client name.',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newClientName.trim() }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      
      const newClient = await response.json();
      setShowCreateDialog(false);
      setNewClientName('');
      
      toast({
        title: 'Client created',
        description: `${newClientName.trim()} has been created successfully.`,
      });
      
      router.push(`/client/${newClient.id}`);
    } catch (error) {
      console.error('Failed to create client:', error);
      toast({
        title: 'Error',
        description: 'Failed to create client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteClient = async () => {
    if (!deleteClientId) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/clients/${deleteClientId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        const clientName = clients.find(c => c.id === deleteClientId)?.name || 'Client';
        await fetchClients();
        toast({
          title: 'Client deleted',
          description: `${clientName} has been deleted successfully.`,
        });
      } else {
        console.error('Failed to delete client');
        toast({
          title: 'Error',
          description: 'Failed to delete client. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Failed to delete client:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete client. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeleting(false);
      setDeleteClientId(null);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out',
        description: 'You have been logged out successfully.',
      });
      router.push('/login');
    } catch (error) {
      console.error('Failed to logout:', error);
      toast({
        title: 'Error',
        description: 'Failed to logout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
            <Sparkles className="h-6 w-6 text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Loading your clients...</p>
        </div>
      </div>
    );
  }


  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        {/* Hero Header */}
        <div className="relative border-b bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-sm">
          <div className="absolute inset-0 gradient-mesh opacity-50"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="space-y-2 animate-fade-in">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full"></div>
                    <Sparkles className="h-10 w-10 text-primary relative z-10" />
                  </div>
                  <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                    Prompt Testing Suite
                  </h1>
                </div>
                <p className="text-lg text-muted-foreground max-w-2xl">
                  Systematically test and optimize your AI prompts across scenarios with intelligent simulation and analysis
                </p>
              </div>
              <div className="flex items-center gap-3">
                {user && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span>{user.email}</span>
                  </div>
                )}
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  size="lg"
                  className="gap-2 border-2"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </Button>
                <Button 
                  onClick={openCreateDialog} 
                  size="lg" 
                  className="gap-2 gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 animate-scale-in"
                >
                  <Plus className="h-5 w-5" />
                  New Client
                </Button>
              </div>
            </div>
          </div>
        </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="space-y-8">
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Your Clients</h2>
                <p className="text-muted-foreground mt-1">
                  {clients.length === 0 
                    ? 'Get started by creating your first client' 
                    : `${clients.length} client${clients.length !== 1 ? 's' : ''} in your workspace`}
                </p>
              </div>
            </div>
          </div>
          <div className="animate-slide-up">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {clients.length === 0 ? (
                <Card className="p-12 md:p-16 text-center border-2 border-dashed hover:border-primary/50 transition-all duration-300 animate-scale-in col-span-full">
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="relative inline-block mb-6">
                      <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                      <div className="relative rounded-full bg-primary/10 p-6">
                        <Sparkles className="h-12 w-12 text-primary" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold text-foreground">No clients found</h3>
                      <p className="text-muted-foreground">
                        If you had clients in Supabase, you need to migrate them to Firebase first.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link href="/migrate">
                        <Button 
                          size="lg"
                          className="gap-2 gradient-primary hover:opacity-90 shadow-lg w-full sm:w-auto"
                        >
                          <Database className="h-5 w-5" />
                          Migrate Data from Supabase
                        </Button>
                      </Link>
                      <Button 
                        onClick={openCreateDialog} 
                        size="lg"
                        variant="outline"
                        className="gap-2 border-2 w-full sm:w-auto"
                      >
                        <Plus className="h-5 w-5" />
                        Create New Client
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : (
                clients.map((client, index) => (
                <Card 
                  key={client.id} 
                  className="group relative overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 h-full border-2 hover:border-primary/50 animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/5 group-hover:to-primary/10 transition-all duration-300 pointer-events-none"></div>
                  
                  <CardHeader className="pb-3 relative z-10">
                    <div className="flex items-start justify-between mb-2">
                      <div className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-3 group-hover:from-primary/20 group-hover:to-primary/10 transition-all duration-300 shadow-sm">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-destructive/10">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteClientId(client.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <Link href={`/client/${client.id}`}>
                      <CardTitle className="text-xl font-bold group-hover:text-primary transition-colors cursor-pointer mb-1">
                        {client.name}
                      </CardTitle>
                      {client.industry && (
                        <CardDescription className="line-clamp-1 font-medium">
                          {client.industry}
                        </CardDescription>
                      )}
                    </Link>
                  </CardHeader>
                  <Link href={`/client/${client.id}`}>
                    <CardContent className="space-y-4 cursor-pointer relative z-10">
                      {client.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
                          {client.description}
                        </p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground pt-3 border-t">
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                          <FileText className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium">{client.scenarioCount || 0} scenarios</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50">
                          <Play className="h-3.5 w-3.5 text-primary" />
                          <span className="font-medium">{client.simulationCount || 0} runs</span>
                        </div>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Created {new Date(client.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>
                    </CardContent>
                  </Link>
                </Card>
                ))
              )}
            </div>
          </div>
        </div>

        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="border-2 shadow-2xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl">Create New Client</DialogTitle>
              <DialogDescription className="text-base">
                Enter a name for your new client. You can add more details after creation.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="client-name" className="text-base font-semibold">Client Name</Label>
                <Input
                  id="client-name"
                  placeholder="e.g., Acme Corporation"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newClientName.trim()) {
                      createNewClient();
                    }
                  }}
                  autoFocus
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
            </div>
            <DialogFooter className="gap-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={() => setShowCreateDialog(false)}
                disabled={creating}
                className="border-2"
              >
                Cancel
              </Button>
              <Button
                onClick={createNewClient}
                disabled={!newClientName.trim() || creating}
                className="gradient-primary hover:opacity-90 shadow-lg transition-all"
              >
                {creating ? 'Creating...' : 'Create Client'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <AlertDialog open={deleteClientId !== null} onOpenChange={(open) => !open && setDeleteClientId(null)}>
          <AlertDialogContent className="border-2 shadow-2xl">
            <AlertDialogHeader className="border-b pb-4">
              <AlertDialogTitle className="text-2xl">Are you sure?</AlertDialogTitle>
              <AlertDialogDescription className="text-base leading-relaxed">
                This will permanently delete <span className="font-bold text-destructive">{clients.find(c => c.id === deleteClientId)?.name}</span> and all associated data including scenarios, simulation runs, and final prompts. This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-3 pt-4">
              <AlertDialogCancel disabled={deleting} className="border-2">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteClient}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-lg transition-all"
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
    </AuthGuard>
  );
}
