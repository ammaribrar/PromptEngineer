'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Client } from '@/lib/database.types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Save, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ClientDetailsTabProps {
  client: Client;
  onUpdate: (client: Client) => void;
}

export default function ClientDetailsTab({ client, onUpdate }: ClientDetailsTabProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [formData, setFormData] = useState(client);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleChange = (field: keyof Client, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to save changes');
      }

      const updated = await response.json();
      onUpdate(updated);

      toast({
        title: 'Changes saved',
        description: 'Client details have been updated successfully.',
      });
    } catch (error) {
      console.error('Failed to update client:', error);
      toast({
        title: 'Error',
        description: 'Failed to save changes. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        toast({
          title: 'Client deleted',
          description: `${client.name} has been deleted successfully.`,
        });
        router.push('/');
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
      setShowDeleteDialog(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-2xl">Basic Information</CardTitle>
          <CardDescription className="text-base">Core details about your client</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-base font-semibold">Client Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="Acme Corporation"
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="industry" className="text-base font-semibold">Industry</Label>
            <Input
              id="industry"
              value={formData.industry || ''}
              onChange={(e) => handleChange('industry', e.target.value)}
              placeholder="E-commerce, SaaS, Healthcare, etc."
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description" className="text-base font-semibold">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of what this client does..."
              rows={3}
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-2xl">Business Details</CardTitle>
          <CardDescription className="text-base">Products, services, and policies</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="products_or_services" className="text-base font-semibold">Products / Services</Label>
            <Textarea
              id="products_or_services"
              value={formData.products_or_services || ''}
              onChange={(e) => handleChange('products_or_services', e.target.value)}
              placeholder="Describe the products or services offered..."
              rows={4}
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="policies" className="text-base font-semibold">Policies</Label>
            <Textarea
              id="policies"
              value={formData.policies || ''}
              onChange={(e) => handleChange('policies', e.target.value)}
              placeholder="Refund policies, guarantees, SLAs, etc..."
              rows={4}
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="extra_context" className="text-base font-semibold">Extra Context</Label>
            <Textarea
              id="extra_context"
              value={formData.extra_context || ''}
              onChange={(e) => handleChange('extra_context', e.target.value)}
              placeholder="Special constraints, compliance requirements, legal considerations..."
              rows={3}
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-2xl">Tone & Style</CardTitle>
          <CardDescription className="text-base">Communication preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5 pt-6">
          <div className="space-y-2">
            <Label htmlFor="tone_of_voice" className="text-base font-semibold">Tone of Voice</Label>
            <Input
              id="tone_of_voice"
              value={formData.tone_of_voice || ''}
              onChange={(e) => handleChange('tone_of_voice', e.target.value)}
              placeholder="Friendly, professional, casual, formal, etc."
              className="border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b">
          <CardTitle className="text-2xl">Base System Prompt</CardTitle>
          <CardDescription className="text-base">
            The initial prompt you want to test and optimize. This will be used to generate responses in simulations.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Textarea
            id="base_system_prompt"
            value={formData.base_system_prompt || ''}
            onChange={(e) => handleChange('base_system_prompt', e.target.value)}
            placeholder="You are a helpful customer support agent for [Company]..."
            rows={12}
            className="font-mono text-sm border-2 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </CardContent>
      </Card>

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
        <Button
          onClick={() => setShowDeleteDialog(true)}
          variant="destructive"
          size="lg"
          className="gap-2 shadow-lg hover:shadow-xl transition-all"
        >
          <Trash2 className="h-5 w-5" />
          Delete Client
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={saving} 
          size="lg" 
          className="gap-2 gradient-primary hover:opacity-90 shadow-lg hover:shadow-xl transition-all"
        >
          <Save className="h-5 w-5" />
          {saving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="text-sm text-muted-foreground text-right italic">
        Last updated: {new Date(formData.updated_at).toLocaleString()}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <span className="font-semibold">{client.name}</span> and all associated data including scenarios, simulation runs, and final prompts. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
