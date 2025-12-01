import { NextRequest, NextResponse } from 'next/server';
import { ConversationMessage } from '@/lib/database.types';
import { callOpenAI } from '@/lib/openai';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

function buildCustomerSimulatorPrompt(scenario: any): string {
  return `You are simulating a real customer in a customer support conversation.
You must behave according to this scenario:
- Scenario name: ${scenario.name}
- Type: ${scenario.type}
- Description: ${scenario.description}
- Persona: ${scenario.customer_persona}
- Goal: ${scenario.goal}

Instructions:
- Speak as the customer only.
- Be consistent in mood and style (e.g., furious, polite, confused).
- React realistically to the agent's previous message.
- Do NOT write the agent's messages.
- Keep each message between 1-3 sentences.
- Stop escalating if your goal is clearly achieved.
- Be natural and human-like in your responses.`;
}

function buildAgentPrompt(client: any): string {
  return `You are the AI support agent for this client.

CLIENT DETAILS:
- Name: ${client.name}
- Industry: ${client.industry}
- Description: ${client.description}
- Products/services: ${client.products_or_services}
- Policies: ${client.policies}
- Tone of voice: ${client.tone_of_voice}
- Extra context: ${client.extra_context}

BASE SYSTEM PROMPT (to follow strictly):
${client.base_system_prompt}

General rules:
- Always respond in a helpful, accurate, and policy-compliant way.
- Stay within the client's tone and style.
- If you lack information, ask clarifying questions or say you don't know.
- Never invent policies or guarantees not provided.
- Keep responses concise and professional.`;
}

