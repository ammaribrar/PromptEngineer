import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { doc, setDoc, getDoc, collection, getDocs, Timestamp } from 'firebase/firestore';

// Supabase configuration (using your existing credentials)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://yboaekytjuggorfqnrrp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlib2Fla3l0anVnZ29yZnFucnJwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzMjU1MjYsImV4cCI6MjA3OTkwMTUyNn0.T6Dm5ISKz2zv4D26kUt8zDu4Xzn2hVf0Xu-Jwtctt0g';

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to convert ISO string to Firestore Timestamp
function convertToTimestamp(isoString: string | null | undefined): Timestamp {
  if (!isoString) return Timestamp.now();
  try {
    return Timestamp.fromDate(new Date(isoString));
  } catch {
    return Timestamp.now();
  }
}

export async function POST(request: NextRequest) {
  try {
    const { collectionName } = await request.json().catch(() => ({}));
    
    const results: any = {};

    // Migrate Clients
    if (!collectionName || collectionName === 'clients') {
      console.log('📦 Migrating clients...');
      const { data: clients, error } = await supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let migrated = 0;
      for (const client of clients || []) {
        const clientRef = doc(db, COLLECTIONS.CLIENTS, client.id);
        const existing = await getDoc(clientRef);
        
        if (!existing.exists()) {
          await setDoc(clientRef, {
            name: client.name,
            industry: client.industry || '',
            description: client.description || '',
            tone_of_voice: client.tone_of_voice || '',
            products_or_services: client.products_or_services || '',
            policies: client.policies || '',
            extra_context: client.extra_context || '',
            base_system_prompt: client.base_system_prompt || '',
            created_at: convertToTimestamp(client.created_at),
            updated_at: convertToTimestamp(client.updated_at),
          });
          migrated++;
        }
      }
      results.clients = { total: clients?.length || 0, migrated };
      console.log(`✅ Migrated ${migrated} clients`);
    }

    // Migrate Scenarios
    if (!collectionName || collectionName === 'scenarios') {
      console.log('📦 Migrating scenarios...');
      const { data: scenarios, error } = await supabase
        .from('scenarios')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let migrated = 0;
      for (const scenario of scenarios || []) {
        const scenarioRef = doc(db, COLLECTIONS.SCENARIOS, scenario.id);
        const existing = await getDoc(scenarioRef);
        
        if (!existing.exists()) {
          await setDoc(scenarioRef, {
            client_id: scenario.client_id,
            name: scenario.name,
            type: scenario.type || 'general',
            description: scenario.description || '',
            customer_persona: scenario.customer_persona || '',
            goal: scenario.goal || '',
            message_count: scenario.message_count || 8,
            is_active: scenario.is_active !== undefined ? scenario.is_active : true,
            created_at: convertToTimestamp(scenario.created_at),
          });
          migrated++;
        }
      }
      results.scenarios = { total: scenarios?.length || 0, migrated };
      console.log(`✅ Migrated ${migrated} scenarios`);
    }

    // Migrate Simulation Runs
    if (!collectionName || collectionName === 'simulation_runs') {
      console.log('📦 Migrating simulation runs...');
      const { data: runs, error } = await supabase
        .from('simulation_runs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let migrated = 0;
      for (const run of runs || []) {
        const runRef = doc(db, COLLECTIONS.SIMULATION_RUNS, run.id);
        const existing = await getDoc(runRef);
        
        if (!existing.exists()) {
          await setDoc(runRef, {
            client_id: run.client_id,
            scenario_id: run.scenario_id,
            status: run.status || 'pending',
            conversation: Array.isArray(run.conversation) ? run.conversation : [],
            score: run.score || 0,
            evaluation_summary: run.evaluation_summary || '',
            detailed_feedback: run.detailed_feedback || '',
            prompt_improvement_suggestions: Array.isArray(run.prompt_improvement_suggestions) 
              ? run.prompt_improvement_suggestions 
              : [],
            created_at: convertToTimestamp(run.created_at),
          });
          migrated++;
        }
      }
      results.simulation_runs = { total: runs?.length || 0, migrated };
      console.log(`✅ Migrated ${migrated} simulation runs`);
    }

    // Migrate Final Prompts
    if (!collectionName || collectionName === 'final_prompt_suggestions') {
      console.log('📦 Migrating final prompts...');
      const { data: prompts, error } = await supabase
        .from('final_prompt_suggestions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      let migrated = 0;
      for (const prompt of prompts || []) {
        const promptRef = doc(db, COLLECTIONS.FINAL_PROMPT_SUGGESTIONS, prompt.id);
        const existing = await getDoc(promptRef);
        
        if (!existing.exists()) {
          await setDoc(promptRef, {
            client_id: prompt.client_id,
            source_simulation_run_ids: Array.isArray(prompt.source_simulation_run_ids) 
              ? prompt.source_simulation_run_ids 
              : [],
            combined_prompt: prompt.combined_prompt || '',
            rationale: prompt.rationale || '',
            created_at: convertToTimestamp(prompt.created_at),
          });
          migrated++;
        }
      }
      results.final_prompt_suggestions = { total: prompts?.length || 0, migrated };
      console.log(`✅ Migrated ${migrated} final prompts`);
    }

    const totalMigrated = Object.values(results).reduce((sum: number, r: any) => sum + (r.migrated || 0), 0);

    return NextResponse.json({
      success: true,
      message: `Migration complete! Migrated ${totalMigrated} documents.`,
      results,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Migration failed',
        details: String(error)
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check migration status
export async function GET() {
  try {
    const status: any = {};

    // Check Supabase
    const { data: supabaseClients } = await supabase
      .from('clients')
      .select('id', { count: 'exact', head: true });
    status.supabase = {
      clients: supabaseClients?.length || 0,
    };

    // Check Firebase
    const firebaseClients = await getDocs(collection(db, COLLECTIONS.CLIENTS));
    status.firebase = {
      clients: firebaseClients.size,
    };

    return NextResponse.json({
      status,
      needsMigration: (supabaseClients?.length || 0) > firebaseClients.size,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}

