'use client';

import { useState } from 'react';
import { Scenario } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, MessageSquare, User, Target, Hash } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ScenariosTabProps {
  clientId: string;
  scenarios: Scenario[];
  onUpdate: () => void;
}

const SCENARIO_TYPES = [
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'reach_back', label: 'Reach Back' },
  { value: 'polite_ending', label: 'Polite Ending' },
  { value: 'furious', label: 'Furious Customer' },
  { value: 'confused', label: 'Confused Customer' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'refund', label: 'Refund Request' },
  { value: 'complaint', label: 'Complaint' },
  { value: 'inquiry', label: 'General Inquiry' },
  { value: 'general', label: 'General' },
];

const TYPE_COLORS: Record<string, string> = {
  'follow_up': 'bg-blue-100 text-blue-700 border-blue-200',
  'reach_back': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'polite_ending': 'bg-green-100 text-green-700 border-green-200',
  'furious': 'bg-red-100 text-red-700 border-red-200',
  'confused': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'technical': 'bg-purple-100 text-purple-700 border-purple-200',
  'refund': 'bg-orange-100 text-orange-700 border-orange-200',
  'complaint': 'bg-pink-100 text-pink-700 border-pink-200',
  'inquiry': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  'general': 'bg-gray-100 text-gray-700 border-gray-200',
};

