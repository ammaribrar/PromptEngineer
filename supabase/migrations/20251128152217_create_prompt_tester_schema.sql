/*
  # Prompt Stress Tester Database Schema

  This migration creates the core tables for the Prompt Stress Tester application.

  ## New Tables
  
  ### 1. `clients`
  Stores client information and their base system prompts
  - `id` (uuid, primary key)
  - `name` (text) - Client company name
  - `industry` (text) - Client's industry sector
  - `description` (text) - What the client does
  - `tone_of_voice` (text) - Communication style (friendly, professional, etc.)
  - `products_or_services` (text) - Detailed product/service info
  - `policies` (text) - Refund, guarantee, SLA policies
  - `extra_context` (text) - Special constraints, compliance notes
  - `base_system_prompt` (text) - Initial prompt to be optimized
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. `scenarios`
  Defines test scenarios for each client
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key) - Links to clients table
  - `name` (text) - Scenario name
  - `type` (text) - Scenario category (follow_up, reach_back, etc.)
  - `description` (text) - What's happening in this scenario
  - `customer_persona` (text) - Customer mood, style, demographics
  - `goal` (text) - What the agent should achieve
  - `message_count` (integer) - Number of conversation turns (default 8-10)
  - `is_active` (boolean) - Whether this scenario is enabled
  - `created_at` (timestamptz)

  ### 3. `simulation_runs`
  Records of individual test executions
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key)
  - `scenario_id` (uuid, foreign key)
  - `status` (text) - pending, running, completed, failed
  - `conversation` (jsonb) - Array of message objects
  - `score` (integer) - 0-100 success percentage
  - `evaluation_summary` (text) - Brief evaluation
  - `detailed_feedback` (text) - Comprehensive analysis
  - `prompt_improvement_suggestions` (jsonb) - Array of suggestions
  - `created_at` (timestamptz)

  ### 4. `final_prompt_suggestions`
  Optimized prompts generated from multiple runs
  - `id` (uuid, primary key)
  - `client_id` (uuid, foreign key)
  - `source_simulation_run_ids` (jsonb) - Array of run IDs used
  - `combined_prompt` (text) - Final optimized prompt
  - `rationale` (text) - Explanation of improvements
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Add policies for authenticated access (public access for MVP)
*/

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  industry text DEFAULT '',
  description text DEFAULT '',
  tone_of_voice text DEFAULT '',
  products_or_services text DEFAULT '',
  policies text DEFAULT '',
  extra_context text DEFAULT '',
  base_system_prompt text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create scenarios table
CREATE TABLE IF NOT EXISTS scenarios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT 'general',
  description text DEFAULT '',
  customer_persona text DEFAULT '',
  goal text DEFAULT '',
  message_count integer DEFAULT 8,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create simulation_runs table
CREATE TABLE IF NOT EXISTS simulation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  scenario_id uuid NOT NULL REFERENCES scenarios(id) ON DELETE CASCADE,
  status text DEFAULT 'pending',
  conversation jsonb DEFAULT '[]'::jsonb,
  score integer DEFAULT 0,
  evaluation_summary text DEFAULT '',
  detailed_feedback text DEFAULT '',
  prompt_improvement_suggestions jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create final_prompt_suggestions table
CREATE TABLE IF NOT EXISTS final_prompt_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  source_simulation_run_ids jsonb DEFAULT '[]'::jsonb,
  combined_prompt text DEFAULT '',
  rationale text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_scenarios_client_id ON scenarios(client_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_client_id ON simulation_runs(client_id);
CREATE INDEX IF NOT EXISTS idx_simulation_runs_scenario_id ON simulation_runs(scenario_id);
CREATE INDEX IF NOT EXISTS idx_final_prompt_suggestions_client_id ON final_prompt_suggestions(client_id);

-- Enable Row Level Security
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE simulation_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE final_prompt_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (MVP - adjust for production)
CREATE POLICY "Allow public read access to clients"
  ON clients FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to clients"
  ON clients FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to clients"
  ON clients FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to clients"
  ON clients FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to scenarios"
  ON scenarios FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to scenarios"
  ON scenarios FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to scenarios"
  ON scenarios FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to scenarios"
  ON scenarios FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to simulation_runs"
  ON simulation_runs FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to simulation_runs"
  ON simulation_runs FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to simulation_runs"
  ON simulation_runs FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to simulation_runs"
  ON simulation_runs FOR DELETE
  TO public
  USING (true);

CREATE POLICY "Allow public read access to final_prompt_suggestions"
  ON final_prompt_suggestions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow public insert access to final_prompt_suggestions"
  ON final_prompt_suggestions FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow public update access to final_prompt_suggestions"
  ON final_prompt_suggestions FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to final_prompt_suggestions"
  ON final_prompt_suggestions FOR DELETE
  TO public
  USING (true);