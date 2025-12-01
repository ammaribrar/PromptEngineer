'use client';

import { useState, useEffect, useRef } from 'react';
import { Client, Scenario, SimulationRun } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Play, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface LiveTestTabProps {
  client: Client;
  scenarios: Scenario[];
  runs: SimulationRun[];
  onUpdate: () => void;
}

export default function LiveTestTab({ client, scenarios, runs, onUpdate }: LiveTestTabProps) {
  const { toast } = useToast();
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState<{ [key: string]: string }>({});
  const [viewingRun, setViewingRun] = useState<SimulationRun | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  const scenariosArray = Array.isArray(scenarios) ? scenarios : [];
  const runsArray = Array.isArray(runs) ? runs : [];
  const activeScenarios = scenariosArray.filter(s => s.is_active);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedScenarios(activeScenarios.map(s => s.id));
    } else {
      setSelectedScenarios([]);
    }
  };

  const handleToggleScenario = (scenarioId: string) => {
    if (selectedScenarios.includes(scenarioId)) {
      setSelectedScenarios(selectedScenarios.filter(id => id !== scenarioId));
    } else {
      setSelectedScenarios([...selectedScenarios, scenarioId]);
    }
  };

  const handleRunTest = async () => {
    if (selectedScenarios.length === 0) {
      toast({
        title: 'No scenarios selected',
        description: 'Please select at least one scenario to test.',
        variant: 'destructive',
      });
      return;
    }

    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }

    setRunning(true);
    const initialProgress: { [key: string]: string } = {};
    selectedScenarios.forEach(id => {
      initialProgress[id] = 'pending';
    });
    setProgress(initialProgress);

    const runStartTime = Date.now() - 5000;

    pollIntervalRef.current = setInterval(async () => {
      try {
        const response = await fetch(`/api/simulation-runs?client_id=${client.id}`);
        const latestRuns = await response.json();
        const runsArray = Array.isArray(latestRuns) ? latestRuns : [];

        const updatedProgress: { [key: string]: string } = {};

        selectedScenarios.forEach(scenarioId => {
          const relevantRuns = runsArray
            .filter((r: SimulationRun) =>
              r.scenario_id === scenarioId &&
              new Date(r.created_at).getTime() >= runStartTime
            )
            .sort((a: SimulationRun, b: SimulationRun) =>
              new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );

          const latestRun = relevantRuns[0];

          if (latestRun) {
            if (latestRun.status === 'completed') {
              updatedProgress[scenarioId] = 'completed';
            } else if (latestRun.status === 'running') {
              updatedProgress[scenarioId] = 'running';
            } else {
              updatedProgress[scenarioId] = 'pending';
            }
          } else {
            updatedProgress[scenarioId] = 'pending';
          }
        });

        setProgress(updatedProgress);

        const allCompleted = Object.values(updatedProgress).every(s => s === 'completed');
        if (allCompleted) {
          if (pollIntervalRef.current) {
            clearInterval(pollIntervalRef.current);
            pollIntervalRef.current = null;
          }
          setRunning(false);
          onUpdate();
          toast({
            title: 'Test completed',
            description: `All ${totalSelected} scenario${totalSelected !== 1 ? 's' : ''} have been tested successfully.`,
          });
        }
      } catch (error) {
        console.error('Failed to poll simulation status:', error);
      }
    }, 1500);

    try {
      toast({
        title: 'Starting test',
        description: `Running test for ${selectedScenarios.length} scenario${selectedScenarios.length !== 1 ? 's' : ''}...`,
      });
      
      fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: client.id,
          scenarioIds: selectedScenarios,
        }),
      }).then(() => {
        setTimeout(() => onUpdate(), 1000);
      }).catch(error => {
        console.error('Failed to run simulation:', error);
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        setRunning(false);
        toast({
          title: 'Error',
          description: 'Failed to start simulation. Please try again.',
          variant: 'destructive',
        });
      });
    } catch (error) {
      console.error('Failed to run simulation:', error);
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
      setRunning(false);
      toast({
        title: 'Error',
        description: 'Failed to start simulation. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const getLatestRunForScenario = (scenarioId: string): SimulationRun | undefined => {
    return runsArray
      .filter(r => r.scenario_id === scenarioId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0];
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const completedCount = Object.values(progress).filter(s => s === 'completed').length;
  const runningCount = Object.values(progress).filter(s => s === 'running').length;
  const totalSelected = selectedScenarios.length;
  const progressPercent = totalSelected > 0 ? (completedCount / totalSelected) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b static">
          <CardTitle className="text-2xl">Live Prompt Test</CardTitle>
          <CardDescription className="text-base">
            Select scenarios to test your base system prompt. The AI will simulate conversations and evaluate performance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {activeScenarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="relative inline-block mb-4">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative rounded-full bg-primary/10 p-4">
                  <Play className="h-8 w-8 text-primary" />
                </div>
              </div>
              <p className="text-muted-foreground text-base">No active scenarios available. Please create and activate scenarios first.</p>
            </div>
          ) : (
            <>
              <div className="space-y-3">
                <div className="flex items-center gap-3 pb-3 border-b-2 bg-secondary/30 p-3 rounded-lg">
                  <Checkbox
                    checked={selectedScenarios.length === activeScenarios.length}
                    onCheckedChange={handleSelectAll}
                    className="border-2"
                  />
                  <span className="font-semibold text-base">Select All ({activeScenarios.length} scenarios)</span>
                </div>
                {activeScenarios.map((scenario) => {
                  const latestRun = getLatestRunForScenario(scenario.id);
                  const isSelected = selectedScenarios.includes(scenario.id);
                  const scenarioProgress = progress[scenario.id];

                  return (
                    <div key={scenario.id} className="flex items-center justify-between p-4 border-2 rounded-xl hover:border-primary/50 hover:shadow-md transition-all duration-300 group">
                      <div className="flex items-center gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleToggleScenario(scenario.id)}
                          disabled={running}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{scenario.name}</div>
                          <div className="text-sm text-slate-600">{scenario.type}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        {isSelected && running && (
                          <>
                            {scenarioProgress === 'pending' && (
                              <Badge variant="outline" className="gap-1.5 text-muted-foreground border-2 px-3 py-1">
                                <Clock className="h-3.5 w-3.5" />
                                Pending...
                              </Badge>
                            )}
                            {scenarioProgress === 'running' && (
                              <Badge variant="outline" className="gap-1.5 text-primary border-primary border-2 px-3 py-1 shadow-sm">
                                <Clock className="h-3.5 w-3.5 animate-spin" />
                                Running...
                              </Badge>
                            )}
                            {scenarioProgress === 'completed' && (
                              <Badge className="gap-1.5 bg-success text-success-foreground border-2 px-3 py-1 shadow-sm">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Completed
                              </Badge>
                            )}
                          </>
                        )}
                        {(!isSelected || !running) && latestRun && (
                          <div className="text-base">
                            <span className={`font-bold text-lg ${getScoreColor(latestRun.score)}`}>
                              {latestRun.score}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {running && (
                <div className="space-y-3 p-4 bg-primary/5 rounded-xl border-2 border-primary/20">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">
                      {runningCount > 0 ? 'Running simulations...' : 'Preparing simulations...'}
                    </span>
                    <span className="text-primary font-bold">{completedCount} / {totalSelected} completed</span>
                  </div>
                  <Progress value={progressPercent} className="h-3 shadow-inner" />
                </div>
              )}

              <Button
                onClick={handleRunTest}
                disabled={selectedScenarios.length === 0 || running}
                size="lg"
                className="w-full gap-2 gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
              >
                <Play className="h-5 w-5" />
                {running ? 'Running Test...' : `Run Live Test (${selectedScenarios.length} scenario${selectedScenarios.length !== 1 ? 's' : ''})`}
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      {runsArray.length > 0 && (
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b static">
            <CardTitle className="text-2xl">Scenario Results</CardTitle>
            <CardDescription className="text-base">View detailed results from completed simulations</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {scenariosArray.map((scenario) => {
                const latestRun = getLatestRunForScenario(scenario.id);
                if (!latestRun || latestRun.status !== 'completed') return null;

                return (
                  <Card key={scenario.id} className="cursor-pointer hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 hover:border-primary/50 group" onClick={() => setViewingRun(latestRun)}>
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3 flex-wrap">
                            <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{scenario.name}</h4>
                            <Badge variant="outline" className="border-2 font-semibold">{scenario.type}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3 leading-relaxed line-clamp-2">{latestRun.evaluation_summary}</p>
                          <div className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Tested {new Date(latestRun.created_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-3">
                          <div className={`text-4xl font-bold ${getScoreColor(latestRun.score)}`}>
                            {latestRun.score}%
                          </div>
                          <Button variant="outline" size="sm" className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all">
                            <MessageSquare className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <Dialog open={!!viewingRun} onOpenChange={(open) => !open && setViewingRun(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2 shadow-2xl">
          {viewingRun && (
            <>
              <DialogHeader className="border-b pb-4">
                <DialogTitle className="text-2xl">
                  {scenariosArray.find(s => s.id === viewingRun.scenario_id)?.name}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-6 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-2">
                  <div>
                    <div className="text-sm text-muted-foreground mb-1 font-semibold">Score</div>
                    <div className={`text-4xl font-bold ${getScoreColor(viewingRun.score)}`}>
                      {viewingRun.score}%
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground mb-1 font-semibold">Summary</div>
                    <p className="text-base leading-relaxed">{viewingRun.evaluation_summary}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Conversation Transcript</h4>
                  <div className="space-y-3 bg-secondary/30 p-4 rounded-xl border-2 max-h-96 overflow-y-auto">
                    {viewingRun.conversation.map((msg, idx) => (
                      <div key={idx} className={`p-4 rounded-lg border-2 ${msg.role === 'customer' ? 'bg-blue-50 border-blue-200' : 'bg-card border'}`}>
                        <div className="text-xs font-bold text-muted-foreground mb-2 uppercase tracking-wide">
                          {msg.role === 'customer' ? 'CUSTOMER' : 'AGENT'} - Turn {msg.turn}
                        </div>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Detailed Feedback</h4>
                  <Card className="border-2">
                    <CardContent className="pt-6">
                      <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{viewingRun.detailed_feedback}</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-bold text-lg mb-3">Prompt Improvement Suggestions</h4>
                  <Card className="border-2">
                    <CardContent className="pt-6">
                      <ul className="space-y-3">
                        {viewingRun.prompt_improvement_suggestions.map((suggestion, idx) => (
                          <li key={idx} className="text-sm text-foreground flex gap-3 items-start">
                            <span className="text-primary font-bold text-lg mt-0.5">•</span>
                            <span className="leading-relaxed">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
