import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/openai';
import { db, COLLECTIONS, createTimestamp, docToData } from '@/lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc } from 'firebase/firestore';

export async function POST(request: NextRequest) {
  try {
    const { clientId } = await request.json();

    const clientRef = doc(db, COLLECTIONS.CLIENTS, clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      throw new Error('Client not found');
    }
    const client = docToData(clientSnap);

    const scenariosRef = collection(db, COLLECTIONS.SCENARIOS);
    const scenariosQuery = query(
      scenariosRef,
      where('client_id', '==', clientId),
      where('is_active', '==', true)
    );
    const scenariosSnap = await getDocs(scenariosQuery);
    const scenarios = scenariosSnap.docs.map(d => docToData(d));

    const scenarioIds = scenarios.map((s: any) => s.id);

    if (scenarioIds.length === 0) {
      throw new Error('No active scenarios found for this client');
    }

    // Firestore doesn't support 'in' with multiple where clauses easily, so we fetch all and filter
    const runsRef = collection(db, COLLECTIONS.SIMULATION_RUNS);
    const runsQuery = query(
      runsRef,
      where('client_id', '==', clientId),
      where('status', '==', 'completed')
    );
    const runsSnap = await getDocs(runsQuery);
    const allRuns = runsSnap.docs.map(d => docToData(d));
    const runs = allRuns.filter((r: any) => scenarioIds.includes(r.scenario_id));

    if (!runs || runs.length === 0) {
      throw new Error('No completed simulation runs found for this client');
    }

    const latestRunsPerScenario = new Map();
    for (const run of (runs || [])) {
      const runData = run as any;
      if (!latestRunsPerScenario.has(runData.scenario_id)) {
        latestRunsPerScenario.set(runData.scenario_id, runData);
      }
    }

    const latestRuns = Array.from(latestRunsPerScenario.values());

    const feedbackSummary = latestRuns.map((run: any) => {
      const scenario: any = (scenarios || []).find((s: any) => s.id === run.scenario_id);
      const suggestions = Array.isArray(run.prompt_improvement_suggestions) 
        ? run.prompt_improvement_suggestions 
        : [];
      return `
SCENARIO: ${scenario?.name || 'Unknown'} (${scenario?.type || 'N/A'})
Description: ${scenario?.description || 'N/A'}
Customer Persona: ${scenario?.customer_persona || 'N/A'}
Goal: ${scenario?.goal || 'N/A'}

TEST RESULTS:
- Score: ${run.score || 0}/100
- Summary: ${run.evaluation_summary || 'No summary available'}

DETAILED FEEDBACK:
${run.detailed_feedback || 'No detailed feedback available'}

SPECIFIC IMPROVEMENT SUGGESTIONS:
${suggestions.length > 0 ? suggestions.map((s: string) => `- ${s}`).join('\n') : '- No specific suggestions provided'}
`;
    }).join('\n' + '='.repeat(80) + '\n');

    const clientData = client as any;
    
    if (!clientData.base_system_prompt || clientData.base_system_prompt.trim().length === 0) {
      throw new Error('Client base system prompt is empty. Please set a base system prompt before generating the final prompt.');
    }
    
    const basePromptWordCount = clientData.base_system_prompt.split(/\s+/).length;
    const basePromptLength = clientData.base_system_prompt.length;

    const synthesisPrompt = `You are an elite prompt engineer with decades of combined expertise in AI systems, advanced customer service psychology, enterprise communication, conflict resolution, emotional intelligence, and industry-specific best practices. Your mission is to create the ULTIMATE, most comprehensive, deeply insightful, and professionally refined system prompt that matches the original base prompt's length while achieving unprecedented depth, sophistication, and effectiveness.

CRITICAL REQUIREMENTS FOR MAXIMUM DEPTH:
- The final prompt MUST be approximately ${basePromptWordCount} words (matching the original base prompt length of ${basePromptWordCount} words)
- The final prompt MUST demonstrate EXTREME depth, incorporating advanced psychological principles, emotional intelligence, and sophisticated communication strategies
- Every single word must be meticulously chosen to maximize impact, clarity, and effectiveness
- The prompt must reflect MASTER-LEVEL understanding of customer psychology, behavioral economics, service excellence frameworks, and AI interaction patterns
- Use the most sophisticated, precise, and impactful language possible while maintaining natural flow
- Incorporate deep insights from psychology, neuroscience, communication theory, and service design
- Include advanced techniques for de-escalation, empathy, persuasion, and relationship building
- Address subconscious customer needs, emotional triggers, and psychological drivers
- Integrate principles from cognitive behavioral therapy, positive psychology, and human-centered design

CLIENT DETAILS (ANALYZE DEEPLY):
- Name: ${clientData.name}
- Industry: ${clientData.industry || 'Not specified'} - Apply deep industry-specific knowledge and best practices
- Description: ${clientData.description || 'Not provided'} - Extract implicit customer expectations and service requirements
- Products/Services: ${clientData.products_or_services || 'Not specified'} - Understand customer journey and pain points
- Policies: ${clientData.policies || 'Not specified'} - Integrate policy nuances with customer psychology
- Tone of Voice: ${clientData.tone_of_voice || 'Not specified'} - Apply advanced communication style principles
- Extra Context: ${clientData.extra_context || 'Not provided'} - Synthesize all contextual information for maximum relevance

ORIGINAL BASE SYSTEM PROMPT (${basePromptWordCount} words):
${clientData.base_system_prompt}

SCENARIO TEST RESULTS & FEEDBACK (ANALYZE EVERY DETAIL):
${feedbackSummary}

YOUR COMPREHENSIVE TASKS (GO DEEP):

1. CONDUCT EXTREMELY THOROUGH ANALYSIS:
   - Analyze EVERY piece of feedback with psychological depth
   - Identify not just surface issues but root psychological causes
   - Map feedback to customer emotional states, cognitive biases, and behavioral patterns
   - Understand the deeper customer needs behind each scenario
   - Identify systemic patterns across all scenarios
   - Apply frameworks from service design, customer experience, and behavioral psychology

2. SYNTHESIZE MAXIMUM KNOWLEDGE:
   - Integrate advanced customer service frameworks (RATER, SERVQUAL, Customer Journey Mapping)
   - Apply principles from emotional intelligence (Goleman's model, empathy mapping)
   - Incorporate conflict resolution techniques (de-escalation, active listening, reframing)
   - Use persuasion psychology (Cialdini's principles, cognitive biases, social proof)
   - Apply communication theory (nonviolent communication, assertiveness, clarity)
   - Integrate industry-specific expertise and best practices
   - Include advanced AI interaction patterns and limitations awareness

3. CREATE THE ULTIMATE PROMPT with EXTREME DEPTH:

   a) PRESERVE AND ENHANCE all effective elements from the original, making them even more powerful
   b) REPLACE every weak element with sophisticated, psychologically-informed alternatives
   c) INFUSE deep domain knowledge, industry expertise, and advanced service principles throughout
   d) ADDRESS every identified weakness with multi-layered, comprehensive solutions
   e) DEMONSTRATE mastery of:
      - Customer psychology and emotional intelligence
      - Advanced communication techniques and persuasion
      - Conflict resolution and de-escalation strategies
      - Service recovery and relationship building
      - Industry-specific nuances and best practices
      - AI capabilities, limitations, and optimal interaction patterns
   f) INCORPORATE sophisticated guidance for:
      - Complex emotional scenarios and edge cases
      - High-stakes situations requiring exceptional handling
      - Subtle psychological triggers and customer states
      - Multi-layered customer needs (stated vs. unstated)
      - Cultural sensitivity and inclusive communication
   g) MAINTAIN professional excellence while being:
      - Emotionally intelligent and empathetic
      - Psychologically sophisticated
      - Strategically comprehensive
      - Tactically actionable
   h) ENSURE the prompt reflects:
      - Enterprise-grade quality and sophistication
      - Master-level expertise in customer service
      - Deep understanding of human psychology
      - Advanced AI prompt engineering principles

4. THE IMPROVED PROMPT MUST ACHIEVE:
   - Approximately ${basePromptWordCount} words (within ±5% of original length)
   - EXTREME depth in every section, demonstrating master-level expertise
   - Sophisticated, precise, impactful language that resonates psychologically
   - Logical structure with clear, well-organized sections that flow naturally
   - Complete elimination of ambiguities with crystal-clear guidance
   - Integration of best practices from world-class service organizations
   - Production-ready quality suitable for enterprise deployment at scale
   - Mastery demonstration across multiple domains (psychology, communication, service, AI)
   - Incorporation of advanced techniques for maximum effectiveness

5. WRITE AN EXTREMELY DETAILED, PROFESSIONAL RATIONALE that explains:
   - The comprehensive analytical framework used (psychological, behavioral, service design)
   - How deep domain knowledge from multiple fields was synthesized and applied
   - Specific enhancements made with detailed professional justification
   - The strategic and tactical thinking behind each major change
   - Expected performance improvements with psychological and behavioral rationale
   - How the prompt addresses subconscious customer needs and emotional drivers
   - Integration of advanced communication and service principles
   - Expected impact on customer satisfaction, loyalty, and business outcomes

QUALITY STANDARDS FOR MAXIMUM EXCELLENCE:
- Every sentence must demonstrate master-level expertise and psychological sophistication
- Use the most precise, impactful terminology while maintaining natural communication
- Show deep understanding of:
  * Customer psychology (needs, motivations, emotional states, cognitive biases)
  * Service excellence (world-class frameworks, best practices, innovation)
  * AI capabilities (strengths, limitations, optimal interaction patterns)
  * Communication mastery (persuasion, empathy, clarity, effectiveness)
- The prompt should read as if written by a world-renowned expert with decades of experience
- Balance extreme comprehensiveness with strategic conciseness to match target word count
- Every instruction must be actionable, specific, and psychologically informed
- Use maximum depth and detail - this is your opportunity to create the BEST prompt possible
- Incorporate every relevant insight, technique, and principle that will improve effectiveness
- Leave no stone unturned in creating the most comprehensive and effective prompt

CRITICAL OUTPUT REQUIREMENT:
You MUST output ONLY valid JSON. Do NOT include any markdown formatting, code blocks, explanations, or text outside the JSON object. Output ONLY the raw JSON object starting with { and ending with }.

Output JSON in EXACTLY this format (no markdown, no code blocks, just raw JSON):
{
  "combinedPrompt": "<the ULTIMATE, most comprehensive, deeply insightful, psychologically sophisticated system prompt - approximately ${basePromptWordCount} words, demonstrating master-level expertise across psychology, communication, service excellence, and AI interaction>",
  "rationale": "<EXTREMELY detailed, comprehensive explanation covering: analytical frameworks used (psychological, behavioral, service design), synthesis of knowledge from multiple domains, specific enhancements with deep justification, strategic and tactical thinking, expected performance improvements with psychological rationale, how subconscious customer needs are addressed, integration of advanced principles, and expected business impact. This rationale should demonstrate the depth of analysis and sophistication of the improvements made.>"
}

Remember: Output ONLY the JSON object, nothing else. No markdown, no explanations, no code blocks. The combinedPrompt should be the most comprehensive, psychologically sophisticated, and effective prompt possible within the word limit.`;

    let response: string;
    try {
      response = await callOpenAI([
        { role: 'system', content: 'You are an elite, world-renowned prompt engineer with master-level expertise in AI systems, customer service psychology, emotional intelligence, communication theory, and service excellence. You create the most comprehensive, deeply insightful, and psychologically sophisticated prompts possible. You synthesize knowledge from psychology, neuroscience, behavioral economics, service design, and communication theory. CRITICAL: You MUST output ONLY valid JSON. Do NOT use markdown code blocks, do NOT add explanations before or after the JSON. Output ONLY the raw JSON object starting with { and ending with }. Your prompts demonstrate extreme depth, master-level expertise, and enterprise-grade quality. You maintain target word counts while achieving maximum comprehensiveness, sophistication, and effectiveness.' },
        { role: 'user', content: synthesisPrompt },
      ], 0.3, 16000);
    } catch (error: any) {
      console.error('OpenAI API error:', error);
      throw new Error(`Failed to call OpenAI API: ${error.message || String(error)}`);
    }

    if (!response || response.trim().length === 0) {
      console.error('Empty response from OpenAI');
      throw new Error('Received empty response from OpenAI API');
    }

    // Try multiple strategies to extract JSON from the response
    let jsonString: string | null = null;
    
    // Strategy 1: Look for JSON in markdown code blocks (```json ... ```)
    const markdownJsonMatch = response.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (markdownJsonMatch) {
      jsonString = markdownJsonMatch[1];
    }
    
    // Strategy 2: Look for JSON object directly
    if (!jsonString) {
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        jsonString = jsonMatch[0];
      }
    }
    
    // Strategy 3: Try to find JSON between common delimiters
    if (!jsonString) {
      const delimitedMatch = response.match(/```[\s\S]*?(\{[\s\S]*?\})[\s\S]*?```/);
      if (delimitedMatch) {
        jsonString = delimitedMatch[1];
      }
    }

    if (!jsonString) {
      // Log the full response for debugging (truncated)
      const responsePreview = response.substring(0, 1000);
      console.error('Failed to find JSON in response. Response preview:', responsePreview);
      console.error('Full response length:', response.length);
      throw new Error(`OpenAI response does not contain valid JSON. Response preview: ${responsePreview.substring(0, 200)}...`);
    }

    let result: any;
    try {
      result = JSON.parse(jsonString);
    } catch (parseError: any) {
      // Try to clean up the JSON string
      let cleanedJson = jsonString.trim();
      
      // Remove any leading/trailing whitespace or non-JSON characters
      cleanedJson = cleanedJson.replace(/^[^{]*/, '').replace(/[^}]*$/, '');
      
      // Try to fix common JSON issues
      // Remove trailing commas before closing braces/brackets
      cleanedJson = cleanedJson.replace(/,(\s*[}\]])/g, '$1');
      
      try {
        result = JSON.parse(cleanedJson);
        console.log('Successfully parsed JSON after cleanup');
      } catch (retryError: any) {
        console.error('JSON parse error (original):', parseError);
        console.error('JSON parse error (after cleanup):', retryError);
        console.error('Original JSON string (first 500 chars):', jsonString.substring(0, 500));
        console.error('Cleaned JSON string (first 500 chars):', cleanedJson.substring(0, 500));
        throw new Error(`Failed to parse JSON response even after cleanup: ${retryError.message}. The model may have returned malformed JSON.`);
      }
    }

    // Validate that the result has the required fields
    if (!result.combinedPrompt && !result.combined_prompt) {
      console.error('Missing combinedPrompt in result:', result);
      throw new Error('OpenAI response is missing the required "combinedPrompt" field');
    }

    // Normalize field names (handle both combinedPrompt and combined_prompt)
    if (!result.combinedPrompt && result.combined_prompt) {
      result.combinedPrompt = result.combined_prompt;
    }

    // Ensure rationale exists
    if (!result.rationale) {
      result.rationale = 'Rationale not provided by the model.';
    }

    const synthesizedWordCount = result.combinedPrompt.split(/\s+/).length;
    const targetWordCount = basePromptWordCount;
    const tolerance = Math.floor(basePromptWordCount * 0.05); // ±5% tolerance
    const minWordCount = targetWordCount - tolerance;
    const maxWordCount = targetWordCount + tolerance;

    if (synthesizedWordCount < minWordCount || synthesizedWordCount > maxWordCount) {
      console.warn(`Synthesized prompt word count (${synthesizedWordCount}) is outside the target range (${minWordCount}-${maxWordCount}). Target was ${targetWordCount} words.`);
    }

    if (!result.combinedPrompt || result.combinedPrompt.length < 100) {
      throw new Error('Synthesized prompt is too short or empty. Please ensure professional, comprehensive prompt generation.');
    }

    const suggestionsRef = collection(db, COLLECTIONS.FINAL_PROMPT_SUGGESTIONS);
    const newSuggestion = {
      client_id: clientId,
      source_simulation_run_ids: latestRuns.map((r: any) => r.id),
      combined_prompt: result.combinedPrompt,
      rationale: result.rationale,
      created_at: createTimestamp(),
    };
    const docRef = await addDoc(suggestionsRef, newSuggestion);
    const suggestion = { id: docRef.id, ...newSuggestion, created_at: newSuggestion.created_at.toDate().toISOString() };

    const lengthMatch = Math.abs(synthesizedWordCount - basePromptWordCount) <= tolerance;
    
    return NextResponse.json({
      ...suggestion,
      stats: {
        originalWordCount: basePromptWordCount,
        synthesizedWordCount,
        targetWordCount,
        lengthMatch: lengthMatch,
        lengthDifference: synthesizedWordCount - basePromptWordCount,
        qualityNote: lengthMatch ? 'Length matches target' : 'Length slightly outside target range'
      }
    });
  } catch (error: any) {
    console.error('Error in synthesize-prompt route:', error);
    const errorMessage = error?.message || String(error);
    return NextResponse.json({ 
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }, { status: 500 });
  }
}
