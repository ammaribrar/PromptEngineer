'use client';

import { useState } from 'react';
import { FinalPromptSuggestion } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Sparkles, Copy, Check, Calendar, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface FinalPromptTabProps {
  clientId: string;
  finalPrompts: FinalPromptSuggestion[];
  onUpdate: () => void;
}

export default function FinalPromptTab({ clientId, finalPrompts, onUpdate }: FinalPromptTabProps) {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPrompts, setExpandedPrompts] = useState<Set<string>>(new Set());

  const latestPrompt = finalPrompts[0];

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const response = await fetch('/api/synthesize-prompt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        const errorMessage = errorData.error || `Failed to generate prompt (${response.status})`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      toast({
        title: 'Prompt generated',
        description: 'The optimized prompt has been generated successfully.',
      });

      // Wait a bit for the database to update, then refresh
      setTimeout(() => {
        onUpdate();
      }, 500);
    } catch (error) {
      console.error('Failed to generate prompt:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to generate prompt. Please ensure you have completed simulation runs and have a base system prompt configured.';
      
      toast({
        title: 'Error generating prompt',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = (promptText: string, promptId: string) => {
    navigator.clipboard.writeText(promptText).then(() => {
      setCopiedId(promptId);
      setTimeout(() => setCopiedId(null), 2000);
      toast({
        title: 'Copied to clipboard',
        description: 'Prompt has been copied to your clipboard.',
      });
    }).catch(() => {
      toast({
        title: 'Error',
        description: 'Failed to copy to clipboard.',
        variant: 'destructive',
      });
    });
  };

  const toggleExpand = (promptId: string) => {
    setExpandedPrompts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(promptId)) {
        newSet.delete(promptId);
      } else {
        newSet.add(promptId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-2xl">Final Optimized Prompt</CardTitle>
          <CardDescription className="text-base">
            Generate an improved system prompt based on all simulation results and feedback
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          {!latestPrompt ? (
            <div className="text-center py-16">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
                <div className="relative rounded-full bg-primary/10 p-6">
                  <Sparkles className="h-16 w-16 text-primary" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">No optimized prompt yet</h3>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto text-base leading-relaxed">
                Run simulations first, then generate an optimized prompt based on the results and feedback
              </p>
              <Button 
                onClick={handleGenerate} 
                disabled={generating} 
                size="lg" 
                className="gap-2 gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
              >
                <Sparkles className="h-5 w-5" />
                {generating ? 'Generating...' : 'Generate Final Prompt'}
              </Button>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-gradient-to-r from-primary/5 to-transparent rounded-xl border-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4 text-primary" />
                  <span className="font-medium">Generated {new Date(latestPrompt.created_at).toLocaleString()}</span>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => handleCopy(latestPrompt.combined_prompt, latestPrompt.id)} 
                    className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {copiedId === latestPrompt.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={handleGenerate} 
                    disabled={generating} 
                    className="gap-2 gradient-primary hover:opacity-90 shadow-lg transition-all"
                  >
                    <Sparkles className="h-5 w-5" />
                    Regenerate
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-lg text-foreground">Optimized System Prompt</h4>
                  <Button 
                    variant="outline" 
                    onClick={() => handleCopy(latestPrompt.combined_prompt, latestPrompt.id)} 
                    className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                  >
                    {copiedId === latestPrompt.id ? (
                      <>
                        <Check className="h-4 w-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" />
                        Copy Prompt
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={latestPrompt.combined_prompt}
                  readOnly
                  rows={16}
                  className="font-mono text-sm bg-secondary/30 border-2 focus:ring-2 focus:ring-primary/20 rounded-xl p-4"
                />
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6">
                <h4 className="font-bold text-lg text-primary mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Next Steps
                </h4>
                <ol className="text-sm text-foreground space-y-2 list-decimal list-inside leading-relaxed">
                  <li>Review the optimized prompt above</li>
                  <li>Test it in your environment or run new simulations</li>
                  <li>Copy the prompt using the button above</li>
                  <li>Paste it into your n8n workflow or AI agent configuration</li>
                  <li>Monitor real-world performance and iterate as needed</li>
                </ol>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {finalPrompts.length > 0 && (
        <Card className="border-2 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
            <div className="flex items-center gap-3">
              <History className="h-6 w-6 text-primary" />
              <div>
                <CardTitle className="text-2xl">Prompt History</CardTitle>
                <CardDescription className="text-base">
                  All generated prompts ({finalPrompts.length} version{finalPrompts.length !== 1 ? 's' : ''})
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {finalPrompts.map((prompt, idx) => {
                const versionNumber = finalPrompts.length - idx;
                const isCopied = copiedId === prompt.id;
                const isExpanded = expandedPrompts.has(prompt.id);
                const isLatest = idx === 0;
                
                return (
                  <Card 
                    key={prompt.id} 
                    className={`border-2 transition-all duration-300 ${
                      isLatest 
                        ? 'bg-gradient-to-r from-primary/10 to-primary/5 border-primary/50 shadow-md' 
                        : 'bg-secondary/30 hover:border-primary/50'
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between flex-wrap gap-3">
                        <div className="flex items-center gap-3">
                          <div className={`px-3 py-1 rounded-lg font-bold text-sm ${
                            isLatest 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-secondary text-foreground'
                          }`}>
                            {isLatest ? 'Latest' : `Version ${versionNumber}`}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span className="font-medium">
                              {new Date(prompt.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCopy(prompt.combined_prompt, prompt.id)}
                            className="gap-2 border-2 hover:bg-primary hover:text-primary-foreground transition-all"
                          >
                            {isCopied ? (
                              <>
                                <Check className="h-4 w-4" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-4 w-4" />
                                Copy Prompt
                              </>
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleExpand(prompt.id)}
                            className="gap-2"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp className="h-4 w-4" />
                                Collapse
                              </>
                            ) : (
                              <>
                                <ChevronDown className="h-4 w-4" />
                                Expand
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-2 mb-3 text-xs text-muted-foreground">
                        <span className="font-medium">
                          {prompt.combined_prompt.split(/\s+/).length} words
                        </span>
                        {prompt.combined_prompt.length > 0 && (
                          <span>• {prompt.combined_prompt.length} characters</span>
                        )}
                      </div>
                      {isExpanded ? (
                        <div className="space-y-3">
                          <div className="space-y-2">
                            <h5 className="font-semibold text-sm text-foreground">Full Prompt:</h5>
                            <Textarea
                              value={prompt.combined_prompt}
                              readOnly
                              rows={12}
                              className="font-mono text-xs bg-background/50 border-2 rounded-lg p-3"
                            />
                          </div>
                          {prompt.rationale && (
                            <div className="space-y-2 pt-3 border-t">
                              <h5 className="font-semibold text-sm text-foreground">Rationale:</h5>
                              <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                {prompt.rationale}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed font-mono">
                            {prompt.combined_prompt}
                          </p>
                          <Button
                            variant="link"
                            size="sm"
                            onClick={() => toggleExpand(prompt.id)}
                            className="text-primary p-0 h-auto"
                          >
                            View full prompt...
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
