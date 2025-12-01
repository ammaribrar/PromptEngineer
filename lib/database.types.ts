export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          industry: string;
          description: string;
          tone_of_voice: string;
          products_or_services: string;
          policies: string;
          extra_context: string;
          base_system_prompt: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          industry?: string;
          description?: string;
          tone_of_voice?: string;
          products_or_services?: string;
          policies?: string;
          extra_context?: string;
          base_system_prompt?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          industry?: string;
          description?: string;
          tone_of_voice?: string;
          products_or_services?: string;
          policies?: string;
          extra_context?: string;
          base_system_prompt?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      scenarios: {
        Row: {
          id: string;
          client_id: string;
          name: string;
          type: string;
          description: string;
          customer_persona: string;
          goal: string;
          message_count: number;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          name: string;
          type?: string;
          description?: string;
          customer_persona?: string;
          goal?: string;
          message_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          name?: string;
          type?: string;
          description?: string;
          customer_persona?: string;
          goal?: string;
          message_count?: number;
          is_active?: boolean;
          created_at?: string;
        };
      };
      simulation_runs: {
        Row: {
          id: string;
          client_id: string;
          scenario_id: string;
          status: string;
          conversation: ConversationMessage[];
          score: number;
          evaluation_summary: string;
          detailed_feedback: string;
          prompt_improvement_suggestions: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          scenario_id: string;
          status?: string;
          conversation?: ConversationMessage[];
          score?: number;
          evaluation_summary?: string;
          detailed_feedback?: string;
          prompt_improvement_suggestions?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          scenario_id?: string;
          status?: string;
          conversation?: ConversationMessage[];
          score?: number;
          evaluation_summary?: string;
          detailed_feedback?: string;
          prompt_improvement_suggestions?: string[];
          created_at?: string;
        };
      };
      final_prompt_suggestions: {
        Row: {
          id: string;
          client_id: string;
          source_simulation_run_ids: string[];
          combined_prompt: string;
          rationale: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          source_simulation_run_ids?: string[];
          combined_prompt?: string;
          rationale?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          source_simulation_run_ids?: string[];
          combined_prompt?: string;
          rationale?: string;
          created_at?: string;
        };
      };
    };
  };
}

export interface ConversationMessage {
  role: 'customer' | 'agent';
  content: string;
  turn: number;
}

export type Client = Database['public']['Tables']['clients']['Row'];
export type Scenario = Database['public']['Tables']['scenarios']['Row'];
export type SimulationRun = Database['public']['Tables']['simulation_runs']['Row'];
export type FinalPromptSuggestion = Database['public']['Tables']['final_prompt_suggestions']['Row'];