export default function ScenariosTab({ clientId, scenarios, onUpdate }: ScenariosTabProps) {
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingScenario, setEditingScenario] = useState<Scenario | null>(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'general',
    description: '',
    customer_persona: '',
    goal: '',
    message_count: 8,
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'general',
      description: '',
      customer_persona: '',
      goal: '',
      message_count: 8,
      is_active: true,
    });
    setEditingScenario(null);
  };

  const handleEdit = (scenario: Scenario) => {
    setEditingScenario(scenario);
    setFormData({
      name: scenario.name,
      type: scenario.type,
      description: scenario.description,
      customer_persona: scenario.customer_persona,
      goal: scenario.goal,
      message_count: scenario.message_count,
      is_active: scenario.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a scenario name.',
        variant: 'destructive',
      });
      return;
    }

    setSaving(true);
    try {
      let response;
      if (editingScenario) {
        response = await fetch(`/api/scenarios/${editingScenario.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch('/api/scenarios', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...formData, client_id: clientId }),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save scenario');
      }

      toast({
        title: 'Success',
        description: `Scenario ${editingScenario ? 'updated' : 'created'} successfully.`,
      });

      setDialogOpen(false);
      resetForm();
      onUpdate();
    } catch (error) {
      console.error('Failed to save scenario:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save scenario. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this scenario?')) return;

    try {
      const response = await fetch(`/api/scenarios/${id}`, { method: 'DELETE' });
      if (response.ok) {
        const scenarioName = scenarios.find(s => s.id === id)?.name || 'Scenario';
        toast({
          title: 'Scenario deleted',
          description: `${scenarioName} has been deleted successfully.`,
        });
        onUpdate();
      } else {
        throw new Error('Failed to delete scenario');
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete scenario. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (scenario: Scenario) => {
    try {
      const response = await fetch(`/api/scenarios/${scenario.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...scenario, is_active: !scenario.is_active }),
      });
      if (response.ok) {
        toast({
          title: 'Scenario updated',
          description: `${scenario.name} has been ${!scenario.is_active ? 'activated' : 'deactivated'}.`,
        });
        onUpdate();
      } else {
        throw new Error('Failed to update scenario');
      }
    } catch (error) {
      console.error('Failed to toggle scenario:', error);
      toast({
        title: 'Error',
        description: 'Failed to update scenario. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const scenariosArray = Array.isArray(scenarios) ? scenarios : [];
  const activeScenarios = scenariosArray.filter(s => s.is_active);
  const inactiveScenarios = scenariosArray.filter(s => !s.is_active);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Test Scenarios</h2>
          <p className="text-muted-foreground mt-1 text-base">
            {scenariosArray.length} scenario{scenariosArray.length !== 1 ? 's' : ''} defined
            {activeScenarios.length > 0 && ` (${activeScenarios.length} active)`}
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          setDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2 gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all">
              <Plus className="h-5 w-5" />
              Add Scenario
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2 shadow-2xl">
            <DialogHeader className="border-b pb-4">
              <DialogTitle className="text-2xl">{editingScenario ? 'Edit Scenario' : 'Add New Scenario'}</DialogTitle>
              <DialogDescription className="text-base">
                Define a customer scenario to test how your agent handles different situations
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-5 py-4">
              <div className="space-y-2">
                <Label htmlFor="scenario-name" className="text-base font-semibold">Scenario Name</Label>
                <Input
                  id="scenario-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Angry customer requesting refund"
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-type" className="text-base font-semibold">Type</Label>
                <Input
                  id="scenario-type"
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="e.g., follow_up, furious, technical, refund"
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  Enter a custom type or use common types like: follow_up, reach_back, polite_ending, furious, confused, technical, refund, complaint, inquiry, general
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-description" className="text-base font-semibold">Description</Label>
                <Textarea
                  id="scenario-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what's happening in this scenario..."
                  rows={3}
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-persona" className="text-base font-semibold">Customer Persona</Label>
                <Textarea
                  id="scenario-persona"
                  value={formData.customer_persona}
                  onChange={(e) => setFormData({ ...formData, customer_persona: e.target.value })}
                  placeholder="Age, mood, knowledge level, communication style..."
                  rows={3}
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-goal" className="text-base font-semibold">Goal</Label>
                <Textarea
                  id="scenario-goal"
                  value={formData.goal}
                  onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  placeholder="What should the agent achieve? (e.g., calm the customer, close sale, resolve issue)"
                  rows={2}
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message-count" className="text-base font-semibold">Message Count</Label>
                <Input
                  id="message-count"
                  type="number"
                  min={2}
                  max={20}
                  value={formData.message_count}
                  onChange={(e) => setFormData({ ...formData, message_count: parseInt(e.target.value) || 8 })}
                  className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                />
                <p className="text-xs text-muted-foreground mt-1">Total number of conversation turns (2-20)</p>
              </div>
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-lg border-2">
                <Label htmlFor="is-active" className="text-base font-semibold">Active</Label>
                <Switch
                  id="is-active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)} 
                disabled={saving}
                className="border-2"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSave} 
                disabled={saving || !formData.name.trim()}
                className="gradient-primary hover:opacity-90 shadow-lg transition-all"
              >
                {saving ? 'Saving...' : editingScenario ? 'Update Scenario' : 'Create Scenario'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {scenariosArray.length === 0 ? (
        <Card className="border-2 border-dashed hover:border-primary/50 transition-all duration-300 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
              <div className="relative rounded-full bg-primary/10 p-6">
                <MessageSquare className="h-12 w-12 text-primary" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No scenarios yet</h3>
            <p className="text-muted-foreground mb-6 text-center max-w-md text-base">
              Create test scenarios to simulate different customer interactions
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {activeScenarios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                Active Scenarios
              </h3>
              <div className="grid gap-4">
                {activeScenarios.map((scenario) => (
                  <Card key={scenario.id} className="hover:shadow-xl transition-all duration-300 border-l-4 border-l-primary hover:-translate-y-1 group">
                    <CardHeader className="pb-3 bg-gradient-to-r from-primary/5 to-transparent">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors">{scenario.name}</CardTitle>
                            <Badge className={`${TYPE_COLORS[scenario.type] || TYPE_COLORS.general} border-2 text-xs font-semibold shadow-sm`}>
                              {SCENARIO_TYPES.find(t => t.value === scenario.type)?.label || scenario.type}
                            </Badge>
                          </div>
                          {scenario.description && (
                            <CardDescription className="text-sm leading-relaxed">{scenario.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleActive(scenario)}
                          >
                            <Switch checked={scenario.is_active} className="pointer-events-none" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(scenario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(scenario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <User className="h-3.5 w-3.5" />
                            <span className="font-medium">Persona</span>
                          </div>
                          <p className="text-foreground line-clamp-2">
                            {scenario.customer_persona || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Target className="h-3.5 w-3.5" />
                            <span className="font-medium">Goal</span>
                          </div>
                          <p className="text-foreground line-clamp-2">
                            {scenario.goal || 'Not specified'}
                          </p>
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-muted-foreground">
                            <Hash className="h-3.5 w-3.5" />
                            <span className="font-medium">Turns</span>
                          </div>
                          <p className="text-foreground">{scenario.message_count} messages</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {inactiveScenarios.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                Inactive Scenarios
              </h3>
              <div className="grid gap-4">
                {inactiveScenarios.map((scenario) => (
                  <Card key={scenario.id} className="opacity-60 hover:opacity-100 transition-all duration-300 hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-base font-semibold">{scenario.name}</CardTitle>
                            <Badge variant="outline" className="text-xs">
                              Inactive
                            </Badge>
                          </div>
                          {scenario.description && (
                            <CardDescription className="text-sm">{scenario.description}</CardDescription>
                          )}
                        </div>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleToggleActive(scenario)}
                          >
                            <Switch checked={scenario.is_active} className="pointer-events-none" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => handleEdit(scenario)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                            onClick={() => handleDelete(scenario.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