export async function POST(request: NextRequest) {
  try {
    const { scenarioIds, clientId } = await request.json();

    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      throw new Error('Client not found');
    }
    const client = docToData(clientSnap);

    // Firestore doesn't support 'in' with document IDs directly, so we fetch by IDs
    const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
    const allScenariosSnap = await getDocs(scenariosRef);
    const scenarios = allScenariosSnap.docs
      .filter(d => scenarioIds.includes(d.id))
      .map(d => docToData(d));
    
    if (scenarios.length === 0) {
      throw new Error('No scenarios found for the provided IDs');
    }

    const results = [];

    for (const scenario of (scenarios || [])) {
      const runId = crypto.randomUUID();
      const scenarioData = scenario as any;

      const runRef = doc(db, COLLECTIONS.SIMULATION_RUNS, runId);
      await setDoc(runRef, {
        id: runId,
        client_id: clientId,
        scenario_id: scenarioData.id,
        status: 'running',
        created_at: createTimestamp(),
      });

      try {
        const conversation: ConversationMessage[] = [];
        const messageCount = scenarioData.message_count;

        const customerSystemPrompt = buildCustomerSimulatorPrompt(scenarioData);
        const agentSystemPrompt = buildAgentPrompt(client);

        for (let turn = 1; turn <= messageCount; turn++) {
          let customerMessage = '';

          if (turn === 1) {
            const customerMessages = [
              { role: 'system' as const, content: customerSystemPrompt },
              {
                role: 'user' as const,
                content: `This is turn 1 of ${messageCount}. Start the conversation naturally as the customer described in the scenario. Introduce your issue or question.`
              },
            ];
            customerMessage = await callOpenAI(customerMessages, 0.8);
          } else {
            const conversationHistory = conversation
              .map(msg => `${msg.role === 'customer' ? 'Customer' : 'Agent'}: ${msg.content}`)
              .join('\n');

            const customerMessages = [
              { role: 'system' as const, content: customerSystemPrompt },
              {
                role: 'user' as const,
                content: `This is turn ${turn} of ${messageCount}.\n\nConversation so far:\n${conversationHistory}\n\nRespond naturally as the customer. React to the agent's last message.`
              },
            ];
            customerMessage = await callOpenAI(customerMessages, 0.8);
          }

          conversation.push({
            role: 'customer',
            content: customerMessage,
            turn,
          });

          const conversationForAgent = conversation
            .map(msg => `${msg.role === 'customer' ? 'Customer' : 'Agent'}: ${msg.content}`)
            .join('\n');

          const agentMessages = [
            { role: 'system' as const, content: agentSystemPrompt },
            {
              role: 'user' as const,
              content: conversationForAgent
            },
          ];
          const agentMessage = await callOpenAI(agentMessages, 0.7);

          conversation.push({
            role: 'agent',
            content: agentMessage,
            turn,
          });

          const runRef = doc(db, COLLECTIONS.SIMULATION_RUNS, runId);
          await updateDoc(runRef, { conversation });
        }

        const evaluationResult = await evaluateConversation(client, scenario, conversation);

        const runRef = doc(db, COLLECTIONS.SIMULATION_RUNS, runId);
        await updateDoc(runRef, {
          status: 'completed',
          conversation,
          score: evaluationResult.score,
          evaluation_summary: evaluationResult.evaluationSummary,
          detailed_feedback: evaluationResult.detailedFeedback,
          prompt_improvement_suggestions: evaluationResult.promptImprovementSuggestions,
        });

        results.push({
          runId,
          scenarioId: scenarioData.id,
          status: 'completed',
          score: evaluationResult.score,
        });
      } catch (error) {
        console.error(`Error processing scenario ${scenarioData.id}:`, error);

        const runRef = doc(db, COLLECTIONS.SIMULATION_RUNS, runId);
        const existingRunSnap = await getDoc(runRef);
        const existingRun = existingRunSnap.exists() ? docToData(existingRunSnap) : null;
        const conversation = (existingRun as any)?.conversation || [];

        const defaultEvaluation = {
          score: 50,
          evaluationSummary: 'Simulation completed with partial data due to processing error.',
          detailedFeedback: `The simulation was run but encountered an error: ${String(error)}. ${conversation.length > 0 ? 'A partial conversation was generated.' : 'No conversation was generated.'}`,
          promptImprovementSuggestions: [
            'Review the base system prompt for clarity and completeness',
            'Ensure all required client information is properly configured'
          ]
        };

        await updateDoc(runRef, {
          status: 'completed',
          conversation,
          score: defaultEvaluation.score,
          evaluation_summary: defaultEvaluation.evaluationSummary,
          detailed_feedback: defaultEvaluation.detailedFeedback,
          prompt_improvement_suggestions: defaultEvaluation.promptImprovementSuggestions,
        });

        results.push({
          runId,
          scenarioId: scenarioData.id,
          status: 'completed',
          score: defaultEvaluation.score,
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}

async function evaluateConversation(client: any, scenario: any, conversation: ConversationMessage[]) {
  const conversationText = conversation
    .map(msg => `${msg.role === 'customer' ? 'Customer' : 'Agent'}: ${msg.content}`)
    .join('\n\n');

  const evaluationPrompt = `You are an expert evaluator of customer support chat quality.
Your task is to rate how well the AI agent handled the conversation.

CLIENT DETAILS:
- Name: ${client.name}
- Industry: ${client.industry}
- Description: ${client.description}
- Products/services: ${client.products_or_services}
- Policies: ${client.policies}
- Tone of voice: ${client.tone_of_voice}
- Base system prompt: ${client.base_system_prompt}

SCENARIO DETAILS:
- Name: ${scenario.name}
- Type: ${scenario.type}
- Description: ${scenario.description}
- Customer persona: ${scenario.customer_persona}
- Goal: ${scenario.goal}

CONVERSATION:
${conversationText}

Evaluate:
1. Goal achievement: Did the agent accomplish the scenario's goal?
2. Tone & style: Did the agent follow the required tone and remain professional?
3. Policy compliance: Did the agent respect the client's stated policies?
4. Helpfulness & clarity: Were the responses clear, concise, and helpful?
5. Safety & risk: Did the agent avoid unsafe promises or misleading information?

Output JSON ONLY in this format:
{
  "score": <number between 0 and 100>,
  "evaluationSummary": "<2-3 sentences summary>",
  "detailedFeedback": "<multi-paragraph explanation>",
  "promptImprovementSuggestions": [
    "<short bullet suggestion 1>",
    "<short bullet suggestion 2>"
  ]
}`;

  const response = await callOpenAI([
    { role: 'system', content: 'You are a JSON-only response bot. Always output valid JSON.' },
    { role: 'user', content: evaluationPrompt },
  ], 0.3);

  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('Failed to parse evaluation response');
  }

  return JSON.parse(jsonMatch[0]);
}
