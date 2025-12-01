'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Client, Scenario, SimulationRun, FinalPromptSuggestion } from '@/lib/database.types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import ClientDetailsTab from '@/components/client/ClientDetailsTab';
import ScenariosTab from '@/components/client/ScenariosTab';
import LiveTestTab from '@/components/client/LiveTestTab';
import FinalPromptTab from '@/components/client/FinalPromptTab';
import { AuthGuard } from '@/components/AuthGuard';

export default function ClientPage() {
  const params = useParams();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [runs, setRuns] = useState<SimulationRun[]>([]);
  const [finalPrompts, setFinalPrompts] = useState<FinalPromptSuggestion[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchClientData();
    }
  }, [params.id]);

  const fetchClientData = async () => {
    try {
      const [clientRes, scenariosRes, runsRes, promptsRes] = await Promise.all([
        fetch(`/api/clients/${params.id}`),
        fetch(`/api/scenarios?client_id=${params.id}`),
        fetch(`/api/simulation-runs?client_id=${params.id}`),
        fetch(`/api/final-prompts?client_id=${params.id}`),
      ]);

      // Check if client fetch was successful
      if (!clientRes.ok) {
        const errorData = await clientRes.json().catch(() => ({ error: 'Failed to fetch client' }));
        console.error('Failed to fetch client:', errorData);
        setClient(null);
        setScenarios([]);
        setRuns([]);
        setFinalPrompts([]);
        setLoading(false);
        return;
      }

      const [clientData, scenariosData, runsData, promptsData] = await Promise.all([
        clientRes.json(),
        scenariosRes.json().catch(() => []),
        runsRes.json().catch(() => []),
        promptsRes.json().catch(() => []),
      ]);

      // Check if clientData has an error
      if (clientData.error) {
        console.error('Client fetch error:', clientData.error);
        setClient(null);
      } else {
        setClient(clientData);
      }

      setScenarios(Array.isArray(scenariosData) ? scenariosData : []);
      setRuns(Array.isArray(runsData) ? runsData : []);
      setFinalPrompts(Array.isArray(promptsData) ? promptsData : []);
    } catch (error) {
      console.error('Failed to fetch client data:', error);
      setClient(null);
      setScenarios([]);
      setRuns([]);
      setFinalPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdate = (updatedClient: Client) => {
    setClient(updatedClient);
  };

  const handleScenariosUpdate = () => {
    fetchClientData();
  };

  const handleRunsUpdate = () => {
    fetchClientData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="text-muted-foreground font-medium">Loading client data...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <p className="text-muted-foreground text-lg">Client not found</p>
          <Link href="/">
            <Button variant="outline" className="mt-4 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <AuthGuard>
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Enhanced Header */}
      <div className="relative border-b bg-gradient-to-r from-card via-card to-primary/5 backdrop-blur-sm sticky top-0 z-10 shadow-sm">
        <div className="absolute inset-0 gradient-mesh opacity-30"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2 -ml-2 mb-4 hover:bg-primary/10 transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Clients
            </Button>
          </Link>
          <div className="space-y-2">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              {client.name}
            </h1>
            {client.industry && (
              <p className="text-muted-foreground text-lg font-medium">{client.industry}</p>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="details" className="space-y-6">
          <TabsList className="bg-card border-2 p-1.5 rounded-xl shadow-sm">
            <TabsTrigger 
              value="details" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 px-6"
            >
              Client Details
            </TabsTrigger>
            <TabsTrigger 
              value="scenarios" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 px-6 relative"
            >
              Scenarios
              {scenarios.length > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-primary/10 data-[state=active]:bg-primary-foreground/20 rounded-full font-semibold">
                  {scenarios.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger 
              value="test" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 px-6"
            >
              Live Test
            </TabsTrigger>
            <TabsTrigger 
              value="final-prompt" 
              className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md rounded-lg transition-all duration-200 px-6"
            >
              Final Prompt
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="mt-6">
            <ClientDetailsTab client={client} onUpdate={handleClientUpdate} />
          </TabsContent>

          <TabsContent value="scenarios" className="mt-6">
            <ScenariosTab
              clientId={client.id}
              scenarios={scenarios}
              onUpdate={handleScenariosUpdate}
            />
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <LiveTestTab
              client={client}
              scenarios={scenarios}
              runs={runs}
              onUpdate={handleRunsUpdate}
            />
          </TabsContent>

          <TabsContent value="final-prompt" className="mt-6">
            <FinalPromptTab
              clientId={client.id}
              finalPrompts={finalPrompts}
              onUpdate={handleRunsUpdate}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </AuthGuard>
  );
}
